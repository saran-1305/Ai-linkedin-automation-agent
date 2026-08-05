import json
from models.business import BusinessProfile
from models.brand import BrandProfile
from models.strategy import StrategyPlan, ExecutiveSummary, CampaignPlan
from sqlalchemy.orm import Session
import datetime

class CalendarPromptBuilder:
    def __init__(self, db: Session):
        self.db = db

    def build_weekly_plan_prompt(self, business_id: int, schema_json: dict) -> str:
        # 1. Fetch Business Profile
        business = self.db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first()
        business_context = f"Company: {business.company_name}\nIndustry: {business.industry}\nGoals: {business.marketing_goals}" if business else "No business context."

        # 2. Fetch Brand Intelligence
        brand = self.db.query(BrandProfile).filter(BrandProfile.business_id == business_id).first()
        if brand:
            voices = [v.characteristic for v in brand.voices] if brand.voices else []
            brand_context = f"Tone of Voice: {', '.join(voices)}\nValue Proposition: {brand.value_proposition}"
        else:
            brand_context = "No brand context."

        # 3. Fetch Latest Master Strategy
        plan = self.db.query(StrategyPlan).filter(StrategyPlan.business_id == business_id).order_by(StrategyPlan.version.desc()).first()
        strategy_context = "No strategy available. Generate a generic plan."
        
        if plan:
            exec_summary = self.db.query(ExecutiveSummary).filter(ExecutiveSummary.strategy_plan_id == plan.id).first()
            campaigns = self.db.query(CampaignPlan).filter(CampaignPlan.strategy_plan_id == plan.id).all()
            campaigns_str = "\n".join([f"- {c.campaign_name}: {c.campaign_goal}" for c in campaigns])
            
            strategy_context = f"""
Strategy Version: {plan.version}
Executive Goal: {exec_summary.success_definition if exec_summary else 'N/A'}
Active Campaigns:
{campaigns_str}
"""

        today = datetime.datetime.now()
        week_num = today.isocalendar()[1]

        prompt = f"""You are the AI Marketing Operations Manager for an AI Growth Operating System.
Your job is to transform the long-term marketing strategy into a highly granular, day-by-day WEEKLY EXECUTION CALENDAR.

### 1. Business Context
{business_context}

### 2. Brand Context
{brand_context}

### 3. Master Strategy Inputs
{strategy_context}

### INSTRUCTIONS:
You are generating the execution blueprint for Week {week_num}.
This is an execution blueprint that will guide the Content Generator module. Do NOT generate content. Generate the plan.

CRITICAL ARCHITECTURAL REQUIREMENT:
The `content_slots` array is the Single Source of Execution Truth for the Content Generator. 
For every content slot you plan, you MUST populate the `content_generator_input` object with extremely strict, structured instructions (platform, campaign, theme, audience, goal, cta, tone, content_type, funnel_stage, priority).

You must generate ONE unified JSON output containing:
1. `weekly_objective`, `themes`, `content_mix`, `platform_plan`, `audience_allocation`, `weekly_kpis`.
2. `daily_execution`: A day-by-day (Mon-Sun) operational plan.
3. `content_slots`: Individual posts/execution items assigned to a day and platform.
4. `campaign_mapping`: How active campaigns map to the week.
5. `cta_plan`: Detailed Calls-to-Action strategy.
6. `funnel_plan`: Mapping content to Awareness, Consideration, Decision stages.
7. `priority_engine`: Execution scoring and urgency.
8. `dependencies`: Which execution items rely on others.
9. `conflicts`: Any detected overlap or audience fatigue warnings.

DO NOT output the JSON schema itself. You MUST output ONLY valid JSON data that precisely conforms to this schema:
{json.dumps(schema_json)}
"""
        return prompt
