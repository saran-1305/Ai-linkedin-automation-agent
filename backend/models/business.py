from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from database.base import Base

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    website = Column(String, nullable=True)
    industry = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    
    # Products & Services
    products = Column(JSON, nullable=True) # List of strings
    services = Column(JSON, nullable=True) # List of strings
    usp = Column(Text, nullable=True)
    
    # Target Audience
    primary_audience = Column(String, nullable=True)
    secondary_audience = Column(String, nullable=True)
    pain_points = Column(JSON, nullable=True) # List of strings
    customer_goals = Column(JSON, nullable=True) # List of strings
    
    # Business Goals
    marketing_goals = Column(JSON, nullable=True) # List of strings
    lead_generation_goals = Column(JSON, nullable=True) # List of strings
    brand_objectives = Column(Text, nullable=True)
    content_objectives = Column(Text, nullable=True)
    
    # Brand Identity
    brand_voice = Column(String, nullable=False)
    writing_style = Column(String, nullable=True)
    cta_style = Column(String, nullable=True)
    competitors = Column(JSON, nullable=True) # List of strings
    
    # AI System Setting
    ai_operating_mode = Column(String(50), default="autonomous")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
