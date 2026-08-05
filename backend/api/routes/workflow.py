from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database.session import get_db
from models.workflow import WorkflowInstance, ReviewAssignment, ReviewDecision, WorkflowComment, WorkflowStatus, ReviewDecisionType
from publishing.workflow.engine import WorkflowEngine
from publishing.workflow.assignments import AssignmentManager
from publishing.workflow.notifications import NotificationEngine
from datetime import datetime

router = APIRouter(prefix="/workflow", tags=["Publishing Workflow"])

class StartWorkflowRequest(BaseModel):
    variation_id: int
    template_id: int = None

class AssignRequest(BaseModel):
    workflow_id: int
    assigned_to: str
    assigned_by: str = "System"
    stage: int = 1

class DecisionRequest(BaseModel):
    assignment_id: int
    reviewer: str
    decision: ReviewDecisionType
    comments: str = None
    reason: str = None

class CommentRequest(BaseModel):
    workflow_id: int
    author: str
    comment_text: str
    is_inline: bool = False
    parent_id: int = None

@router.post("/start")
def start_workflow(request: StartWorkflowRequest, db: Session = Depends(get_db)):
    engine = WorkflowEngine(db)
    workflow = engine.start_workflow(request.variation_id, request.template_id)
    return {"status": "success", "workflow_id": workflow.id}

@router.post("/assign")
def assign_reviewer(request: AssignRequest, db: Session = Depends(get_db)):
    manager = AssignmentManager(db)
    assignment = manager.assign_reviewer(
        request.workflow_id,
        request.assigned_to,
        request.assigned_by,
        request.stage
    )
    NotificationEngine(db).notify_assignment(assignment)
    return {"status": "success", "assignment_id": assignment.id}

@router.post("/decision")
def make_decision(request: DecisionRequest, db: Session = Depends(get_db)):
    assignment = db.query(ReviewAssignment).filter(ReviewAssignment.id == request.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    decision = ReviewDecision(
        assignment_id=assignment.id,
        reviewer=request.reviewer,
        decision=request.decision,
        comments=request.comments,
        reason=request.reason
    )
    db.add(decision)
    
    AssignmentManager(db).complete_assignment(assignment.id)
    WorkflowEngine(db).process_decision(decision)
    
    return {"status": "success", "decision_id": decision.id}

@router.post("/comment")
def add_comment(request: CommentRequest, db: Session = Depends(get_db)):
    comment = WorkflowComment(
        workflow_id=request.workflow_id,
        author=request.author,
        comment_text=request.comment_text,
        is_inline=request.is_inline,
        parent_id=request.parent_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    NotificationEngine(db)._create_notification(
        request.workflow_id,
        "System",
        "New Comment",
        f"{request.author} added a comment."
    )
    
    return {"status": "success", "comment_id": comment.id}

@router.get("/status/{variation_id}")
def get_workflow_status(variation_id: int, db: Session = Depends(get_db)):
    workflow = db.query(WorkflowInstance).filter(WorkflowInstance.variation_id == variation_id).order_by(WorkflowInstance.created_at.desc()).first()
    if not workflow:
        return {"status": "Not in workflow", "is_locked": False}
    return {
        "workflow_id": workflow.id,
        "status": workflow.status.value,
        "is_locked": workflow.is_locked,
        "current_stage": workflow.current_stage
    }

@router.get("/{workflow_id}/details")
def get_workflow_details(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(WorkflowInstance).filter(WorkflowInstance.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    assignments = []
    for a in workflow.assignments:
        decisions = [{"reviewer": d.reviewer, "decision": d.decision.value, "comments": d.comments, "time": d.timestamp} for d in a.decisions]
        assignments.append({
            "id": a.id,
            "assigned_to": a.assigned_to,
            "status": a.status,
            "stage": a.stage,
            "decisions": decisions
        })
        
    comments = db.query(WorkflowComment).filter(WorkflowComment.workflow_id == workflow_id).all()
    
    return {
        "status": workflow.status.value,
        "assignments": assignments,
        "comments": [{"id": c.id, "author": c.author, "text": c.comment_text, "time": c.created_at} for c in comments]
    }
