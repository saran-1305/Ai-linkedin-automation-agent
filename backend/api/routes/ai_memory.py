from fastapi import APIRouter
from typing import List, Dict
from settings.repositories.ai_memory_repository import AIMemoryRepository, ProviderStatus, MemorySourceStatus

router = APIRouter(prefix="/settings/ai-memory", tags=["AI Memory"])

memory_repo = AIMemoryRepository()

@router.get("/status", response_model=List[MemorySourceStatus])
async def get_memory_status():
    """Retrieve status for all AI knowledge bases."""
    return await memory_repo.get_memory_sources()

@router.get("/providers", response_model=List[ProviderStatus])
async def get_providers():
    """Retrieve health and usage of AI models."""
    return await memory_repo.get_providers_status()

@router.get("/health", response_model=Dict[str, str])
async def get_health():
    """Retrieve overall system health."""
    return await memory_repo.get_system_health()

@router.post("/refresh/{module}")
async def refresh_knowledge(module: str):
    """Trigger manual refresh of a specific knowledge module."""
    await memory_repo.refresh_knowledge(module)
    return {"status": "success", "message": f"Knowledge base '{module}' refresh triggered."}

@router.post("/clear-cache/{cache_type}")
async def clear_cache(cache_type: str):
    """Clear AI caches."""
    await memory_repo.clear_cache(cache_type)
    return {"status": "success", "message": f"Cache '{cache_type}' cleared."}
