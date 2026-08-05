from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta

class ProviderStatus(BaseModel):
    name: str
    connected: bool
    current_model: str
    response_time: str
    requests_today: int
    success_rate: str
    last_request: str
    token_usage: int

class MemorySourceStatus(BaseModel):
    name: str
    status: str # Healthy, Warning, Critical
    last_updated: str
    version: str
    confidence_score: float
    total_records: int
    last_analysis: str

class AIMemoryRepository:
    async def get_system_health(self) -> Dict[str, str]:
        return {
            "overall_health": "Healthy",
            "provider_availability": "100%",
            "background_jobs": "Idle",
            "knowledge_sync": "Synced",
            "scheduler_status": "Running",
            "memory_usage": "45%",
            "queue_status": "Empty"
        }

    async def get_providers_status(self) -> List[ProviderStatus]:
        return [
            ProviderStatus(
                name="OpenAI",
                connected=True,
                current_model="gpt-4-turbo",
                response_time="1.2s",
                requests_today=145,
                success_rate="99.8%",
                last_request=(datetime.utcnow() - timedelta(minutes=5)).isoformat() + "Z",
                token_usage=245000
            ),
            ProviderStatus(
                name="Anthropic",
                connected=False,
                current_model="claude-3-opus",
                response_time="--",
                requests_today=0,
                success_rate="--",
                last_request="--",
                token_usage=0
            )
        ]

    async def get_memory_sources(self) -> List[MemorySourceStatus]:
        now = datetime.utcnow()
        return [
            MemorySourceStatus(
                name="Brand Memory",
                status="Healthy",
                last_updated=(now - timedelta(hours=2)).isoformat() + "Z",
                version="v1.4",
                confidence_score=0.92,
                total_records=14,
                last_analysis=(now - timedelta(hours=2)).isoformat() + "Z"
            ),
            MemorySourceStatus(
                name="Performance Memory",
                status="Healthy",
                last_updated=(now - timedelta(minutes=15)).isoformat() + "Z",
                version="v2.1",
                confidence_score=0.89,
                total_records=245,
                last_analysis=(now - timedelta(minutes=15)).isoformat() + "Z"
            )
        ]

    async def clear_cache(self, cache_type: str) -> bool:
        """Simulate clearing a cache."""
        return True

    async def refresh_knowledge(self, module: str) -> bool:
        """Simulate rebuilding knowledge for a specific module."""
        return True
