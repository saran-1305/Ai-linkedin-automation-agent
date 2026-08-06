import asyncio
import logging

from database.session import SessionLocal
from workflow.orchestrator import AutonomousWorkflowOrchestrator
from workflow.schedule_repository import ScheduleRepository

logger = logging.getLogger(__name__)


class AutonomousScheduler:
    """Background driver for the autonomous AI Growth workflow - the same
    in-process asyncio-loop pattern already used by AnalyticsScheduler and
    ApprovalReminderScheduler. No new worker process/container.

    Orchestrator calls are synchronous and use asyncio.run() internally for
    their few async sub-calls (email sending, analytics collection), so they
    must never run directly on this scheduler's own event loop thread -
    every call into the orchestrator here goes through asyncio.to_thread.
    """

    def __init__(self, interval_seconds: int = 1800):
        self.interval_seconds = interval_seconds
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        await asyncio.to_thread(self._recover)
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"Autonomous Scheduler started. Interval: {self.interval_seconds}s")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Autonomous Scheduler stopped.")

    async def _run_loop(self):
        while self._running:
            try:
                await asyncio.to_thread(self._tick)
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in Autonomous Scheduler loop: {e}")
                await asyncio.sleep(60)

    def _recover(self):
        """Startup recovery pass: resume any WorkflowRun/ContentPipelineRun
        left in-progress when the process last stopped, instead of
        restarting the whole cycle from scratch."""
        db = SessionLocal()
        try:
            resumed = AutonomousWorkflowOrchestrator(db).resume_incomplete_runs()
            if resumed:
                logger.info(f"Autonomous Scheduler resumed {len(resumed)} in-progress run(s)/pipeline(s) after restart.")
        except Exception as e:
            logger.error(f"Autonomous Scheduler recovery pass failed: {e}")
        finally:
            db.close()

    def _tick(self):
        db = SessionLocal()
        try:
            schedule_repo = ScheduleRepository(db)
            due_business_ids = schedule_repo.due_businesses()
            if not due_business_ids:
                return
            logger.info(f"Autonomous Scheduler: {len(due_business_ids)} business(es) due for a new cycle.")
            orchestrator = AutonomousWorkflowOrchestrator(db)
            for business_id in due_business_ids:
                try:
                    schedule_repo.mark_run(business_id)
                    orchestrator.run_cycle(business_id)
                except Exception as e:
                    logger.error(f"Autonomous cycle failed for business {business_id}: {e}")
        finally:
            db.close()


autonomous_scheduler = AutonomousScheduler()
