from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

from schemas.analytics_dashboard import (
    DashboardSummary, OverviewMetrics, PlatformMetrics, 
    EngagementTrend, TopPost, ActivityEvent
)
from analytics.repositories.analytics_repository import AnalyticsRepository

class DashboardAggregationService:
    """
    Aggregates metrics and data across platforms to provide 
    comprehensive insights for the analytics dashboard.
    """
    def __init__(self, repository: AnalyticsRepository):
        self.repository = repository

    async def get_overview_metrics(self) -> OverviewMetrics:
        """Calculate overall KPI metrics based on stored analytics records."""
        records = await self.repository.get_latest_metrics()
        
        overview = OverviewMetrics()
        overview.total_posts = len(records)
        
        for record in records:
            if record.metrics:
                overview.total_impressions += record.metrics.impressions
                overview.total_reach += record.metrics.reach
                
                engagements = record.metrics.likes + record.metrics.comments + record.metrics.shares + record.metrics.clicks
                overview.total_engagement += engagements
                
                overview.followers_gained += record.metrics.followers_gained
                overview.profile_visits += record.metrics.profile_visits
        
        if overview.total_impressions > 0:
            overview.engagement_rate = round((overview.total_engagement / overview.total_impressions) * 100, 2)
            
        success_posts = [r for r in records if r.collection_status == 'success']
        overview.publishing_success_rate = round((len(success_posts) / overview.total_posts * 100) if overview.total_posts > 0 else 0, 1)
        
        # Mocking growth percentages for demonstration
        overview.impressions_growth = 12.5
        overview.engagement_growth = 8.3
        overview.reach_growth = 15.0
        
        return overview

    async def get_engagement_trends(self, days: int = 14) -> List[EngagementTrend]:
        """Generate mocked daily trends (as we don't have historical time-series in our mock DB yet)."""
        trends = []
        base_date = datetime.utcnow() - timedelta(days=days)
        
        for i in range(days):
            current_date = base_date + timedelta(days=i)
            # Generate somewhat realistic looking increasing trend
            trends.append(EngagementTrend(
                date=current_date.strftime("%Y-%m-%d"),
                impressions=random.randint(500, 2500) + (i * 100),
                engagement=random.randint(50, 300) + (i * 15),
                reach=random.randint(400, 2000) + (i * 80)
            ))
            
        return trends

    async def get_top_performing_posts(self, limit: int = 5) -> List[TopPost]:
        """Get the highest performing posts."""
        records = await self.repository.get_latest_metrics()
        
        # Sort by engagement rate or total engagements
        sorted_records = sorted(
            records, 
            key=lambda r: r.metrics.engagement_rate if r.metrics else 0, 
            reverse=True
        )
        
        top_posts = []
        for r in sorted_records[:limit]:
            if r.metrics:
                top_posts.append(TopPost(
                    id=r.id or "",
                    platform=r.platform,
                    published_date=r.collected_at or datetime.utcnow(),
                    content_preview=f"Post ID {r.platform_post_id} snippet...", # Mock content
                    impressions=r.metrics.impressions,
                    likes=r.metrics.likes,
                    comments=r.metrics.comments,
                    shares=r.metrics.shares,
                    engagement_rate=r.metrics.engagement_rate,
                    status=r.collection_status
                ))
        return top_posts

    async def get_platform_comparison(self) -> List[PlatformMetrics]:
        """Aggregate metrics per platform."""
        records = await self.repository.get_latest_metrics()
        
        platforms = set(r.platform for r in records)
        if not platforms:
             platforms = {"linkedin", "x"} # Mock if empty
             
        result = []
        for plat in platforms:
            plat_records = [r for r in records if r.platform == plat]
            if not plat_records:
                # Mock empty platform
                result.append(PlatformMetrics(platform_name=plat))
                continue
                
            metrics = PlatformMetrics(platform_name=plat, posts_published=len(plat_records))
            
            total_eng = 0
            total_imp = 0
            total_reach = 0
            
            for r in plat_records:
                if r.metrics:
                    total_eng += (r.metrics.likes + r.metrics.comments + r.metrics.shares + r.metrics.clicks)
                    total_imp += r.metrics.impressions
                    total_reach += r.metrics.reach
                    
            metrics.average_engagement = round(total_eng / len(plat_records), 1)
            metrics.average_impressions = int(total_imp / len(plat_records))
            metrics.average_reach = int(total_reach / len(plat_records))
            metrics.publishing_success_rate = 95.0 # Mocked
            metrics.growth = random.uniform(-5.0, 15.0) # Mocked
            
            result.append(metrics)
            
        return result

    async def get_recent_activity(self, limit: int = 10) -> List[ActivityEvent]:
        """Fetch recent publishing and analytics activity."""
        # Mocking activity events
        activities = []
        now = datetime.utcnow()
        platforms = ["linkedin", "x", "linkedin", "linkedin"]
        
        for i in range(limit):
            activities.append(ActivityEvent(
                id=f"act_{i}",
                platform=platforms[i % len(platforms)],
                event_type=random.choice(["published", "verified", "publishing", "scheduled"]),
                timestamp=now - timedelta(hours=i*2, minutes=random.randint(5, 45)),
                status=random.choice(["success", "success", "success", "failed", "in_progress"]),
                duration_seconds=random.uniform(1.5, 12.0)
            ))
            
        return activities

    async def get_complete_dashboard(self) -> DashboardSummary:
        """Aggregates all components into a single response payload."""
        return DashboardSummary(
            overview=await self.get_overview_metrics(),
            trends=await self.get_engagement_trends(),
            top_posts=await self.get_top_performing_posts(),
            platform_performance=await self.get_platform_comparison(),
            recent_activity=await self.get_recent_activity()
        )
