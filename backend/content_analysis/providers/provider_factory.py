import os
from content_analysis.providers.base_provider import BaseProvider
from content_analysis.providers.litellm_provider import LiteLLMProvider

class ProviderFactory:
    @staticmethod
    def get_provider(model_env_var: str = "ANALYSIS_LLM_MODEL") -> BaseProvider:
        # e.g., "openai/gpt-4o", "gemini/gemini-1.5-pro"
        # Defaults to a cheap/fast model for analysis if not set
        model_name = os.getenv(model_env_var) or os.getenv("ANALYSIS_LLM_MODEL", "gpt-4o-mini")
        
        # We use LiteLLM to wrap all supported providers seamlessly
        return LiteLLMProvider(model_name=model_name)
