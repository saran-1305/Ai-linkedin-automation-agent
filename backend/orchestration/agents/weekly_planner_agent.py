from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from execution.service import ExecutionService

logger = logging.getLogger(__name__)

class WeeklyPlannerAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Weekly Planner Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Generating Weekly Plan for Business {business_id}")
        plan = ExecutionService(self.db).generate_weekly_plan(business_id)
        return {"weekly_plan_id": plan.id if plan else None}
