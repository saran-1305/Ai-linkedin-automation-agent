from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Recommendation(BaseModel):
    id: str
    workspace_id: str
    category: str # strategy, content, audience, publishing, growth
    priority: str # critical, high, medium, low
    recommendation_type: str
    title: str
    description: str
    expected_impact: str
    confidence: float
    supporting_metrics: Dict[str, Any]
    status: str # new, accepted, dismissed, implemented, archived
    created_at: datetime = Field(default_factory=datetime.utcnow)
    implemented_at: Optional[datetime] = None

class RecommendationHistory(BaseModel):
    id: str
    recommendation_id: str
    action_taken: str # accepted, dismissed, implemented
    implemented: bool
    implementation_date: Optional[datetime] = None
    outcome: Optional[str] = None

class OptimizationGoal(BaseModel):
    id: str
    workspace_id: str
    goal: str
    target_metric: str
    target_value: float
    current_value: float
    progress: float
    status: str # active, achieved, failed
