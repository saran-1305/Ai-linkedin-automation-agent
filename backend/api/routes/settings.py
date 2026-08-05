from fastapi import APIRouter
from settings.repositories.workspace_repository import WorkspaceRepository, WorkspaceSettings
from settings.repositories.ai_settings_repository import AISettingsRepository, AISettings
from settings.repositories.publishing_settings_repository import PublishingSettingsRepository, PublishingSettings

router = APIRouter(prefix="/settings", tags=["Settings"])

workspace_repo = WorkspaceRepository()
ai_repo = AISettingsRepository()
publishing_repo = PublishingSettingsRepository()

@router.get("/workspace", response_model=WorkspaceSettings)
async def get_workspace():
    return await workspace_repo.get_settings()

@router.put("/workspace", response_model=WorkspaceSettings)
async def update_workspace(settings: WorkspaceSettings):
    return await workspace_repo.update_settings(settings)

@router.get("/ai", response_model=AISettings)
async def get_ai():
    return await ai_repo.get_settings()

@router.put("/ai", response_model=AISettings)
async def update_ai(settings: AISettings):
    return await ai_repo.update_settings(settings)

@router.get("/publishing", response_model=PublishingSettings)
async def get_publishing():
    return await publishing_repo.get_settings()

@router.put("/publishing", response_model=PublishingSettings)
async def update_publishing(settings: PublishingSettings):
    return await publishing_repo.update_settings(settings)
