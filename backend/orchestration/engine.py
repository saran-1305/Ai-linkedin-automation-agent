import asyncio
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

        # Phase 5: Autonomous Content -> Visual Intelligence -> Quality Assurance -> Approval Email
        #
        # NOTE: this used to call pub_service.approve_content()+create_job_from_generated_content()
        # directly here, silently auto-approving and scheduling without any human step whenever
        # ai_operating_mode == 'autonomous'. That contradicts the platform's core guarantee that
        # the *only* recurring human touchpoint is the approval email - so every generated post,
        # autonomous mode or not, is now routed through backend/workflow/orchestrator.py's
        # Visual Intelligence -> Quality Assurance -> mandatory approval-email gate instead.
        business = self.db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first()
        if business and business.ai_operating_mode == 'autonomous':
            generated_ids = context.get("generated_content_ids", [])
            if generated_ids:
                logger.info(f"Autonomous Mode Active: routing {len(generated_ids)} generated post(s) through Visual Intelligence, Quality Assurance, and the mandatory approval email.")
                from models.content import GeneratedContent
                from models.workflow_run import WorkflowRun, ContentPipelineRun, CycleStage, ContentPipelineStage, RunStatus
                from workflow.orchestrator import AutonomousWorkflowOrchestrator

                run = WorkflowRun(
                    business_id=business_id,
                    cycle_stage=CycleStage.COMPLETED,
                    status=RunStatus.RUNNING,
                    weekly_plan_id=context.get("weekly_plan_id"),
                )
                self.db.add(run)
                self.db.commit()
                self.db.refresh(run)

                orchestrator = AutonomousWorkflowOrchestrator(self.db)
                for cid in generated_ids:
                    try:
                        content = self.db.query(GeneratedContent).filter(GeneratedContent.id == cid).first()
                        if not content:
                            continue
                        pipeline = ContentPipelineRun(
                            workflow_run_id=run.id,
                            content_slot_id=content.content_slot_id,
                            generated_content_id=content.id,
                            stage=ContentPipelineStage.CONTENT_READY,
                            status=RunStatus.RUNNING,
                        )
                        self.db.add(pipeline)
                        self.db.commit()
                        self.db.refresh(pipeline)
                        # Orchestrator methods use asyncio.run() internally for their async
                        # sub-calls (e.g. sending the approval email), so they must run off
                        # this coroutine's own event loop thread.
                        await asyncio.to_thread(orchestrator.advance_content_pipeline, pipeline.id)
                    except Exception as e:
                        logger.error(f"Failed to route generated content {cid} through the autonomous pipeline: {e}")
        
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
