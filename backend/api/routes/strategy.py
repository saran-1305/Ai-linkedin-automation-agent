from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database.session import get_db
from strategy.strategy_service import StrategyService
from models.strategy import StrategyPlan

router = APIRouter(prefix="/strategy", tags=["strategy"])

@router.get("/current")
def get_current_strategy(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No active strategy found")
    return plan

@router.get("/history")
def get_strategy_history(business_id: int = 1, db: Session = Depends(get_db)):
    plans = db.query(StrategyPlan).filter(StrategyPlan.business_id == business_id).order_by(StrategyPlan.version.desc()).all()
    return [{"version": p.version, "confidence": p.confidence, "created_at": p.created_at} for p in plans]

@router.get("/pillars")
def get_strategy_pillars(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    if not plan: return []
    return plan.pillars

@router.get("/audiences")
def get_strategy_audiences(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    if not plan: return []
    return plan.audience_segments

@router.get("/messaging")
def get_strategy_messaging(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    if not plan: return {}
    return plan.messaging

@router.get("/positioning")
def get_strategy_positioning(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.positioning if plan else None

@router.get("/opportunities")
def get_strategy_opportunities(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return {
        "gaps": plan.competitor_gaps if plan else [],
        "trends": plan.trend_opportunities if plan else [],
        "general": plan.opportunities if plan else []
    }

@router.get("/recommendations")
def get_strategy_recommendations(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.recommendations if plan else []

@router.get("/campaigns")
def get_strategy_campaigns(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.campaigns if plan else []

@router.get("/weekly")
def get_strategy_weekly(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.weekly_roadmaps if plan else []

@router.get("/monthly")
def get_strategy_monthly(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.monthly_roadmaps if plan else []

@router.get("/risks")
def get_strategy_risks(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.risks if plan else []

@router.get("/confidence")
def get_strategy_confidence(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.confidence_breakdown if plan else None

@router.get("/metrics")
def get_strategy_metrics(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    plan = service.get_current_strategy(business_id)
    return plan.metrics if plan else []

@router.post("/generate")
def generate_strategy(business_id: int = 1, db: Session = Depends(get_db)):
    service = StrategyService(db)
    try:
        new_plan = service.generate_strategy(business_id)
        return {"status": "success", "plan_id": new_plan.id}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
@router.post("/regenerate")
def regenerate_strategy(business_id: int = 1, db: Session = Depends(get_db)):
    # Alias to generate for now
    return generate_strategy(business_id, db)
