from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from analytics.services.analytics_collector import AnalyticsCollector
from analytics.repositories.analytics_repository import AnalyticsRepository

logger = logging.getLogger(__name__)

class AnalyticsAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Analytics Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Collecting post performance for Business {business_id}")
        collector = AnalyticsCollector(AnalyticsRepository())
        run = await collector.run_collection_cycle("linkedin")
        return {"analytics_updated": True, "collected_posts": run.collected_posts}
