from pydantic import BaseModel
from typing import Optional

class WorkspaceSettings(BaseModel):
    workspace_name: str = "Acme Corp"
    workspace_logo: Optional[str] = None
    time_zone: str = "UTC"
    language: str = "en-US"
    date_format: str = "MM/DD/YYYY"
    default_currency: str = "USD"
    default_region: str = "US"

# In-memory store for simulation
_WORKSPACE_STORE = WorkspaceSettings()

class WorkspaceRepository:
    async def get_settings(self) -> WorkspaceSettings:
        return _WORKSPACE_STORE

    async def update_settings(self, settings: WorkspaceSettings) -> WorkspaceSettings:
        global _WORKSPACE_STORE
        _WORKSPACE_STORE = settings
        return _WORKSPACE_STORE
