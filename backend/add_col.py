import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS ai_operating_mode VARCHAR(50) DEFAULT 'autonomous';"))
    conn.commit()
print("Column added successfully!")
