import time
import random
from typing import Dict, Any
from .base import PublishingProvider, PublishResult
from models.content import PlatformVariation
from models.publishing import PlatformAccount

class MockProvider(PublishingProvider):
    """
    Mock provider for testing the publishing orchestrator without making real API calls.
    """
    
    def __init__(self, account: PlatformAccount, platform_name: str):
        super().__init__(account)
        self._platform_name = platform_name
        
    @property
    def platform_name(self) -> str:
        return self._platform_name
        
    def validate_connection(self) -> bool:
        # For Phase 1, assume all mock connections are valid
        return self.account.is_connected
        
    def publish(self, variation: PlatformVariation) -> PublishResult:
        # Simulate network delay
        time.sleep(1.5)
        
        # Simulate 90% success rate
        is_success = random.random() > 0.1
        
        if is_success:
            return PublishResult(
                success=True,
                platform_post_id=f"mock_{self.platform_name.lower()}_{random.randint(1000, 9999)}",
                api_response={"status": "published", "url": f"https://{self.platform_name.lower()}.com/post/mock_123"}
            )
        else:
            return PublishResult(
                success=False,
                error_message=f"Mock API Error: Failed to reach {self.platform_name} servers.",
                api_response={"error": "Rate limit exceeded or connection timeout."}
            )

class ProviderFactory:
    @staticmethod
    def get_provider(account: PlatformAccount) -> PublishingProvider:
        """
        In Phase 1, we return MockProvider for all platforms.
        Later, this will switch based on account.platform_name.
        """
        # Example for future implementation:
        # if account.platform_name == "LinkedIn":
        #     return LinkedInProvider(account)
        
        return MockProvider(account, account.platform_name)
