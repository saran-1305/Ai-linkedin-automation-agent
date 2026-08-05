import logging
import random
from models.publishing import PublishingJob, PublishingStatus
from sqlalchemy.orm import Session
from publishing.scheduler.core import schedule_job
from publishing.providers.base import ProviderException
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
BASE_DELAY_SECONDS = 60  # 1 minute base for exponential backoff
MAX_DELAY_SECONDS = 3600  # cap at 1 hour

# Errors worth retrying: transient/server-side issues that may resolve on their own.
RETRYABLE_CLASSIFICATIONS = {"Rate Limit Error", "Network Error", "Platform Service Error"}
# Errors that will not resolve by waiting: fail immediately, no point burning retries.
NON_RETRYABLE_CLASSIFICATIONS = {"Authentication Error", "Permission Error", "Validation Error"}


class FailureRecoveryEngine:
    def __init__(self, db: Session):
        self.db = db

    def _compute_backoff_seconds(self, retry_count: int, retry_after: int = None) -> int:
        """Prefer the platform's own Retry-After header; otherwise exponential
        backoff with jitter to avoid a thundering-herd of retries."""
        if retry_after:
            return min(retry_after, MAX_DELAY_SECONDS)

        exponential = BASE_DELAY_SECONDS * (2 ** (retry_count - 1))
        jitter = random.uniform(0.8, 1.2)
        return min(int(exponential * jitter), MAX_DELAY_SECONDS)

    def _reschedule(self, job: PublishingJob, delay_seconds: int) -> PublishingStatus:
        job.retry_count += 1
        next_run = datetime.utcnow() + timedelta(seconds=delay_seconds)

        logger.info(f"Retryable failure for job {job.id} (attempt {job.retry_count}/{MAX_RETRIES}). Retrying at {next_run}")

        try:
            schedule_job(job.id, next_run)
            job.status = PublishingStatus.SCHEDULED
            self.db.commit()
            return PublishingStatus.SCHEDULED
        except Exception as e:
            logger.error(f"Failed to reschedule job {job.id}: {e}")
            return PublishingStatus.FAILED

    def handle_failure(self, job: PublishingJob, error: Exception) -> PublishingStatus:
        classification = None
        retry_after = None

        if isinstance(error, ProviderException):
            classification = error.classification
            retry_after = error.retry_after
        else:
            # Fall back to message sniffing for errors that aren't structured
            # ProviderExceptions (e.g. raised directly by orchestrator/validators).
            error_msg = str(error)
            if "401" in error_msg or "Unauthorized" in error_msg:
                classification = "Authentication Error"
            elif "429" in error_msg or "Rate limit" in error_msg or "Timeout" in error_msg:
                classification = "Rate Limit Error"

        if classification in NON_RETRYABLE_CLASSIFICATIONS:
            logger.warning(f"Non-retryable failure ({classification}) for job {job.id}. Manual intervention required.")
            return PublishingStatus.FAILED

        if classification in RETRYABLE_CLASSIFICATIONS and job.retry_count < MAX_RETRIES:
            delay_seconds = self._compute_backoff_seconds(job.retry_count + 1, retry_after)
            return self._reschedule(job, delay_seconds)

        logger.error(f"Unrecoverable failure for job {job.id} ({classification or 'Unknown'}): {error}")
        return PublishingStatus.FAILED
