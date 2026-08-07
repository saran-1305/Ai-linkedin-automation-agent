import json
from database.session import SessionLocal
from models.business import BusinessProfile
from models.brand import BrandProfile
from models.competitor import Competitor
from models.market import TrendTopic

class PromptBuilder:
    def __init__(self, db):
        self.db = db

    def build_cmo_prompt_part1(self, business_id: int, schema_json: dict) -> str:
        # 1. Gather Intelligence
        business = self.db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first()
        business_context = f"Business Name: {business.company_name}\nIndustry: {business.industry}\nPrimary Audience: {business.primary_audience}\nMarketing Goals: {business.marketing_goals}" if business else "No business context."

        brand = self.db.query(BrandProfile).filter(BrandProfile.business_id == business_id).first()
        if brand:
            voices = [v.characteristic for v in brand.voices] if brand.voices else []
            pillars = [p.pillar_name for p in brand.pillars] if brand.pillars else []
            brand_context = f"Brand Vision: {brand.brand_vision}\nValue Proposition: {brand.value_proposition}\nTone of Voice: {', '.join(voices)}\nContent Pillars: {', '.join(pillars)}"
        else:
            brand_context = "No brand intelligence available."

        competitors = self.db.query(Competitor).filter(Competitor.business_id == business_id).all()
        comp_context = []
        for comp in competitors:
            swots = [s for s in comp.swot]
            swot = swots[-1] if swots else None
            if swot:
                comp_context.append(f"Competitor: {comp.company_name}\nStrengths: {swot.strengths}\nWeaknesses: {swot.weaknesses}\nOpportunities: {swot.opportunities}\nThreats: {swot.threats}")
        comp_context_str = "\n\n".join(comp_context) if comp_context else "No competitor data."

        trends = self.db.query(TrendTopic).order_by(TrendTopic.last_seen_at.desc()).limit(15).all()
        trend_context = []
        for trend in trends:
            insights = [i for i in trend.insights]
            insight = insights[-1] if insights else None
            trend_str = f"Trend: {trend.topic_name} ({trend.category})\nSummary: {trend.summary}"
            if insight:
                trend_str += f"\nImpact: {insight.business_impact}\nOpportunity: {insight.marketing_opportunity}"
            trend_context.append(trend_str)
        trend_context_str = "\n\n".join(trend_context) if trend_context else "No trend data."

        prompt = f"""You are the Chief Marketing Officer (CMO) for an AI Growth Operating System.
Your job is to synthesize all available intelligence and create an explainable, data-driven master strategic marketing plan.

### 1. Business Intelligence
{business_context}

### 2. Brand Intelligence
{brand_context}

### 3. Competitor Intelligence
{comp_context_str}

### 4. Trend Intelligence
{trend_context_str}

### INSTRUCTIONS (PART 1):
You must generate PART 1 of the massive JSON output containing the core strategic blueprint:
1. Executive Summary & Pillars: Create the core foundation.
2. Audience & Messaging: Define the target market and how to speak to them.
3. Positioning Strategy: Determine Blue Ocean opportunities and competitive advantage.
4. Competitor Gaps & Trend Opportunities: Identify exploitable weaknesses in competitors and capitalize on trends.

CRITICAL EXPLAINABILITY:
Every generated section MUST have a 'reasoning' and 'confidence' field.

DO NOT output the JSON schema itself. You MUST output ONLY valid JSON data that precisely conforms to this schema:
{json.dumps(schema_json)}
"""
        return prompt

    def build_cmo_prompt_part2(self, business_id: int, part1_data: dict, schema_json: dict) -> str:
        prompt = f"""You are the Chief Marketing Officer (CMO) for an AI Growth Operating System.
You have just generated PART 1 of the strategic marketing plan. Here is what you generated:

{json.dumps(part1_data, indent=2)}

### INSTRUCTIONS (PART 2):
Based on the Strategy Part 1 above, you must now generate PART 2 of the JSON output:
5. Opportunity Engine: Score and prioritize all growth/content opportunities out of 100.
6. Recommendations: Provide specific, actionable AI recommendations.
7. Campaign Planner: Design full marketing campaigns (name, budget, platforms, content mix). 
   *IMPORTANT:* The ONLY supported platform right now is 'LinkedIn'. Do NOT include Twitter, X, Instagram, or any other platforms.
8. Weekly & Monthly Roadmaps: Build week-by-week and month-by-month timelines.
9. Risk Assessment & Metrics: Identify risks and project KPIs (e.g., Follower Growth, Lead Gen).
10. Confidence Breakdown: Rate your confidence in different areas based on the quality of provided intelligence.

CRITICAL EXPLAINABILITY:
Every generated section MUST have a 'reasoning' and 'confidence' field.

DO NOT output the JSON schema itself. You MUST output ONLY valid JSON data that precisely conforms to this schema:
{json.dumps(schema_json)}
"""
        return prompt
