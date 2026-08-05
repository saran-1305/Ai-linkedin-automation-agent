from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    
    company_name = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    twitter_url = Column(String(255), nullable=True)
    youtube_url = Column(String(255), nullable=True)
    blog_url = Column(String(255), nullable=True)
    
    description = Column(Text, nullable=True)
    industry = Column(String(255), nullable=True)
    priority = Column(String(50), default="Medium") # High, Medium, Low
    notes = Column(Text, nullable=True)
    
    is_ai_suggested = Column(Integer, default=0) # 0=Manual, 1=AI
    suggestion_confidence = Column(Float, nullable=True)
    suggestion_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_collected_at = Column(DateTime, nullable=True)
    last_analyzed_at = Column(DateTime, nullable=True)

    business = relationship("BusinessProfile")
    profiles = relationship("CompetitorProfile", back_populates="competitor", cascade="all, delete-orphan")
    analyses = relationship("CompetitorAnalysis", back_populates="competitor", cascade="all, delete-orphan")
    topics = relationship("CompetitorTopic", back_populates="competitor", cascade="all, delete-orphan")
    keywords = relationship("CompetitorKeyword", back_populates="competitor", cascade="all, delete-orphan")
    swot = relationship("CompetitorSWOT", back_populates="competitor", cascade="all, delete-orphan")
    posts = relationship("CompetitorPost", back_populates="competitor", cascade="all, delete-orphan")

class CompetitorProfile(Base):
    __tablename__ = "competitor_profiles"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    
    mission = Column(Text, nullable=True)
    products = Column(JSON, nullable=True)
    services = Column(JSON, nullable=True)
    audience = Column(JSON, nullable=True)
    positioning = Column(Text, nullable=True)
    usp = Column(Text, nullable=True)
    brand_voice = Column(String(255), nullable=True)
    content_style = Column(String(255), nullable=True)
    posting_frequency = Column(String(100), nullable=True)
    marketing_channels = Column(JSON, nullable=True)
    content_formats = Column(JSON, nullable=True)
    growth_strategy = Column(Text, nullable=True)
    
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="profiles")

class CompetitorAnalysis(Base):
    __tablename__ = "competitor_analysis"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    
    # Gap analysis against Brand Profile
    content_gap = Column(Text, nullable=True)
    keyword_gap = Column(Text, nullable=True)
    audience_gap = Column(Text, nullable=True)
    topic_gap = Column(Text, nullable=True)
    platform_gap = Column(Text, nullable=True)
    positioning_gap = Column(Text, nullable=True)
    messaging_gap = Column(Text, nullable=True)
    
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="analyses")

class CompetitorTopic(Base):
    __tablename__ = "competitor_topics"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    topic_name = Column(String(255), nullable=False)
    frequency = Column(Integer, default=1)
    sentiment = Column(String(50), nullable=True)
    
    competitor = relationship("Competitor", back_populates="topics")

class CompetitorKeyword(Base):
    __tablename__ = "competitor_keywords"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String(255), nullable=False)
    is_seo_target = Column(Integer, default=0)
    frequency = Column(Integer, default=1)
    
    competitor = relationship("Competitor", back_populates="keywords")

class CompetitorSWOT(Base):
    __tablename__ = "competitor_swot"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    opportunities = Column(JSON, nullable=True)
    threats = Column(JSON, nullable=True)
    
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="swot")

class CompetitorPost(Base):
    __tablename__ = "competitor_posts"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False)
    
    platform = Column(String(50), nullable=False) # LinkedIn, Twitter, Blog
    url = Column(String(500), nullable=True)
    content_text = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    
    engagement_score = Column(Float, nullable=True)
    topics = Column(JSON, nullable=True)
    keywords = Column(JSON, nullable=True)
    cta = Column(String(255), nullable=True)
    storytelling_pattern = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="posts")
