from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAnalyticsProvider(ABC):
    """
    Abstract base class for analytics providers.
    All platform-specific analytics providers must inherit from this class.
    """

    @abstractmethod
    async def collect_post_metrics(self, post_id: str) -> Dict[str, Any]:
        """
        Collects metrics for a specific post.
        Should return a raw dictionary of metrics that the normalizer will later process.
        """
        pass

    @abstractmethod
    async def collect_profile_metrics(self, profile_id: str) -> Dict[str, Any]:
        """
        Collects metrics for the overall profile/page.
        """
        pass

    @abstractmethod
    async def collect_account_metrics(self, account_id: str) -> Dict[str, Any]:
        """
        Collects overall account metrics (e.g. followers, total engagement).
        """
        pass

    @abstractmethod
    async def validate_connection(self) -> bool:
        """
        Validates that the provider's connection and credentials are valid.
        """
        pass
