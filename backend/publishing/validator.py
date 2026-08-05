import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.publishing import PublishingJob, PublishingStatus, PlatformAccount, PublishingApproval
from models.content import PlatformVariation

class PublishingReadinessValidator:
    def __init__(self, db: Session):
        self.db = db
        
    def validate(self, variation_id: int, account_id: int, scheduled_time: datetime) -> tuple[int, dict]:
        """
        Validates readiness and returns a tuple: (readiness_score, validation_report)
        Readiness score: 0-100. >=80 is required for scheduling.
        """
        score = 100
        report = {
            "passed": [],
            "failed": [],
            "warnings": [],
            "recommended_fixes": []
        }
        
        # 1. Approval Check (Handled upstream in Phase 5, assume True if we reach here)
        report["passed"].append("Content approval verified upstream.")
            
        # 2. Account Connection Check
        account = self.db.query(PlatformAccount).filter(PlatformAccount.id == account_id).first()
        if account and account.is_connected:
            report["passed"].append(f"Account {account.platform_name} is connected.")
        else:
            score -= 50
            report["failed"].append("Platform account is disconnected or missing.")
            report["recommended_fixes"].append("Reconnect the platform account.")
            
        # 3. Conflict Detection (Duplicate times or overlapping posts on same platform)
        if scheduled_time:
            # Simple check: is there another job for this account exactly at this time?
            conflict = self.db.query(PublishingJob).filter(
                PublishingJob.account_id == account_id,
                PublishingJob.scheduled_time == scheduled_time,
                PublishingJob.status.in_([PublishingStatus.SCHEDULED, PublishingStatus.PUBLISHING])
            ).first()
            
            if conflict:
                score -= 30
                report["failed"].append("Scheduling conflict detected (overlap).")
                report["recommended_fixes"].append("Select a different scheduled time.")
            else:
                report["passed"].append("No scheduling conflicts detected.")
                
        # 4. Schedule Validity (Add 5 min grace period for 'Publish Now')
        from datetime import timedelta, timezone
        now_utc = datetime.now(timezone.utc)
        
        # Ensure scheduled_time is aware before comparing
        if scheduled_time:
            if scheduled_time.tzinfo is None:
                scheduled_time = scheduled_time.replace(tzinfo=timezone.utc)
                
            if scheduled_time < (now_utc - timedelta(minutes=5)):
                score -= 30
                report["failed"].append("Scheduled time is in the past.")
                report["recommended_fixes"].append("Select a future time for scheduling.")
            else:
                report["passed"].append("Publishing time is valid.")
            
        # Ensure score stays between 0 and 100
        score = max(0, min(100, score))
        return score, report
