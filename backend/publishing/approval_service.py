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

    def _build_urls(self, token_value: str) -> tuple[str, str]:
        base_url = settings.FRONTEND_BASE_URL.rstrip("/")
        return (
            f"{base_url}/approvals/{token_value}?action=approve",
            f"{base_url}/approvals/{token_value}?action=reject",
        )

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
        approve_url, reject_url = self._build_urls(token_value)

        html = render_email(
            "approval_request.html",
            workspace_name="Your Workspace",
            platform_name=platform_name,
            scheduled_time=job.scheduled_time.strftime("%b %d, %Y %I:%M %p UTC") if job.scheduled_time else "as soon as approved",
            content_preview=variation.body,
            approve_url=approve_url,
            reject_url=reject_url,
            expires_at=expires_at.strftime("%b %d, %Y %I:%M %p UTC"),
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
        approve_url, reject_url = self._build_urls(token.token)

        hours_remaining = max(0, int((token.expires_at - datetime.utcnow()).total_seconds() // 3600))

        html = render_email(
            "approval_reminder.html",
            workspace_name="Your Workspace",
            platform_name=platform_name,
            scheduled_time=job.scheduled_time.strftime("%b %d, %Y %I:%M %p UTC") if job.scheduled_time else "as soon as approved",
            content_preview=variation.body if variation else "",
            approve_url=approve_url,
            reject_url=reject_url,
            expires_at=token.expires_at.strftime("%b %d, %Y %I:%M %p UTC"),
            hours_remaining=f"{hours_remaining} hour{'s' if hours_remaining != 1 else ''}",
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
        }

    def consume(self, token_value: str, action: str, actor: Optional[str] = None, ip_address: Optional[str] = None) -> PublishingJob:
        if action not in ("approve", "reject"):
            raise ApprovalError("Action must be 'approve' or 'reject'.")

        token = self._get_valid_token(token_value)
        job = token.job
        old_status = job.status

        new_status = PublishingStatus.APPROVED if action == "approve" else PublishingStatus.CANCELLED
        action_label = "approved" if action == "approve" else "rejected"

        token.consumed_at = datetime.utcnow()
        token.action_taken = action_label
        job.status = new_status

        self._log_audit(
            job.id, f"approval_{action_label}", actor=actor or token.recipient_email, token_id=token.id,
            previous_status=old_status.value if old_status else None,
            new_status=new_status.value, ip_address=ip_address,
        )

        self.db.commit()
        self.db.refresh(job)
        return job
