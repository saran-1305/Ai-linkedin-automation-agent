from typing import Dict, Any
import logging
from orchestration.agents.base import BaseAgent
from models.content import GeneratedContent
from models.publishing import PublishingJob

logger = logging.getLogger(__name__)

class PublishingAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Publishing Agent"

    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        content_id = context.get("content_id")
        logger.info(f"[{self.name}] Checking publishing status for content {content_id} (Business {business_id})")

        content = self.db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first() if content_id else None
        if not content:
            return {"publishing_status": "not_found"}

        job = (
            self.db.query(PublishingJob).filter(PublishingJob.id == content.publishing_job_id).first()
            if content.publishing_job_id else None
        )
        # Publishing itself is gated behind the mandatory approval-email flow
        # (backend/workflow/orchestrator.py) - this agent only reports status,
        # it never publishes directly.
        return {"publishing_status": job.status.value if job else content.publish_status}
