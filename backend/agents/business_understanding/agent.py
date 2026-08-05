from typing import Union
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate
from .validator import BusinessValidator
from .normalizer import BusinessNormalizer
from .processor import BusinessProcessor

class BusinessUnderstandingAgent:
    def __init__(self):
        self.validator = BusinessValidator()
        self.normalizer = BusinessNormalizer()
        self.processor = BusinessProcessor()
        
    def process_input(self, data: Union[BusinessProfileCreate, BusinessProfileUpdate]) -> Union[BusinessProfileCreate, BusinessProfileUpdate]:
        # 1. Validation
        validated_data = self.validator.validate(data)
        
        # 2. Normalization
        normalized_data = self.normalizer.normalize(validated_data)
        
        # 3. Processing (Structuring into Business Knowledge Object)
        processed_data = self.processor.process(normalized_data)
        
        return processed_data

    def extract_from_text(self, text: str) -> dict:
        """Extract structured business profile data from raw text."""
        from content_analysis.providers.litellm_provider import LiteLLMProvider
        import json
        import logging
        
        import os
        logger = logging.getLogger(__name__)
        model_name = os.environ.get("ANALYSIS_LLM_MODEL", "groq/llama-3.1-8b-instant")
        provider = LiteLLMProvider(model_name=model_name)
        
        system_prompt = (
            "You are an expert business analyst. Extract structured business information from the provided text. "
            "Return the data strictly as a JSON object matching this schema. For each field, return an object containing: "
            "value (the extracted value, which can be string or array of strings, or null), "
            "confidence (float between 0.0 and 1.0 indicating your confidence), "
            "source (string indicating the source file name where you found it, e.g. 'company_deck.pdf', or 'Inferenced'), "
            "explanation (a short reason why you extracted this value). "
            "The expected fields are: "
            "company_name, website, industry, description, location, linkedin_url, "
            "products (array), services (array), usp, primary_audience, secondary_audience, "
            "pain_points (array), customer_goals (array), marketing_goals (array), lead_generation_goals (array), "
            "brand_objectives, content_objectives, brand_voice, writing_style, cta_style, competitors (array)."
        )
        
        try:
            # Groq's free tier has a strict 6000 Tokens Per Minute (TPM) limit.
            # Limiting text to 10000 characters and max_tokens to 2000 keeps us well within the limit.
            result = provider.analyze(
                system_prompt=system_prompt, 
                user_prompt=f"Extract from the following text:\n\n{text[:10000]}",
                max_tokens=2000
            )
            raw_response = result.get("raw_response", "{}")
            extracted_data = json.loads(raw_response)
            
            # extracted_data is already in the expected format (each key is an object with value, confidence, source, explanation)
            # if we wanted to enforce it perfectly we'd map it through Pydantic, but this dictionary is sufficient to pass to the frontend
            
            return extracted_data
        except Exception as e:
            logger.error(f"Error extracting data from text: {e}")
            return {
                "company_name": "Error Extracting Company",
                "industry": "Unknown",
                "description": "Error during text extraction",
                "brand_voice": "Professional",
                "error": str(e)
            }
