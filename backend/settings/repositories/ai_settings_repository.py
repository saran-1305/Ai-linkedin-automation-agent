from pydantic import BaseModel
from typing import Optional

class AISettings(BaseModel):
    ai_provider: str = "openai"
    provider_api_key: str = "sk-mock-key-12345"
    model_selection: str = "gpt-4-turbo"
    temperature: float = 0.7
    maximum_tokens: int = 2048
    reasoning_level: str = "high"
    default_content_style: str = "professional"
    brand_voice_preference: str = "authoritative"
    writing_tone: str = "informative"
    language: str = "en-US"

# In-memory store
_AI_STORE = AISettings()

class AISettingsRepository:
    async def get_settings(self) -> AISettings:
        return _AI_STORE

    async def update_settings(self, settings: AISettings) -> AISettings:
        global _AI_STORE
        _AI_STORE = settings
        return _AI_STORE
