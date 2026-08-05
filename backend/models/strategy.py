from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime

class StrategyPlan(Base):
    __tablename__ = "strategy_plans"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(Integer, default=1)
    confidence = Column(Float, nullable=True)
    source_modules = Column(JSON, nullable=True)
    
    # Existing Phase 1 Relationships
    executive_summary = relationship("ExecutiveSummary", uselist=False, back_populates="plan", cascade="all, delete-orphan")
    pillars = relationship("StrategicPillar", back_populates="plan", cascade="all, delete-orphan")
    audience_segments = relationship("AudienceSegment", back_populates="plan", cascade="all, delete-orphan")
    messaging = relationship("MessagingFramework", uselist=False, back_populates="plan", cascade="all, delete-orphan")
    versions = relationship("StrategyVersion", back_populates="plan", cascade="all, delete-orphan")
    decision_logs = relationship("DecisionLog", back_populates="plan", cascade="all, delete-orphan")
    
    # New Phase 2 & 3 Relationships
    positioning = relationship("PositioningStrategy", uselist=False, back_populates="plan", cascade="all, delete-orphan")
    competitor_gaps = relationship("CompetitorGap", back_populates="plan", cascade="all, delete-orphan")
    trend_opportunities = relationship("TrendOpportunity", back_populates="plan", cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="plan", cascade="all, delete-orphan")
    recommendations = relationship("StrategyRecommendation", back_populates="plan", cascade="all, delete-orphan")
    campaigns = relationship("CampaignPlan", back_populates="plan", cascade="all, delete-orphan")
    weekly_roadmaps = relationship("WeeklyRoadmap", back_populates="plan", cascade="all, delete-orphan")
    monthly_roadmaps = relationship("MonthlyRoadmap", back_populates="plan", cascade="all, delete-orphan")
    risks = relationship("RiskAssessment", back_populates="plan", cascade="all, delete-orphan")
    metrics = relationship("StrategyMetric", back_populates="plan", cascade="all, delete-orphan")
    confidence_breakdown = relationship("ConfidenceBreakdown", uselist=False, back_populates="plan", cascade="all, delete-orphan")

# --- PHASE 1 TABLES ---

class ExecutiveSummary(Base):
    __tablename__ = "strategy_executive_summary"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    business_overview = Column(Text, nullable=True)
    current_market_position = Column(Text, nullable=True)
    competitive_landscape = Column(Text, nullable=True)
    growth_opportunities = Column(Text, nullable=True)
    strategic_direction = Column(Text, nullable=True)
    business_risks = Column(Text, nullable=True)
    marketing_vision = Column(Text, nullable=True)
    success_definition = Column(Text, nullable=True)
    expected_outcome = Column(Text, nullable=True)
    priority_areas = Column(JSON, nullable=True) 
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    source_modules = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plan = relationship("StrategyPlan", back_populates="executive_summary")

class StrategicPillar(Base):
    __tablename__ = "strategy_pillars"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    purpose = Column(Text, nullable=True)
    priority = Column(String(50), nullable=True)
    weight = Column(Integer, nullable=True)
    recommended_content_percent = Column(Integer, nullable=True)
    posting_frequency = Column(String(100), nullable=True)
    target_audience = Column(String(255), nullable=True)
    business_objective = Column(Text, nullable=True)
    
    related_competitors = Column(JSON, nullable=True)
    related_trends = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plan = relationship("StrategyPlan", back_populates="pillars")

class AudienceSegment(Base):
    __tablename__ = "strategy_audience_segments"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    segment_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pain_points = Column(JSON, nullable=True)
    goals = Column(JSON, nullable=True)
    motivations = Column(JSON, nullable=True)
    buying_stage = Column(String(100), nullable=True)
    decision_factors = Column(JSON, nullable=True)
    preferred_content = Column(JSON, nullable=True)
    preferred_platforms = Column(JSON, nullable=True)
    cta_preference = Column(String(255), nullable=True)
    objections = Column(JSON, nullable=True)
    opportunity_score = Column(Float, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plan = relationship("StrategyPlan", back_populates="audience_segments")

class MessagingFramework(Base):
    __tablename__ = "strategy_messaging"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    core_brand_message = Column(Text, nullable=True)
    primary_value_proposition = Column(Text, nullable=True)
    supporting_messages = Column(JSON, nullable=True)
    brand_promise = Column(Text, nullable=True)
    differentiators = Column(JSON, nullable=True)
    proof_points = Column(JSON, nullable=True)
    trust_builders = Column(JSON, nullable=True)
    tone = Column(String(100), nullable=True)
    voice = Column(String(100), nullable=True)
    writing_style = Column(String(255), nullable=True)
    emotional_positioning = Column(String(255), nullable=True)
    cta_framework = Column(JSON, nullable=True)
    objection_handling = Column(JSON, nullable=True)
    messaging_hierarchy = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plan = relationship("StrategyPlan", back_populates="messaging")

class StrategyVersion(Base):
    __tablename__ = "strategy_versions"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    prompt_version = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    confidence = Column(Float, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="versions")

class DecisionLog(Base):
    __tablename__ = "strategy_decision_logs"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    decision_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)
    source_modules = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    plan = relationship("StrategyPlan", back_populates="decision_logs")

# --- PHASE 2 & 3 TABLES ---

class PositioningStrategy(Base):
    __tablename__ = "strategy_positioning"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    market_position = Column(Text, nullable=True)
    unique_value_proposition = Column(Text, nullable=True)
    competitive_advantage = Column(Text, nullable=True)
    brand_category = Column(String(255), nullable=True)
    brand_perception = Column(String(255), nullable=True)
    differentiators = Column(JSON, nullable=True)
    brand_personality = Column(String(255), nullable=True)
    pricing_position = Column(String(255), nullable=True)
    market_message = Column(Text, nullable=True)
    customer_promise = Column(Text, nullable=True)
    ideal_customer = Column(Text, nullable=True)
    primary_market = Column(String(255), nullable=True)
    secondary_market = Column(String(255), nullable=True)
    blue_ocean_opportunities = Column(JSON, nullable=True)
    positioning_risks = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    source_modules = Column(JSON, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="positioning")

class CompetitorGap(Base):
    __tablename__ = "strategy_competitor_gaps"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    gap_type = Column(String(100), nullable=False) # e.g. Content Gap, SEO Gap, Audience Gap
    description = Column(Text, nullable=True)
    impact = Column(String(50), nullable=True) # High, Medium, Low
    priority = Column(String(50), nullable=True)
    difficulty = Column(String(50), nullable=True)
    business_value = Column(Text, nullable=True)
    suggested_solution = Column(Text, nullable=True)
    competitor_reference = Column(String(255), nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="competitor_gaps")

class TrendOpportunity(Base):
    __tablename__ = "strategy_trend_opportunities"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    opportunity_type = Column(String(100), nullable=False) # Emerging, Growing, Seasonal, Urgent
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    business_impact = Column(String(50), nullable=True)
    urgency = Column(String(50), nullable=True)
    difficulty = Column(String(50), nullable=True)
    expected_roi = Column(String(255), nullable=True)
    related_industry = Column(String(255), nullable=True)
    related_competitors = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="trend_opportunities")

class Opportunity(Base):
    __tablename__ = "strategy_opportunities"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    opportunity_type = Column(String(100), nullable=True) # Content, Marketing, Positioning, Growth
    opportunity_score = Column(Float, nullable=True) # 0-100
    business_impact = Column(String(50), nullable=True)
    difficulty = Column(String(50), nullable=True)
    estimated_timeline = Column(String(100), nullable=True)
    priority = Column(String(50), nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="opportunities")

class StrategyRecommendation(Base):
    __tablename__ = "strategy_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    business_impact = Column(String(255), nullable=True)
    priority = Column(String(50), nullable=True)
    expected_outcome = Column(Text, nullable=True)
    estimated_effort = Column(String(50), nullable=True)
    related_competitors = Column(JSON, nullable=True)
    related_trends = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="recommendations")

class CampaignPlan(Base):
    __tablename__ = "strategy_campaigns"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    campaign_name = Column(String(255), nullable=False)
    campaign_goal = Column(Text, nullable=True)
    campaign_description = Column(Text, nullable=True)
    target_audience = Column(String(255), nullable=True)
    business_objective = Column(String(255), nullable=True)
    platforms = Column(JSON, nullable=True)
    posting_frequency = Column(String(100), nullable=True)
    content_mix = Column(JSON, nullable=True)
    kpis = Column(JSON, nullable=True)
    duration = Column(String(100), nullable=True)
    budget_recommendation = Column(String(255), nullable=True)
    priority = Column(String(50), nullable=True)
    success_criteria = Column(Text, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="campaigns")

class WeeklyRoadmap(Base):
    __tablename__ = "strategy_weekly_roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    week_number = Column(Integer, nullable=False) # 1, 2, 3, 4
    objective = Column(Text, nullable=True)
    primary_campaign = Column(String(255), nullable=True)
    secondary_campaign = Column(String(255), nullable=True)
    target_audience = Column(String(255), nullable=True)
    content_mix = Column(JSON, nullable=True)
    strategic_focus = Column(Text, nullable=True)
    expected_kpi = Column(String(255), nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="weekly_roadmaps")

class MonthlyRoadmap(Base):
    __tablename__ = "strategy_monthly_roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    month_number = Column(Integer, nullable=True)
    executive_goal = Column(Text, nullable=True)
    monthly_objectives = Column(JSON, nullable=True)
    campaign_timeline = Column(JSON, nullable=True)
    major_themes = Column(JSON, nullable=True)
    posting_distribution = Column(JSON, nullable=True)
    expected_outcomes = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    kpis = Column(JSON, nullable=True)
    review_points = Column(JSON, nullable=True)
    optimization_opportunities = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="monthly_roadmaps")

class RiskAssessment(Base):
    __tablename__ = "strategy_risks"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    risk_type = Column(String(100), nullable=True) # Market, Competitive, Brand, Execution
    description = Column(Text, nullable=True)
    priority = Column(String(50), nullable=True)
    mitigation_strategy = Column(Text, nullable=True)
    likelihood = Column(String(50), nullable=True)
    business_impact = Column(String(50), nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="risks")

class StrategyMetric(Base):
    __tablename__ = "strategy_metrics"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    metric_name = Column(String(100), nullable=False) # Follower Growth, Lead Gen
    target = Column(String(255), nullable=True)
    expected_improvement = Column(String(255), nullable=True)
    
    confidence = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="metrics")

class ConfidenceBreakdown(Base):
    __tablename__ = "strategy_confidence_breakdown"
    id = Column(Integer, primary_key=True, index=True)
    strategy_plan_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    overall_confidence = Column(Float, nullable=True)
    business_confidence = Column(Float, nullable=True)
    brand_confidence = Column(Float, nullable=True)
    competitor_confidence = Column(Float, nullable=True)
    trend_confidence = Column(Float, nullable=True)
    recommendation_confidence = Column(Float, nullable=True)
    campaign_confidence = Column(Float, nullable=True)
    
    business_reasoning = Column(Text, nullable=True)
    brand_reasoning = Column(Text, nullable=True)
    competitor_reasoning = Column(Text, nullable=True)
    trend_reasoning = Column(Text, nullable=True)
    
    plan = relationship("StrategyPlan", back_populates="confidence_breakdown")
