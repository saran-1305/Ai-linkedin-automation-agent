from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseProvider(ABC):
    @abstractmethod
    def analyze(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Executes the LLM request and returns a dict containing:
        - raw_response: str
        - input_tokens: int
        - output_tokens: int
        - total_tokens: int
        - estimated_cost: float
        - latency_ms: int
        - provider: str
        - model_name: str
        """
        pass
