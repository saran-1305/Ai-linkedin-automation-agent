import json
import logging
import time
from sqlalchemy.orm import Session
from models.execution import (
    WeeklyPlan,
    ExecutionOptimization,
    ExecutionHealth,
    ExecutionSuggestion,
    ExecutionAlert,
    StrategySyncLog,
    TrendInjection,
    OptimizationHistory,
    ExecutionAnalytics,
    ContentSlot,
    DailyPlan
)
from content_analysis.providers.provider_factory import ProviderFactory
from .schemas import ExecutionOptimizationResponse
from .optimization_prompt_builder import OptimizationPromptBuilder
import os

logger = logging.getLogger(__name__)

class OptimizationService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")
        if "groq" in self.provider.model_name or "llama-3.1-8b" in self.provider.model_name:
            self.provider.model_name = "openrouter/meta-llama/llama-3.3-70b-instruct"
            self.provider.api_key = os.getenv("OPENROUTER_API_KEY")

    def archive_and_fork_plan(self, old_plan: WeeklyPlan) -> WeeklyPlan:
        # Mark old as Archived
        old_plan.status = "Archived"
        self.db.commit()

        # Create new Active Plan
        new_plan = WeeklyPlan(
            business_id=old_plan.business_id,
            strategy_id=old_plan.strategy_id,
            week_number=old_plan.week_number,
            start_date=old_plan.start_date,
            end_date=old_plan.end_date,
            status="Active",
            confidence=old_plan.confidence,
            version=old_plan.version + 1,
            content_mix=old_plan.content_mix
        )
        self.db.add(new_plan)
        self.db.commit()
        self.db.refresh(new_plan)
        
        # Clone ContentSlots for the new plan so we don't lose execution data
        slots = self.db.query(ContentSlot).filter(ContentSlot.weekly_plan_id == old_plan.id).all()
        for slot in slots:
            cloned_slot = ContentSlot(
                weekly_plan_id=new_plan.id,
                day_of_week=slot.day_of_week,
                platform=slot.platform,
                campaign=slot.campaign,
                theme=slot.theme,
                topic=slot.topic,
                audience=slot.audience,
                objective=slot.objective,
                content_type=slot.content_type,
                estimated_length=slot.estimated_length,
                priority=slot.priority,
                status=slot.status,
                dependencies=slot.dependencies,
                content_generator_input=slot.content_generator_input
            )
            self.db.add(cloned_slot)
            
        self.db.commit()
        return new_plan

    def generate_optimizations(self, business_id: int):
        logger.info("Executing Weekly Planner Optimization (Phase 3)...")
        
        # Get active plan
        current_plan = self.db.query(WeeklyPlan).filter(
            WeeklyPlan.business_id == business_id,
            WeeklyPlan.status == "Active"
        ).order_by(WeeklyPlan.version.desc()).first()
        
        if not current_plan:
            raise ValueError("No Active Weekly Plan found to optimize.")

        prompt_builder = OptimizationPromptBuilder(self.db)
        schema = ExecutionOptimizationResponse.model_json_schema()
        prompt = prompt_builder.build_optimization_prompt(business_id, current_plan, schema)
        
        start_time = time.time()
        logger.info("Executing Optimization LLM Engine...")
        response = self.provider.analyze(system_prompt=prompt, user_prompt="Optimize the Execution Plan.", max_tokens=8000)
        execution_time_ms = int((time.time() - start_time) * 1000)
        
        raw_json = response.get("raw_response", "{}")
        if raw_json.startswith("```json"): raw_json = raw_json.split("```json")[1].rsplit("```", 1)[0].strip()
        elif raw_json.startswith("```"): raw_json = raw_json.split("```")[1].rsplit("```", 1)[0].strip()
        
        data = ExecutionOptimizationResponse(**json.loads(raw_json))
        
        # Architecture Improvement: Archive old, Fork new
        new_plan = self.archive_and_fork_plan(current_plan)

        # Save Optimizations to the NEW Plan
        for opt in data.optimizations:
            self.db.add(ExecutionOptimization(weekly_plan_id=new_plan.id, **opt.model_dump()))
            
        for sync in data.strategy_sync:
            self.db.add(StrategySyncLog(weekly_plan_id=new_plan.id, **sync.model_dump()))
            
        for ti in data.trend_injections:
            self.db.add(TrendInjection(weekly_plan_id=new_plan.id, **ti.model_dump()))
            
        self.db.add(ExecutionHealth(weekly_plan_id=new_plan.id, **data.execution_health.model_dump()))
        
        for alert in data.alerts:
            self.db.add(ExecutionAlert(weekly_plan_id=new_plan.id, **alert.model_dump()))
            
        for sug in data.suggestions:
            self.db.add(ExecutionSuggestion(weekly_plan_id=new_plan.id, **sug.model_dump()))
            
        self.db.add(OptimizationHistory(
            weekly_plan_id=new_plan.id,
            version=new_plan.version,
            prompt_version="3.0",
            execution_time_ms=execution_time_ms,
            trigger_source="Manual_Optimization",
            confidence=data.execution_health.overall_score / 100.0
        ))
        
        self.db.commit()
        return new_plan
