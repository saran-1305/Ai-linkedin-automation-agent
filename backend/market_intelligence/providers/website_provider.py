import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from .base_provider import MarketProvider
from datetime import datetime
import json

class WebsiteProvider(MarketProvider):
    def collect_competitor_data(self, url: str) -> List[Dict[str, Any]]:
        """
        Downloads webpage, extracts visible content, title, headings,
        meta description, links, and returns normalized text.
        """
        try:
            # Add a generic User-Agent to avoid simple blocks
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts, styles, and common navigation containers
            for element in soup(["script", "style", "nav", "header", "footer", "aside"]):
                element.decompose()
                
            # Extract title
            title = soup.title.string.strip() if soup.title and soup.title.string else ""
            
            # Extract meta description
            meta_desc = ""
            meta_tag = soup.find("meta", attrs={"name": "description"})
            if meta_tag and "content" in meta_tag.attrs:
                meta_desc = meta_tag.attrs["content"]
                
            # Extract headings
            headings = []
            for h in soup.find_all(['h1', 'h2', 'h3']):
                headings.append(h.get_text(separator=' ', strip=True))
                
            # Extract text content
            # separator=' ' ensures words don't squash together when tags are stripped
            text = soup.get_text(separator=' ', strip=True)
            
            # Normalize whitespace
            normalized_text = ' '.join(text.split())
            
            # Extract canonical url
            canonical = ""
            canonical_tag = soup.find("link", rel="canonical")
            if canonical_tag and "href" in canonical_tag.attrs:
                canonical = canonical_tag.attrs["href"]
                
            # Build structured output
            result = {
                "title": title,
                "url": canonical or url,
                "published_date": datetime.utcnow(),
                "author": None,
                "meta_description": meta_desc,
                "headings": headings,
                "raw_text": normalized_text
            }
            
            return [result]
            
        except Exception as e:
            print(f"Error fetching website {url}: {e}")
            return []
            
    def collect_trend_data(self, url: str) -> List[Dict[str, Any]]:
        # Trend data from a single website page uses the same logic
        return self.collect_competitor_data(url)
