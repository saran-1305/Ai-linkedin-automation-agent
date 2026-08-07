from sqlalchemy import text
from database.session import engine
with engine.begin() as conn:
    conn.execute(text("UPDATE workflow_runs SET status='FAILED' WHERE status='RUNNING'"))
    conn.execute(text("UPDATE content_pipeline_runs SET status='FAILED' WHERE status='RUNNING'"))
