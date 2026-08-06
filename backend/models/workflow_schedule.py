from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from database.base import Base


class WorkflowSchedule(Base):
    """Persisted, business-scoped posting cadence for the autonomous scheduler.

    Replaces relying on the in-memory-only PublishingSettingsRepository for
    anything the AutonomousScheduler needs to survive a restart.
    """
    __tablename__ = "workflow_schedules"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    cadence_days = Column(Integer, default=7, nullable=False)
    preferred_day_of_week = Column(String(20), default="Monday", nullable=False)
    preferred_time = Column(String(10), default="09:00", nullable=False)  # "HH:MM", interpreted in `timezone`
    timezone = Column(String(50), default="UTC", nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
