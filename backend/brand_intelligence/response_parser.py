import json
import re
from typing import Dict, Any
from .schemas import BrandIntelligenceOutput

class BrandResponseParser:
    @staticmethod
    def parse(response_text: str) -> BrandIntelligenceOutput:
        """
        Parses the JSON response from the LLM and validates it against the BrandIntelligenceOutput schema.
        """
        try:
            # Strip markdown formatting if present
            clean_text = response_text
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].strip()
                
            data = json.loads(clean_text)
            return BrandIntelligenceOutput(**data)
        except Exception as e:
            raise ValueError(f"Failed to parse Brand Intelligence LLM response: {str(e)}")
