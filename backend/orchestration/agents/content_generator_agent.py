from typing import Dict, Any
import logging
import asyncio
from sqlalchemy.orm import Session
from orchestration.agents.base import BaseAgent

logger = logging.getLogger(__name__)

class ContentGeneratorAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Content Generator Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Generating actual post content for Business {business_id}")
        await asyncio.sleep(5)
        # We don't want the engine to actually try to auto-publish dummy IDs and crash since they don't exist in DB
        # So we just return an empty array for generated_content_ids for the test
        return {"generated_content_ids": []}
