from abc import ABC, abstractmethod
from typing import Dict, Any
from sqlalchemy.orm import Session

class BaseAgent(ABC):
    """
    Base class for all AI Agents in the Workflow Engine.
    """
    def __init__(self, db: Session):
        self.db = db
        
    @property
    @abstractmethod
    def name(self) -> str:
        """Returns the name of the agent."""
        pass
        
    @abstractmethod
    async def execute(self, business_id: int, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        The core execution logic of the agent.
        Takes in a context dictionary from previous agents in the workflow,
        and returns a dictionary of output data to be passed to the next agent.
        """
        pass
