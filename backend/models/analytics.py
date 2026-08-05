from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime

class PostMetrics(BaseModel):
    impressions: int = 0
    reach: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reposts: int = 0
    saves: int = 0
    clicks: int = 0
    profile_visits: int = 0
    followers_gained: int = 0
    engagement_rate: float = 0.0

class AnalyticsRecord(BaseModel):
    id: Optional[str] = None
    workspace_id: str
    publishing_job_id: str
    generated_content_id: Optional[str] = None
    platform: str
    platform_post_id: str
    collected_at: Optional[datetime] = None
    collection_status: str = "pending" # pending, in_progress, success, failed
    provider_version: str = "1.0"
    metrics: Optional[PostMetrics] = None
    
class AnalyticsCollectionRun(BaseModel):
    run_id: Optional[str] = None
    provider: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration: float = 0.0 # in seconds
    status: str = "in_progress" # in_progress, completed, failed
    collected_posts: int = 0
    failed_posts: int = 0
    errors: List[str] = Field(default_factory=list)

class ProviderStatus(BaseModel):
    provider_name: str
    last_sync: Optional[datetime] = None
    sync_status: str = "idle" # idle, syncing, error
    next_sync: Optional[datetime] = None
