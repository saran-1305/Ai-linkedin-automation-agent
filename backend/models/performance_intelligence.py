from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class PerformanceInsight(BaseModel):
    id: str
    workspace_id: str
    insight_type: str # topic, hook, cta, timing, audience, platform
    title: str
    description: str
    confidence: float
    supporting_data: Dict[str, Any]
    suggested_action: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class PerformancePattern(BaseModel):
    pattern_name: str
    category: str
    confidence: float
    occurrences: int
    impact_score: float

class PerformanceRecommendation(BaseModel):
    recommendation: str
    reason: str
    priority: str # high, medium, low
    expected_impact: str
    confidence: float
    historical_comparison: Optional[str] = None

class ExecutiveSummary(BaseModel):
    overall_performance: str
    key_wins: List[str]
    key_challenges: List[str]
    content_learnings: List[str]
    audience_behavior: str
    top_opportunities: List[str]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class PerformanceMemory(BaseModel):
    workspace_id: str
    winning_topics: List[Dict[str, Any]]
    winning_hooks: List[Dict[str, Any]]
    winning_ctas: List[Dict[str, Any]]
    winning_timing: List[Dict[str, Any]]
    common_failures: List[str]
    audience_preferences: List[str]
    last_updated: datetime = Field(default_factory=datetime.utcnow)
