from database.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

tables = [
    "raw_articles", "raw_posts", "raw_news", 
    "raw_competitor_pages", "raw_social_content", 
    "trend_sources", "trend_articles"
]

try:
    for table in tables:
        col = "url" if table != "trend_sources" else "url_or_query"
        print(f"Altering {table}.{col} to TEXT...")
        db.execute(text(f"ALTER TABLE {table} ALTER COLUMN {col} TYPE TEXT;"))
    db.commit()
    print("Database altered successfully!")
except Exception as e:
    print("Error:", e)
    db.rollback()
