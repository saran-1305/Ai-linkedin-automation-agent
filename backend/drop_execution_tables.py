from database.session import engine
from sqlalchemy import text
from models.execution import Base

print("Dropping execution tables...")
with engine.connect() as con:
    # Phase 3 tables
    con.execute(text("DROP TABLE IF EXISTS execution_analytics CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_optimization_history CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_holiday_events CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_trend_injections CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_strategy_sync_logs CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_alerts CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_suggestions CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_feedback CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_health CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_optimizations CASCADE;"))

    # Phase 2 tables
    con.execute(text("DROP TABLE IF EXISTS execution_conflicts CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_content_dependencies CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_priorities CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_funnel_plans CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_cta_plans CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_campaign_schedules CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_content_slots CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_daily_plans CASCADE;"))
    
    # Phase 1 tables
    con.execute(text("DROP TABLE IF EXISTS execution_weekly_versions CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_weekly_metrics CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_audience_allocations CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_platform_plans CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_weekly_themes CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_weekly_objectives CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS execution_weekly_plans CASCADE;"))
    con.commit()

print("Dropped successfully. Recreating...")
Base.metadata.create_all(bind=engine)
print("Recreated successfully.")
