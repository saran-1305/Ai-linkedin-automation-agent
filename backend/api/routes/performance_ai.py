from fastapi import APIRouter, Depends
from typing import List
from models.performance_intelligence import (
    PerformanceInsight, PerformanceRecommendation, 
    ExecutiveSummary, PerformanceMemory, PerformancePattern
)
from analytics.services.performance_ai_engine import PerformanceAIEngine

router = APIRouter(prefix="/performance", tags=["Performance AI Engine"])

from sqlalchemy.orm import Session
from api.dependencies import get_db

def get_ai_engine(db: Session = Depends(get_db)):
    return PerformanceAIEngine(db)

@router.get("/summary", response_model=ExecutiveSummary)
async def get_executive_summary(engine: PerformanceAIEngine = Depends(get_ai_engine)):
    """Retrieve the executive performance report."""
    return await engine.generate_executive_summary()

@router.get("/insights", response_model=List[PerformanceInsight])
async def get_insights(engine: PerformanceAIEngine = Depends(get_ai_engine)):
    """Retrieve natural-language insights generated from detected patterns."""
    return await engine.generate_insights()

@router.get("/recommendations", response_model=List[PerformanceRecommendation])
async def get_recommendations(engine: PerformanceAIEngine = Depends(get_ai_engine)):
    """Retrieve actionable AI recommendations."""
    return await engine.generate_recommendations()

@router.get("/memory", response_model=PerformanceMemory)
async def get_memory(engine: PerformanceAIEngine = Depends(get_ai_engine)):
    """Retrieve the persistent performance learning memory."""
    return await engine.update_performance_memory()

@router.post("/analyze")
async def trigger_analysis(engine: PerformanceAIEngine = Depends(get_ai_engine)):
    """Manually trigger the AI analysis pipeline (simulated)."""
    # In a real app, this queues a background job.
    return {"status": "success", "message": "AI analysis completed. Performance Memory updated."}
