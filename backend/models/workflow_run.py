from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from database.base import Base


class CycleStage(str, enum.Enum):
    BUSINESS_READY = "BUSINESS_READY"
    CONTENT_INTELLIGENCE_RUNNING = "CONTENT_INTELLIGENCE_RUNNING"
    CONTENT_INTELLIGENCE_COMPLETED = "CONTENT_INTELLIGENCE_COMPLETED"
    BRAND_INTELLIGENCE_RUNNING = "BRAND_INTELLIGENCE_RUNNING"
    BRAND_INTELLIGENCE_COMPLETED = "BRAND_INTELLIGENCE_COMPLETED"
    MARKET_INTELLIGENCE_RUNNING = "MARKET_INTELLIGENCE_RUNNING"
    MARKET_INTELLIGENCE_COMPLETED = "MARKET_INTELLIGENCE_COMPLETED"
    COMPETITOR_INTELLIGENCE_RUNNING = "COMPETITOR_INTELLIGENCE_RUNNING"
    COMPETITOR_INTELLIGENCE_COMPLETED = "COMPETITOR_INTELLIGENCE_COMPLETED"
    STRATEGY_GENERATING = "STRATEGY_GENERATING"
    STRATEGY_READY = "STRATEGY_READY"
    WEEKLY_PLAN_GENERATING = "WEEKLY_PLAN_GENERATING"
    WEEKLY_PLAN_READY = "WEEKLY_PLAN_READY"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class RunStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PAUSED = "PAUSED"


class ContentPipelineStage(str, enum.Enum):
    CONTENT_GENERATING = "CONTENT_GENERATING"
    CONTENT_READY = "CONTENT_READY"
    IMAGE_SELECTING = "IMAGE_SELECTING"
    IMAGE_READY = "IMAGE_READY"
    QUALITY_REVIEW = "QUALITY_REVIEW"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    QUEUED = "QUEUED"
    SCHEDULED = "SCHEDULED"
    PUBLISHING = "PUBLISHING"
    PUBLISHED = "PUBLISHED"
    ANALYTICS_RUNNING = "ANALYTICS_RUNNING"
    LEARNING_RUNNING = "LEARNING_RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class WorkflowRun(Base):
    """One row per business per autonomous cycle (upstream: Business -> ... -> Weekly Plan)."""
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    cycle_stage = Column(SQLEnum(CycleStage), default=CycleStage.BUSINESS_READY, nullable=False)
    status = Column(SQLEnum(RunStatus), default=RunStatus.RUNNING, nullable=False)

    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="SET NULL"), nullable=True)

    error_message = Column(Text, nullable=True)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    pipeline_runs = relationship("ContentPipelineRun", back_populates="workflow_run", cascade="all, delete-orphan")


class ContentPipelineRun(Base):
    """One row per content slot, fanning out from a WorkflowRun (downstream: Generate -> ... -> Learning)."""
    __tablename__ = "content_pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_run_id = Column(Integer, ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    content_slot_id = Column(Integer, ForeignKey("execution_content_slots.id", ondelete="CASCADE"), nullable=False)

    generated_content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="SET NULL"), nullable=True)
    variation_id = Column(Integer, ForeignKey("content_platform_variations.id", ondelete="SET NULL"), nullable=True)
    publishing_job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="SET NULL"), nullable=True)

    stage = Column(SQLEnum(ContentPipelineStage), default=ContentPipelineStage.CONTENT_GENERATING, nullable=False)
    status = Column(SQLEnum(RunStatus), default=RunStatus.RUNNING, nullable=False)

    retry_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    workflow_run = relationship("WorkflowRun", back_populates="pipeline_runs")
