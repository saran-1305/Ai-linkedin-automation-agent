from typing import Tuple
from publishing.providers.base import BaseProvider

class PlatformValidationEngine:
    """Runs pre-publish validation on the content based on platform provider rules"""
    
    @staticmethod
    async def validate(provider: BaseProvider, content_text: str, media: list = None) -> Tuple[bool, str]:
        if not await provider.authenticate():
            return False, "Authentication failed or token expired."
            
        return await provider.validate_platform_requirements(content_text, media)
