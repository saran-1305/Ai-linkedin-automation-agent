from sqlalchemy.orm import Session
from .strategy_repository import StrategyRepository
from .PromptBuilder import PromptBuilder
from .planner import StrategyEngine
from .strategy_models import MasterStrategyResponse

class StrategyService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = StrategyRepository(db)
        self.engine = StrategyEngine(db)

    def get_current_strategy(self, business_id: int):
        return self.repo.get_latest_plan(business_id)

    def generate_strategy(self, business_id: int):
        import time
        start_time = time.time()
        
        # 1. Execute AI Generation (2-Part Split)
        parsed_strategy = self.engine.generate_strategy(business_id)
        
        # 2. Calculate time and save
        execution_time_ms = int((time.time() - start_time) * 1000)
        new_plan = self.repo.save_new_strategy(business_id, parsed_strategy, execution_time_ms)
        
        return new_plan
