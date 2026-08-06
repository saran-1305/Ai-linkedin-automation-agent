from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from api.dependencies import get_db, get_current_user_id
from services.system_services import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_notifications(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = NotificationService(db)
    notifications = service.get_user_notifications(user_id=user_id, limit=50)
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "metadata_info": n.metadata_info,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]

@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = NotificationService(db)
    success = service.mark_as_read(notification_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.post("/read-all")
async def mark_all_notifications_read(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = NotificationService(db)
    service.mark_all_as_read(user_id=user_id)
    return {"status": "success"}
