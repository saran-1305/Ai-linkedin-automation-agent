from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from database.session import get_db
from models.publishing import PublishingJob, PlatformAccount, PublishingApproval, PublishingStatus
from publishing.orchestrator import PublishingOrchestrator
from publishing.providers.oauth import OAuthHandler
from publishing.services.content_publishing_service import ContentPublishingService

router = APIRouter(prefix="/publishing", tags=["Publishing Center"])

class ScheduleRequest(BaseModel):
    variation_id: int
    account_id: int
    scheduled_time: datetime

class PublishNowRequest(BaseModel):
    variation_id: int
    account_id: int

class ApprovalRequest(BaseModel):
    variation_id: int
    approved_by: str = "User"

@router.post("/approve")
def approve_content(request: ApprovalRequest, db: Session = Depends(get_db)):
    """Approve a content variation for publishing"""
    existing = db.query(PublishingApproval).filter(PublishingApproval.variation_id == request.variation_id).first()
    if existing:
        return {"status": "already_approved", "approval_id": existing.id}
        
    approval = PublishingApproval(
        variation_id=request.variation_id,
        approved_by=request.approved_by
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return {"status": "success", "approval_id": approval.id}

@router.post("/schedule")
def schedule_publishing(request: ScheduleRequest, db: Session = Depends(get_db)):
    """Schedule approved content for future publishing"""
    orchestrator = PublishingOrchestrator(db)
    try:
        job = orchestrator.schedule_publish(
            variation_id=request.variation_id,
            account_id=request.account_id,
            scheduled_time=request.scheduled_time
        )
        return {"status": "success", "job_id": job.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class RescheduleRequest(BaseModel):
    scheduled_time: datetime

@router.post("/reschedule/{job_id}")
def reschedule_publishing(job_id: int, request: RescheduleRequest, db: Session = Depends(get_db)):
    orchestrator = PublishingOrchestrator(db)
    try:
        job = db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ValueError("Job not found")
        variation_id = job.variation_id
        account_id = job.account_id
        
        # We must validate and schedule the NEW job BEFORE deleting the old one,
        # otherwise if validation fails (e.g. time in the past), the old job is lost.
        new_job = orchestrator.schedule_publish(
            variation_id=variation_id,
            account_id=account_id,
            scheduled_time=request.scheduled_time,
            by=job.created_by
        )
        
        # Now that the new job is successfully created, we can safely delete the old one.
        orchestrator.cancel_job(job_id)
        
        return {"status": "success", "new_job_id": new_job.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cancel/{job_id}")
def cancel_publishing(job_id: int, db: Session = Depends(get_db)):
    orchestrator = PublishingOrchestrator(db)
    try:
        orchestrator.cancel_job(job_id)
        return {"status": "success", "message": "Job cancelled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/publish")
def publish_now(request: PublishNowRequest, db: Session = Depends(get_db)):
    """Publish approved content immediately"""
    orchestrator = PublishingOrchestrator(db)
    try:
        # Schedule it for "now". APScheduler will pick it up instantly.
        job = orchestrator.schedule_publish(
            variation_id=request.variation_id,
            account_id=request.account_id,
            scheduled_time=datetime.utcnow()
        )
        return {"status": "success", "job_id": job.id, "message": "Publishing queued"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/retry/{job_id}")
def retry_job(job_id: int, db: Session = Depends(get_db)):
    orchestrator = PublishingOrchestrator(db)
    try:
        job = db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ValueError("Job not found")
        # Reschedule it for now
        orchestrator.schedule_publish(
            variation_id=job.variation_id,
            account_id=job.account_id,
            scheduled_time=datetime.utcnow()
        )
        return {"status": "success", "message": "Retry scheduled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==========================================
# PHASE 5: Content Pipeline Integration
# ==========================================
class ContentPublishRequest(BaseModel):
    platform_name: str
    scheduled_time: datetime | None = None
    approved_by: str = "User"

@router.post("/content/{content_id}/approve")
def approve_generated_content(content_id: int, request: ContentPublishRequest, db: Session = Depends(get_db)):
    service = ContentPublishingService(db)
    try:
        content = service.approve_content(content_id, request.approved_by)
        return {"status": "success", "publish_status": content.publish_status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/content/{content_id}/publish-now")
def publish_content_now(content_id: int, request: ContentPublishRequest, db: Session = Depends(get_db)):
    service = ContentPublishingService(db)
    try:
        # First ensure it's approved if it wasn't already
        content = service.approve_content(content_id, request.approved_by)
        job = service.create_job_from_generated_content(content_id, request.platform_name)
        return {"status": "success", "job_id": job.id, "message": "Publishing queued"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/content/{content_id}/schedule")
def schedule_content(content_id: int, request: ContentPublishRequest, db: Session = Depends(get_db)):
    if not request.scheduled_time:
        raise HTTPException(status_code=400, detail="scheduled_time is required")
        
    service = ContentPublishingService(db)
    try:
        content = service.approve_content(content_id, request.approved_by)
        job = service.create_job_from_generated_content(content_id, request.platform_name, request.scheduled_time)
        return {"status": "success", "job_id": job.id, "message": "Publishing scheduled"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/approved-content")
def get_approved_content(db: Session = Depends(get_db)):
    from models.content import GeneratedContent
    # Fetch content that is approved but not yet assigned to a publishing job
    approved = db.query(GeneratedContent).filter(
        GeneratedContent.publish_status == "APPROVED",
        GeneratedContent.publishing_job_id == None
    ).order_by(GeneratedContent.approved_at.desc()).all()
    
    return [{
        "id": c.id,
        "platform": c.target_platforms[0] if c.target_platforms else "LinkedIn",
        "approved_by": c.approved_by,
        "approved_at": c.approved_at,
        "draft_title": c.drafts[0].title if c.drafts else "Untitled Draft",
        "body_preview": c.drafts[0].body[:100] + "..." if c.drafts and c.drafts[0].body else ""
    } for c in approved]

@router.delete("/content/{content_id}")
def archive_approved_content(content_id: int, db: Session = Depends(get_db)):
    from models.content import GeneratedContent, PublishStatus
    content = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    content.publish_status = PublishStatus.REJECTED.value
    db.commit()
    return {"status": "success", "message": "Content archived successfully"}

@router.get("/jobs")
def get_publishing_jobs(db: Session = Depends(get_db)):
    jobs = db.query(PublishingJob).filter(
        PublishingJob.status != PublishingStatus.ARCHIVED,
        PublishingJob.status != PublishingStatus.CANCELLED
    ).order_by(PublishingJob.created_at.desc()).all()
    return [{
        "id": job.id,
        "variation_id": job.variation_id,
        "status": job.status.value,
        "platform": job.account.platform_name if job.account else "Unknown",
        "scheduled_time": job.scheduled_time,
        "published_at": job.published_at,
        "retry_count": job.retry_count
    } for job in jobs]

@router.get("/jobs/{job_id}")
def get_job_details(job_id: int, db: Session = Depends(get_db)):
    job = db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "id": job.id,
        "status": job.status.value,
        "platform": job.account.platform_name,
        "history": [{"status": h.new_status, "time": h.timestamp} for h in job.history],
        "logs": [{"action": l.action, "details": l.details, "time": l.timestamp} for l in job.logs],
        "errors": [{"error": e.error_message, "time": e.timestamp} for e in job.errors]
    }

@router.get("/accounts")
def get_platform_accounts(db: Session = Depends(get_db)):
    accounts = db.query(PlatformAccount).all()
    return [{
        "id": a.id,
        "platform_name": a.platform_name,
        "account_name": a.account_name,
        "is_connected": a.is_connected,
        "platform_user_id": a.platform_user_id
    } for a in accounts]

@router.get("/accounts/mock")
def create_mock_account(platform_name: str, account_name: str, db: Session = Depends(get_db)):
    """Create a mock connected account for testing"""
    account = PlatformAccount(
        platform_name=platform_name,
        account_name=account_name,
        access_token="mock_token",
        is_connected=True,
        permissions="write,read",
        token_expiry=datetime.utcnow()
    )
    db.add(account)
    db.commit()
    return {"status": "success"}

class PlatformConnectRequest(BaseModel):
    platform_name: str
    auth_code: str
    state: str

@router.get("/platform/{platform_name}/auth-url")
def get_auth_url(platform_name: str, db: Session = Depends(get_db)):
    oauth = OAuthHandler(db)
    try:
        url = oauth.get_authorization_url(platform_name)
        return {"status": "success", "url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/platform/connect")
async def connect_platform(request: PlatformConnectRequest, db: Session = Depends(get_db)):
    import httpx
    oauth = OAuthHandler(db)
    
    # 1. Validate State
    if not oauth.validate_state(request.state, request.platform_name):
        raise HTTPException(status_code=400, detail="Invalid OAuth state.")
        
    try:
        # 2. Exchange Token
        tokens = await oauth.exchange_code_for_token(request.platform_name, request.auth_code)
        access_token = tokens.get("access_token")
        
        # 3. Fetch real user identity from LinkedIn
        platform_user_id = None
        account_name = f"{request.platform_name} Account"
        
        if request.platform_name.lower() == "linkedin" and access_token:
            try:
                async with httpx.AsyncClient() as client:
                    # Use OpenID Connect userinfo endpoint (works with openid+profile scopes)
                    profile_resp = await client.get(
                        "https://api.linkedin.com/v2/userinfo",
                        headers={"Authorization": f"Bearer {access_token}"}
                    )
                    if profile_resp.status_code == 200:
                        profile_data = profile_resp.json()
                        # 'sub' is the LinkedIn member URN like "urn:li:person:XXXXX"
                        sub = profile_data.get("sub")
                        if sub:
                            # LinkedIn sub is returned as a raw ID, build the URN
                            platform_user_id = f"urn:li:person:{sub}"
                        first = profile_data.get("given_name", "")
                        last = profile_data.get("family_name", "")
                        if first or last:
                            account_name = f"{first} {last}".strip()
            except Exception as profile_err:
                # Non-fatal: log and continue, URN will be None
                import logging
                logging.getLogger(__name__).warning(f"Could not fetch LinkedIn profile: {profile_err}")

        # 4. Save Account
        account = PlatformAccount(
            platform_name=request.platform_name,
            account_name=account_name,
            access_token=access_token,
            refresh_token=tokens.get("refresh_token"),
            permissions=tokens.get("scope"),
            is_connected=True,
            platform_user_id=platform_user_id
        )
        db.add(account)
        db.commit()
        return {"status": "success", "account_id": account.id, "account_name": account_name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect: {str(e)}")

@router.post("/platform/{account_id}/disconnect")
def disconnect_platform(account_id: int, db: Session = Depends(get_db)):
    account = db.query(PlatformAccount).filter(PlatformAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.is_connected = False
    account.access_token = ""
    db.commit()
    return {"status": "success"}

@router.post("/platform/{account_id}/refresh")
def refresh_platform_token(account_id: int, db: Session = Depends(get_db)):
    account = db.query(PlatformAccount).filter(PlatformAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    # Mock refresh
    account.access_token = "refreshed_mock_token"
    db.commit()
    return {"status": "success"}

@router.get("/post/{job_id}/status")
def get_post_live_status(job_id: int, db: Session = Depends(get_db)):
    from publishing.providers.factory import ProviderFactory
    job = db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
    if not job or not job.platform_post_id:
        raise HTTPException(status_code=404, detail="Job or post_id not found")
    
    provider = ProviderFactory.get_provider(job.account)
    try:
        status = provider.fetch_publishing_status(job.platform_post_id)
        return {"status": "success", "live_status": status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/calendar")
def get_publishing_calendar(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    jobs = db.query(PublishingJob).filter(
        PublishingJob.scheduled_time >= start_date,
        PublishingJob.scheduled_time <= end_date
    ).all()
    
    return [{
        "id": job.id,
        "title": f"Post to {job.account.platform_name}",
        "start": job.scheduled_time,
        "end": job.scheduled_time,
        "status": job.status.value,
        "platform": job.account.platform_name,
        "color": "#1d9bf0" if job.account.platform_name == "X" else "#0a66c2" # Examples
    } for job in jobs]
