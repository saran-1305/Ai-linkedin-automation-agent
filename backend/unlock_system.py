import sys
import logging
from sqlalchemy import text
from database.session import SessionLocal

logging.basicConfig(level=logging.INFO)
db = SessionLocal()
try:
    db.execute(text("DELETE FROM system_locks"))
    db.commit()
    print("Deleted all system locks")
finally:
    db.close()
