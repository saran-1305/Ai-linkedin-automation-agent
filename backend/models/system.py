from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from datetime import datetime, timezone
from database.base import Base


class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    business_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=True, index=True)
    workflow_run_id = Column(Integer, ForeignKey("workflow_runs.id"), nullable=True, index=True)
    metadata_info = Column(JSON, nullable=True)  # Using metadata_info because metadata is reserved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # success, error, warning, info
    is_read = Column(Boolean, default=False)
    metadata_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class SystemLock(Base):
    __tablename__ = "system_locks"

    name = Column(String, primary_key=True)
    locked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
