from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from models.execution import WeeklyPlan, ContentSlot
from content.orchestrator import AIContentOrchestrator

logger = logging.getLogger(__name__)

class ContentGeneratorAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Content Generator Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Generating actual post content for Business {business_id}")

        weekly_plan_id = context.get("weekly_plan_id")
        plan = None
        if weekly_plan_id:
            plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.id == weekly_plan_id).first()
        if not plan:
            plan = (
                self.db.query(WeeklyPlan)
                .filter(WeeklyPlan.business_id == business_id)
                .order_by(WeeklyPlan.version.desc(), WeeklyPlan.created_at.desc())
                .first()
            )
        if not plan:
            logger.warning(f"[{self.name}] No weekly plan found for Business {business_id}; nothing to generate.")
            return {"generated_content_ids": []}

        slots = self.db.query(ContentSlot).filter(ContentSlot.weekly_plan_id == plan.id).all()
        orchestrator = AIContentOrchestrator(self.db)
        generated_content_ids = []
        for slot in slots:
            try:
                content = orchestrator.generate_content_for_slot(slot.id)
                generated_content_ids.append(content.id)
            except Exception as e:
                logger.error(f"[{self.name}] Failed to generate content for slot {slot.id}: {e}")

        return {"generated_content_ids": generated_content_ids, "weekly_plan_id": plan.id}
