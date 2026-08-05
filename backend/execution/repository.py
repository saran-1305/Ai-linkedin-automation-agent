from sqlalchemy.orm import Session
from models.execution import (
    WeeklyPlan,
    WeeklyObjective,
    WeeklyTheme,
    PlatformPlan,
    AudienceAllocation,
    WeeklyMetric,
    WeeklyVersion,
    DailyPlan,
    ContentSlot,
    CampaignSchedule,
    CTAPlan,
    FunnelPlan,
    ExecutionPriority,
    ContentDependency,
    ExecutionConflict
)
from models.strategy import StrategyPlan
from .schemas import WeeklyExecutionPlanResponse
import datetime
from sqlalchemy import desc

class ExecutionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_plan(self, business_id: int):
        return self.db.query(WeeklyPlan).filter(
            WeeklyPlan.business_id == business_id
        ).order_by(desc(WeeklyPlan.created_at)).first()

    def save_new_plan(self, business_id: int, data: WeeklyExecutionPlanResponse, execution_time_ms: int = 0) -> WeeklyPlan:
        # Get latest strategy to link
        strategy = self.db.query(StrategyPlan).filter(StrategyPlan.business_id == business_id).order_by(desc(StrategyPlan.version)).first()
        strategy_id = strategy.id if strategy else 1 # Fallback
        
        latest_plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.business_id == business_id).order_by(desc(WeeklyPlan.version)).first()
        new_version = (latest_plan.version + 1) if latest_plan else 1
        
        today = datetime.datetime.now(datetime.timezone.utc)
        week_num = today.isocalendar()[1]
        
        # Calculate start and end date of current week (Monday to Sunday)
        start_date = today - datetime.timedelta(days=today.weekday())
        end_date = start_date + datetime.timedelta(days=6)
        
        plan = WeeklyPlan(
            business_id=business_id,
            strategy_id=strategy_id,
            version=new_version,
            week_number=week_num,
            start_date=start_date,
            end_date=end_date,
            confidence=data.weekly_objective.confidence,
            content_mix=data.content_mix
        )
        self.db.add(plan)
        self.db.flush()
        
        self.db.add(WeeklyObjective(weekly_plan_id=plan.id, **data.weekly_objective.model_dump()))
        
        for t in data.themes:
            self.db.add(WeeklyTheme(weekly_plan_id=plan.id, **t.model_dump()))
            
        for p in data.platform_plan:
            self.db.add(PlatformPlan(weekly_plan_id=plan.id, **p.model_dump()))
            
        for a in data.audience_allocation:
            self.db.add(AudienceAllocation(weekly_plan_id=plan.id, **a.model_dump()))
            
        self.db.add(WeeklyMetric(weekly_plan_id=plan.id, **data.weekly_kpis.model_dump()))
        
        # Phase 2 Inserts
        if hasattr(data, 'daily_execution') and data.daily_execution:
            for d in data.daily_execution:
                self.db.add(DailyPlan(weekly_plan_id=plan.id, **d.model_dump()))
                
        if hasattr(data, 'content_slots') and data.content_slots:
            for c in data.content_slots:
                slot_data = c.model_dump()
                self.db.add(ContentSlot(weekly_plan_id=plan.id, **slot_data))
                
        if hasattr(data, 'campaign_mapping') and data.campaign_mapping:
            for c in data.campaign_mapping:
                self.db.add(CampaignSchedule(weekly_plan_id=plan.id, **c.model_dump()))
                
        if hasattr(data, 'cta_plan') and data.cta_plan:
            for cta in data.cta_plan:
                self.db.add(CTAPlan(weekly_plan_id=plan.id, **cta.model_dump()))
                
        if hasattr(data, 'funnel_plan') and data.funnel_plan:
            for f in data.funnel_plan:
                self.db.add(FunnelPlan(weekly_plan_id=plan.id, **f.model_dump()))
                
        if hasattr(data, 'priority_engine') and data.priority_engine:
            for pri in data.priority_engine:
                self.db.add(ExecutionPriority(weekly_plan_id=plan.id, **pri.model_dump()))
                
        if hasattr(data, 'dependencies') and data.dependencies:
            for dep in data.dependencies:
                self.db.add(ContentDependency(weekly_plan_id=plan.id, **dep.model_dump()))
                
        if hasattr(data, 'conflicts') and data.conflicts:
            for conf in data.conflicts:
                self.db.add(ExecutionConflict(weekly_plan_id=plan.id, **conf.model_dump()))
        
        self.db.add(WeeklyVersion(
            weekly_plan_id=plan.id,
            prompt_version="2.0",
            model="Execution-LLM-Phase2",
            execution_time_ms=execution_time_ms,
            confidence=plan.confidence
        ))
        
        self.db.commit()
        self.db.refresh(plan)
        return plan
