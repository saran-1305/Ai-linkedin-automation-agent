from typing import Dict, Type, Optional
from .base_provider import MarketProvider
from .google_news_provider import GoogleNewsProvider
from .rss_provider import RSSProvider
from .website_provider import WebsiteProvider
from .placeholders import RedditProvider, LinkedInProvider

class MarketProviderFactory:
    _providers: Dict[str, Type[MarketProvider]] = {
        "google_news": GoogleNewsProvider,
        "rss": RSSProvider,
        "website": WebsiteProvider,
        "reddit": RedditProvider,
        "linkedin": LinkedInProvider
    }
    
    @classmethod
    def get_provider(cls, provider_type: str, api_key: Optional[str] = None) -> MarketProvider:
        """
        Instantiates and returns the appropriate data collection provider.
        """
        provider_class = cls._providers.get(provider_type)
        if not provider_class:
            raise ValueError(f"Market data provider '{provider_type}' is not supported.")
        return provider_class(api_key=api_key)
