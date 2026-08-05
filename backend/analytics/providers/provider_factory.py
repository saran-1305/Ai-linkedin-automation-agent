from .base_provider import BaseAnalyticsProvider
from .linkedin_provider import LinkedInAnalyticsProvider

class AnalyticsProviderFactory:
    """
    Factory to instantiate the correct analytics provider based on platform name.
    """

    @staticmethod
    def get_provider(platform: str, **kwargs) -> BaseAnalyticsProvider:
        platform = platform.lower()
        if platform == "linkedin":
            return LinkedInAnalyticsProvider(**kwargs)
        # Future providers will be added here
        # elif platform == "twitter" or platform == "x":
        #     return XAnalyticsProvider(**kwargs)
        else:
            raise ValueError(f"Unsupported analytics platform: {platform}")
