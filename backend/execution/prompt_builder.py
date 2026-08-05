import json
from models.business import BusinessProfile
from models.brand import BrandProfile
from models.strategy import StrategyPlan, ExecutiveSummary, StrategicPillar, AudienceSegment, CampaignPlan, MonthlyRoadmap
from sqlalchemy.orm import Session
import datetime

class ExecutionPromptBuilder:
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
            # Extract key components
            exec_summary = self.db.query(ExecutiveSummary).filter(ExecutiveSummary.strategy_plan_id == plan.id).first()
            campaigns = self.db.query(CampaignPlan).filter(CampaignPlan.strategy_plan_id == plan.id).all()
            roadmaps = self.db.query(MonthlyRoadmap).filter(MonthlyRoadmap.strategy_plan_id == plan.id).all()
            
            campaigns_str = "\n".join([f"- {c.campaign_name}: {c.campaign_goal}" for c in campaigns])
            roadmaps_str = roadmaps[0].executive_goal if roadmaps else "Execute ongoing strategy."
            
            strategy_context = f"""
Strategy Version: {plan.version}
Executive Goal: {exec_summary.success_definition if exec_summary else 'N/A'}
Active Campaigns:
{campaigns_str}
Current Monthly Roadmap Goal: {roadmaps_str}
"""

        # 4. Determine Current Week Date
        today = datetime.datetime.now()
        week_num = today.isocalendar()[1]

        prompt = f"""You are the Marketing Operations Manager for an AI Growth Operating System.
Your job is to transform the long-term marketing strategy into a highly structured WEEKLY EXECUTION PLAN.

### 1. Business Context
{business_context}

### 2. Brand Context
{brand_context}

### 3. Master Strategy Inputs
{strategy_context}

### INSTRUCTIONS:
You are generating the execution plan for Week {week_num}.
This is an execution blueprint that will guide the Content Generator module. Do NOT generate content. Generate the plan.

You must generate a structured JSON output containing:
1. Weekly Objective: The overarching goal and campaign focus.
2. Weekly Themes: 3-7 specific themes (e.g. Founder Branding, Product Education).
3. Content Mix: A dictionary mapping content types to percentages (e.g. {{"Educational": 40, "Founder Story": 20}}).
4. Platform Plan: How to execute across LinkedIn, Newsletter, etc.
5. Audience Allocation: Which audience segment to target on which day of the week (Monday-Friday/Sunday).
6. Weekly KPIs: Expected reach, engagement, leads, etc.

CRITICAL: 
Every section MUST have a 'reasoning' and 'confidence' field. Explain exactly which part of the Master Strategy influenced this decision.

DO NOT output the JSON schema itself. You MUST output ONLY valid JSON data that precisely conforms to this schema:
{json.dumps(schema_json)}
"""
        return prompt
