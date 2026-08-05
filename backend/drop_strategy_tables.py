from database.session import engine
from models.strategy import Base
from sqlalchemy import text

print("Dropping strategy tables...")
with engine.connect() as con:
    # Phase 2 & 3
    con.execute(text("DROP TABLE IF EXISTS strategy_confidence_breakdown CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_metrics CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_risks CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_monthly_roadmaps CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_weekly_roadmaps CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_campaigns CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_recommendations CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_opportunities CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_trend_opportunities CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_competitor_gaps CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_positioning CASCADE;"))
    
    # Phase 1
    con.execute(text("DROP TABLE IF EXISTS strategy_decision_logs CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_versions CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_messaging CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_audience_segments CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_pillars CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS strategy_executive_summary CASCADE;"))
    
    # Core Plan
    con.execute(text("DROP TABLE IF EXISTS strategy_plans CASCADE;"))
    con.commit()

print("Dropped successfully. Recreating...")
from models.business import *
from models.content import *
from models.analysis import *
from models.brand import *
from models.competitor import *
from models.market import *
from models.strategy import *
Base.metadata.create_all(bind=engine)
print("Recreated successfully.")
