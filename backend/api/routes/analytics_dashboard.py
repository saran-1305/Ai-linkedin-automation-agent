from fastapi import APIRouter, Depends
from schemas.analytics_dashboard import (
    DashboardSummary, OverviewMetrics, PlatformMetrics, 
    EngagementTrend, TopPost, ActivityEvent
)
from analytics.repositories.analytics_repository import AnalyticsRepository
from analytics.services.dashboard_service import DashboardAggregationService
from typing import List

router = APIRouter(prefix="/analytics/dashboard", tags=["Analytics Dashboard"])

def get_repository():
    return AnalyticsRepository()

def get_dashboard_service(repo: AnalyticsRepository = Depends(get_repository)):
    return DashboardAggregationService(repo)

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve complete aggregated dashboard metrics."""
    return await service.get_complete_dashboard()

@router.get("/overview", response_model=OverviewMetrics)
async def get_overview(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve KPI cards overview."""
    return await service.get_overview_metrics()

@router.get("/trends", response_model=List[EngagementTrend])
async def get_trends(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve engagement trends for charting."""
    return await service.get_engagement_trends()

@router.get("/posts/top", response_model=List[TopPost])
async def get_top_posts(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve top performing posts."""
    return await service.get_top_performing_posts()

@router.get("/platforms", response_model=List[PlatformMetrics])
async def get_platforms(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve platform performance comparison."""
    return await service.get_platform_comparison()

@router.get("/activity", response_model=List[ActivityEvent])
async def get_activity(service: DashboardAggregationService = Depends(get_dashboard_service)):
    """Retrieve recent publishing activity."""
    return await service.get_recent_activity()
