from .schemas import BrandIntelligenceOutput

def build_brand_intelligence_system_prompt() -> str:
    schema_json = BrandIntelligenceOutput.schema_json(indent=2)
    return f"""You are the Brand Intelligence Engine.
Your job is to read aggregated data from many historical documents, posts, and analyses, and distill them into a single comprehensive Brand Profile.

You must output ONLY valid JSON matching the exact schema provided below. Do not deviate from this structure.
SCHEMA:
{schema_json}

Determine the overarching brand voice, personality, topics, keywords, and pillars.
Aggregate frequencies where possible, or rank them.

Provide confidence scores (0.0 to 1.0) for your assessments based on the consistency of the provided data.
"""

def build_brand_intelligence_user_prompt(aggregated_data: dict, business_profile: dict) -> str:
    import json
    return f"""
BUSINESS PROFILE:
{json.dumps(business_profile, indent=2)}

AGGREGATED HISTORICAL DATA:
{json.dumps(aggregated_data, indent=2)}

Based on the aggregated historical data across all analyzed documents, generate a unified Brand Intelligence profile.
Respond in JSON format.
"""
