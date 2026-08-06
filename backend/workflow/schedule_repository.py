from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from models.workflow_schedule import WorkflowSchedule


class ScheduleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, business_id: int) -> WorkflowSchedule:
        schedule = self.db.query(WorkflowSchedule).filter(WorkflowSchedule.business_id == business_id).first()
        if not schedule:
            schedule = WorkflowSchedule(business_id=business_id)
            self.db.add(schedule)
            self.db.commit()
            self.db.refresh(schedule)
        return schedule

    def update(self, business_id: int, **fields) -> WorkflowSchedule:
        schedule = self.get_or_create(business_id)
        for key, value in fields.items():
            if value is not None and hasattr(schedule, key):
                setattr(schedule, key, value)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def due_businesses(self, now: Optional[datetime] = None) -> List[int]:
        """Business IDs whose next scheduled autonomous cycle is due."""
        now = now or datetime.now(timezone.utc)
        schedules = self.db.query(WorkflowSchedule).filter(WorkflowSchedule.is_active == True).all()
        due = []
        for s in schedules:
            if s.next_run_at is None:
                due.append(s.business_id)
            elif s.next_run_at.replace(tzinfo=timezone.utc) <= now:
                due.append(s.business_id)
        return due

    def mark_run(self, business_id: int, now: Optional[datetime] = None) -> WorkflowSchedule:
        now = now or datetime.now(timezone.utc)
        schedule = self.get_or_create(business_id)
        schedule.last_run_at = now
        schedule.next_run_at = now + timedelta(days=schedule.cadence_days or 7)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule
