from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from api.dependencies import get_db
from orchestration.engine import WorkflowEngine
from models.orchestration import AgentTaskStatus
import logging

router = APIRouter(prefix="/orchestration", tags=["AI Orchestration"])
logger = logging.getLogger(__name__)

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
    Returns the real-time status of all AI agents for a business.
    """
    statuses = db.query(AgentTaskStatus).filter(AgentTaskStatus.business_id == business_id).all()
    
    # We always return the full list of agents so the frontend has them all, even if WAITING
    all_agents = [
        "Business Agent", "Content Intelligence Agent", "Brand Intelligence Agent", 
        "Market Intelligence Agent", "Strategy Agent", "Weekly Planner Agent", 
        "Content Generator Agent", "Publishing Agent", "Analytics Agent"
    ]
    
    status_map = {s.agent_name: {"status": s.status.value, "last_update": s.last_update} for s in statuses}
    
    result = []
    for agent in all_agents:
        if agent in status_map:
            result.append({
                "agent_name": agent,
                "status": status_map[agent]["status"],
                "last_update": status_map[agent]["last_update"]
            })
        else:
            result.append({
                "agent_name": agent,
                "status": "WAITING",
                "last_update": None
            })
            
    return result
