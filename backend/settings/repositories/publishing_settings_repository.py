from pydantic import BaseModel
from typing import Optional

class PublishingSettings(BaseModel):
    default_platform: str = "linkedin"
    default_publish_time: str = "09:00"
    default_time_zone: str = "UTC"
    retry_attempts: int = 3
    retry_delay: int = 15
    auto_verification: bool = True
    publishing_queue_limit: int = 50
    scheduling_buffer: int = 24

# In-memory store
_PUB_STORE = PublishingSettings()

class PublishingSettingsRepository:
    async def get_settings(self) -> PublishingSettings:
        return _PUB_STORE

    async def update_settings(self, settings: PublishingSettings) -> PublishingSettings:
        global _PUB_STORE
        _PUB_STORE = settings
        return _PUB_STORE
