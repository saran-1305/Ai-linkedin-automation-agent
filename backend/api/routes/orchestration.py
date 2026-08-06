from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from api.dependencies import get_db
from orchestration.engine import WorkflowEngine
from models.orchestration import AgentTaskStatus
from models.workflow_run import WorkflowRun, ContentPipelineRun, ContentPipelineStage
import logging

router = APIRouter(prefix="/orchestration", tags=["AI Orchestration"])
logger = logging.getLogger(__name__)

# Order used to translate a ContentPipelineRun's current stage into a simple
# WAITING/RUNNING/COMPLETED status for each named downstream "agent" below.
_PIPELINE_STAGE_ORDER = [
    ContentPipelineStage.CONTENT_GENERATING, ContentPipelineStage.CONTENT_READY,
    ContentPipelineStage.IMAGE_SELECTING, ContentPipelineStage.IMAGE_READY,
    ContentPipelineStage.QUALITY_REVIEW,
    ContentPipelineStage.PENDING_APPROVAL, ContentPipelineStage.CHANGES_REQUESTED, ContentPipelineStage.APPROVED,
    ContentPipelineStage.QUEUED, ContentPipelineStage.SCHEDULED, ContentPipelineStage.PUBLISHING, ContentPipelineStage.PUBLISHED,
    ContentPipelineStage.ANALYTICS_RUNNING, ContentPipelineStage.LEARNING_RUNNING, ContentPipelineStage.COMPLETED,
]

# Maps each new autonomous-pipeline "agent" name to the pipeline stage(s) that represent it.
_DOWNSTREAM_AGENT_STAGES = {
    "Visual Intelligence Agent": (ContentPipelineStage.IMAGE_SELECTING, ContentPipelineStage.IMAGE_READY),
    "Quality Assurance Agent": (ContentPipelineStage.QUALITY_REVIEW,),
    "Approval Agent": (ContentPipelineStage.PENDING_APPROVAL, ContentPipelineStage.CHANGES_REQUESTED, ContentPipelineStage.APPROVED),
    "Learning Agent": (ContentPipelineStage.LEARNING_RUNNING,),
}


def _latest_pipeline_run(db: Session, business_id: int):
    return (
        db.query(ContentPipelineRun)
        .join(WorkflowRun, ContentPipelineRun.workflow_run_id == WorkflowRun.id)
        .filter(WorkflowRun.business_id == business_id)
        .order_by(ContentPipelineRun.updated_at.desc())
        .first()
    )


def _downstream_agent_status(pipeline, stages: tuple) -> dict:
    if not pipeline:
        return {"status": "WAITING", "last_update": None}

    stage_indices = [_PIPELINE_STAGE_ORDER.index(s) for s in stages if s in _PIPELINE_STAGE_ORDER]
    current_index = _PIPELINE_STAGE_ORDER.index(pipeline.stage) if pipeline.stage in _PIPELINE_STAGE_ORDER else -1

    if pipeline.status.value == "FAILED" and current_index in stage_indices:
        status = "FAILED"
    elif current_index in stage_indices and pipeline.status.value == "RUNNING":
        status = "RUNNING"
    elif stage_indices and current_index > max(stage_indices):
        status = "COMPLETED"
    else:
        status = "WAITING"

    return {"status": status, "last_update": pipeline.updated_at}

@router.post("/onboarding/{business_id}")
async def trigger_onboarding_pipeline(business_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers the autonomous onboarding pipeline in the background.
    """
    engine = WorkflowEngine(db)
    # We pass it to background tasks so the API returns immediately
    background_tasks.add_task(engine.run_onboarding_pipeline, business_id)
    return {"message": "Onboarding pipeline initiated successfully", "status": "running"}

@router.post("/weekly-planning/{business_id}")
async def trigger_weekly_planning(business_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers the autonomous weekly planning pipeline in the background.
    """
    engine = WorkflowEngine(db)
    background_tasks.add_task(engine.run_weekly_planning_pipeline, business_id)
    return {"message": "Weekly planning pipeline initiated successfully", "status": "running"}

@router.get("/status/{business_id}")
def get_agent_statuses(business_id: int, db: Session = Depends(get_db)):
    """
    Returns the real-time status of all AI agents for a business. Response
    shape is unchanged (a flat list of {agent_name, status, last_update}) so
    existing consumers (AICommandCenter.tsx) keep working - the fixed agent
    list is just extended with the new autonomous-pipeline stages, whose
    status is derived from the most recent ContentPipelineRun since they
    aren't tracked in AgentTaskStatus.
    """
    statuses = db.query(AgentTaskStatus).filter(AgentTaskStatus.business_id == business_id).all()
    status_map = {s.agent_name: {"status": s.status.value, "last_update": s.last_update} for s in statuses}

    upstream_agents = [
        "Business Agent", "Content Intelligence Agent", "Brand Intelligence Agent",
        "Market Intelligence Agent", "Strategy Agent", "Weekly Planner Agent",
        "Content Generator Agent", "Publishing Agent", "Analytics Agent",
    ]

    result = []
    for agent in upstream_agents:
        if agent in status_map:
            result.append({
                "agent_name": agent,
                "status": status_map[agent]["status"],
                "last_update": status_map[agent]["last_update"],
            })
        else:
            result.append({"agent_name": agent, "status": "WAITING", "last_update": None})

    pipeline = _latest_pipeline_run(db, business_id)
    for agent_name, stages in _DOWNSTREAM_AGENT_STAGES.items():
        entry = _downstream_agent_status(pipeline, stages)
        result.append({"agent_name": agent_name, **entry})

    return result


@router.get("/workflow-run/{business_id}")
def get_latest_workflow_run(business_id: int, db: Session = Depends(get_db)):
    """
    Returns the autonomous orchestrator's current cycle stage and a summary
    of its fanned-out content pipelines, for a richer "AI Workflow Status"
    view than the per-agent list above. Additive - new endpoint, doesn't
    change the existing /status/{business_id} contract.
    """
    run = (
        db.query(WorkflowRun)
        .filter(WorkflowRun.business_id == business_id)
        .order_by(WorkflowRun.started_at.desc())
        .first()
    )
    if not run:
        return {"workflow_run": None, "pipelines": []}

    pipelines = (
        db.query(ContentPipelineRun)
        .filter(ContentPipelineRun.workflow_run_id == run.id)
        .order_by(ContentPipelineRun.updated_at.desc())
        .all()
    )

    return {
        "workflow_run": {
            "id": run.id,
            "cycle_stage": run.cycle_stage.value,
            "status": run.status.value,
            "error_message": run.error_message,
            "started_at": run.started_at,
            "updated_at": run.updated_at,
            "completed_at": run.completed_at,
        },
        "pipelines": [
            {
                "id": p.id,
                "content_slot_id": p.content_slot_id,
                "stage": p.stage.value,
                "status": p.status.value,
                "retry_count": p.retry_count,
                "last_error": p.last_error,
                "updated_at": p.updated_at,
            }
            for p in pipelines
        ],
    }
