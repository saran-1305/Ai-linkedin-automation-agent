from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from services.business_service import BusinessProfileService

logger = logging.getLogger(__name__)

class BusinessAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Business Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Validating Business Profile {business_id}")
        profile = BusinessProfileService(self.db).get_profile(business_id)
        if not profile:
            raise ValueError(f"Business profile {business_id} not found or not ready.")
        return {"business_analysis": {"status": "ready", "business_id": profile.id}}
