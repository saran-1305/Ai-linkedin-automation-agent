import feedparser
from typing import List, Dict, Any
from .base_provider import MarketProvider
from datetime import datetime

class RSSProvider(MarketProvider):
    def collect_competitor_data(self, url: str) -> List[Dict[str, Any]]:
        return self._fetch_feed(url)
        
    def collect_trend_data(self, url: str) -> List[Dict[str, Any]]:
        return self._fetch_feed(url)
        
    def _fetch_feed(self, url: str) -> List[Dict[str, Any]]:
        feed = feedparser.parse(url)
        results = []
        
        for entry in feed.entries:
            pub_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                pub_date = datetime(*entry.published_parsed[:6])
                
            results.append({
                "title": entry.title if hasattr(entry, 'title') else "",
                "url": entry.link if hasattr(entry, 'link') else "",
                "published_date": pub_date,
                "author": entry.author if hasattr(entry, 'author') else None,
                "raw_text": entry.summary if hasattr(entry, 'summary') else ""
            })
            
        return results
