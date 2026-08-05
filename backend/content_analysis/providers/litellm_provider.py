import time
from content_analysis.providers.base_provider import BaseProvider
from typing import Dict, Any
import litellm

class LiteLLMProvider(BaseProvider):
    def __init__(self, model_name: str, api_key: str = None, api_base: str = None):
        self.model_name = model_name
        self.api_key = api_key
        self.api_base = api_base

    def analyze(self, system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> Dict[str, Any]:
        start_time = time.time()
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        kwargs = {
            "model": self.model_name,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": max_tokens
        }
        if self.api_key:
            kwargs["api_key"] = self.api_key
        if self.api_base:
            kwargs["api_base"] = self.api_base
            
        response = litellm.completion(**kwargs)
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        raw_response = response.choices[0].message.content
        usage = response.usage
        
        # litellm provides cost tracking
        cost = 0.0
        if not self.model_name.startswith("groq/"):
            try:
                cost = litellm.completion_cost(completion_response=response) or 0.0
            except Exception:
                pass
        
        return {
            "raw_response": raw_response,
            "input_tokens": usage.prompt_tokens,
            "output_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,
            "estimated_cost": cost,
            "latency_ms": latency_ms,
            "provider": response.model, # liteLLM sets model field usually
            "model_name": self.model_name
        }
