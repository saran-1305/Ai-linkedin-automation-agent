import json
import logging
import time
import litellm
import os
from content_analysis.providers.provider_factory import ProviderFactory
from .schemas import WeeklyExecutionPlanResponse
from .calendar_prompt_builder import CalendarPromptBuilder

logger = logging.getLogger(__name__)

class ExecutionEngine:
    def __init__(self, db):
        self.db = db
        # Phase 2 requires a massive JSON output (14 complex arrays/objects). 
        # Groq's 12k TPM limit will definitely fail here. We MUST use OpenRouter.
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")
        if "groq" in self.provider.model_name or "llama-3.1-8b" in self.provider.model_name:
            self.provider.model_name = "openrouter/meta-llama/llama-3.3-70b-instruct"
            self.provider.api_key = os.getenv("OPENROUTER_API_KEY")

    def generate_weekly_plan(self, business_id: int) -> WeeklyExecutionPlanResponse:
        logger.info("Executing Weekly Planner LLM generation (Phase 2 - Unified JSON)...")
        prompt_builder = CalendarPromptBuilder(self.db)
        
        try:
            schema = WeeklyExecutionPlanResponse.model_json_schema()
            prompt = prompt_builder.build_weekly_plan_prompt(business_id, schema)
            
            logger.info("Calling OpenRouter for Massive Weekly Execution Blueprint...")
            
            # Using OpenRouter meta-llama/llama-3.3-70b-instruct which has massive context windows
            response = self.provider.analyze(system_prompt=prompt, user_prompt="Generate the Weekly Execution Plan.", max_tokens=8000)
            
            raw_json = response.get("raw_response", "{}")
            if raw_json.startswith("```json"): raw_json = raw_json.split("```json")[1].rsplit("```", 1)[0].strip()
            elif raw_json.startswith("```"): raw_json = raw_json.split("```")[1].rsplit("```", 1)[0].strip()
            
            data = json.loads(raw_json)
            # Validate
            plan = WeeklyExecutionPlanResponse(**data)
            return plan
            
        except Exception as e:
            logger.error(f"Failed to generate weekly plan: {e}")
            raise e
