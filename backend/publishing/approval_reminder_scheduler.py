import asyncio
import logging
from datetime import datetime, timedelta

from database.session import SessionLocal
from models.publishing import PublishingApprovalToken
from publishing.approval_service import PublishingApprovalService, ApprovalError

logger = logging.getLogger(__name__)

# Send exactly one reminder once a token is within this window of expiring,
# to avoid pinging the reviewer repeatedly.
REMINDER_WINDOW_HOURS = 24


class ApprovalReminderScheduler:
    """Background loop that emails a single reminder for approval tokens
    that are still pending and approaching expiry."""

    def __init__(self, interval_seconds: int = 1800):
        self.interval_seconds = interval_seconds
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"Approval Reminder Scheduler started. Interval: {self.interval_seconds}s")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Approval Reminder Scheduler stopped.")

    async def _run_loop(self):
        while self._running:
            try:
                await self._send_due_reminders()
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in approval reminder scheduler loop: {e}")
                await asyncio.sleep(60)

    async def _send_due_reminders(self):
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            reminder_cutoff = now + timedelta(hours=REMINDER_WINDOW_HOURS)

            due_tokens = db.query(PublishingApprovalToken).filter(
                PublishingApprovalToken.consumed_at.is_(None),
                PublishingApprovalToken.reminder_sent_at.is_(None),
                PublishingApprovalToken.expires_at > now,
                PublishingApprovalToken.expires_at <= reminder_cutoff,
            ).all()

            if not due_tokens:
                return

            logger.info(f"Sending {len(due_tokens)} approval reminder(s)...")
            service = PublishingApprovalService(db)

            for token in due_tokens:
                try:
                    result = await service.send_reminder(token)
                    if not result.success:
                        logger.warning(f"Reminder email failed for token id={token.id}: {result.error_message}")
                except ApprovalError as e:
                    logger.warning(f"Skipping reminder for token id={token.id}: {e}")
        finally:
            db.close()


approval_reminder_scheduler = ApprovalReminderScheduler()
