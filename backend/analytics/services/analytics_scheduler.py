import asyncio
import logging
from analytics.services.analytics_collector import AnalyticsCollector

logger = logging.getLogger(__name__)

class AnalyticsScheduler:
    """
    Background scheduler to periodically trigger analytics collection.
    """
    def __init__(self, collector: AnalyticsCollector, interval_seconds: int = 1800):
        self.collector = collector
        self.interval_seconds = interval_seconds
        self._running = False
        self._task = None

    async def start(self):
        """Starts the background scheduler task."""
        if self._running:
            return
            
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"Analytics Scheduler started. Interval: {self.interval_seconds}s")

    async def stop(self):
        """Stops the background scheduler task."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Analytics Scheduler stopped.")

    async def _run_loop(self):
        while self._running:
            try:
                # We can iterate through configured platforms here
                # For now, let's just trigger LinkedIn
                logger.info("Triggering scheduled analytics collection for LinkedIn...")
                await self.collector.run_collection_cycle("linkedin")
                
                # Sleep until next cycle
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {str(e)}")
                # Sleep a bit on error to avoid tight error loops
                await asyncio.sleep(60)
