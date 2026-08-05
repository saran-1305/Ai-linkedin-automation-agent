from database.session import engine, SessionLocal
from database.base import Base
import models.strategy

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created.")

from strategy.strategy_service import StrategyService
db = SessionLocal()
service = StrategyService(db)

try:
    print("Generating Strategy (This might take a minute)...")
    plan = service.generate_strategy(business_id=1)
    print(f"Strategy Generated Successfully: ID={plan.id}, Name={plan.strategy_name}")
except Exception as e:
    print(f"Error generating strategy: {e}")
    import traceback
    traceback.print_exc()
