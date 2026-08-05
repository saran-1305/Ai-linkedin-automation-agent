from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union

class BrandPersonalitySchema(BaseModel):
    trait: str
    confidence: float

class BrandVoiceSchema(BaseModel):
    characteristic: str
    confidence: float

class BrandVocabularySchema(BaseModel):
    word_or_phrase: str
    category: str
    frequency: int = 1

class BrandContentPillarSchema(BaseModel):
    pillar_name: str
    pillar_type: str
    confidence: float = 0.0
    frequency: int = 1

class BrandTargetAudienceSchema(BaseModel):
    audience_segment: str
    audience_type: str
    confidence: float = 0.0

class BrandCtaPatternSchema(BaseModel):
    cta_text: str
    frequency: int = 1

class BrandTopicSchema(BaseModel):
    topic_name: str
    topic_type: str
    frequency: int = 1
    rank: Optional[int] = None

class BrandKeywordSchema(BaseModel):
    keyword: str
    keyword_type: str
    frequency: int = 1

class BrandStorytellingPatternSchema(BaseModel):
    pattern_name: str
    frequency: int = 1

class BrandPostingPatternSchema(BaseModel):
    avg_sentence_length: Optional[float] = None
    paragraph_structure: Optional[str] = None
    vocabulary_complexity: Optional[str] = None
    storytelling_preference: Optional[str] = None
    educational_vs_promotional_ratio: Optional[str] = None
    technical_depth: Optional[str] = None
    reading_difficulty: Optional[str] = None
    content_strategy: Optional[List[str]] = None
    strategy_confidence: Optional[float] = None

    @validator('content_strategy', pre=True)
    def parse_str_to_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

class BrandConfidenceScoreSchema(BaseModel):
    category: str
    current_confidence: float
    knowledge_coverage: Optional[float] = None
    data_completeness: Optional[float] = None

class BrandProfileSchema(BaseModel):
    business_summary: Optional[str] = None
    core_mission: Optional[str] = None
    primary_industry: Optional[str] = None
    primary_expertise: Optional[str] = None
    primary_services: Optional[List[str]] = None
    unique_selling_points: Optional[List[str]] = None
    value_proposition: Optional[str] = None
    communication_objectives: Optional[List[str]] = None
    brand_vision: Optional[str] = None
    brand_positioning: Optional[str] = None

    @validator('primary_services', 'unique_selling_points', 'communication_objectives', pre=True)
    def parse_str_to_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

# This is the master schema the LLM will output
class BrandIntelligenceOutput(BaseModel):
    brand_profile: BrandProfileSchema
    personalities: List[BrandPersonalitySchema] = []
    voices: List[BrandVoiceSchema] = []
    vocabularies: List[BrandVocabularySchema] = []
    pillars: List[BrandContentPillarSchema] = []
    audiences: List[BrandTargetAudienceSchema] = []
    cta_patterns: List[BrandCtaPatternSchema] = []
    topics: List[BrandTopicSchema] = []
    keywords: List[BrandKeywordSchema] = []
    storytelling_patterns: List[BrandStorytellingPatternSchema] = []
    posting_patterns: Optional[BrandPostingPatternSchema] = None
    confidence_scores: List[BrandConfidenceScoreSchema] = []
