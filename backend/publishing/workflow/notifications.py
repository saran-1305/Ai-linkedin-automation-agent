from sqlalchemy.orm import Session
from models.workflow import WorkflowNotification, ReviewDecision

class NotificationEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def _create_notification(self, workflow_id: int, user_id: str, event_type: str, message: str):
        notification = WorkflowNotification(
            workflow_id=workflow_id,
            user_id=user_id,
            event_type=event_type,
            message=message
        )
        self.db.add(notification)
        self.db.commit()
        
    def notify_assignment(self, assignment):
        self._create_notification(
            assignment.workflow_id,
            assignment.assigned_to,
            "Review Assigned",
            f"You have been assigned to review content by {assignment.assigned_by}."
        )
        
    def notify_decision(self, decision: ReviewDecision):
        # Notify the author or relevant stakeholders
        workflow = decision.assignment.workflow
        # Assuming we know who started it, or broadcast to admins
        self._create_notification(
            workflow.id,
            "System", # Broadcasting to general team for now
            f"Review {decision.decision.value}",
            f"{decision.reviewer} has {decision.decision.value.lower()} the content."
        )
