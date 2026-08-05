from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime

# ==========================================
# RAW DATA TABLES
# ==========================================

class RawArticle(Base):
    __tablename__ = "raw_articles"
    id = Column(Integer, primary_key=True, index=True)
    source_provider = Column(String(100), nullable=False)
    url = Column(Text, nullable=True, unique=True)
    published_date = Column(DateTime, nullable=True)
    author = Column(String(255), nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    processing_status = Column(String(50), default="pending") # pending, processed, failed

class RawPost(Base):
    __tablename__ = "raw_posts"
    id = Column(Integer, primary_key=True, index=True)
    source_provider = Column(String(100), nullable=False)
    platform = Column(String(100), nullable=False)
    url = Column(Text, nullable=True, unique=True)
    published_date = Column(DateTime, nullable=True)
    author = Column(String(255), nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    processing_status = Column(String(50), default="pending")

class RawNews(Base):
    __tablename__ = "raw_news"
    id = Column(Integer, primary_key=True, index=True)
    source_provider = Column(String(100), nullable=False)
    url = Column(Text, nullable=True, unique=True)
    published_date = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    processing_status = Column(String(50), default="pending")

class RawCompetitorPage(Base):
    __tablename__ = "raw_competitor_pages"
    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, nullable=True) # Weak link, can be null
    source_provider = Column(String(100), nullable=False)
    url = Column(Text, nullable=True, unique=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    processing_status = Column(String(50), default="pending")

class RawSocialContent(Base):
    __tablename__ = "raw_social_content"
    id = Column(Integer, primary_key=True, index=True)
    source_provider = Column(String(100), nullable=False)
    platform = Column(String(100), nullable=False)
    url = Column(Text, nullable=True, unique=True)
    published_date = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    processing_status = Column(String(50), default="pending")

# ==========================================
# TREND INTELLIGENCE TABLES
# ==========================================

class TrendSource(Base):
    __tablename__ = "trend_sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider_type = Column(String(100), nullable=False) # e.g. rss, google_news, reddit
    url_or_query = Column(Text, nullable=False)
    is_active = Column(Integer, default=1)
    last_collected_at = Column(DateTime, nullable=True)

class TrendTopic(Base):
    __tablename__ = "trend_topics"
    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    
    scores = relationship("TrendScore", back_populates="topic", cascade="all, delete-orphan")
    articles = relationship("TrendArticle", back_populates="topic", cascade="all, delete-orphan")
    keywords = relationship("TrendKeyword", back_populates="topic", cascade="all, delete-orphan")
    insights = relationship("TrendInsight", back_populates="topic", cascade="all, delete-orphan")

class TrendScore(Base):
    __tablename__ = "trend_scores"
    id = Column(Integer, primary_key=True, index=True)
    trend_topic_id = Column(Integer, ForeignKey("trend_topics.id", ondelete="CASCADE"), nullable=False)
    
    popularity = Column(Float, default=0.0)
    velocity = Column(Float, default=0.0)
    recency = Column(Float, default=0.0)
    relevance = Column(Float, default=0.0)
    business_fit = Column(Float, default=0.0)
    
    scored_at = Column(DateTime, default=datetime.utcnow)
    
    topic = relationship("TrendTopic", back_populates="scores")

class TrendArticle(Base):
    __tablename__ = "trend_articles"
    id = Column(Integer, primary_key=True, index=True)
    trend_topic_id = Column(Integer, ForeignKey("trend_topics.id", ondelete="CASCADE"), nullable=False)
    
    url = Column(Text, nullable=False)
    title = Column(String(500), nullable=False)
    source_name = Column(String(255), nullable=True)
    published_date = Column(DateTime, nullable=True)
    
    topic = relationship("TrendTopic", back_populates="articles")

class TrendKeyword(Base):
    __tablename__ = "trend_keywords"
    id = Column(Integer, primary_key=True, index=True)
    trend_topic_id = Column(Integer, ForeignKey("trend_topics.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String(255), nullable=False)
    frequency = Column(Integer, default=1)
    
    topic = relationship("TrendTopic", back_populates="keywords")

class TrendInsight(Base):
    __tablename__ = "trend_insights"
    id = Column(Integer, primary_key=True, index=True)
    trend_topic_id = Column(Integer, ForeignKey("trend_topics.id", ondelete="CASCADE"), nullable=False)
    
    business_impact = Column(Text, nullable=True)
    audience_impact = Column(Text, nullable=True)
    marketing_opportunity = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    urgency = Column(String(50), nullable=True) # High, Medium, Low
    confidence = Column(Float, nullable=True)
    
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    topic = relationship("TrendTopic", back_populates="insights")

# ==========================================
# COMBINED MARKET INSIGHTS
# ==========================================

class MarketInsight(Base):
    __tablename__ = "market_insights"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    
    executive_summary = Column(Text, nullable=True)
    market_overview = Column(Text, nullable=True)
    competitor_landscape = Column(Text, nullable=True)
    emerging_trends = Column(Text, nullable=True)
    
    content_opportunities = Column(JSON, nullable=True)
    audience_opportunities = Column(JSON, nullable=True)
    keyword_opportunities = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    threats = Column(JSON, nullable=True)
    
    priority_score = Column(Float, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
