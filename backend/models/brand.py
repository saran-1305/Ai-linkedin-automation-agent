from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime

class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    business_summary = Column(Text, nullable=True)
    core_mission = Column(Text, nullable=True)
    primary_industry = Column(String(255), nullable=True)
    primary_expertise = Column(String(255), nullable=True)
    primary_services = Column(JSON, nullable=True) # List of strings
    unique_selling_points = Column(JSON, nullable=True) # List of strings
    value_proposition = Column(Text, nullable=True)
    communication_objectives = Column(JSON, nullable=True) # List of strings
    brand_vision = Column(Text, nullable=True)
    brand_positioning = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business = relationship("BusinessProfile")
    # Using relationships to load all attached components
    personalities = relationship("BrandPersonality", back_populates="brand_profile", cascade="all, delete-orphan")
    voices = relationship("BrandVoice", back_populates="brand_profile", cascade="all, delete-orphan")
    vocabularies = relationship("BrandVocabulary", back_populates="brand_profile", cascade="all, delete-orphan")
    pillars = relationship("BrandContentPillar", back_populates="brand_profile", cascade="all, delete-orphan")
    audiences = relationship("BrandTargetAudience", back_populates="brand_profile", cascade="all, delete-orphan")
    cta_patterns = relationship("BrandCtaPattern", back_populates="brand_profile", cascade="all, delete-orphan")
    topics = relationship("BrandTopic", back_populates="brand_profile", cascade="all, delete-orphan")
    keywords = relationship("BrandKeyword", back_populates="brand_profile", cascade="all, delete-orphan")
    storytelling_patterns = relationship("BrandStorytellingPattern", back_populates="brand_profile", cascade="all, delete-orphan")
    posting_patterns = relationship("BrandPostingPattern", back_populates="brand_profile", cascade="all, delete-orphan")
    confidence_scores = relationship("BrandConfidenceScore", back_populates="brand_profile", cascade="all, delete-orphan")
    versions = relationship("BrandMemoryVersion", back_populates="brand_profile", cascade="all, delete-orphan")

class BrandPersonality(Base):
    __tablename__ = "brand_personality"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    trait = Column(String(100), nullable=False) # e.g. Innovative, Reliable
    confidence = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="personalities")

class BrandVoice(Base):
    __tablename__ = "brand_voice"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    characteristic = Column(String(100), nullable=False) # e.g. Professional, Educational
    confidence = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="voices")

class BrandVocabulary(Base):
    __tablename__ = "brand_vocabulary"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    word_or_phrase = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # 'frequent', 'industry', 'preferred', 'avoided', 'expression'
    frequency = Column(Integer, default=1)
    
    brand_profile = relationship("BrandProfile", back_populates="vocabularies")

class BrandContentPillar(Base):
    __tablename__ = "brand_content_pillars"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    pillar_name = Column(String(255), nullable=False)
    pillar_type = Column(String(50), nullable=False) # 'Primary', 'Secondary', 'Emerging'
    confidence = Column(Float, nullable=True)
    frequency = Column(Integer, default=1)
    
    brand_profile = relationship("BrandProfile", back_populates="pillars")

class BrandTargetAudience(Base):
    __tablename__ = "brand_target_audiences"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    audience_segment = Column(String(255), nullable=False)
    audience_type = Column(String(50), nullable=False) # 'Primary', 'Secondary', 'Emerging'
    confidence = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="audiences")

class BrandCtaPattern(Base):
    __tablename__ = "brand_cta_patterns"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    cta_text = Column(Text, nullable=False)
    frequency = Column(Integer, default=1)
    
    brand_profile = relationship("BrandProfile", back_populates="cta_patterns")

class BrandTopic(Base):
    __tablename__ = "brand_topics"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    topic_name = Column(String(255), nullable=False)
    topic_type = Column(String(50), nullable=False) # 'Most Discussed', 'Growing', 'Rare'
    frequency = Column(Integer, default=1)
    rank = Column(Integer, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="topics")

class BrandKeyword(Base):
    __tablename__ = "brand_keywords"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String(255), nullable=False)
    keyword_type = Column(String(50), nullable=False) # 'Primary', 'Secondary', 'Industry', 'Named Entity'
    frequency = Column(Integer, default=1)
    
    brand_profile = relationship("BrandProfile", back_populates="keywords")

class BrandStorytellingPattern(Base):
    __tablename__ = "brand_storytelling_patterns"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    pattern_name = Column(String(100), nullable=False) # e.g. Problem -> Solution
    frequency = Column(Integer, default=1)
    
    brand_profile = relationship("BrandProfile", back_populates="storytelling_patterns")

class BrandPostingPattern(Base):
    __tablename__ = "brand_posting_patterns"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    avg_sentence_length = Column(Float, nullable=True)
    paragraph_structure = Column(String(255), nullable=True)
    vocabulary_complexity = Column(String(100), nullable=True)
    storytelling_preference = Column(String(100), nullable=True)
    educational_vs_promotional_ratio = Column(String(100), nullable=True)
    technical_depth = Column(String(100), nullable=True)
    reading_difficulty = Column(String(100), nullable=True)
    content_strategy = Column(JSON, nullable=True) # e.g. ["Education First", "Founder Branding"]
    strategy_confidence = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="posting_patterns")

class BrandConfidenceScore(Base):
    __tablename__ = "brand_confidence_scores"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False) # e.g. 'personality', 'voice', 'pillars'
    current_confidence = Column(Float, nullable=False)
    previous_confidence = Column(Float, nullable=True)
    trend = Column(String(20), nullable=True) # 'up', 'down', 'stable'
    knowledge_coverage = Column(Float, nullable=True)
    data_completeness = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="confidence_scores")

class BrandMemoryVersion(Base):
    __tablename__ = "brand_memory_versions"
    id = Column(Integer, primary_key=True, index=True)
    brand_profile_id = Column(Integer, ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    document_count = Column(Integer, nullable=False, default=0)
    analysis_count = Column(Integer, nullable=False, default=0)
    model_name = Column(String(100), nullable=True)
    prompt_version = Column(String(50), nullable=True)
    generation_duration = Column(Integer, nullable=True) # ms
    overall_confidence_score = Column(Float, nullable=True)
    
    brand_profile = relationship("BrandProfile", back_populates="versions")
