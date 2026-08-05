from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum
from database.base import Base
from datetime import datetime

class WorkflowRole(str, enum.Enum):
    ADMIN = "Admin"
    MARKETING_MANAGER = "Marketing Manager"
    CONTENT_STRATEGIST = "Content Strategist"
    REVIEWER = "Reviewer"
    PUBLISHER = "Publisher"
    VIEWER = "Viewer"

class WorkflowStatus(str, enum.Enum):
    DRAFT = "Draft"
    IN_REVIEW = "In Review"
    CHANGES_REQUESTED = "Changes Requested"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    PUBLISHED = "Published"

class ReviewDecisionType(str, enum.Enum):
    APPROVE = "Approve"
    REJECT = "Reject"
    REQUEST_CHANGES = "Request Changes"

class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    steps_config = Column(JSON) # e.g., [{"stage": 1, "role": "Marketing Manager"}, ...]
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"
    id = Column(Integer, primary_key=True, index=True)
    variation_id = Column(Integer, ForeignKey("content_platform_variations.id", ondelete="CASCADE"))
    template_id = Column(Integer, ForeignKey("workflow_templates.id", ondelete="CASCADE"), nullable=True)
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.DRAFT)
    current_stage = Column(Integer, default=1)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignments = relationship("ReviewAssignment", back_populates="workflow")

class ReviewAssignment(Base):
    __tablename__ = "review_assignments"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_instances.id", ondelete="CASCADE"))
    assigned_by = Column(String)
    assigned_to = Column(String)
    stage = Column(Integer)
    assignment_time = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    status = Column(String, default="Pending") # Pending, Completed
    
    workflow = relationship("WorkflowInstance", back_populates="assignments")
    decisions = relationship("ReviewDecision", back_populates="assignment")

class ReviewDecision(Base):
    __tablename__ = "review_decisions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("review_assignments.id", ondelete="CASCADE"))
    reviewer = Column(String)
    decision = Column(SQLEnum(ReviewDecisionType))
    comments = Column(Text, nullable=True)
    reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("ReviewAssignment", back_populates="decisions")

class WorkflowComment(Base):
    __tablename__ = "workflow_comments"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_instances.id", ondelete="CASCADE"))
    author = Column(String)
    comment_text = Column(Text)
    is_inline = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("workflow_comments.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowNotification(Base):
    __tablename__ = "workflow_notifications"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_instances.id", ondelete="CASCADE"))
    user_id = Column(String) # For now string representing username
    event_type = Column(String) # Review Assigned, Approval Granted, etc.
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
