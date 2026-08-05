from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# =======================
# PHASE 1 SCHEMAS
# =======================

class WeeklyObjectiveModel(BaseModel):
    primary_goal: str = Field(..., description="The main overarching goal for the week")
    secondary_goal: str = Field(..., description="The secondary goal for the week")
    campaign_focus: str = Field(..., description="The specific marketing campaign this week focuses on")
    expected_outcome: str = Field(..., description="What should happen if this week is successful")
    priority: str = Field(..., description="High, Medium, or Low")
    reasoning: str = Field(..., description="Why this objective was chosen based on the strategy")
    confidence: float = Field(..., description="Confidence score out of 1.0")

class WeeklyThemeModel(BaseModel):
    theme: str = Field(..., description="Name of the theme (e.g. Founder Branding)")
    priority: str = Field(..., description="High, Medium, or Low")
    content_percent: int = Field(..., description="Percentage of weekly content dedicated to this theme")
    campaign: str = Field(..., description="Associated campaign")
    business_goal: str = Field(..., description="Business goal this theme supports")
    reasoning: str = Field(..., description="Why this theme was selected")
    confidence: float = Field(..., description="Confidence score out of 1.0")

class PlatformPlanModel(BaseModel):
    platform: str = Field(..., description="Name of the platform (e.g. LinkedIn)")
    priority: str = Field(..., description="High, Medium, or Low")
    purpose: str = Field(..., description="The strategic purpose of this platform")
    posting_frequency: str = Field(..., description="How often to post")
    audience: str = Field(..., description="Target audience on this platform")
    content_types: List[str] = Field(..., description="Types of content to post (e.g. Text, Video, Carousel)")
    cta_style: str = Field(..., description="Call to Action style")
    reasoning: str = Field(..., description="Why this platform strategy was chosen")
    confidence: float = Field(..., description="Confidence score out of 1.0")

class AudienceAllocationModel(BaseModel):
    day_of_week: str = Field(..., description="Monday, Tuesday, etc.")
    audience: str = Field(..., description="Target audience for this day")
    reason: str = Field(..., description="Why target this audience on this day")
    business_goal: str = Field(..., description="Supported business goal")
    campaign: str = Field(..., description="Associated campaign")
    confidence: float = Field(..., description="Confidence score out of 1.0")

class WeeklyMetricModel(BaseModel):
    expected_reach: int = Field(..., description="Expected total reach for the week")
    expected_engagement: int = Field(..., description="Expected total engagement for the week")
    expected_leads: int = Field(..., description="Expected leads generated")
    expected_website_visits: int = Field(..., description="Expected website visits")
    expected_demo_bookings: int = Field(..., description="Expected demo bookings")
    expected_ctr: float = Field(..., description="Expected Click-Through Rate")
    reasoning: str = Field(..., description="Why these KPIs were projected")

# =======================
# PHASE 2 SCHEMAS
# =======================

class DailyPlanModel(BaseModel):
    day_of_week: str = Field(..., description="Monday to Sunday")
    daily_objective: str = Field(..., description="The main objective for the day")
    business_goal: str = Field(...)
    campaign: str = Field(...)
    theme: str = Field(...)
    primary_audience: str = Field(...)
    secondary_audience: str = Field(...)
    platform: str = Field(...)
    content_type: str = Field(...)
    cta: str = Field(...)
    funnel_stage: str = Field(...)
    expected_kpi: str = Field(...)
    reasoning: str = Field(...)
    confidence: float = Field(...)

class ContentGeneratorInputModel(BaseModel):
    platform: str = Field(...)
    campaign: str = Field(...)
    theme: str = Field(...)
    audience: str = Field(...)
    goal: str = Field(...)
    cta: str = Field(...)
    tone: str = Field(...)
    content_type: str = Field(...)
    funnel_stage: str = Field(...)
    priority: str = Field(...)

class ContentSlotModel(BaseModel):
    day_of_week: str = Field(..., description="Day this slot executes")
    platform: str = Field(...)
    campaign: str = Field(...)
    theme: str = Field(...)
    topic: str = Field(...)
    audience: str = Field(...)
    objective: str = Field(...)
    content_type: str = Field(...)
    estimated_length: str = Field(...)
    priority: str = Field(...)
    dependencies: str = Field(...)
    content_generator_input: ContentGeneratorInputModel = Field(..., description="Direct structured input for Content Generator")

class CampaignScheduleModel(BaseModel):
    campaign_name: str = Field(...)
    objective: str = Field(...)
    duration: str = Field(...)
    priority: str = Field(...)
    content_count: int = Field(...)
    platforms: List[str] = Field(...)
    kpis: List[str] = Field(...)
    dependencies: str = Field(...)

class CTAPlanModel(BaseModel):
    cta: str = Field(...)
    business_goal: str = Field(...)
    audience: str = Field(...)
    campaign: str = Field(...)
    confidence: float = Field(...)
    reasoning: str = Field(...)

class FunnelPlanModel(BaseModel):
    day_of_week: str = Field(...)
    funnel_stage: str = Field(...)
    goal: str = Field(...)
    expected_kpi: str = Field(...)
    reasoning: str = Field(...)

class ExecutionPriorityModel(BaseModel):
    task: str = Field(...)
    priority_score: float = Field(..., description="Score 0-100")
    business_impact: str = Field(...)
    urgency: str = Field(...)
    campaign_importance: str = Field(...)
    trend_importance: str = Field(...)
    competitor_opportunity: str = Field(...)
    difficulty: str = Field(...)
    execution_score: float = Field(...)
    confidence: float = Field(...)

class ContentDependencyModel(BaseModel):
    dependency_type: str = Field(...)
    parent_task: str = Field(...)
    child_task: str = Field(...)
    reason: str = Field(...)
    execution_order: int = Field(...)

class ExecutionConflictModel(BaseModel):
    conflict_type: str = Field(...)
    description: str = Field(...)
    warning: str = Field(...)
    recommendation: str = Field(...)

# =======================
# CONSOLIDATED RESPONSE
# =======================

class WeeklyExecutionPlanResponse(BaseModel):
    weekly_objective: WeeklyObjectiveModel = Field(...)
    themes: List[WeeklyThemeModel] = Field(...)
    content_mix: Dict[str, Any] = Field(...)
    platform_plan: List[PlatformPlanModel] = Field(...)
    audience_allocation: List[AudienceAllocationModel] = Field(...)
    weekly_kpis: WeeklyMetricModel = Field(...)
    
    # Phase 2 Additions
    daily_execution: List[DailyPlanModel] = Field(...)
    content_slots: List[ContentSlotModel] = Field(...)
    campaign_mapping: List[CampaignScheduleModel] = Field(...)
    cta_plan: List[CTAPlanModel] = Field(...)
    funnel_plan: List[FunnelPlanModel] = Field(...)
    priority_engine: List[ExecutionPriorityModel] = Field(...)
    dependencies: List[ContentDependencyModel] = Field(...)
    conflicts: List[ExecutionConflictModel] = Field(...)

# =======================
# PHASE 3 SCHEMAS: OPTIMIZATION ENGINE
# =======================

class ExecutionOptimizationModel(BaseModel):
    optimization_type: str = Field(...)
    description: str = Field(...)
    expected_impact: str = Field(...)
    confidence: float = Field(...)
    reasoning: str = Field(...)

class ExecutionHealthModel(BaseModel):
    overall_score: float = Field(...)
    campaign_health: float = Field(...)
    audience_coverage: float = Field(...)
    platform_coverage: float = Field(...)
    content_diversity: float = Field(...)
    trend_alignment: float = Field(...)
    strategy_alignment: float = Field(...)
    readiness_status: str = Field(...)
    reasoning: str = Field(...)

class ExecutionSuggestionModel(BaseModel):
    suggestion: str = Field(...)
    priority: str = Field(...)
    business_impact: str = Field(...)
    confidence: float = Field(...)
    reasoning: str = Field(...)

class ExecutionAlertModel(BaseModel):
    alert_type: str = Field(...)
    message: str = Field(...)
    severity: str = Field(...)
    action_required: bool = Field(...)

class StrategySyncLogModel(BaseModel):
    changed_element: str = Field(...)
    old_value: str = Field(...)
    new_value: str = Field(...)
    impact_description: str = Field(...)

class TrendInjectionModel(BaseModel):
    trend_name: str = Field(...)
    injection_type: str = Field(...)
    affected_slots: List[str] = Field(...)
    reasoning: str = Field(...)
    confidence: float = Field(...)

class ExecutionOptimizationResponse(BaseModel):
    optimizations: List[ExecutionOptimizationModel] = Field(...)
    strategy_sync: List[StrategySyncLogModel] = Field(...)
    trend_injections: List[TrendInjectionModel] = Field(...)
    execution_health: ExecutionHealthModel = Field(...)
    alerts: List[ExecutionAlertModel] = Field(...)
    suggestions: List[ExecutionSuggestionModel] = Field(...)
    analytics: Dict[str, Any] = Field(...)
