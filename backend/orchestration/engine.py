import logging
from typing import List, Dict, Any, Type
from datetime import datetime

from orchestration.runner import WorkflowRunner
from orchestration.agents.base import BaseAgent
from models.business import BusinessProfile

logger = logging.getLogger(__name__)

class WorkflowEngine:
    """
    Coordinates independent agents to execute the AI Marketing pipeline autonomously.
    It does not do the work itself; it acts as the orchestrator for the WorkflowRunner.
    """
    def __init__(self, db_session):
        self.db = db_session
        self.runner = WorkflowRunner(db_session)
        
    async def run_onboarding_pipeline(self, business_id: int):
        """
        Triggered when a new user finishes the onboarding wizard.
        Executes the initial setup pipeline.
        """
        logger.info(f"Starting Onboarding Pipeline for Business {business_id}")
        
        # We define the sequence of agents for this specific workflow
        from orchestration.agents.business_agent import BusinessAgent
        from orchestration.agents.brand_agent import BrandIntelligenceAgent
        from orchestration.agents.market_agent import MarketIntelligenceAgent
        
        agents_to_run = [
            BusinessAgent(self.db),
            BrandIntelligenceAgent(self.db),
            MarketIntelligenceAgent(self.db)
        ]
        
        # Execute the pipeline
        await self._execute_sequence(business_id, agents_to_run)
        
    async def run_weekly_planning_pipeline(self, business_id: int):
        """
        Triggered weekly to create strategy, generate content, and schedule.
        """
        logger.info(f"Starting Weekly Planning Pipeline for Business {business_id}")
        
        from orchestration.agents.strategy_agent import StrategyAgent
        from orchestration.agents.weekly_planner_agent import WeeklyPlannerAgent
        from orchestration.agents.content_generator_agent import ContentGeneratorAgent
        
        agents_to_run = [
            StrategyAgent(self.db),
            WeeklyPlannerAgent(self.db),
            ContentGeneratorAgent(self.db)
        ]
        
        context = await self._execute_sequence(business_id, agents_to_run)
        
        # Phase 5: Autonomous Content -> Publishing Pipeline
        business = self.db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first()
        if business and business.ai_operating_mode == 'autonomous':
            generated_ids = context.get("generated_content_ids", [])
            if generated_ids:
                logger.info(f"Autonomous Mode Active: Scheduling {len(generated_ids)} posts directly to Publishing Queue.")
                from publishing.services.content_publishing_service import ContentPublishingService
                pub_service = ContentPublishingService(self.db)
                
                for cid in generated_ids:
                    try:
                        pub_service.approve_content(cid, "AI Autonomous System")
                        pub_service.create_job_from_generated_content(cid, "LinkedIn")
                    except Exception as e:
                        logger.error(f"Failed to auto-schedule content {cid}: {e}")
        
    async def run_publishing_pipeline(self, business_id: int, content_id: int):
        """
        Triggered when content is approved or autonomously marked ready.
        """
        from orchestration.agents.publishing_agent import PublishingAgent
        
        agent = PublishingAgent(self.db)
        context = {"content_id": content_id}
        
        await self.runner.execute_agent(agent, business_id, context)
        
    async def _execute_sequence(self, business_id: int, agents: List[BaseAgent], initial_context: Dict = None):
        """
        Sequentially executes a list of agents, passing the context forward.
        """
        context = initial_context or {}
        
        for agent in agents:
            logger.info(f"Engine passing control to {agent.name}")
            result = await self.runner.execute_agent(agent, business_id, context)
            
            if not result.success:
                logger.error(f"Workflow sequence halted. Agent {agent.name} failed: {result.error_message}")
                break
                
            # Merge agent's output into the context for the next agent
            context.update(result.data or {})
            
        logger.info(f"Workflow sequence completed for Business {business_id}")
        return context
