from typing import Union
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate

class BusinessNormalizer:
    def normalize(self, data: Union[BusinessProfileCreate, BusinessProfileUpdate]) -> Union[BusinessProfileCreate, BusinessProfileUpdate]:
        # Remove duplicate values in lists
        if data.products:
            data.products = list(dict.fromkeys(data.products))
        if data.services:
            data.services = list(dict.fromkeys(data.services))
        if data.pain_points:
            data.pain_points = list(dict.fromkeys(data.pain_points))
        if data.customer_goals:
            data.customer_goals = list(dict.fromkeys(data.customer_goals))
        if data.marketing_goals:
            data.marketing_goals = list(dict.fromkeys(data.marketing_goals))
        if data.lead_generation_goals:
            data.lead_generation_goals = list(dict.fromkeys(data.lead_generation_goals))
        if data.competitors:
            data.competitors = list(dict.fromkeys(data.competitors))
            
        # Clean formatting
        data.company_name = data.company_name.strip()
        data.industry = data.industry.strip()
        data.description = data.description.strip()
        
        return data
