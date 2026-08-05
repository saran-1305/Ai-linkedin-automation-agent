from sqlalchemy.orm import Session
from .repository import ExecutionRepository
from .planner import ExecutionEngine
import time

class ExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExecutionRepository(db)
        self.engine = ExecutionEngine(db)

    def get_current_plan(self, business_id: int):
        return self.repo.get_latest_plan(business_id)

    def generate_weekly_plan(self, business_id: int):
        start_time = time.time()
        
        # 1. Execute AI Generation
        parsed_plan = self.engine.generate_weekly_plan(business_id)
        
        # 2. Calculate time and save
        execution_time_ms = int((time.time() - start_time) * 1000)
        new_plan = self.repo.save_new_plan(business_id, parsed_plan, execution_time_ms)
        
        return new_plan
