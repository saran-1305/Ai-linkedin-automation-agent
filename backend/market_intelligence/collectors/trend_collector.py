from typing import List, Dict, Any
from ..providers.provider_factory import MarketProviderFactory

class TrendCollector:
    def __init__(self):
        pass

    def collect(self, query: str, provider_type: str = "google_news") -> List[Dict[str, Any]]:
        """
        Collects trend data for a given query using the specified provider.
        Defaults to google_news.
        """
        try:
            provider = MarketProviderFactory.get_provider(provider_type)
            raw_data = provider.collect_trend_data(query)
            return raw_data
        except ValueError:
            return []
