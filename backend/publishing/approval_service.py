import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from models.publishing import PublishingJob, PublishingApprovalToken, PublishingAuditLog, PublishingStatus
from models.content import PlatformVariation
from services.email.factory import get_email_provider
from services.email.renderer import render_email, html_to_text
from services.email.base import EmailSendResult
from config.settings import settings

logger = logging.getLogger(__name__)

APPROVAL_TOKEN_TTL_HOURS = 48


class ApprovalError(Exception):
    """Raised for any client-facing approval failure (not found, expired, already used, bad action)."""


class PublishingApprovalService:
    def __init__(self, db: Session):
        self.db = db

    def _log_audit(
        self,
        job_id: int,
        action: str,
        actor: Optional[str] = None,
        token_id: Optional[int] = None,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ):
        self.db.add(PublishingAuditLog(
            job_id=job_id,
            approval_token_id=token_id,
            action=action,
            actor=actor,
            previous_status=previous_status,
            new_status=new_status,
            details=details,
            ip_address=ip_address,
        ))

    def _get_variation(self, job: PublishingJob) -> Optional[PlatformVariation]:
        return self.db.query(PlatformVariation).filter(PlatformVariation.id == job.variation_id).first()

    def _build_urls(self, token_value: str) -> tuple[str, str, str]:
        base_url = settings.FRONTEND_BASE_URL.rstrip("/")
        return (
            f"{base_url}/approvals/{token_value}?action=approve",
            f"{base_url}/approvals/{token_value}?action=request_changes",
            f"{base_url}/approvals/{token_value}?action=cancel",
        )

    def _ai_context(self, variation: Optional[PlatformVariation]) -> dict:
        """Pulls the already-computed image + quality-score + reasoning for the
        email, so the reviewer doesn't have to open the app to see why the AI
        made this post."""
        if not variation:
            return {"image_url": None, "image_attribution": None, "quality_score": None, "ai_reasoning": None}

        content = variation.platform_content.content if variation.platform_content else None
        quality_score = None
        ai_reasoning = None
        if content and content.scores and content.scores.overall_quality is not None:
            quality_score = round(content.scores.overall_quality, 1)
        if content and content.reasoning:
            reasoning_parts = [
                content.reasoning.hook_strategy,
                content.reasoning.body_strategy,
            ]
            ai_reasoning = " ".join(p for p in reasoning_parts if p)
        elif variation.reasoning:
            ai_reasoning = variation.reasoning

        return {
            "image_url": variation.image_url,
            "image_attribution": variation.image_attribution,
            "quality_score": quality_score,
            "ai_reasoning": ai_reasoning,
        }

    async def request_approval(self, job_id: int, recipient_email: str, ttl_hours: int = APPROVAL_TOKEN_TTL_HOURS) -> PublishingApprovalToken:
        job = self.db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ApprovalError(f"Publishing job {job_id} not found.")

        variation = self._get_variation(job)
        if not variation:
            raise ApprovalError("Content variation not found for this job.")

        token_value = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=ttl_hours)

        token = PublishingApprovalToken(
            job_id=job.id,
            token=token_value,
            recipient_email=recipient_email,
            expires_at=expires_at,
        )
        self.db.add(token)

        old_status = job.status
        job.status = PublishingStatus.PENDING_APPROVAL

        self.db.flush()  # populate token.id for the audit log FK

        self._log_audit(
            job.id, "approval_requested", actor="system", token_id=token.id,
            previous_status=old_status.value if old_status else None,
            new_status=PublishingStatus.PENDING_APPROVAL.value,
        )
        self.db.commit()
        self.db.refresh(token)

        platform_name = variation.platform_content.platform_name if variation.platform_content else "LinkedIn"
        approve_url, request_changes_url, cancel_url = self._build_urls(token_value)

        html = render_email(
            "approval_request.html",
            workspace_name="Your Workspace",
            platform_name=platform_name,
            scheduled_time=job.scheduled_time.strftime("%b %d, %Y %I:%M %p UTC") if job.scheduled_time else "as soon as approved",
            content_preview=variation.body,
            approve_url=approve_url,
            request_changes_url=request_changes_url,
            cancel_url=cancel_url,
            expires_at=expires_at.strftime("%b %d, %Y %I:%M %p UTC"),
            **self._ai_context(variation),
        )
        result = await get_email_provider().send_email(
            to=recipient_email,
            subject=f"Approval needed: {platform_name} post",
            html_body=html,
            text_body=html_to_text(html),
        )
        if not result.success:
            # Don't fail the request over email delivery - the token/link is still
            # valid and reachable via the in-app notification center.
            self._log_audit(job.id, "approval_email_failed", actor="system", token_id=token.id, details=result.error_message)
            self.db.commit()

        return token

    async def send_reminder(self, token: PublishingApprovalToken) -> EmailSendResult:
        if token.is_consumed or token.is_expired:
            raise ApprovalError("Cannot send a reminder for a consumed or expired token.")

        job = token.job
        variation = self._get_variation(job)
        platform_name = variation.platform_content.platform_name if variation and variation.platform_content else "LinkedIn"
        approve_url, request_changes_url, cancel_url = self._build_urls(token.token)

        hours_remaining = max(0, int((token.expires_at - datetime.utcnow()).total_seconds() // 3600))

        html = render_email(
            "approval_reminder.html",
            workspace_name="Your Workspace",
            platform_name=platform_name,
            scheduled_time=job.scheduled_time.strftime("%b %d, %Y %I:%M %p UTC") if job.scheduled_time else "as soon as approved",
            content_preview=variation.body if variation else "",
            approve_url=approve_url,
            request_changes_url=request_changes_url,
            cancel_url=cancel_url,
            expires_at=token.expires_at.strftime("%b %d, %Y %I:%M %p UTC"),
            hours_remaining=f"{hours_remaining} hour{'s' if hours_remaining != 1 else ''}",
            **self._ai_context(variation),
        )
        result = await get_email_provider().send_email(
            to=token.recipient_email,
            subject=f"Reminder: approval needed for {platform_name} post",
            html_body=html,
            text_body=html_to_text(html),
        )

        token.reminder_sent_at = datetime.utcnow()
        self._log_audit(
            job.id, "approval_reminder_sent" if result.success else "approval_reminder_failed",
            actor="system", token_id=token.id, details=None if result.success else result.error_message,
        )
        self.db.commit()

        return result

    def _get_valid_token(self, token_value: str) -> PublishingApprovalToken:
        token = self.db.query(PublishingApprovalToken).filter(PublishingApprovalToken.token == token_value).first()
        if not token:
            raise ApprovalError("Invalid approval link.")
        if token.is_consumed:
            raise ApprovalError("This approval link has already been used.")
        if token.is_expired:
            raise ApprovalError("This approval link has expired.")
        return token

    def get_preview(self, token_value: str) -> dict:
        token = self._get_valid_token(token_value)
        job = token.job
        variation = self._get_variation(job)
        return {
            "job_id": job.id,
            "status": job.status.value,
            "platform_name": variation.platform_content.platform_name if variation and variation.platform_content else None,
            "content_preview": variation.body if variation else None,
            "scheduled_time": job.scheduled_time,
            "expires_at": token.expires_at,
            **self._ai_context(variation),
        }

    def consume(self, token_value: str, action: str, actor: Optional[str] = None, ip_address: Optional[str] = None) -> PublishingJob:
        if action not in ("approve", "request_changes", "cancel"):
            raise ApprovalError("Action must be 'approve', 'request_changes', or 'cancel'.")

        token = self._get_valid_token(token_value)
        job = token.job
        old_status = job.status

        status_map = {
            "approve": PublishingStatus.APPROVED,
            "request_changes": PublishingStatus.AI_REVIEW,
            "cancel": PublishingStatus.CANCELLED,
        }
        new_status = status_map[action]

        token.consumed_at = datetime.utcnow()
        token.action_taken = action
        job.status = new_status

        self._log_audit(
            job.id, f"approval_{action}", actor=actor or token.recipient_email, token_id=token.id,
            previous_status=old_status.value if old_status else None,
            new_status=new_status.value, ip_address=ip_address,
        )

        self.db.commit()
        self.db.refresh(job)

        # Hand control back to the autonomous orchestrator to continue (approve/request_changes)
        # or terminate (cancel) the content pipeline. Imported lazily: workflow/orchestrator.py
        # imports this module, so a top-level import here would be circular.
        try:
            from models.workflow_run import ContentPipelineRun
            from workflow.orchestrator import AutonomousWorkflowOrchestrator

            pipeline = self.db.query(ContentPipelineRun).filter(ContentPipelineRun.publishing_job_id == job.id).first()
            if pipeline:
                AutonomousWorkflowOrchestrator(self.db).continue_after_approval(pipeline.id, action)
        except Exception as e:
            logger.error(f"Failed to continue autonomous workflow after '{action}' on job {job.id}: {e}")

        self.db.refresh(job)
        return job
