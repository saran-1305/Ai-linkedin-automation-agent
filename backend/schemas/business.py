from typing import List, Optional
from pydantic import BaseModel, HttpUrl, ConfigDict
from datetime import datetime

class BusinessProfileBase(BaseModel):
    company_name: str
    website: Optional[str] = None
    industry: str
    description: str
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    
    products: Optional[List[str]] = []
    services: Optional[List[str]] = []
    usp: Optional[str] = None
    
    primary_audience: Optional[str] = None
    secondary_audience: Optional[str] = None
    pain_points: Optional[List[str]] = []
    customer_goals: Optional[List[str]] = []
    
    marketing_goals: Optional[List[str]] = []
    lead_generation_goals: Optional[List[str]] = []
    brand_objectives: Optional[str] = None
    content_objectives: Optional[str] = None
    
    brand_voice: str
    writing_style: Optional[str] = None
    cta_style: Optional[str] = None
    competitors: Optional[List[str]] = []

class BusinessProfileCreate(BusinessProfileBase):
    pass

class BusinessProfileUpdate(BusinessProfileBase):
    pass

class BusinessProfileResponse(BusinessProfileBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

from typing import TypeVar, Generic, Any
T = TypeVar("T")

class ExtractedField(BaseModel, Generic[T]):
    value: T
    confidence: float
    source: str
    explanation: str

class ExtractedBusinessProfile(BaseModel):
    company_name: ExtractedField[str]
    website: Optional[ExtractedField[str]] = None
    industry: ExtractedField[str]
    description: ExtractedField[str]
    location: Optional[ExtractedField[str]] = None
    linkedin_url: Optional[ExtractedField[str]] = None
    
    products: Optional[ExtractedField[List[str]]] = None
    services: Optional[ExtractedField[List[str]]] = None
    usp: Optional[ExtractedField[str]] = None
    
    primary_audience: Optional[ExtractedField[str]] = None
    secondary_audience: Optional[ExtractedField[str]] = None
    pain_points: Optional[ExtractedField[List[str]]] = None
    customer_goals: Optional[ExtractedField[List[str]]] = None
    
    marketing_goals: Optional[ExtractedField[List[str]]] = None
    lead_generation_goals: Optional[ExtractedField[List[str]]] = None
    brand_objectives: Optional[ExtractedField[str]] = None
    content_objectives: Optional[ExtractedField[str]] = None
    
    brand_voice: ExtractedField[str]
    writing_style: Optional[ExtractedField[str]] = None
    cta_style: Optional[ExtractedField[str]] = None
    competitors: Optional[ExtractedField[List[str]]] = None
