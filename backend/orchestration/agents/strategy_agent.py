from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from strategy.strategy_service import StrategyService

logger = logging.getLogger(__name__)

class StrategyAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Strategy Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Formulating AI Marketing Strategy for Business {business_id}")
        plan = StrategyService(self.db).generate_strategy(business_id)
        return {"strategy_id": plan.id if plan else None}
