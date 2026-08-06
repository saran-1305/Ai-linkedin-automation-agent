from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from database.session import get_db
from api.dependencies import get_current_user_id
from models.publishing import PublishingApprovalToken
from publishing.approval_service import PublishingApprovalService, ApprovalError

router = APIRouter(prefix="/approvals", tags=["Publishing Approvals"])


class RequestApprovalBody(BaseModel):
    recipient_email: str
    ttl_hours: int = 48


class ApprovalPreviewResponse(BaseModel):
    job_id: int
    status: str
    platform_name: Optional[str] = None
    content_preview: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    expires_at: datetime
    image_url: Optional[str] = None
    image_attribution: Optional[str] = None
    quality_score: Optional[float] = None
    ai_reasoning: Optional[str] = None


class ConsumeActionResponse(BaseModel):
    job_id: int
    status: str


class PendingApprovalItem(BaseModel):
    token: str
    job_id: int
    platform_name: Optional[str] = None
    content_preview: Optional[str] = None
    recipient_email: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    requested_at: Optional[datetime] = None
    expires_at: datetime


def _client_ip(request: Request) -> Optional[str]:
    return request.client.host if request.client else None


@router.post("/jobs/{job_id}/request", status_code=201)
async def request_approval(job_id: int, body: RequestApprovalBody, db: Session = Depends(get_db), _user_id: int = Depends(get_current_user_id)):
    """Generate a secure, time-limited approval link and email it to the reviewer.
    This is the one endpoint in this router that requires an in-app login - the
    others are public magic-link endpoints for external reviewers."""
    service = PublishingApprovalService(db)
    try:
        token = await service.request_approval(job_id, body.recipient_email, body.ttl_hours)
    except ApprovalError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"token": token.token, "expires_at": token.expires_at}


@router.get("/pending", response_model=List[PendingApprovalItem])
def list_pending_approvals(db: Session = Depends(get_db), _user_id: int = Depends(get_current_user_id)):
    """Powers the in-app notification center - active (not consumed, not
    expired) approval requests, soonest-expiring first."""
    from models.content import PlatformVariation

    tokens = db.query(PublishingApprovalToken).filter(
        PublishingApprovalToken.consumed_at.is_(None),
        PublishingApprovalToken.expires_at > datetime.utcnow(),
    ).order_by(PublishingApprovalToken.expires_at.asc()).all()

    items = []
    for token in tokens:
        job = token.job
        variation = db.query(PlatformVariation).filter(PlatformVariation.id == job.variation_id).first() if job else None
        items.append(PendingApprovalItem(
            token=token.token,
            job_id=token.job_id,
            platform_name=variation.platform_content.platform_name if variation and variation.platform_content else None,
            content_preview=(variation.body[:140] if variation and variation.body else None),
            recipient_email=token.recipient_email,
            scheduled_time=job.scheduled_time if job else None,
            requested_at=token.created_at,
            expires_at=token.expires_at,
        ))
    return items


@router.get("/{token}", response_model=ApprovalPreviewResponse)
def get_approval_preview(token: str, db: Session = Depends(get_db)):
    """Public lookup used by the secure approval page - no login required, the
    token itself is the credential."""
    service = PublishingApprovalService(db)
    try:
        return service.get_preview(token)
    except ApprovalError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{token}/approve", response_model=ConsumeActionResponse)
def approve(token: str, request: Request, db: Session = Depends(get_db)):
    service = PublishingApprovalService(db)
    try:
        job = service.consume(token, "approve", ip_address=_client_ip(request))
    except ApprovalError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"job_id": job.id, "status": job.status.value}


@router.post("/{token}/request_changes", response_model=ConsumeActionResponse)
def request_changes(token: str, request: Request, db: Session = Depends(get_db)):
    service = PublishingApprovalService(db)
    try:
        job = service.consume(token, "request_changes", ip_address=_client_ip(request))
    except ApprovalError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"job_id": job.id, "status": job.status.value}


@router.post("/{token}/cancel", response_model=ConsumeActionResponse)
def cancel(token: str, request: Request, db: Session = Depends(get_db)):
    service = PublishingApprovalService(db)
    try:
        job = service.consume(token, "cancel", ip_address=_client_ip(request))
    except ApprovalError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"job_id": job.id, "status": job.status.value}
