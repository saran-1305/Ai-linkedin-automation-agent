import logging
import json
from models.publishing import PublishingJob, PublishingStatus
from sqlalchemy.orm import Session
from publishing.providers.base import BaseProvider
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class PublishingVerificationEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def verify(self, job: PublishingJob, provider: BaseProvider) -> PublishingStatus:
        if not job.platform_post_id:
            logger.warning(f"Job {job.id} has no platform_post_id. Cannot verify.")
            return PublishingStatus.VERIFICATION_FAILED
            
        try:
            status_data = asyncio.run(provider.fetch_publishing_status(job.platform_post_id))
            if status_data.get("status") == "PUBLISHED":
                job.verified_published_at = datetime.utcnow()
                logger.info(f"Job {job.id} verified published on {provider.account.platform_name}")
                return PublishingStatus.VERIFIED_PUBLISHED
            else:
                logger.warning(f"Job {job.id} platform status is {status_data.get('status')}")
                return PublishingStatus.VERIFICATION_FAILED
        except Exception as e:
            logger.error(f"Verification failed for job {job.id}: {e}")
            return PublishingStatus.VERIFICATION_FAILED
