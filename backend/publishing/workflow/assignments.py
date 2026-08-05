from sqlalchemy.orm import Session
from models.workflow import ReviewAssignment, WorkflowInstance
from datetime import datetime

class AssignmentManager:
    def __init__(self, db: Session):
        self.db = db
        
    def assign_reviewer(self, workflow_id: int, assigned_to: str, assigned_by: str, stage: int = 1, due_date: datetime = None) -> ReviewAssignment:
        assignment = ReviewAssignment(
            workflow_id=workflow_id,
            assigned_by=assigned_by,
            assigned_to=assigned_to,
            stage=stage,
            due_date=due_date
        )
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        
        # We would use NotificationEngine here to notify the assignee
        return assignment
        
    def complete_assignment(self, assignment_id: int):
        assignment = self.db.query(ReviewAssignment).filter(ReviewAssignment.id == assignment_id).first()
        if assignment:
            assignment.status = "Completed"
            self.db.commit()
