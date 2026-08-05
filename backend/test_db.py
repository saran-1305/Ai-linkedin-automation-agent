from database.session import SessionLocal
from models.business import BusinessProfile
from models.competitor import Competitor, CompetitorSWOT, CompetitorProfile, CompetitorAnalysis
from models.market import RawCompetitorPage

db = SessionLocal()

competitors = db.query(Competitor).all()
for comp in competitors:
    raw_pages = db.query(RawCompetitorPage).filter(RawCompetitorPage.competitor_id == comp.id).all()
    print(f"Competitor {comp.id} ({comp.website}) has {len(raw_pages)} RawCompetitorPage entries.")
    for rp in raw_pages:
        print(f"  - URL: {rp.url} | len: {len(rp.raw_text)}")
