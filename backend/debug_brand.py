import sys
sys.path.append('c:/linkedin automation tool agent/backend')
from database.session import SessionLocal
from brand_intelligence.service import BrandIntelligenceService
from brand_intelligence.prompt_builder import build_brand_intelligence_system_prompt, build_brand_intelligence_user_prompt

db = SessionLocal()
svc = BrandIntelligenceService(db)

business_profile = svc.aggregator.get_business_profile()
aggregated_data = svc.aggregator.aggregate_data()

system_prompt = build_brand_intelligence_system_prompt()
user_prompt = build_brand_intelligence_user_prompt(aggregated_data, business_profile)

print("Sending to LLM...")
llm_result = svc.provider.analyze(system_prompt=system_prompt, user_prompt=user_prompt)
print("Raw Response:")
print(llm_result["raw_response"])
