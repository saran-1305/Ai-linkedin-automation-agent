from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from market_intelligence.services.market_service import MarketIntelligenceService

logger = logging.getLogger(__name__)

class MarketIntelligenceAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Market Intelligence Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Conducting Market Research for Business {business_id}")
        service = MarketIntelligenceService(self.db)
        service.refresh_trends_background()
        for competitor in service.get_competitors(business_id):
            service.refresh_competitor_background(competitor.id)
        return {"market_analysis_status": "completed"}
