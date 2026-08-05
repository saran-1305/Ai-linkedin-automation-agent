import json
from models.business import BusinessProfile
from models.brand import BrandProfile
from models.strategy import StrategyPlan, ExecutiveSummary, CampaignPlan
from models.execution import WeeklyPlan, ContentSlot
from sqlalchemy.orm import Session
import datetime

class OptimizationPromptBuilder:
    def __init__(self, db: Session):
        self.db = db

    def build_optimization_prompt(self, business_id: int, current_plan: WeeklyPlan, schema_json: dict) -> str:
        # Fetch latest strategy to check for diffs
        plan = self.db.query(StrategyPlan).filter(StrategyPlan.business_id == business_id).order_by(StrategyPlan.version.desc()).first()
        strategy_context = "No new strategy updates."
        
        if plan:
            exec_summary = self.db.query(ExecutiveSummary).filter(ExecutiveSummary.strategy_plan_id == plan.id).first()
            campaigns = self.db.query(CampaignPlan).filter(CampaignPlan.strategy_plan_id == plan.id).all()
            campaigns_str = "\n".join([f"- {c.campaign_name}: {c.campaign_goal}" for c in campaigns])
            
            strategy_context = f"""
Current Strategy Version: {plan.version}
Executive Goal: {exec_summary.success_definition if exec_summary else 'N/A'}
Active Campaigns:
{campaigns_str}
"""

        # Fetch current content slots to optimize
        slots = self.db.query(ContentSlot).filter(ContentSlot.weekly_plan_id == current_plan.id).all()
        slots_json = json.dumps([{"day": s.day_of_week, "platform": s.platform, "topic": s.topic, "priority": s.priority} for s in slots])

        prompt = f"""You are the AI Marketing Operations Manager.
Your job is to OPTIMIZE the existing Weekly Execution Plan based on new intelligence, trends, and strategy updates.

### 1. Master Strategy Sync
{strategy_context}

### 2. Current Execution Plan (To Be Optimized)
Week Number: {current_plan.week_number}
Current Slots: {slots_json}

### INSTRUCTIONS:
Evaluate the current Execution Plan against the Strategy and best practices. 
Generate a comprehensive Optimization Report containing:
1. `optimizations`: Any direct adjustments you recommend or applied.
2. `strategy_sync`: Detected differences between the Master Strategy and the Execution Plan.
3. `trend_injections`: New trends to inject.
4. `execution_health`: A robust score (0-100) on how healthy the current plan is.
5. `alerts`: High-priority warnings (e.g. audience fatigue, campaign overlaps).
6. `suggestions`: Proactive advice.
7. `analytics`: Stub for future metrics.

DO NOT output the JSON schema itself. Output ONLY valid JSON data that exactly conforms to this schema:
{json.dumps(schema_json)}
"""
        return prompt
