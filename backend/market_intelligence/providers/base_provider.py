from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class MarketProvider(ABC):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        
    @abstractmethod
    def collect_competitor_data(self, url: str) -> List[Dict[str, Any]]:
        """
        Collects raw data for a specific competitor URL or identifier.
        Returns a list of dicts representing raw articles/posts.
        """
        pass
        
    @abstractmethod
    def collect_trend_data(self, query: str) -> List[Dict[str, Any]]:
        """
        Collects raw trend data for a given query or topic.
        Returns a list of dicts representing raw articles/posts.
        """
        pass
