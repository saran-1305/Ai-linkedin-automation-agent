from pydantic import BaseModel, Field
from typing import List, Optional

class TopicSchema(BaseModel):
    topic_type: str
    topic_name: str
    confidence: Optional[float] = 0.0

class KeywordSchema(BaseModel):
    keyword_type: str
    keyword: str

class ToneSchema(BaseModel):
    tone_name: str
    confidence: Optional[float] = 0.0

class AudienceSchema(BaseModel):
    audience_segment: str
    confidence: Optional[float] = 0.0

class CTASchema(BaseModel):
    cta_text: str
    cta_type: str

class DocumentAnalysisResponse(BaseModel):
    document_type: str = "Unknown"
    summary: str = ""
    overall_confidence: float = 0.0
    topics: List[TopicSchema] = Field(default_factory=list)
    keywords: List[KeywordSchema] = Field(default_factory=list)
    writing_styles: List[str] = Field(default_factory=list)
    tones: List[ToneSchema] = Field(default_factory=list)
    audiences: List[AudienceSchema] = Field(default_factory=list)
    ctas: List[CTASchema] = Field(default_factory=list)
    content_pillars: List[str] = Field(default_factory=list)
