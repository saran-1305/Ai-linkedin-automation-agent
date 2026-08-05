from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class OverviewMetrics(BaseModel):
    total_posts: int = 0
    total_impressions: int = 0
    total_reach: int = 0
    total_engagement: int = 0
    engagement_rate: float = 0.0
    followers_gained: int = 0
    profile_visits: int = 0
    publishing_success_rate: float = 0.0
    
    # Comparisons vs previous period
    impressions_growth: float = 0.0
    engagement_growth: float = 0.0
    reach_growth: float = 0.0

class PlatformMetrics(BaseModel):
    platform_name: str
    posts_published: int = 0
    average_engagement: float = 0.0
    average_reach: int = 0
    average_impressions: int = 0
    publishing_success_rate: float = 0.0
    growth: float = 0.0

class EngagementTrend(BaseModel):
    date: str
    impressions: int = 0
    engagement: int = 0
    reach: int = 0

class TopPost(BaseModel):
    id: str
    platform: str
    published_date: datetime
    content_preview: str
    impressions: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_rate: float = 0.0
    status: str

class ActivityEvent(BaseModel):
    id: str
    platform: str
    event_type: str # scheduled, publishing, published, verified
    timestamp: datetime
    status: str # success, in_progress, failed
    duration_seconds: float = 0.0
    errors: Optional[str] = None

class DashboardSummary(BaseModel):
    overview: OverviewMetrics
    trends: List[EngagementTrend]
    top_posts: List[TopPost]
    platform_performance: List[PlatformMetrics]
    recent_activity: List[ActivityEvent]
