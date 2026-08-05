import json
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

class ContentValidator:
    def parse_and_validate(self, raw_response: str) -> Tuple[bool, Dict[str, Any], str]:
        """
        Attempts to parse the LLM output. 
        Returns (is_valid, parsed_json, error_message)
        """
        try:
            # Clean Markdown formatting if present
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1]
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
                
            data = json.loads(cleaned.strip())
            
            # Basic schema validation
            required_keys = ["title", "hook", "body", "cta", "hashtags", "metadata", "reasoning"]
            missing_keys = [k for k in required_keys if k not in data]
            
            if missing_keys:
                return False, {}, f"Missing required keys: {', '.join(missing_keys)}"
                
            return True, data, ""
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}\nRaw Response: {raw_response[:200]}...")
            return False, {}, f"Failed to parse JSON: {str(e)}"
        except Exception as e:
            logger.error(f"Validation Error: {e}")
            return False, {}, f"Unexpected validation error: {str(e)}"
