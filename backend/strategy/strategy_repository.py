from sqlalchemy.orm import Session
from models.strategy import (
    StrategyPlan,
    ExecutiveSummary,
    StrategicPillar,
    AudienceSegment,
    MessagingFramework,
    StrategyVersion,
    DecisionLog,
    PositioningStrategy,
    CompetitorGap,
    TrendOpportunity,
    Opportunity,
    StrategyRecommendation,
    CampaignPlan,
    WeeklyRoadmap,
    MonthlyRoadmap,
    RiskAssessment,
    StrategyMetric,
    ConfidenceBreakdown
)
from .strategy_models import MasterStrategyResponse

class StrategyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_plan(self, business_id: int):
        return self.db.query(StrategyPlan).filter(
            StrategyPlan.business_id == business_id
        ).order_by(StrategyPlan.version.desc()).first()

    def save_new_strategy(self, business_id: int, data: MasterStrategyResponse, execution_time_ms: int = 0) -> StrategyPlan:
        latest_plan = self.get_latest_plan(business_id)
        new_version = (latest_plan.version + 1) if latest_plan else 1
        
        plan = StrategyPlan(
            business_id=business_id,
            version=new_version,
            confidence=data.executive_summary.confidence,
            source_modules=data.executive_summary.source_modules
        )
        self.db.add(plan)
        self.db.flush()
        
        # --- PHASE 1 ---
        self.db.add(ExecutiveSummary(strategy_plan_id=plan.id, **data.executive_summary.model_dump()))
        
        for p in data.strategic_pillars:
            self.db.add(StrategicPillar(strategy_plan_id=plan.id, **p.model_dump()))
            
        for a in data.audience_segments:
            self.db.add(AudienceSegment(strategy_plan_id=plan.id, **a.model_dump()))
            
        self.db.add(MessagingFramework(strategy_plan_id=plan.id, **data.messaging_framework.model_dump()))
        
        # --- PHASE 2 & 3 ---
        self.db.add(PositioningStrategy(strategy_plan_id=plan.id, **data.positioning.model_dump()))
        self.db.add(ConfidenceBreakdown(strategy_plan_id=plan.id, **data.confidence_breakdown.model_dump()))
        
        for gap in data.competitor_gaps:
            self.db.add(CompetitorGap(strategy_plan_id=plan.id, **gap.model_dump()))
            
        for trend_opp in data.trend_opportunities:
            self.db.add(TrendOpportunity(strategy_plan_id=plan.id, **trend_opp.model_dump()))
            
        for opp in data.opportunities:
            self.db.add(Opportunity(strategy_plan_id=plan.id, **opp.model_dump()))
            
        for rec in data.recommendations:
            self.db.add(StrategyRecommendation(strategy_plan_id=plan.id, **rec.model_dump()))
            
        for camp in data.campaigns:
            self.db.add(CampaignPlan(strategy_plan_id=plan.id, **camp.model_dump()))
            
        for week in data.weekly_roadmaps:
            self.db.add(WeeklyRoadmap(strategy_plan_id=plan.id, **week.model_dump()))
            
        for month in data.monthly_roadmaps:
            self.db.add(MonthlyRoadmap(strategy_plan_id=plan.id, **month.model_dump()))
            
        for risk in data.risks:
            self.db.add(RiskAssessment(strategy_plan_id=plan.id, **risk.model_dump()))
            
        for metric in data.metrics:
            self.db.add(StrategyMetric(strategy_plan_id=plan.id, **metric.model_dump()))
        
        # --- TRACKING ---
        self.db.add(StrategyVersion(
            strategy_plan_id=plan.id,
            prompt_version="2.0",
            model="Analysis-LLM",
            execution_time_ms=execution_time_ms,
            confidence=plan.confidence
        ))
        
        self._generate_decision_logs(plan.id, data)
        
        self.db.commit()
        self.db.refresh(plan)
        return plan
        
    def _generate_decision_logs(self, plan_id: int, data: MasterStrategyResponse):
        # We selectively log major decisions to avoid bloating the DB with thousands of logs
        # Executive Summary Decision
        if data.executive_summary.reasoning:
            self.db.add(DecisionLog(strategy_plan_id=plan_id, decision_type="Executive Direction", description="Formulated primary executive direction.", reasoning=data.executive_summary.reasoning, confidence=data.executive_summary.confidence))
            
        if data.positioning.reasoning:
            self.db.add(DecisionLog(strategy_plan_id=plan_id, decision_type="Positioning", description="Determined market positioning.", reasoning=data.positioning.reasoning, confidence=data.positioning.confidence))
            
        for p in data.strategic_pillars:
            if p.reasoning:
                self.db.add(DecisionLog(strategy_plan_id=plan_id, decision_type="Pillar Creation", description=f"Created Pillar: {p.title}", reasoning=p.reasoning, confidence=p.confidence))
                
        for a in data.audience_segments:
            if a.reasoning:
                self.db.add(DecisionLog(strategy_plan_id=plan_id, decision_type="Audience Selection", description=f"Identified Audience: {a.segment_name}", reasoning=a.reasoning, confidence=a.confidence))
                
        for c in data.campaigns:
            if c.reasoning:
                self.db.add(DecisionLog(strategy_plan_id=plan_id, decision_type="Campaign Planning", description=f"Planned Campaign: {c.campaign_name}", reasoning=c.reasoning, confidence=c.confidence))
