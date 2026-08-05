from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship
from database.base import Base
from datetime import datetime, timezone

class WeeklyPlan(Base):
    __tablename__ = "execution_weekly_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategy_plans.id", ondelete="CASCADE"), nullable=False)
    
    week_number = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    status = Column(String(50), default="Active")
    confidence = Column(Float)
    version = Column(Integer, default=1)
    content_mix = Column(JSON) 
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Phase 1
    objective = relationship("WeeklyObjective", back_populates="plan", uselist=False, cascade="all, delete-orphan")
    themes = relationship("WeeklyTheme", back_populates="plan", cascade="all, delete-orphan")
    platform_plans = relationship("PlatformPlan", back_populates="plan", cascade="all, delete-orphan")
    audience_allocations = relationship("AudienceAllocation", back_populates="plan", cascade="all, delete-orphan")
    metrics = relationship("WeeklyMetric", back_populates="plan", uselist=False, cascade="all, delete-orphan")
    versions = relationship("WeeklyVersion", back_populates="plan", cascade="all, delete-orphan")

    # Phase 2
    daily_plans = relationship("DailyPlan", back_populates="plan", cascade="all, delete-orphan")
    content_slots = relationship("ContentSlot", back_populates="plan", cascade="all, delete-orphan")
    campaign_schedules = relationship("CampaignSchedule", back_populates="plan", cascade="all, delete-orphan")
    funnel_plans = relationship("FunnelPlan", back_populates="plan", cascade="all, delete-orphan")
    cta_plans = relationship("CTAPlan", back_populates="plan", cascade="all, delete-orphan")
    priorities = relationship("ExecutionPriority", back_populates="plan", cascade="all, delete-orphan")
    dependencies = relationship("ContentDependency", back_populates="plan", cascade="all, delete-orphan")
    conflicts = relationship("ExecutionConflict", back_populates="plan", cascade="all, delete-orphan")


class WeeklyObjective(Base):
    __tablename__ = "execution_weekly_objectives"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    primary_goal = Column(String(255))
    secondary_goal = Column(String(255))
    campaign_focus = Column(String(255))
    expected_outcome = Column(Text)
    priority = Column(String(50))
    reasoning = Column(Text)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="objective")

class WeeklyTheme(Base):
    __tablename__ = "execution_weekly_themes"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    theme = Column(String(255))
    priority = Column(String(50))
    content_percent = Column(Integer)
    campaign = Column(String(255))
    business_goal = Column(String(255))
    reasoning = Column(Text)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="themes")

class PlatformPlan(Base):
    __tablename__ = "execution_platform_plans"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    platform = Column(String(100))
    priority = Column(String(50))
    purpose = Column(Text)
    posting_frequency = Column(String(100))
    audience = Column(String(255))
    content_types = Column(JSON) 
    cta_style = Column(String(255))
    reasoning = Column(Text)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="platform_plans")

class AudienceAllocation(Base):
    __tablename__ = "execution_audience_allocations"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    day_of_week = Column(String(50))
    audience = Column(String(255))
    reason = Column(Text)
    business_goal = Column(String(255))
    campaign = Column(String(255))
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="audience_allocations")

class WeeklyMetric(Base):
    __tablename__ = "execution_weekly_metrics"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    expected_reach = Column(Integer)
    expected_engagement = Column(Integer)
    expected_leads = Column(Integer)
    expected_website_visits = Column(Integer)
    expected_demo_bookings = Column(Integer)
    expected_ctr = Column(Float)
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan", back_populates="metrics")

class WeeklyVersion(Base):
    __tablename__ = "execution_weekly_versions"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    prompt_version = Column(String(50))
    model = Column(String(100))
    execution_time_ms = Column(Integer)
    confidence = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    plan = relationship("WeeklyPlan", back_populates="versions")

# ==========================================
# PHASE 2 MODELS: EXECUTION BLUEPRINT
# ==========================================

class DailyPlan(Base):
    __tablename__ = "execution_daily_plans"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    day_of_week = Column(String(50))
    daily_objective = Column(Text)
    business_goal = Column(String(255))
    campaign = Column(String(255))
    theme = Column(String(255))
    primary_audience = Column(String(255))
    secondary_audience = Column(String(255))
    platform = Column(String(100))
    content_type = Column(String(100))
    cta = Column(String(255))
    funnel_stage = Column(String(100))
    expected_kpi = Column(Text)
    reasoning = Column(Text)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="daily_plans")

class ContentSlot(Base):
    """The Single Source of Truth for Content Generator"""
    __tablename__ = "execution_content_slots"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    day_of_week = Column(String(50))
    platform = Column(String(100))
    campaign = Column(String(255))
    theme = Column(String(255))
    topic = Column(Text)
    audience = Column(String(255))
    objective = Column(Text)
    content_type = Column(String(100))
    estimated_length = Column(String(100))
    priority = Column(String(50))
    status = Column(String(50), default="Planned")
    dependencies = Column(Text)
    content_generator_input = Column(JSON) # Extremely structured mapping for prompt
    plan = relationship("WeeklyPlan", back_populates="content_slots")

class CampaignSchedule(Base):
    __tablename__ = "execution_campaign_schedules"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    campaign_name = Column(String(255))
    objective = Column(Text)
    duration = Column(String(100))
    priority = Column(String(50))
    content_count = Column(Integer)
    platforms = Column(JSON)
    kpis = Column(JSON)
    dependencies = Column(Text)
    plan = relationship("WeeklyPlan", back_populates="campaign_schedules")

class CTAPlan(Base):
    __tablename__ = "execution_cta_plans"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    cta = Column(String(255))
    business_goal = Column(String(255))
    audience = Column(String(255))
    campaign = Column(String(255))
    confidence = Column(Float)
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan", back_populates="cta_plans")

class FunnelPlan(Base):
    __tablename__ = "execution_funnel_plans"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    day_of_week = Column(String(50))
    funnel_stage = Column(String(100))
    goal = Column(Text)
    expected_kpi = Column(Text)
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan", back_populates="funnel_plans")

class ExecutionPriority(Base):
    __tablename__ = "execution_priorities"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    task = Column(String(255))
    priority_score = Column(Float)
    business_impact = Column(String(100))
    urgency = Column(String(100))
    campaign_importance = Column(String(100))
    trend_importance = Column(String(100))
    competitor_opportunity = Column(String(100))
    difficulty = Column(String(100))
    execution_score = Column(Float)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan", back_populates="priorities")

class ContentDependency(Base):
    __tablename__ = "execution_content_dependencies"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    dependency_type = Column(String(100))
    parent_task = Column(String(255))
    child_task = Column(String(255))
    reason = Column(Text)
    execution_order = Column(Integer)
    plan = relationship("WeeklyPlan", back_populates="dependencies")

class ExecutionConflict(Base):
    __tablename__ = "execution_conflicts"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    conflict_type = Column(String(100))
    description = Column(Text)
    warning = Column(Text)
    recommendation = Column(Text)
    plan = relationship("WeeklyPlan", back_populates="conflicts")

# ==========================================
# PHASE 3 MODELS: OPTIMIZATION ENGINE
# ==========================================

class ExecutionOptimization(Base):
    __tablename__ = "execution_optimizations"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    optimization_type = Column(String(100))
    description = Column(Text)
    expected_impact = Column(Text)
    confidence = Column(Float)
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan")

class ExecutionHealth(Base):
    __tablename__ = "execution_health"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    overall_score = Column(Float)
    campaign_health = Column(Float)
    audience_coverage = Column(Float)
    platform_coverage = Column(Float)
    content_diversity = Column(Float)
    trend_alignment = Column(Float)
    strategy_alignment = Column(Float)
    readiness_status = Column(String(100))
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan")

class ExecutionFeedback(Base):
    __tablename__ = "execution_feedback"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    post_id = Column(String(100))
    engagement = Column(Integer)
    reach = Column(Integer)
    clicks = Column(Integer)
    conversions = Column(Integer)
    campaign_success_score = Column(Float)
    plan = relationship("WeeklyPlan")

class ExecutionSuggestion(Base):
    __tablename__ = "execution_suggestions"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    suggestion = Column(Text)
    priority = Column(String(50))
    business_impact = Column(Text)
    confidence = Column(Float)
    reasoning = Column(Text)
    plan = relationship("WeeklyPlan")

class ExecutionAlert(Base):
    __tablename__ = "execution_alerts"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    alert_type = Column(String(100))
    message = Column(Text)
    severity = Column(String(50))
    action_required = Column(Boolean, default=False)
    plan = relationship("WeeklyPlan")

class StrategySyncLog(Base):
    __tablename__ = "execution_strategy_sync_logs"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    changed_element = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    impact_description = Column(Text)
    plan = relationship("WeeklyPlan")

class TrendInjection(Base):
    __tablename__ = "execution_trend_injections"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    trend_name = Column(String(255))
    injection_type = Column(String(100))
    affected_slots = Column(JSON)
    reasoning = Column(Text)
    confidence = Column(Float)
    plan = relationship("WeeklyPlan")

class HolidayEvent(Base):
    __tablename__ = "execution_holiday_events"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    event_name = Column(String(255))
    event_date = Column(String(100))
    impact_level = Column(String(50))
    adjustment_made = Column(Text)
    plan = relationship("WeeklyPlan")

class OptimizationHistory(Base):
    __tablename__ = "execution_optimization_history"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    version = Column(Integer)
    prompt_version = Column(String(50))
    execution_time_ms = Column(Integer)
    trigger_source = Column(String(100))
    confidence = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    plan = relationship("WeeklyPlan")

class ExecutionAnalytics(Base):
    __tablename__ = "execution_analytics"
    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("execution_weekly_plans.id", ondelete="CASCADE"))
    total_slots = Column(Integer)
    completed_slots = Column(Integer)
    failed_slots = Column(Integer)
    overall_performance_score = Column(Float)
    plan = relationship("WeeklyPlan")
