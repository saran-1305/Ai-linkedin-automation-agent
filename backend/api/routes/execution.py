from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from execution.service import ExecutionService

router = APIRouter(prefix="/execution", tags=["Weekly Execution Planner"])

@router.get("/current")
def get_current_plan(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan:
        return None
    
    return {
        "id": plan.id,
        "week_number": plan.week_number,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "status": plan.status,
        "confidence": plan.confidence,
        "version": plan.version,
        "content_mix": plan.content_mix
    }

@router.get("/objective")
def get_weekly_objective(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.objective if plan else None

@router.get("/themes")
def get_weekly_themes(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.themes if plan else []

@router.get("/platforms")
def get_platform_plans(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.platform_plans if plan else []

@router.get("/audiences")
def get_audience_allocation(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.audience_allocations if plan else []

@router.get("/kpis")
def get_weekly_kpis(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.metrics if plan else None

# ========================
# PHASE 2 ENDPOINTS
# ========================

@router.get("/daily")
def get_daily_plans(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.daily_plans if plan else []

@router.get("/content-slots")
def get_content_slots(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.content_slots if plan else []

@router.get("/campaigns")
def get_campaign_schedules(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.campaign_schedules if plan else []

@router.get("/funnel")
def get_funnel_plans(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.funnel_plans if plan else []

@router.get("/cta")
def get_cta_plans(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.cta_plans if plan else []

@router.get("/priorities")
def get_priorities(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.priorities if plan else []

@router.get("/conflicts")
def get_conflicts(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    return plan.conflicts if plan else []

# ========================
# PHASE 3 ENDPOINTS (Optimization)
# ========================
from execution.optimization_service import OptimizationService

@router.get("/health")
def get_execution_health(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan: return None
    # execution_health is a direct child table? Wait, in models we made it a single row per plan, so query it
    from models.execution import ExecutionHealth
    return db.query(ExecutionHealth).filter(ExecutionHealth.weekly_plan_id == plan.id).first()

@router.get("/optimizations")
def get_optimizations(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan: return []
    from models.execution import ExecutionOptimization
    return db.query(ExecutionOptimization).filter(ExecutionOptimization.weekly_plan_id == plan.id).all()

@router.get("/suggestions")
def get_suggestions(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan: return []
    from models.execution import ExecutionSuggestion
    return db.query(ExecutionSuggestion).filter(ExecutionSuggestion.weekly_plan_id == plan.id).all()

@router.get("/alerts")
def get_alerts(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan: return []
    from models.execution import ExecutionAlert
    return db.query(ExecutionAlert).filter(ExecutionAlert.weekly_plan_id == plan.id).all()

@router.get("/trend-injections")
def get_trend_injections(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    plan = service.get_current_plan(business_id)
    if not plan: return []
    from models.execution import TrendInjection
    return db.query(TrendInjection).filter(TrendInjection.weekly_plan_id == plan.id).all()

@router.post("/optimize")
def trigger_optimization(business_id: int = 1, db: Session = Depends(get_db)):
    opt_service = OptimizationService(db)
    try:
        new_plan = opt_service.generate_optimizations(business_id)
        return {"status": "success", "message": "Plan optimized and version incremented.", "plan_id": new_plan.id, "version": new_plan.version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
def generate_weekly_plan(business_id: int = 1, db: Session = Depends(get_db)):
    service = ExecutionService(db)
    try:
        new_plan = service.generate_weekly_plan(business_id)
        return {"status": "success", "message": "Weekly plan generated", "plan_id": new_plan.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
