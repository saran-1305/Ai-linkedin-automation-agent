import logging
import traceback
from typing import Dict, Any, Optional
from datetime import datetime

from orchestration.agents.base import BaseAgent
from sqlalchemy.orm import Session
from models.orchestration import AgentTaskStatus, AgentStatus

logger = logging.getLogger(__name__)

class AgentExecutionResult:
    def __init__(self, success: bool, data: Dict[str, Any] = None, error_message: str = None):
        self.success = success
        self.data = data or {}
        self.error_message = error_message

class WorkflowRunner:
    """
    Executes a single agent, handles error catching, retries, and records status.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        
    async def execute_agent(self, agent: BaseAgent, business_id: int, context: Dict[str, Any]) -> AgentExecutionResult:
        logger.info(f"Runner executing Agent: {agent.name} for Business {business_id}")
        
        # Here we could record "RUNNING" state to the DB for the AI Command Center
        self._update_agent_status(business_id, agent.name, "RUNNING")
        
        try:
            # Provide the agent with context and let it execute its internal logic
            result_data = await agent.execute(business_id, context)
            
            # Record "COMPLETED" state
            self._update_agent_status(business_id, agent.name, "COMPLETED")
            return AgentExecutionResult(success=True, data=result_data)
            
        except Exception as e:
            error_details = traceback.format_exc()
            logger.error(f"Agent {agent.name} failed: {str(e)}\n{error_details}")
            
            # Record "FAILED" state
            self._update_agent_status(business_id, agent.name, "FAILED")
            return AgentExecutionResult(success=False, error_message=str(e))
            
    def _update_agent_status(self, business_id: int, agent_name: str, status: str):
        """
        Updates the agent's status in the database, allowing the AI Command Center to reflect live states.
        Valid statuses: WAITING, RUNNING, COMPLETED, FAILED, RETRYING, PAUSED
        """
        try:
            task = self.db.query(AgentTaskStatus).filter(
                AgentTaskStatus.business_id == business_id,
                AgentTaskStatus.agent_name == agent_name
            ).first()
            
            if not task:
                task = AgentTaskStatus(
                    business_id=business_id,
                    agent_name=agent_name,
                    status=getattr(AgentStatus, status)
                )
                self.db.add(task)
            else:
                task.status = getattr(AgentStatus, status)
                task.last_update = datetime.utcnow()
                
            self.db.commit()
            logger.debug(f"[Agent Status] {agent_name} -> {status}")
        except Exception as e:
            logger.error(f"Failed to update agent status: {e}")
            self.db.rollback()
