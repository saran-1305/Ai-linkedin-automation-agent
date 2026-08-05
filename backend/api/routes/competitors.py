from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.session import get_db
from market_intelligence.schemas.market import CompetitorCreate, CompetitorResponse
from market_intelligence.services.market_service import MarketIntelligenceService

router = APIRouter(prefix="/market/competitors", tags=["competitors"])

@router.get("", response_model=List[CompetitorResponse])
def get_competitors(business_id: int = 1, db: Session = Depends(get_db)):
    service = MarketIntelligenceService(db)
    return service.get_competitors(business_id)

@router.delete("/{competitor_id}")
def delete_competitor(competitor_id: int, db: Session = Depends(get_db)):
    service = MarketIntelligenceService(db)
    success = service.delete_competitor(competitor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return {"status": "deleted"}

@router.post("", response_model=CompetitorResponse)
def add_competitor(data: CompetitorCreate, background_tasks: BackgroundTasks, business_id: int = 1, db: Session = Depends(get_db)):
    service = MarketIntelligenceService(db)
    
    # 1. Store competitor in DB immediately
    competitor = service.add_competitor(business_id, data)
    
    # 2. Schedule background refresh to collect data and run LLM
    def run_competitor_refresh_background(comp_id: int):
        from database.session import SessionLocal
        bg_db = SessionLocal()
        try:
            bg_service = MarketIntelligenceService(bg_db)
            bg_service.refresh_competitor_background(comp_id)
        finally:
            bg_db.close()
            
    background_tasks.add_task(run_competitor_refresh_background, competitor.id)
    
    return competitor

@router.post("/{competitor_id}/refresh")
def refresh_competitor(competitor_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    service = MarketIntelligenceService(db)
    
    # Check if exists
    comp = service.repo.get_competitor(competitor_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")
        
    def run_competitor_refresh_background(comp_id: int):
        from database.session import SessionLocal
        bg_db = SessionLocal()
        try:
            bg_service = MarketIntelligenceService(bg_db)
            bg_service.refresh_competitor_background(comp_id)
        finally:
            bg_db.close()
            
    background_tasks.add_task(run_competitor_refresh_background, competitor_id)
    return {"message": "Competitor refresh queued successfully"}
