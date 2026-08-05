from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from database.base import Base

class ImportStatus(str, enum.Enum):
    PENDING = "Pending"
    UPLOADING = "Uploading"
    UPLOADED = "Uploaded"
    VALIDATING = "Validating"
    READY = "Ready"
    IMPORTED = "Imported"
    FAILED = "Failed"

class ProcessingStatus(str, enum.Enum):
    PENDING = "Pending"
    EXTRACTING = "Extracting"
    CLEANING = "Cleaning"
    CHUNKING = "Chunking"
    COMPLETED = "Completed"
    FAILED = "Failed"

class AnalysisStatus(str, enum.Enum):
    PENDING = "Pending"
    READY_FOR_AI = "Ready For AI"
    QUEUED_FOR_ANALYSIS = "Queued For Analysis"
    ANALYZING = "Analyzing"
    ANALYZED = "Analyzed"
    FAILED = "Failed"

class PublishStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    REVIEW = "REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SCHEDULED = "SCHEDULED"
    QUEUED = "QUEUED"
    PUBLISHING = "PUBLISHING"
    PUBLISHED = "PUBLISHED"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"

class ContentImport(Base):
    __tablename__ = "content_imports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True) # String to accommodate UUID or string IDs later
    source = Column(String, nullable=False) # e.g., 'PDF', 'Website URL', 'Paste Text'
    status = Column(Enum(ImportStatus), default=ImportStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship to the actual files/content pieces
    imported_contents = relationship("ImportedContent", back_populates="import_session", cascade="all, delete-orphan")

class ImportedContent(Base):
    __tablename__ = "imported_contents"

    id = Column(Integer, primary_key=True, index=True)
    import_id = Column(Integer, ForeignKey("content_imports.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=True) # Can be null for raw text pastes initially
    mime_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) # in bytes
    file_hash = Column(String, nullable=True) # for deduplication
    metadata_json = Column(JSON, nullable=True) # JSON column for wordCount, pageCount, etc.
    # Extracted content properties
    extracted_text = Column(String, nullable=True) # Full raw text
    cleaned_text = Column(String, nullable=True) # Normalized text
    language = Column(String, nullable=True) # e.g. 'en', 'fr'
    
    # Statistics
    word_count = Column(Integer, nullable=True)
    sentence_count = Column(Integer, nullable=True)
    paragraph_count = Column(Integer, nullable=True)
    estimated_read_time = Column(Integer, nullable=True) # in minutes
    
    # Processing status
    content_hash = Column(String, nullable=True) # SHA-256 of cleaned text
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING, nullable=False)
    processing_error = Column(Text, nullable=True)
    
    # Analysis Workflow Fields
    analysis_status = Column(Enum(AnalysisStatus, name="analysis_status_enum", create_type=False), default=AnalysisStatus.PENDING)
    analyzed_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    import_session = relationship("ContentImport", back_populates="imported_contents")
    chunks = relationship("ContentChunk", back_populates="imported_content", cascade="all, delete-orphan", order_by="ContentChunk.chunk_index")
    analysis_runs = relationship("AnalysisRun", back_populates="imported_content", cascade="all, delete-orphan")
    document_analysis = relationship("DocumentAnalysis", back_populates="imported_content", cascade="all, delete-orphan")


class ContentChunk(Base):
    __tablename__ = "content_chunks"

    id = Column(Integer, primary_key=True, index=True)
    imported_content_id = Column(Integer, ForeignKey("imported_contents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_title = Column(String, nullable=True)
    text_content = Column(String, nullable=False)
    
    # Statistics for the chunk
    word_count = Column(Integer, nullable=True)
    token_estimate = Column(Integer, nullable=True)
    
    # Position tracking within original document
    start_offset = Column(Integer, nullable=True)
    end_offset = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    imported_content = relationship("ImportedContent", back_populates="chunks")

# ==========================================
# PHASE 1 MODELS: CONTENT GENERATOR
# ==========================================

class GeneratedContent(Base):
    __tablename__ = "content_generated"
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    execution_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"), nullable=False)
    content_slot_id = Column(Integer, ForeignKey("execution_content_slots.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String(50), default="Draft") # Draft, Generated, Reviewed, Approved, Rejected, Archived
    version = Column(Integer, default=1)
    confidence = Column(Float)
    
    # Phase 5 Publishing Pipeline Integration Fields
    publish_status = Column(String(50), default=PublishStatus.DRAFT.value)
    publish_mode = Column(String(50), nullable=True) # e.g. "Auto", "Manual", "Scheduled"
    target_platforms = Column(JSON, nullable=True) # e.g. ["LinkedIn", "X"]
    scheduled_at = Column(DateTime, nullable=True)
    publishing_job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"), nullable=True)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    platform_post_id = Column(String(255), nullable=True)
    published_url = Column(String(500), nullable=True)
    publishing_error = Column(Text, nullable=True)
    verification_status = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    drafts = relationship("ContentDraft", back_populates="content", cascade="all, delete-orphan")
    metadata_info = relationship("ContentMetadata", back_populates="content", uselist=False, cascade="all, delete-orphan")
    reasoning = relationship("GenerationReasoning", back_populates="content", uselist=False, cascade="all, delete-orphan")
    scores = relationship("ContentScore", back_populates="content", uselist=False, cascade="all, delete-orphan")
    versions = relationship("ContentVersion", back_populates="content", cascade="all, delete-orphan")
    
    # Phase 2
    analyses = relationship("ContentAnalysis", back_populates="content", uselist=False, cascade="all, delete-orphan")
    improvements = relationship("ContentImprovement", back_populates="content", cascade="all, delete-orphan")
    
    # Phase 3
    platform_contents = relationship("PlatformContent", back_populates="content", cascade="all, delete-orphan")

class ContentDraft(Base):
    __tablename__ = "content_drafts"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    
    title = Column(String(255))
    hook = Column(Text)
    body = Column(Text)
    cta = Column(Text)
    hashtags = Column(JSON)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    content = relationship("GeneratedContent", back_populates="drafts")

class ContentMetadata(Base):
    __tablename__ = "content_metadata_generator"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    
    platform = Column(String(100))
    tone = Column(String(100))
    campaign = Column(String(255))
    audience = Column(String(255))
    content_type = Column(String(100))
    estimated_read_time = Column(String(50))
    
    content = relationship("GeneratedContent", back_populates="metadata_info")

class GenerationReasoning(Base):
    __tablename__ = "content_generation_reasoning"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    
    hook_strategy = Column(Text)
    body_strategy = Column(Text)
    cta_strategy = Column(Text)
    campaign_alignment = Column(Text)
    audience_alignment = Column(Text)
    trend_alignment = Column(Text)
    
    content = relationship("GeneratedContent", back_populates="reasoning")

class ContentScore(Base):
    __tablename__ = "content_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    
    curiosity_score = Column(Float)
    emotion_score = Column(Float)
    clarity_score = Column(Float)
    value_score = Column(Float)
    
    # Phase 2 metrics
    hook_score = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    brand_voice_score = Column(Float, nullable=True)
    engagement_score = Column(Float, nullable=True)
    cta_score = Column(Float, nullable=True)
    platform_compliance_score = Column(Float, nullable=True)
    
    overall_quality = Column(Float)
    
    content = relationship("GeneratedContent", back_populates="scores")

# Phase 2 tables
class ContentAnalysis(Base):
    __tablename__ = "content_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    
    primary_topic = Column(String(255))
    secondary_topics = Column(JSON)
    key_message = Column(Text)
    emotional_tone = Column(String(100))
    writing_style = Column(String(100))
    estimated_engagement = Column(String(100))
    audience_intent = Column(String(255))
    
    content = relationship("GeneratedContent", back_populates="analyses")

class ContentImprovement(Base):
    __tablename__ = "content_improvements"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    
    improvement_type = Column(String(100)) # e.g. 'Weak Hook', 'Repetitive'
    description = Column(Text)
    suggestion = Column(Text)
    severity = Column(String(50))
    
    content = relationship("GeneratedContent", back_populates="improvements")

class ContentVersion(Base):
    __tablename__ = "content_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    
    version = Column(Integer)
    prompt_version = Column(String(50))
    model = Column(String(100))
    execution_time_ms = Column(Integer)
    token_usage = Column(Integer)
    confidence = Column(Float)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    content = relationship("GeneratedContent", back_populates="versions")

# ==========================================
# PHASE 3 MODELS: MULTI-PLATFORM ENGINE
# ==========================================

class PlatformContent(Base):
    __tablename__ = "content_platforms"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content_generated.id", ondelete="CASCADE"), nullable=False)
    platform_name = Column(String(100), nullable=False) # e.g. "LinkedIn", "X"
    status = Column(String(50), default="Draft") # Draft, Ready, Published
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    content = relationship("GeneratedContent", back_populates="platform_contents")
    variations = relationship("PlatformVariation", back_populates="platform_content", cascade="all, delete-orphan")

class PlatformVariation(Base):
    __tablename__ = "content_platform_variations"
    
    id = Column(Integer, primary_key=True, index=True)
    platform_content_id = Column(Integer, ForeignKey("content_platforms.id", ondelete="CASCADE"), nullable=False)
    
    variation_label = Column(String(50)) # e.g., 'Version A', 'Version B'
    title = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)
    hashtags = Column(JSON, nullable=True)
    
    # Optimization Metrics
    optimization_score = Column(Float, nullable=True)
    engagement_potential = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    brand_consistency = Column(Float, nullable=True)
    
    # Explainability
    reasoning = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    platform_content = relationship("PlatformContent", back_populates="variations")
    rule_validations = relationship("PlatformRuleValidation", back_populates="variation", cascade="all, delete-orphan")

class PlatformRuleValidation(Base):
    __tablename__ = "content_platform_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    variation_id = Column(Integer, ForeignKey("content_platform_variations.id", ondelete="CASCADE"), nullable=False)
    
    rule_name = Column(String(255))
    is_valid = Column(Integer) # 1 for True, 0 for False
    feedback = Column(Text)
    
    variation = relationship("PlatformVariation", back_populates="rule_validations")

