from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from models.recommendation import Recommendation, OptimizationGoal
from analytics.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

def get_engine():
    return RecommendationEngine()

@router.get("", response_model=List[Recommendation])
async def get_recommendations(engine: RecommendationEngine = Depends(get_engine)):
    """Retrieve all active recommendations."""
    return await engine.get_active_recommendations()

@router.get("/goals", response_model=List[OptimizationGoal])
async def get_goals(engine: RecommendationEngine = Depends(get_engine)):
    """Retrieve optimization goals."""
    return await engine.get_optimization_goals()

@router.get("/summary", response_model=Dict[str, Any])
async def get_summary(engine: RecommendationEngine = Depends(get_engine)):
    """Retrieve the executive optimization summary."""
    return await engine.get_executive_summary()

@router.post("/{id}/accept")
async def accept_recommendation(id: str, engine: RecommendationEngine = Depends(get_engine)):
    """Accept a recommendation (applies to strategy planner)."""
    return await engine.update_recommendation_status(id, "accepted")

@router.post("/{id}/dismiss")
async def dismiss_recommendation(id: str, engine: RecommendationEngine = Depends(get_engine)):
    """Dismiss a recommendation."""
    return await engine.update_recommendation_status(id, "dismissed")
