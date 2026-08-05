import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    imported_content_id = Column(Integer, ForeignKey("imported_contents.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    prompt_version = Column(String(50))
    analysis_version = Column(String(50))
    
    raw_prompt = Column(Text, nullable=True)
    raw_response = Column(Text, nullable=True)
    
    execution_time_ms = Column(Integer, default=0)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    
    status = Column(String(50), default="Pending") # Pending, Success, Failed
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    imported_content = relationship("ImportedContent", back_populates="analysis_runs")


class DocumentAnalysis(Base):
    __tablename__ = "document_analysis"

    id = Column(Integer, primary_key=True, index=True)
    imported_content_id = Column(Integer, ForeignKey("imported_contents.id", ondelete="CASCADE"), unique=True, nullable=False)
    document_type = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    overall_confidence = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    imported_content = relationship("ImportedContent", back_populates="document_analysis")
    
    topics = relationship("AnalysisTopic", back_populates="document_analysis", cascade="all, delete-orphan")
    keywords = relationship("AnalysisKeyword", back_populates="document_analysis", cascade="all, delete-orphan")
    pillars = relationship("AnalysisPillar", back_populates="document_analysis", cascade="all, delete-orphan")
    ctas = relationship("AnalysisCTA", back_populates="document_analysis", cascade="all, delete-orphan")
    audiences = relationship("AnalysisAudience", back_populates="document_analysis", cascade="all, delete-orphan")
    tones = relationship("AnalysisTone", back_populates="document_analysis", cascade="all, delete-orphan")
    styles = relationship("AnalysisStyle", back_populates="document_analysis", cascade="all, delete-orphan")


class AnalysisTopic(Base):
    __tablename__ = "analysis_topics"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    topic_type = Column(String(50), nullable=False) # Primary, Secondary, Subtopic
    topic_name = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=True)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="topics")


class AnalysisKeyword(Base):
    __tablename__ = "analysis_keywords"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    keyword_type = Column(String(50), nullable=False) # Primary, Secondary, Industry Term, Named Entity
    keyword = Column(String(255), nullable=False)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="keywords")


class AnalysisPillar(Base):
    __tablename__ = "analysis_pillars"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    pillar_name = Column(String(100), nullable=False)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="pillars")


class AnalysisCTA(Base):
    __tablename__ = "analysis_ctas"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    cta_text = Column(Text, nullable=False)
    cta_type = Column(String(100), nullable=True)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="ctas")


class AnalysisAudience(Base):
    __tablename__ = "analysis_audience"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    audience_segment = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=True)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="audiences")


class AnalysisTone(Base):
    __tablename__ = "analysis_tones"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    tone_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=True)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="tones")


class AnalysisStyle(Base):
    __tablename__ = "analysis_styles"
    id = Column(Integer, primary_key=True, index=True)
    document_analysis_id = Column(Integer, ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False)
    style_name = Column(String(100), nullable=False)
    
    document_analysis = relationship("DocumentAnalysis", back_populates="styles")
