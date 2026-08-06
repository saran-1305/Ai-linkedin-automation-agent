import logging
from typing import Dict, List, Optional

import httpx

from config.settings import settings

logger = logging.getLogger(__name__)

PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"


class PexelsProvider:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.PEXELS_API_KEY

    def search(self, query: str, per_page: int = 5) -> List[Dict]:
        if not self.api_key:
            logger.warning("PEXELS_API_KEY not set; skipping image search.")
            return []
        try:
            response = httpx.get(
                PEXELS_SEARCH_URL,
                headers={"Authorization": self.api_key},
                params={"query": query, "per_page": per_page, "orientation": "landscape"},
                timeout=15.0,
            )
            response.raise_for_status()
            return response.json().get("photos", [])
        except Exception as e:
            logger.error(f"Pexels search failed for query '{query}': {e}")
            return []
