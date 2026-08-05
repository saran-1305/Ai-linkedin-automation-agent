from typing import List, Optional
from models.analytics import AnalyticsRecord, AnalyticsCollectionRun, ProviderStatus

class AnalyticsRepository:
    """
    Repository for storing and retrieving analytics data.
    This implementation mocks a database connection.
    In a real system, this would interact with MongoDB, Postgres, etc.
    """
    
    def __init__(self):
        # In-memory mock storage
        self.metrics_db: dict[str, AnalyticsRecord] = {}
        self.runs_db: dict[str, AnalyticsCollectionRun] = {}
        self.status_db: dict[str, ProviderStatus] = {}

    async def save_metrics(self, record: AnalyticsRecord) -> AnalyticsRecord:
        """Saves a new analytics record."""
        if not record.id:
            record.id = f"ar_{len(self.metrics_db) + 1}"
        self.metrics_db[record.id] = record
        return record

    async def update_metrics(self, record: AnalyticsRecord) -> AnalyticsRecord:
        """Updates an existing analytics record."""
        self.metrics_db[record.id] = record
        return record

    async def get_post_metrics(self, post_id: str) -> Optional[AnalyticsRecord]:
        """Retrieves analytics for a specific post."""
        for record in self.metrics_db.values():
            if record.platform_post_id == post_id:
                return record
        return None

    async def get_workspace_metrics(self, workspace_id: str) -> List[AnalyticsRecord]:
        """Retrieves all analytics records for a workspace."""
        return [r for r in self.metrics_db.values() if r.workspace_id == workspace_id]

    async def get_platform_metrics(self, platform: str) -> List[AnalyticsRecord]:
        """Retrieves all analytics records for a platform."""
        return [r for r in self.metrics_db.values() if r.platform == platform]

    async def get_latest_metrics(self) -> List[AnalyticsRecord]:
        """Retrieves all analytics records."""
        return list(self.metrics_db.values())

    async def get_posts_for_sync(self, platform: str) -> List[AnalyticsRecord]:
        """Retrieves posts that need syncing for a platform."""
        # For mock purposes, return all for the platform
        return [r for r in self.metrics_db.values() if r.platform == platform]

    async def save_collection_run(self, run: AnalyticsCollectionRun) -> AnalyticsCollectionRun:
        """Saves a background collection run record."""
        if not run.run_id:
            run.run_id = f"run_{len(self.runs_db) + 1}"
        self.runs_db[run.run_id] = run
        return run

    async def get_collection_history(self) -> List[AnalyticsCollectionRun]:
        """Retrieves the history of collection runs."""
        return list(self.runs_db.values())

    async def update_provider_status(self, status: ProviderStatus) -> ProviderStatus:
        """Updates the status of an analytics provider."""
        self.status_db[status.provider_name] = status
        return status
        
    async def get_platform_status(self) -> List[ProviderStatus]:
        """Retrieves the status of all providers."""
        return list(self.status_db.values())
