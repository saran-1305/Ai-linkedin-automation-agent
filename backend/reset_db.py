import sys
import os
import pkgutil
import importlib
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database.session import engine
from database.base import Base

# Dynamically import all models so create_all knows about them
import models
for _, module_name, _ in pkgutil.iter_modules(models.__path__):
    importlib.import_module(f"models.{module_name}")

print("Wiping PostgreSQL database completely...")
with engine.connect() as conn:
    # Drop all tables by recreating the public schema
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    
    # Re-grant permissions (standard postgres)
    conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
    conn.commit()

print("Recreating tables from models...")
Base.metadata.create_all(bind=engine)

print("Database reset successfully! The workspace is now completely empty.")
