from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ContentBriefModel(BaseModel):
    primary_goal: str
    core_message: str
    target_audience: str
    desired_emotion: str
    key_takeaway: str
    cta_objective: str
    writing_style: str
    platform_requirements: str

class ContentMetadataModel(BaseModel):
    platform: str
    tone: str
    campaign: str
    audience: str
    content_type: str
    estimated_read_time: str
    confidence: float = 1.0

class GenerationReasoningModel(BaseModel):
    hook_strategy: str
    body_strategy: str
    cta_strategy: str
    campaign_alignment: str
    audience_alignment: str
    trend_alignment: str

class ContentScoreModel(BaseModel):
    curiosity_score: float
    emotion_score: float
    clarity_score: float
    value_score: float
    hook_score: float
    readability_score: float
    brand_voice_score: float
    engagement_score: float
    cta_score: float
    platform_compliance_score: float
    overall_quality: float

class ContentAnalysisModel(BaseModel):
    primary_topic: str
    secondary_topics: List[str]
    key_message: str
    emotional_tone: str
    writing_style: str
    estimated_engagement: str
    audience_intent: str

class ContentImprovementModel(BaseModel):
    improvement_type: str
    description: str
    suggestion: str
    severity: str

class GeneratedDraftResponse(BaseModel):
    title: str = Field(...)
    hook: str = Field(...)
    body: str = Field(...)
    cta: str = Field(...)
    hashtags: List[str] = Field(...)
    metadata: ContentMetadataModel = Field(...)
    reasoning: GenerationReasoningModel = Field(...)
    scores: ContentScoreModel = Field(...)
    analysis: ContentAnalysisModel = Field(...)
    improvements: List[ContentImprovementModel] = Field(...)

class PlatformRuleValidationModel(BaseModel):
    rule_name: str
    is_valid: int
    feedback: str

class PlatformVariationModel(BaseModel):
    id: int
    variation_label: str
    title: Optional[str]
    body: str
    hashtags: Optional[List[str]]
    optimization_score: Optional[float]
    engagement_potential: Optional[float]
    readability_score: Optional[float]
    brand_consistency: Optional[float]
    reasoning: Optional[str]
    rule_validations: List[PlatformRuleValidationModel]

class PlatformContentModel(BaseModel):
    id: int
    platform_name: str
    status: str
    variations: List[PlatformVariationModel]

