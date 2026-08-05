from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from database.base import Base
from datetime import datetime, timezone

class PublishingStatus(str, enum.Enum):
    DRAFT = "Draft"
    AI_REVIEW = "AI Review"
    REVIEWED = "Reviewed"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    QUEUED = "Queued"
    SCHEDULED = "Scheduled"
    PUBLISHING = "Publishing"
    PUBLISHED = "Published"
    PARTIALLY_PUBLISHED = "Partially Published"
    ANALYZING = "Analyzing"
    VERIFIED_PUBLISHED = "Verified Published"
    VERIFICATION_FAILED = "Verification Failed"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"
    ARCHIVED = "Archived"

class PlatformAccount(Base):
    __tablename__ = "platform_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    platform_name = Column(String, index=True)  # LinkedIn, X, Facebook, Instagram, etc.
    account_name = Column(String)
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    permissions = Column(Text, nullable=True) # JSON stored as string
    platform_user_id = Column(String, nullable=True)
    platform_username = Column(String, nullable=True)
    is_connected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    jobs = relationship("PublishingJob", back_populates="account")

class PublishingApproval(Base):
    __tablename__ = "publishing_approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    variation_id = Column(Integer, ForeignKey("content_platform_variations.id", ondelete="CASCADE"))
    approved_by = Column(String)
    approved_at = Column(DateTime, default=datetime.utcnow)

class PublishingJob(Base):
    __tablename__ = "publishing_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    variation_id = Column(Integer, ForeignKey("content_platform_variations.id", ondelete="CASCADE"))
    account_id = Column(Integer, ForeignKey("platform_accounts.id", ondelete="CASCADE"))
    status = Column(SQLEnum(PublishingStatus), default=PublishingStatus.APPROVED)
    scheduled_time = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    verified_published_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0)
    readiness_score = Column(Integer, nullable=True)
    validation_report = Column(Text, nullable=True) # JSON stored as string
    platform_post_id = Column(String, nullable=True)
    published_url = Column(String, nullable=True)
    api_response = Column(Text, nullable=True) # JSON stored as string
    request_duration_ms = Column(Integer, nullable=True)
    created_by = Column(String, default="System")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("PlatformAccount", back_populates="jobs")
    logs = relationship("PublishLog", back_populates="job", cascade="all, delete-orphan")
    errors = relationship("PublishingError", back_populates="job", cascade="all, delete-orphan")
    history = relationship("PublishingHistory", back_populates="job", cascade="all, delete-orphan")
    approval_tokens = relationship("PublishingApprovalToken", back_populates="job", cascade="all, delete-orphan")
    audit_logs = relationship("PublishingAuditLog", back_populates="job", cascade="all, delete-orphan")

class PublishLog(Base):
    __tablename__ = "publishing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    action = Column(String) # e.g. "Started", "API Request", "API Response"
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="logs")

class PublishingError(Base):
    __tablename__ = "publishing_errors"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    error_message = Column(Text)
    error_code = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="errors")

class PublishingHistory(Base):
    __tablename__ = "publishing_history"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    previous_status = Column(String)
    new_status = Column(String)
    changed_by = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="history")

class PublishingAutomationRule(Base):
    __tablename__ = "publishing_automation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    platform_name = Column(String, index=True)
    rule_type = Column(String) # e.g., "PUBLISH_IMMEDIATELY", "RETRY_POLICY"
    config = Column(Text) # JSON configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PublishingNotification(Base):
    __tablename__ = "publishing_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"), nullable=True)
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class OAuthState(Base):
    __tablename__ = "oauth_states"
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, unique=True, index=True)
    platform_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class PublishingApprovalToken(Base):
    __tablename__ = "publishing_approval_tokens"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True, nullable=False)
    recipient_email = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    consumed_at = Column(DateTime, nullable=True)
    action_taken = Column(String, nullable=True)  # "approved" | "rejected"
    reminder_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="approval_tokens")

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at.replace(tzinfo=timezone.utc)

    @property
    def is_consumed(self) -> bool:
        return self.consumed_at is not None

class PublishingAuditLog(Base):
    __tablename__ = "publishing_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"), nullable=True)
    approval_token_id = Column(Integer, ForeignKey("publishing_approval_tokens.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)  # e.g. "approval_requested", "approved", "rejected", "reminder_sent"
    actor = Column(String, nullable=True)  # email or "system"
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=True)
    details = Column(Text, nullable=True)  # JSON stored as string
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="audit_logs")

