from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from brand_intelligence.service import BrandIntelligenceService

logger = logging.getLogger(__name__)

class BrandIntelligenceAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Brand Intelligence Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Building Brand Identity for Business {business_id}")
        brand_profile = BrandIntelligenceService(self.db).regenerate_brand_profile(business_id)
        return {"brand_profile_id": brand_profile.id if brand_profile else None}
