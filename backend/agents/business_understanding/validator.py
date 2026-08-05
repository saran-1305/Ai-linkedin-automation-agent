import re
from typing import Union
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate

class BusinessValidator:
    def validate(self, data: Union[BusinessProfileCreate, BusinessProfileUpdate]) -> Union[BusinessProfileCreate, BusinessProfileUpdate]:
        # Validate URLs
        if data.website:
            self._validate_url(data.website)
        if data.linkedin_url:
            self._validate_url(data.linkedin_url)
            
        # Ensure lists don't have empty strings
        if data.products:
            data.products = [p for p in data.products if p.strip()]
        if data.services:
            data.services = [s for s in data.services if s.strip()]
            
        return data

    def _validate_url(self, url: str):
        # Basic URL validation regex
        regex = re.compile(
            r'^(?:http|ftp)s?://' # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
            r'localhost|' #localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
            r'(?::\d+)?' # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if not re.match(regex, url):
            raise ValueError(f"Invalid URL: {url}")
