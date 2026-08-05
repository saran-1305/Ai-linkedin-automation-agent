import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.content import GeneratedContent, PublishStatus, PlatformVariation, PlatformContent
from models.publishing import PublishingJob, PublishingStatus, PlatformAccount
from publishing.orchestrator import PublishingOrchestrator

logger = logging.getLogger(__name__)

class ContentPublishingService:
    def __init__(self, db: Session):
        self.db = db
        self.orchestrator = PublishingOrchestrator(db)

    def approve_content(self, content_id: int, approved_by: str = "User") -> GeneratedContent:
        content = self.db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
        if not content:
            raise ValueError(f"Content {content_id} not found.")

        content.publish_status = PublishStatus.APPROVED.value
        content.approved_by = approved_by
        content.approved_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(content)
        return content

    def create_job_from_generated_content(self, content_id: int, platform_name: str, scheduled_time: datetime = None) -> PublishingJob:
        """
        Creates a publishing job from a GeneratedContent.
        It finds the specific PlatformVariation for the target platform.
        """
        content = self.db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
        if not content:
            raise ValueError("Content not found.")
            
        if content.publish_status != PublishStatus.APPROVED.value:
            raise ValueError("Content must be APPROVED before scheduling/publishing.")

        # Find the platform variation for this platform
        platform_content = self.db.query(PlatformContent).filter(
            PlatformContent.content_id == content_id,
            PlatformContent.platform_name == platform_name
        ).first()

        if not platform_content or not platform_content.variations:
            # Fallback to creating one if not exists (for backwards compatibility if Phase 3 was skipped)
            # Just create a dummy variation to satisfy the FK
            variation_id = self._get_or_create_variation(content_id, platform_name)
        else:
            variation_id = platform_content.variations[0].id

        # Find Connected Account
        account = self.db.query(PlatformAccount).filter(
            PlatformAccount.platform_name == platform_name,
            PlatformAccount.is_connected == True
        ).first()

        if not account:
            raise ValueError(f"No connected account found for platform {platform_name}.")

        if not scheduled_time:
            scheduled_time = datetime.utcnow()
            content.publish_mode = "Manual"
        else:
            content.publish_mode = "Scheduled"
            
        job = self.orchestrator.schedule_publish(
            variation_id=variation_id,
            account_id=account.id,
            scheduled_time=scheduled_time,
            by=content.approved_by or "User"
        )
        
        # Update GeneratedContent tracking fields
        content.publishing_job_id = job.id
        content.scheduled_at = scheduled_time
        
        # Merge target platforms
        current_platforms = content.target_platforms or []
        if platform_name not in current_platforms:
            current_platforms.append(platform_name)
        content.target_platforms = current_platforms
        
        self.db.commit()
        return job

    def _get_or_create_variation(self, content_id: int, platform_name: str) -> int:
        # Helper to generate a PlatformVariation if it doesn't exist
        content = self.db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
        draft = content.drafts[0] if content.drafts else None
        
        # Assemble the full post: hook + body + cta + hashtags
        parts = []
        if draft:
            if draft.hook:
                parts.append(draft.hook.strip())
            if draft.body:
                parts.append(draft.body.strip())
            if draft.cta:
                parts.append(draft.cta.strip())
            if draft.hashtags:
                tags = draft.hashtags if isinstance(draft.hashtags, list) else []
                hashtag_line = " ".join(f"#{t.strip('#')}" for t in tags)
                if hashtag_line:
                    parts.append(hashtag_line)
        
        full_body = "\n\n".join(parts) if parts else "Empty content"
        
        pc = PlatformContent(content_id=content_id, platform_name=platform_name)
        self.db.add(pc)
        self.db.commit()
        self.db.refresh(pc)
        
        pv = PlatformVariation(platform_content_id=pc.id, body=full_body, variation_label="Default")
        self.db.add(pv)
        self.db.commit()
        return pv.id
