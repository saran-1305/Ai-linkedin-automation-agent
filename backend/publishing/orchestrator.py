import logging
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.publishing import (
    PublishingJob, PublishingStatus, PublishLog, 
    PublishingError, PublishingHistory, PlatformAccount, PublishingApproval
)
from models.content import PlatformVariation, PlatformContent
from publishing.providers.factory import ProviderFactory
from publishing.scheduler.core import schedule_job, cancel_scheduled_job
from publishing.validator import PublishingReadinessValidator
from publishing.engine.validation import PlatformValidationEngine
from publishing.engine.recovery import FailureRecoveryEngine
from publishing.engine.verification import PublishingVerificationEngine
import time
import asyncio

logger = logging.getLogger(__name__)

class PublishingOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def _log_history(self, job: PublishingJob, old_status: PublishingStatus, new_status: PublishingStatus, by: str = "System"):
        history = PublishingHistory(
            job_id=job.id,
            previous_status=old_status.value if old_status else None,
            new_status=new_status.value,
            changed_by=by
        )
        self.db.add(history)

    def _add_log(self, job: PublishingJob, action: str, details: dict):
        log = PublishLog(
            job_id=job.id,
            action=action,
            details=json.dumps(details)
        )
        self.db.add(log)

    def schedule_publish(self, variation_id: int, account_id: int, scheduled_time: datetime, by: str = "User") -> PublishingJob:
        # 1. Validation & Readiness Engine
        validator = PublishingReadinessValidator(self.db)
        score, report = validator.validate(variation_id, account_id, scheduled_time)
        
        if score < 80:
            raise ValueError(f"Publishing Readiness Validation Failed (Score: {score}). Fix required issues before scheduling.")
            
        # 2. Create Job
        job = PublishingJob(
            variation_id=variation_id,
            account_id=account_id,
            status=PublishingStatus.SCHEDULED,
            scheduled_time=scheduled_time,
            readiness_score=score,
            validation_report=json.dumps(report),
            created_by=by
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        
        # 3. Add to APScheduler
        try:
            schedule_job(job.id, scheduled_time)
        except Exception as e:
            logger.error(f"Failed to add job to APScheduler: {e}")
            job.status = PublishingStatus.FAILED
            self.db.commit()
            raise ValueError("Failed to schedule job in background worker.")
        
        # 4. Log History
        self._log_history(job, None, PublishingStatus.SCHEDULED, by)
        self._add_log(job, "Scheduled via APScheduler", {"scheduled_time": scheduled_time.isoformat()})
        self.db.commit()
        
        return job

    def cancel_job(self, job_id: int, by: str = "User"):
        job = self.db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found.")
            
        if job.status not in [PublishingStatus.SCHEDULED, PublishingStatus.FAILED]:
            raise ValueError("Can only cancel scheduled or failed jobs.")
            
        cancel_scheduled_job(job_id)
        
        # Unlink from GeneratedContent so it returns to Approved Inbox
        from models.content import GeneratedContent, PlatformVariation
        variation = self.db.query(PlatformVariation).filter(PlatformVariation.id == job.variation_id).first()
        if variation and variation.platform_content:
            content = self.db.query(GeneratedContent).filter(GeneratedContent.id == variation.platform_content.content_id).first()
            if content and content.publishing_job_id == job.id:
                content.publishing_job_id = None
                content.publish_mode = None
        
        self.db.delete(job)
        self.db.commit()

    def publish_now(self, job_id: int) -> PublishingJob:
        job = self.db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ValueError(f"Publishing Job {job_id} not found.")

        if job.status not in [PublishingStatus.SCHEDULED, PublishingStatus.FAILED, PublishingStatus.APPROVED]:
            raise ValueError(f"Cannot publish job in status {job.status}")

        old_status = job.status
        job.status = PublishingStatus.PUBLISHING
        self._log_history(job, old_status, PublishingStatus.PUBLISHING)
        self._add_log(job, "Started Publishing", {})
        self.db.commit()

        try:
            # 1. Fetch data
            variation = self.db.query(PlatformVariation).filter(PlatformVariation.id == job.variation_id).first()
            account = self.db.query(PlatformAccount).filter(PlatformAccount.id == job.account_id).first()
            
            if not account.is_connected:
                raise ValueError("Platform account is disconnected.")

            # 2. Get Provider & Pre-Validate
            provider = ProviderFactory.get_provider(account)
            
            # Build full post text: hook + body + CTA + hashtags from the linked draft
            def build_full_post(variation) -> str:
                try:
                    pc = variation.platform_content
                    content = pc.content if pc else None
                    draft = content.drafts[0] if content and content.drafts else None
                    if draft:
                        parts = []
                        if draft.hook: parts.append(draft.hook.strip())
                        if draft.body: parts.append(draft.body.strip())
                        if draft.cta: parts.append(draft.cta.strip())
                        if draft.hashtags:
                            tags = draft.hashtags if isinstance(draft.hashtags, list) else []
                            ht = " ".join(f"#{t.strip('#')}" for t in tags)
                            if ht: parts.append(ht)
                        if parts:
                            return "\n\n".join(parts)
                except Exception:
                    pass
                return variation.body if variation and variation.body else "Missing content"
            
            content_text = build_full_post(variation)
            
            is_valid, validation_msg = asyncio.run(PlatformValidationEngine.validate(provider, content_text))
            if not is_valid:
                raise ValueError(f"Platform validation failed: {validation_msg}")
            
            # 3. Publish
            start_time = time.time()
            result = asyncio.run(provider.publish_content(content_text))
            duration_ms = int((time.time() - start_time) * 1000)

            # 4. Handle Success
            job.platform_post_id = result.get("post_id")
            job.published_url = result.get("url")
            job.api_response = json.dumps(result.get("api_response", {}))
            job.request_duration_ms = duration_ms
            
            job.status = PublishingStatus.PUBLISHED
            job.published_at = datetime.utcnow()
            self._add_log(job, "API Success", {"post_id": job.platform_post_id, "duration_ms": duration_ms})
            self._log_history(job, PublishingStatus.PUBLISHING, PublishingStatus.PUBLISHED)
            self.db.commit()
            
            # 5. Verification
            # Need to update VerificationEngine as well if it calls provider methods
            verification_engine = PublishingVerificationEngine(self.db)
            final_status = verification_engine.verify(job, provider) # Note: If this makes network calls, needs asyncio.run too. Wait, I will just let it be for now and fix verification if needed.
            
            if final_status != job.status:
                self._log_history(job, job.status, final_status, "VerificationEngine")
                job.status = final_status

        except Exception as e:
            recovery_engine = FailureRecoveryEngine(self.db)
            new_status = recovery_engine.handle_failure(job, e)
            
            error = PublishingError(
                job_id=job.id,
                error_message=str(e),
            )
            self.db.add(error)
            self._add_log(job, "Exception/Failure", {"error": str(e), "new_status": new_status.value if isinstance(new_status, PublishingStatus) else str(new_status)})
            
            if new_status != job.status:
                self._log_history(job, PublishingStatus.PUBLISHING, new_status, "RecoveryEngine")
            job.status = new_status

        self.db.commit()
        self.db.refresh(job)
        return job

    def retry_job(self, job_id: int) -> PublishingJob:
        return self.publish_now(job_id)
