from typing import Union
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate

class BusinessProcessor:
    def process(self, data: Union[BusinessProfileCreate, BusinessProfileUpdate]) -> Union[BusinessProfileCreate, BusinessProfileUpdate]:
        # Convert validated and normalized input into a structured Business Knowledge Object
        # In a real AI agent, this might involve calling an LLM to categorize or extract more info.
        # Since this module ONLY stores business knowledge and shouldn't call LLM,
        # the processor just ensures the data structure is complete for the DB.
        
        # We just pass the data through as the schema is already our structured object.
        return data
