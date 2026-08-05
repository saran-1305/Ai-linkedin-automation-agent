import json
import logging
from content_analysis.providers.provider_factory import ProviderFactory
from .strategy_models import MasterStrategyResponse, MasterStrategyPart1, MasterStrategyPart2
from .PromptBuilder import PromptBuilder

logger = logging.getLogger(__name__)

class StrategyEngine:
    def __init__(self, db):
        self.db = db
        from content_analysis.providers.litellm_provider import LiteLLMProvider
        # Both Part 1 and Part 2 will use OpenRouter Llama 3.3 70B Instruct to avoid Groq's TPM limits
        self.provider_part1 = LiteLLMProvider(model_name="openrouter/meta-llama/llama-3.3-70b-instruct")
        self.provider_part2 = LiteLLMProvider(model_name="openrouter/meta-llama/llama-3.3-70b-instruct")

    def generate_strategy(self, business_id: int) -> MasterStrategyResponse:
        logger.info("Executing CMO Strategy LLM generation (2-Part Split)...")
        prompt_builder = PromptBuilder(self.db)
        
        try:
            # --- PART 1 ---
            schema_part1 = MasterStrategyPart1.model_json_schema()
            prompt1 = prompt_builder.build_cmo_prompt_part1(business_id, schema_part1)
            
            logger.info("Calling Groq for Part 1...")
            
            # Simple retry logic for Groq Free Tier TPM Sliding Window
            import time
            import litellm
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    response1 = self.provider_part1.analyze(system_prompt=prompt1, user_prompt="Generate PART 1.", max_tokens=8000)
                    break
                except litellm.RateLimitError as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"Groq Rate Limit hit. Waiting 35 seconds before retry... ({str(e)})")
                        time.sleep(35)
                    else:
                        raise e

            raw_json1 = response1.get("raw_response", "{}")
            if raw_json1.startswith("```json"): raw_json1 = raw_json1.split("```json")[1].rsplit("```", 1)[0].strip()
            elif raw_json1.startswith("```"): raw_json1 = raw_json1.split("```")[1].rsplit("```", 1)[0].strip()
            
            data_part1 = json.loads(raw_json1)
            # Validate part 1
            MasterStrategyPart1(**data_part1)
            
            # --- PART 2 ---
            schema_part2 = MasterStrategyPart2.model_json_schema()
            prompt2 = prompt_builder.build_cmo_prompt_part2(business_id, data_part1, schema_part2)
            
            logger.info("Calling OpenRouter for Part 2...")
            response2 = self.provider_part2.analyze(system_prompt=prompt2, user_prompt="Generate PART 2.", max_tokens=8000)
            raw_json2 = response2.get("raw_response", "{}")
            if raw_json2.startswith("```json"): raw_json2 = raw_json2.split("```json")[1].rsplit("```", 1)[0].strip()
            elif raw_json2.startswith("```"): raw_json2 = raw_json2.split("```")[1].rsplit("```", 1)[0].strip()
            
            data_part2 = json.loads(raw_json2)
            # Validate part 2
            MasterStrategyPart2(**data_part2)
            
            # --- MERGE ---
            merged_data = {**data_part1, **data_part2}
            strategy = MasterStrategyResponse(**merged_data)
            return strategy
            
        except Exception as e:
            logger.error(f"Failed to generate strategy: {e}")
            raise e
