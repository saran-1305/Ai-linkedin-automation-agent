from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.analytics import AnalyticsRecord, AnalyticsCollectionRun, ProviderStatus
from analytics.repositories.analytics_repository import AnalyticsRepository
from analytics.services.analytics_collector import AnalyticsCollector

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Dependency injection
def get_repository():
    return AnalyticsRepository()

def get_collector(repo: AnalyticsRepository = Depends(get_repository)):
    return AnalyticsCollector(repo)

@router.get("/posts", response_model=List[AnalyticsRecord])
async def get_all_post_metrics(repo: AnalyticsRepository = Depends(get_repository)):
    """Retrieve the latest metrics for all published posts."""
    return await repo.get_latest_metrics()

@router.get("/post/{post_id}", response_model=AnalyticsRecord)
async def get_post_metrics(post_id: str, repo: AnalyticsRepository = Depends(get_repository)):
    """Retrieve detailed analytics for a specific post."""
    record = await repo.get_post_metrics(post_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analytics record not found")
    return record

@router.get("/platforms", response_model=List[ProviderStatus])
async def get_platform_status(repo: AnalyticsRepository = Depends(get_repository)):
    """Retrieve synchronization status for platforms."""
    return await repo.get_platform_status()

@router.post("/sync", response_model=AnalyticsCollectionRun)
async def trigger_analytics_sync(
    platform: str = "linkedin",
    collector: AnalyticsCollector = Depends(get_collector)
):
    """Manually trigger analytics collection for a platform."""
    return await collector.run_collection_cycle(platform)

@router.get("/history", response_model=List[AnalyticsCollectionRun])
async def get_collection_history(repo: AnalyticsRepository = Depends(get_repository)):
    """Retrieve the history of analytics collection runs."""
    return await repo.get_collection_history()
