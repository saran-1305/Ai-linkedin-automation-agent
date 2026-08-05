import json
import logging
from typing import Dict, Any
from pydantic import ValidationError
from content_analysis.schemas import DocumentAnalysisResponse
from content_analysis.validators import sanitize_confidence, normalize_text

logger = logging.getLogger(__name__)

class ResponseParser:
    @staticmethod
    def parse_v1(raw_response: str) -> DocumentAnalysisResponse:
        """
        Parses raw LLM text into the strongly typed DocumentAnalysisResponse.
        Gracefully handles JSON extraction and ignores unknown fields.
        """
        try:
            # Attempt to extract JSON if wrapped in markdown
            if "```json" in raw_response:
                json_str = raw_response.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_response:
                json_str = raw_response.split("```")[1].split("```")[0].strip()
            else:
                json_str = raw_response.strip()

            parsed_dict = json.loads(json_str)
            
            # Apply custom normalizations
            if 'overall_confidence' in parsed_dict:
                parsed_dict['overall_confidence'] = sanitize_confidence(parsed_dict['overall_confidence'])
                
            if 'topics' in parsed_dict and isinstance(parsed_dict['topics'], list):
                for t in parsed_dict['topics']:
                    t['confidence'] = sanitize_confidence(t.get('confidence', 0.0))
                    
            if 'audiences' in parsed_dict and isinstance(parsed_dict['audiences'], list):
                for a in parsed_dict['audiences']:
                    a['confidence'] = sanitize_confidence(a.get('confidence', 0.0))
                    
            if 'tones' in parsed_dict and isinstance(parsed_dict['tones'], list):
                for t in parsed_dict['tones']:
                    t['confidence'] = sanitize_confidence(t.get('confidence', 0.0))

            # Pydantic validation (ignores unknown fields inherently)
            return DocumentAnalysisResponse(**parsed_dict)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from LLM: {str(e)}")
            raise ValueError(f"Invalid JSON returned from LLM: {str(e)}")
        except ValidationError as e:
            logger.error(f"Schema validation failed: {str(e)}")
            raise ValueError(f"LLM response did not match expected schema: {str(e)}")
