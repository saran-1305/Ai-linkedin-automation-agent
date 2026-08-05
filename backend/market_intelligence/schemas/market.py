from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class CompetitorCreate(BaseModel):
    company_name: str
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    twitter_url: Optional[HttpUrl] = None
    youtube_url: Optional[HttpUrl] = None
    blog_url: Optional[HttpUrl] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    priority: Optional[str] = "Medium"
    notes: Optional[str] = None

class CompetitorProfileResponse(BaseModel):
    mission: Optional[str] = None
    positioning: Optional[str] = None
    target_audience: Optional[List[str]] = None
    brand_voice: Optional[str] = None
    
    class Config:
        from_attributes = True

class CompetitorSWOTResponse(BaseModel):
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    threats: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class CompetitorAnalysisResponse(BaseModel):
    content_gap: Optional[str] = None
    keyword_gap: Optional[str] = None
    messaging_gap: Optional[str] = None
    opportunities: Optional[str] = None
    
    class Config:
        from_attributes = True

class CompetitorResponse(CompetitorCreate):
    id: int
    business_id: int
    is_ai_suggested: int
    
    # We will fetch the latest version of these
    latest_profile: Optional[CompetitorProfileResponse] = None
    latest_swot: Optional[CompetitorSWOTResponse] = None
    latest_analysis: Optional[CompetitorAnalysisResponse] = None
    
    class Config:
        from_attributes = True

class TrendSourceCreate(BaseModel):
    name: str
    provider_type: str
    url_or_query: str

class TrendSourceResponse(TrendSourceCreate):
    id: int
    is_active: int
    
    class Config:
        from_attributes = True
