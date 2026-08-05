from typing import List, Optional
from datetime import datetime
from models.analytics import AnalyticsRecord, AnalyticsCollectionRun
from analytics.providers.provider_factory import AnalyticsProviderFactory
from analytics.services.normalizer import AnalyticsNormalizer
import logging

logger = logging.getLogger(__name__)

class AnalyticsCollector:
    """
    Orchestrates the process of collecting analytics data for posts.
    """
    def __init__(self, repository):
        # The repository instance would be injected here
        self.repository = repository

    async def collect_metrics_for_post(self, post_record: AnalyticsRecord) -> bool:
        """
        Collects metrics for a single post.
        """
        try:
            # Update status
            post_record.collection_status = "in_progress"
            await self.repository.update_metrics(post_record)

            # Get provider
            provider = AnalyticsProviderFactory.get_provider(post_record.platform)
            
            # Fetch raw metrics
            raw_metrics = await provider.collect_post_metrics(post_record.platform_post_id)
            
            # Normalize
            normalized_metrics = AnalyticsNormalizer.normalize(post_record.platform, raw_metrics)
            
            # Update record
            post_record.metrics = normalized_metrics
            post_record.collected_at = datetime.utcnow()
            post_record.collection_status = "success"
            
            await self.repository.update_metrics(post_record)
            return True
            
        except Exception as e:
            logger.error(f"Failed to collect metrics for post {post_record.id}: {str(e)}")
            post_record.collection_status = "failed"
            await self.repository.update_metrics(post_record)
            return False

    async def run_collection_cycle(self, platform: str) -> AnalyticsCollectionRun:
        """
        Runs a full collection cycle for all pending or old posts for a specific platform.
        """
        run = AnalyticsCollectionRun(
            provider=platform,
            started_at=datetime.utcnow()
        )
        
        try:
            # Fetch posts that need sync
            posts_to_sync = await self.repository.get_posts_for_sync(platform)
            
            for post in posts_to_sync:
                success = await self.collect_metrics_for_post(post)
                if success:
                    run.collected_posts += 1
                else:
                    run.failed_posts += 1
                    
            run.status = "completed"
        except Exception as e:
            logger.error(f"Collection cycle failed for {platform}: {str(e)}")
            run.status = "failed"
            run.errors.append(str(e))
            
        run.completed_at = datetime.utcnow()
        run.duration = (run.completed_at - run.started_at).total_seconds()
        
        # Save run history
        await self.repository.save_collection_run(run)
        return run
