import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from models.workflow_run import WorkflowRun, ContentPipelineRun, CycleStage, ContentPipelineStage, RunStatus
from models.workflow_schedule import WorkflowSchedule
from models.execution import WeeklyPlan, ContentSlot
from models.content import GeneratedContent, ImportedContent, AnalysisStatus
from models.publishing import PublishingJob, PublishingStatus
from models.user import User

from content_analysis.dispatcher import AnalysisDispatcher
from brand_intelligence.service import BrandIntelligenceService
from market_intelligence.services.market_service import MarketIntelligenceService
from strategy.strategy_service import StrategyService
from execution.service import ExecutionService
from content.orchestrator import AIContentOrchestrator
from content.platforms.engine import MultiPlatformEngine
from visual_intelligence.service import VisualIntelligenceService
from publishing.services.content_publishing_service import ContentPublishingService
from publishing.orchestrator import PublishingOrchestrator
from publishing.approval_service import PublishingApprovalService
from publishing.scheduler.core import schedule_job
from analytics.services.analytics_collector import AnalyticsCollector
from analytics.repositories.analytics_repository import AnalyticsRepository
from analytics.services.performance_ai_engine import PerformanceAIEngine

from workflow.retry import run_stage_with_retry
from services.system_services import WorkflowLockService, AuditLogger, NotificationService

logger = logging.getLogger(__name__)

_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Order used to know which upstream stages a WorkflowRun has already passed,
# so resume_cycle() can pick up mid-sequence after a crash/restart instead of
# starting over.
_CYCLE_ORDER = [
    CycleStage.BUSINESS_READY,
    CycleStage.CONTENT_INTELLIGENCE_RUNNING, CycleStage.CONTENT_INTELLIGENCE_COMPLETED,
    CycleStage.BRAND_INTELLIGENCE_RUNNING, CycleStage.BRAND_INTELLIGENCE_COMPLETED,
    CycleStage.MARKET_INTELLIGENCE_RUNNING, CycleStage.MARKET_INTELLIGENCE_COMPLETED,
    CycleStage.COMPETITOR_INTELLIGENCE_RUNNING, CycleStage.COMPETITOR_INTELLIGENCE_COMPLETED,
    CycleStage.STRATEGY_GENERATING, CycleStage.STRATEGY_READY,
    CycleStage.WEEKLY_PLAN_GENERATING, CycleStage.WEEKLY_PLAN_READY,
]


def _next_occurrence(day_name: Optional[str], time_str: Optional[str]) -> datetime:
    now = datetime.now(timezone.utc)
    try:
        target_idx = _WEEKDAYS.index(day_name)
    except (ValueError, TypeError):
        return now + timedelta(hours=1)
    try:
        hour, minute = (int(p) for p in (time_str or "09:00").split(":"))
    except Exception:
        hour, minute = 9, 0
    days_ahead = (target_idx - now.weekday()) % 7
    candidate = (now + timedelta(days=days_ahead)).replace(hour=hour, minute=minute, second=0, microsecond=0)
    if candidate <= now:
        candidate += timedelta(days=7)
    return candidate


class AutonomousWorkflowOrchestrator:
    """The brain of the platform: chains every module's existing service
    methods into one autonomous, checkpointed, resumable pipeline.

    Every public method here is synchronous by design, mirroring how
    PublishingOrchestrator.publish_now already calls `asyncio.run(...)`
    internally for its one async sub-call. That means callers must invoke
    these methods from a context that is NOT already running an asyncio
    event loop on the same thread (a FastAPI sync route handler - which
    Starlette runs in a worker thread - or a background thread via
    asyncio.to_thread, as workflow/scheduler.py does).
    """

    QUALITY_THRESHOLD = 7.5

    def __init__(self, db: Session):
        self.db = db
        self.lock_service = WorkflowLockService(db)
        self.audit_logger = AuditLogger(db)
        self.notification_service = NotificationService(db)

    # ------------------------------------------------------------------
    # Cycle-level (upstream: Business -> ... -> Weekly Plan)
    # ------------------------------------------------------------------

    def run_cycle(self, business_id: int) -> Optional[WorkflowRun]:
        lock_name = f"workflow_{business_id}"
        if not self.lock_service.acquire_lock(lock_name):
            logger.info(f"Skipping run_cycle for business {business_id} - already locked/running.")
            return None
            
        try:
            run = WorkflowRun(business_id=business_id, cycle_stage=CycleStage.BUSINESS_READY, status=RunStatus.RUNNING)
            self.db.add(run)
            self.db.commit()
            self.db.refresh(run)
            
            self.audit_logger.log("WORKFLOW_STARTED", "Autonomous workflow cycle started.", business_id, run.id)
            return self.resume_cycle(run.id)
        finally:
            self.lock_service.release_lock(lock_name)

    def resume_cycle(self, run_id: int) -> WorkflowRun:
        run = self.db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
        if not run:
            raise ValueError(f"WorkflowRun {run_id} not found")
        if run.status != RunStatus.RUNNING:
            return run

        stage_sequence = [
            (CycleStage.CONTENT_INTELLIGENCE_RUNNING, CycleStage.CONTENT_INTELLIGENCE_COMPLETED, self._run_content_intelligence),
            (CycleStage.BRAND_INTELLIGENCE_RUNNING, CycleStage.BRAND_INTELLIGENCE_COMPLETED, self._run_brand_intelligence),
            (CycleStage.MARKET_INTELLIGENCE_RUNNING, CycleStage.MARKET_INTELLIGENCE_COMPLETED, self._run_market_intelligence),
            (CycleStage.COMPETITOR_INTELLIGENCE_RUNNING, CycleStage.COMPETITOR_INTELLIGENCE_COMPLETED, self._run_competitor_intelligence),
            (CycleStage.STRATEGY_GENERATING, CycleStage.STRATEGY_READY, self._run_strategy),
            (CycleStage.WEEKLY_PLAN_GENERATING, CycleStage.WEEKLY_PLAN_READY, self._run_weekly_plan),
        ]

        current_index = _CYCLE_ORDER.index(run.cycle_stage)

        for running_stage, completed_stage, handler in stage_sequence:
            if _CYCLE_ORDER.index(completed_stage) <= current_index:
                continue  # already completed before a restart - skip, don't redo

            self._transition(run, running_stage)
            try:
                run_stage_with_retry(lambda h=handler, bid=run.business_id: h(bid), stage_name=running_stage.value)
            except Exception as e:
                self._fail(run, str(e))
                return run
            self._transition(run, completed_stage)
            self.audit_logger.log(completed_stage.name, f"Stage {completed_stage.name} completed successfully.", run.business_id, run.id)
            current_index = _CYCLE_ORDER.index(completed_stage)

        weekly_plan = self._latest_weekly_plan(run.business_id)
        if weekly_plan:
            run.weekly_plan_id = weekly_plan.id
            self.db.commit()
            slots = self.db.query(ContentSlot).filter(ContentSlot.weekly_plan_id == weekly_plan.id).all()
            for slot in slots:
                # Don't double-fan-out if resuming a run that already started some pipelines.
                existing = self.db.query(ContentPipelineRun).filter(
                    ContentPipelineRun.workflow_run_id == run.id,
                    ContentPipelineRun.content_slot_id == slot.id,
                ).first()
                if not existing:
                    self._start_content_pipeline(run, slot.id)

        run.status = RunStatus.COMPLETED
        run.cycle_stage = CycleStage.COMPLETED
        run.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        
        self.audit_logger.log("WORKFLOW_COMPLETED", "Autonomous workflow cycle completed successfully.", run.business_id, run.id)
        return run

    def resume_incomplete_runs(self) -> List[int]:
        """Startup recovery pass: never restart from scratch, just continue
        whatever was left RUNNING when the process last stopped."""
        resumed: List[int] = []

        for run in self.db.query(WorkflowRun).filter(WorkflowRun.status == RunStatus.RUNNING).all():
            try:
                self.resume_cycle(run.id)
                resumed.append(run.id)
            except Exception as e:
                logger.error(f"Failed to resume WorkflowRun {run.id}: {e}")

        # PENDING_APPROVAL pipelines are correctly waiting on a human, not stuck -
        # only resume pipelines that were RUNNING mid-stage when the process stopped.
        stale_pipelines = self.db.query(ContentPipelineRun).filter(
            ContentPipelineRun.status == RunStatus.RUNNING,
            ContentPipelineRun.stage.notin_([ContentPipelineStage.PENDING_APPROVAL]),
        ).all()
        for pipeline in stale_pipelines:
            try:
                self.advance_content_pipeline(pipeline.id)
                resumed.append(pipeline.id)
            except Exception as e:
                logger.error(f"Failed to resume ContentPipelineRun {pipeline.id}: {e}")

        return resumed

    # ------------------------------------------------------------------
    # Content-pipeline level (downstream: Generate -> ... -> Learning)
    # ------------------------------------------------------------------

    def _start_content_pipeline(self, run: WorkflowRun, slot_id: int) -> ContentPipelineRun:
        pipeline = ContentPipelineRun(
            workflow_run_id=run.id,
            content_slot_id=slot_id,
            stage=ContentPipelineStage.CONTENT_GENERATING,
            status=RunStatus.RUNNING,
        )
        self.db.add(pipeline)
        self.db.commit()
        self.db.refresh(pipeline)
        return self.advance_content_pipeline(pipeline.id)

    def advance_content_pipeline(self, pipeline_id: int) -> ContentPipelineRun:
        pipeline = self._get_pipeline(pipeline_id)
        if pipeline.status != RunStatus.RUNNING:
            return pipeline

        try:
            if pipeline.stage == ContentPipelineStage.CONTENT_GENERATING:
                content = run_stage_with_retry(
                    lambda: AIContentOrchestrator(self.db).generate_content_for_slot(pipeline.content_slot_id),
                    "content_generation",
                )
                pipeline.generated_content_id = content.id
                self._transition_pipeline(pipeline, ContentPipelineStage.CONTENT_READY)
                self.audit_logger.log("CONTENT_GENERATED", "AI generated content for slot.", self._business_id_for_pipeline(pipeline), pipeline.workflow_run_id)

            if pipeline.stage == ContentPipelineStage.CONTENT_READY:
                platform_content = run_stage_with_retry(
                    lambda: MultiPlatformEngine(self.db).generate_for_platform(
                        pipeline.generated_content_id, "LinkedIn", variations_count=1
                    ),
                    "platform_variation_generation",
                )
                variation = platform_content.variations[0] if platform_content.variations else None
                if not variation:
                    raise RuntimeError("No platform variation was generated")
                pipeline.variation_id = variation.id
                self._transition_pipeline(pipeline, ContentPipelineStage.IMAGE_SELECTING)

            if pipeline.stage == ContentPipelineStage.IMAGE_SELECTING:
                try:
                    run_stage_with_retry(
                        lambda: VisualIntelligenceService(self.db).select_image_for_variation(pipeline.variation_id),
                        "visual_intelligence",
                        max_retries=1,
                    )
                except Exception as e:
                    # A missing/failed image shouldn't block the whole post - the
                    # approval email just renders without one.
                    logger.warning(f"Visual Intelligence failed for variation {pipeline.variation_id}: {e}")
                    
                self.audit_logger.log("IMAGE_SELECTED", "Visual intelligence attached image.", self._business_id_for_pipeline(pipeline), pipeline.workflow_run_id)
                self._transition_pipeline(pipeline, ContentPipelineStage.IMAGE_READY)

            if pipeline.stage == ContentPipelineStage.IMAGE_READY:
                self._transition_pipeline(pipeline, ContentPipelineStage.QUALITY_REVIEW)

            if pipeline.stage == ContentPipelineStage.QUALITY_REVIEW:
                content = self.db.query(GeneratedContent).filter(GeneratedContent.id == pipeline.generated_content_id).first()
                score = content.scores.overall_quality if content and content.scores else None
                if score is None or score < self.QUALITY_THRESHOLD:
                    pipeline.last_error = f"Quality score {score} is below the required threshold of {self.QUALITY_THRESHOLD}."
                    self._fail_pipeline(pipeline)
                    return pipeline
                self._request_approval(pipeline)

        except Exception as e:
            pipeline.retry_count += 1
            pipeline.last_error = str(e)
            self._fail_pipeline(pipeline)

        return pipeline

    def _request_approval(self, pipeline: ContentPipelineRun) -> None:
        content_id = pipeline.generated_content_id
        pub_service = ContentPublishingService(self.db)
        # This "approve" marks the GeneratedContent row internally ready-to-schedule;
        # it is NOT the human approval gate - that still happens via the emailed
        # approval token below, which is what actually lets the job publish.
        pub_service.approve_content(content_id, approved_by="AI Autonomous System")

        scheduled_time = self._compute_scheduled_time(pipeline)
        job = pub_service.create_job_from_generated_content(content_id, "LinkedIn", scheduled_time=scheduled_time)
        pipeline.publishing_job_id = job.id
        self._transition_pipeline(pipeline, ContentPipelineStage.PENDING_APPROVAL)

        recipient_email = self._recipient_email()
        if recipient_email:
            try:
                asyncio.run(PublishingApprovalService(self.db).request_approval(job.id, recipient_email))
                self.audit_logger.log("APPROVAL_EMAIL_SENT", f"Approval email sent to {recipient_email}.", self._business_id_for_pipeline(pipeline), pipeline.workflow_run_id)
            except Exception as e:
                logger.error(f"Failed to send approval email for job {job.id}: {e}")
        else:
            logger.warning("No user account found to email the approval request to - skipping.")

    def continue_after_approval(self, pipeline_id: int, action: str) -> ContentPipelineRun:
        pipeline = self._get_pipeline(pipeline_id)

        if action == "approve":
            self._transition_pipeline(pipeline, ContentPipelineStage.APPROVED)
            job = self.db.query(PublishingJob).filter(PublishingJob.id == pipeline.publishing_job_id).first()
            if not job:
                pipeline.last_error = "Approved but no publishing job was found."
                self._fail_pipeline(pipeline)
                return pipeline

            self._transition_pipeline(pipeline, ContentPipelineStage.QUEUED)
            try:
                publishing_orchestrator = PublishingOrchestrator(self.db)
                if job.scheduled_time and job.scheduled_time > datetime.utcnow():
                    schedule_job(job.id, job.scheduled_time)
                    self._transition_pipeline(pipeline, ContentPipelineStage.SCHEDULED)
                else:
                    self._transition_pipeline(pipeline, ContentPipelineStage.PUBLISHING)
                    job = publishing_orchestrator.publish_now(job.id)
                    if job.status in (PublishingStatus.PUBLISHED, PublishingStatus.VERIFIED_PUBLISHED):
                        self._transition_pipeline(pipeline, ContentPipelineStage.PUBLISHED)
                        self.audit_logger.log("PUBLISHED", "Content published to LinkedIn.", self._business_id_for_pipeline(pipeline), pipeline.workflow_run_id)
                        self.continue_after_publish(pipeline.id)
                    else:
                        pipeline.last_error = f"Publish attempt resulted in status {job.status}"
                        self._fail_pipeline(pipeline)
            except Exception as e:
                pipeline.last_error = str(e)
                self._fail_pipeline(pipeline)

        elif action == "request_changes":
            self.audit_logger.log("CHANGES_REQUESTED", "Reviewer requested changes.", self._business_id_for_pipeline(pipeline), pipeline.workflow_run_id)
            pipeline.retry_count += 1
            self._transition_pipeline(pipeline, ContentPipelineStage.CHANGES_REQUESTED)
            self._transition_pipeline(pipeline, ContentPipelineStage.CONTENT_GENERATING)
            self.advance_content_pipeline(pipeline.id)

        elif action == "cancel":
            pipeline.last_error = "Cancelled by reviewer"
            self._fail_pipeline(pipeline)

        return pipeline

    def continue_after_publish(self, pipeline_id: int) -> ContentPipelineRun:
        pipeline = self._get_pipeline(pipeline_id)
        business_id = self._business_id_for_pipeline(pipeline)

        self._transition_pipeline(pipeline, ContentPipelineStage.ANALYTICS_RUNNING)
        try:
            asyncio.run(self._run_analytics(business_id))
        except Exception as e:
            # Analytics/learning are best-effort - a successful publish should
            # still count as a successful pipeline even if this stage errors.
            logger.error(f"Analytics collection failed for pipeline {pipeline.id}: {e}")

        self._transition_pipeline(pipeline, ContentPipelineStage.LEARNING_RUNNING)
        try:
            asyncio.run(PerformanceAIEngine(self.db).process_latest_metrics(business_id))
        except Exception as e:
            logger.error(f"Learning engine failed for pipeline {pipeline.id}: {e}")
        try:
            BrandIntelligenceService(self.db).regenerate_brand_profile(business_id)
            self.audit_logger.log("LEARNING_COMPLETED", "Performance metrics processed and brand memory updated.", business_id, pipeline.workflow_run_id)
        except Exception as e:
            logger.error(f"Brand memory update failed for pipeline {pipeline.id}: {e}")

        pipeline.status = RunStatus.COMPLETED
        self._transition_pipeline(pipeline, ContentPipelineStage.COMPLETED)
        return pipeline

    async def _run_analytics(self, business_id: int) -> None:
        repository = AnalyticsRepository()
        collector = AnalyticsCollector(repository)
        await collector.run_collection_cycle("linkedin")

    # ------------------------------------------------------------------
    # Cycle-stage handlers - each calls an already-clean, existing service
    # method, verified during the architecture review before this file
    # was written.
    # ------------------------------------------------------------------

    def _run_content_intelligence(self, business_id: int) -> None:
        # ImportedContent has no business_id FK anywhere in the schema
        # (ContentImport.user_id is a free-text string) - dispatch analysis
        # for whatever is pending system-wide, matching the single-tenant
        # assumption already baked into content_analysis/orchestrator.py
        # (which itself just grabs `BusinessProfile).first()`).
        pending = self.db.query(ImportedContent).filter(
            ImportedContent.analysis_status.in_([AnalysisStatus.PENDING, AnalysisStatus.READY_FOR_AI])
        ).all()
        for item in pending:
            AnalysisDispatcher.dispatch(item.id)

    def _run_brand_intelligence(self, business_id: int) -> None:
        BrandIntelligenceService(self.db).regenerate_brand_profile(business_id)

    def _run_market_intelligence(self, business_id: int) -> None:
        MarketIntelligenceService(self.db).refresh_trends_background()

    def _run_competitor_intelligence(self, business_id: int) -> None:
        service = MarketIntelligenceService(self.db)
        for competitor in service.get_competitors(business_id):
            service.refresh_competitor_background(competitor.id)

    def _run_strategy(self, business_id: int) -> None:
        StrategyService(self.db).generate_strategy(business_id)

    def _run_weekly_plan(self, business_id: int) -> None:
        ExecutionService(self.db).generate_weekly_plan(business_id)

    def _latest_weekly_plan(self, business_id: int) -> Optional[WeeklyPlan]:
        return (
            self.db.query(WeeklyPlan)
            .filter(WeeklyPlan.business_id == business_id)
            .order_by(WeeklyPlan.version.desc(), WeeklyPlan.created_at.desc())
            .first()
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _compute_scheduled_time(self, pipeline: ContentPipelineRun) -> datetime:
        slot = self.db.query(ContentSlot).filter(ContentSlot.id == pipeline.content_slot_id).first()
        plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.id == slot.weekly_plan_id).first() if slot else None
        schedule = (
            self.db.query(WorkflowSchedule).filter(WorkflowSchedule.business_id == plan.business_id).first()
            if plan else None
        )
        preferred_time = schedule.preferred_time if schedule else "09:00"
        day_name = (slot.day_of_week if slot and slot.day_of_week else None) or (
            schedule.preferred_day_of_week if schedule else "Monday"
        )
        return _next_occurrence(day_name, preferred_time)

    def _recipient_email(self) -> Optional[str]:
        # No per-business user linkage exists in the schema yet (single-tenant
        # assumption, same as elsewhere) - notify whoever owns the account.
        user = self.db.query(User).first()
        return user.email if user else None

    def _business_id_for_pipeline(self, pipeline: ContentPipelineRun) -> int:
        run = self.db.query(WorkflowRun).filter(WorkflowRun.id == pipeline.workflow_run_id).first()
        return run.business_id

    def _get_pipeline(self, pipeline_id: int) -> ContentPipelineRun:
        pipeline = self.db.query(ContentPipelineRun).filter(ContentPipelineRun.id == pipeline_id).first()
        if not pipeline:
            raise ValueError(f"ContentPipelineRun {pipeline_id} not found")
        return pipeline

    def _transition(self, run: WorkflowRun, stage: CycleStage) -> None:
        run.cycle_stage = stage
        run.updated_at = datetime.now(timezone.utc)
        self.db.commit()

    def _fail(self, run: WorkflowRun, error: str) -> None:
        run.status = RunStatus.FAILED
        run.cycle_stage = CycleStage.FAILED
        run.error_message = error
        run.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.audit_logger.log("WORKFLOW_FAILED", f"WorkflowRun failed: {error}", run.business_id, run.id)
        logger.error(f"WorkflowRun {run.id} failed: {error}")

    def _transition_pipeline(self, pipeline: ContentPipelineRun, stage: ContentPipelineStage) -> None:
        pipeline.stage = stage
        pipeline.updated_at = datetime.now(timezone.utc)
        self.db.commit()

    def _fail_pipeline(self, pipeline: ContentPipelineRun) -> None:
        pipeline.status = RunStatus.FAILED
        pipeline.stage = ContentPipelineStage.FAILED
        pipeline.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        logger.error(f"ContentPipelineRun {pipeline.id} failed: {pipeline.last_error}")
