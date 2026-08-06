import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.system import SystemAuditLog, Notification, SystemLock
from models.user import User

logger = logging.getLogger(__name__)

class WorkflowLockService:
    def __init__(self, db: Session):
        self.db = db

    def acquire_lock(self, lock_name: str, ttl_seconds: int = 3600) -> bool:
        """Attempts to acquire a named lock. Returns True if successful, False if already locked."""
        try:
            # Clean up expired locks first
            now = datetime.now(timezone.utc)
            self.db.query(SystemLock).filter(SystemLock.expires_at < now).delete()
            self.db.commit()

            lock = SystemLock(
                name=lock_name,
                locked_at=now,
                expires_at=now + timedelta(seconds=ttl_seconds)
            )
            self.db.add(lock)
            self.db.commit()
            return True
        except IntegrityError:
            self.db.rollback()
            return False
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error acquiring lock {lock_name}: {e}")
            return False

    def release_lock(self, lock_name: str) -> None:
        """Releases a named lock."""
        try:
            self.db.query(SystemLock).filter(SystemLock.name == lock_name).delete()
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error releasing lock {lock_name}: {e}")

class AuditLogger:
    def __init__(self, db: Session):
        self.db = db

    def log(self, event_type: str, description: str, business_id: Optional[int] = None, workflow_run_id: Optional[int] = None, metadata_info: Optional[dict] = None) -> None:
        """Creates a SystemAuditLog entry."""
        try:
            log_entry = SystemAuditLog(
                event_type=event_type,
                description=description,
                business_id=business_id,
                workflow_run_id=workflow_run_id,
                metadata_info=metadata_info
            )
            self.db.add(log_entry)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to write audit log ({event_type}): {e}")

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def notify_user(self, user_id: int, title: str, message: str, type: str = "info", metadata_info: Optional[dict] = None) -> None:
        """Creates a Notification for a specific user."""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=type,
                metadata_info=metadata_info
            )
            self.db.add(notification)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create notification for user {user_id}: {e}")

    def notify_all_admins(self, title: str, message: str, type: str = "info", metadata_info: Optional[dict] = None) -> None:
        """Sends a notification to all admin users."""
        admins = self.db.query(User).filter(User.role == "admin").all()
        for admin in admins:
            self.notify_user(admin.id, title, message, type, metadata_info)

    def get_unread_notifications(self, user_id: int):
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).order_by(Notification.created_at.desc()).all()

    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        notif = self.db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return True
        return False

    def get_user_notifications(self, user_id: int, limit: int = 50):
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_all_as_read(self, user_id: int) -> None:
        self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        self.db.commit()

