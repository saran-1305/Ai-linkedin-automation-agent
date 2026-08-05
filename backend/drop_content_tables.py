from database.session import engine
from sqlalchemy import text

print("Dropping content tables...")
with engine.connect() as con:
    # Phase 2 tables
    con.execute(text("DROP TABLE IF EXISTS content_improvements CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_analyses CASCADE;"))
    
    # Phase 1 tables
    con.execute(text("DROP TABLE IF EXISTS content_versions CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_scores CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_generation_reasoning CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_metadata_generator CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_drafts CASCADE;"))
    con.execute(text("DROP TABLE IF EXISTS content_generated CASCADE;"))
    con.commit()
    
print("Dropped successfully. Recreating...")

from models.business import BusinessProfile
from models.execution import WeeklyPlan, ContentSlot
from models.content import Base
Base.metadata.create_all(bind=engine)
print("Recreated successfully.")
