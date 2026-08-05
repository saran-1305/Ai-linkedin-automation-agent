from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.session import get_db
from market_intelligence.services.market_service import MarketIntelligenceService

router = APIRouter(prefix="/market/trends", tags=["trends"])

from models.market import TrendSource, RawNews

@router.get("")
def get_trends(business_id: int = 1, db: Session = Depends(get_db)):
    sources = db.query(TrendSource).filter(TrendSource.is_active == 1).all()
    latest_news = db.query(RawNews).order_by(RawNews.published_date.desc()).limit(20).all()
    
    return {
        "sources": sources,
        "trending_topics": [], # To be populated by AI Analyzer in future phases
        "latest_news": latest_news,
        "emerging_trends": []
    }

@router.post("/refresh")
def refresh_trends(background_tasks: BackgroundTasks):
    def run_trend_refresh_background():
        from database.session import SessionLocal
        db = SessionLocal()
        try:
            service = MarketIntelligenceService(db)
            service.refresh_trends_background()
        finally:
            db.close()
            
    background_tasks.add_task(run_trend_refresh_background)
    return {"message": "Trend refresh queued successfully"}
