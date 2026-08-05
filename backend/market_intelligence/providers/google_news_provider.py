import feedparser
from typing import List, Dict, Any
from .base_provider import MarketProvider
from datetime import datetime

class GoogleNewsProvider(MarketProvider):
    def collect_competitor_data(self, url: str) -> List[Dict[str, Any]]:
        # Google News is better for company names rather than URLs. 
        # But we can query the URL string to find mentions.
        return self._fetch_news(f'"{url}"')
        
    def collect_trend_data(self, query: str) -> List[Dict[str, Any]]:
        return self._fetch_news(query)
        
    def _fetch_news(self, query: str) -> List[Dict[str, Any]]:
        encoded_query = query.replace(' ', '%20')
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        
        feed = feedparser.parse(rss_url)
        results = []
        
        for entry in feed.entries:
            # feedparser returns parsed dates as a time.struct_time tuple
            # If date parsing fails, it might not exist.
            pub_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                pub_date = datetime(*entry.published_parsed[:6])
                
            results.append({
                "title": entry.title if hasattr(entry, 'title') else "",
                "url": entry.link if hasattr(entry, 'link') else "",
                "published_date": pub_date,
                "author": entry.source.title if hasattr(entry, 'source') and hasattr(entry.source, 'title') else None,
                "raw_text": entry.summary if hasattr(entry, 'summary') else ""
            })
            
        return results
