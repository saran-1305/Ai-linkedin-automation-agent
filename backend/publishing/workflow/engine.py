from sqlalchemy.orm import Session
from models.workflow import WorkflowInstance, WorkflowStatus, ReviewDecision, ReviewDecisionType
from models.content import PlatformVariation
from publishing.workflow.notifications import NotificationEngine
from typing import Optional

class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db

    def start_workflow(self, variation_id: int, template_id: Optional[int] = None) -> WorkflowInstance:
        """Starts a workflow and locks the content from being edited directly."""
        workflow = WorkflowInstance(
            variation_id=variation_id,
            template_id=template_id,
            status=WorkflowStatus.IN_REVIEW,
            is_locked=True
        )
        self.db.add(workflow)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def is_content_locked(self, variation_id: int) -> bool:
        """Checks if content is locked by an active workflow."""
        workflow = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.variation_id == variation_id,
            WorkflowInstance.is_locked == True
        ).first()
        return bool(workflow)

    def process_decision(self, decision: ReviewDecision):
        """Process a new decision and transition workflow state."""
        workflow = decision.assignment.workflow
        
        if decision.decision == ReviewDecisionType.REJECT:
            workflow.status = WorkflowStatus.REJECTED
            workflow.is_locked = False
        elif decision.decision == ReviewDecisionType.REQUEST_CHANGES:
            workflow.status = WorkflowStatus.CHANGES_REQUESTED
            workflow.is_locked = False
        elif decision.decision == ReviewDecisionType.APPROVE:
            # Here we check if all assignments for the current stage are approved
            pending_in_stage = [a for a in workflow.assignments if a.stage == workflow.current_stage and a.status == "Pending"]
            if not pending_in_stage:
                # All approved for this stage
                # If there are more stages, advance. For now, mark approved.
                workflow.status = WorkflowStatus.APPROVED
                # Keep locked until published or explicitly unlocked
                
        self.db.commit()
        
        # Notify
        NotificationEngine(self.db).notify_decision(decision)
