from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
import enum
from database.base import Base
from datetime import datetime

class AgentStatus(str, enum.Enum):
    WAITING = "WAITING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    PAUSED = "PAUSED"

class AgentTaskStatus(Base):
    __tablename__ = "agent_task_statuses"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    
    agent_name = Column(String(100), nullable=False)
    status = Column(SQLEnum(AgentStatus), default=AgentStatus.WAITING)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    details = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
