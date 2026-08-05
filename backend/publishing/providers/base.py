from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
from pydantic import BaseModel
from models.content import PlatformVariation
from models.publishing import PlatformAccount
import httpx
import time
import json
import asyncio

class PublishResult(BaseModel):
    success: bool
    platform_post_id: str = None
    error_message: str = None
    api_response: Dict[str, Any] = {}
    error_classification: str = None

class ProviderException(Exception):
    def __init__(self, message: str, classification: str, retry_after: int = None):
        self.message = message
        self.classification = classification
        self.retry_after = retry_after
        super().__init__(self.message)

class BaseProvider(ABC):
    def __init__(self, account: PlatformAccount):
        self.account = account
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(timeout=self.timeout)

    def _classify_error(self, status_code: int) -> str:
        if status_code == 401:
            return "Authentication Error"
        elif status_code == 403:
            return "Permission Error"
        elif status_code == 429:
            return "Rate Limit Error"
        elif 400 <= status_code < 500:
            return "Validation Error"
        elif 500 <= status_code < 600:
            return "Platform Service Error"
        return "Unknown Error"

    async def _make_request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Shared HTTP client wrapper with error handling and rate limits."""
        async with self._get_client() as client:
            try:
                response = await client.request(method, url, **kwargs)
                
                if response.status_code >= 400:
                    classification = self._classify_error(response.status_code)
                    retry_after = None
                    
                    if response.status_code == 429:
                        # Attempt to parse Retry-After header
                        retry_after_header = response.headers.get("Retry-After")
                        if retry_after_header:
                            try:
                                retry_after = int(retry_after_header)
                            except ValueError:
                                pass
                                
                    error_msg = f"HTTP {response.status_code}: {response.text}"
                    raise ProviderException(error_msg, classification, retry_after)
                    
                return response
            except httpx.RequestError as e:
                raise ProviderException(f"Network error: {str(e)}", "Network Error")

    @abstractmethod
    async def authenticate(self) -> bool:
        """Verify authentication or refresh tokens"""
        pass
        
    @abstractmethod
    async def validate_platform_requirements(self, content_text: str, media: list = None) -> Tuple[bool, str]:
        """Validate content against platform limits (e.g. character count)"""
        pass

    @abstractmethod
    async def publish_content(self, content_text: str, media: list = None) -> Dict[str, Any]:
        """
        Publish content to the platform.
        Must return a dict containing at least 'post_id' and 'url'.
        """
        pass
        
    @abstractmethod
    async def update_scheduled_post(self, post_id: str, content_text: str) -> bool:
        """Update a post that is scheduled natively on the platform"""
        pass
        
    @abstractmethod
    async def delete_published_post(self, post_id: str) -> bool:
        """Delete a published post"""
        pass
        
    @abstractmethod
    async def fetch_publishing_status(self, post_id: str) -> Dict[str, Any]:
        """Get the live status of a post from the platform"""
        pass

class PublishingProvider(BaseProvider):
    """
    Abstract base class for all platform publishing providers.
    """
        
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Name of the platform (e.g., 'LinkedIn', 'X')"""
        pass
        
    @abstractmethod
    async def validate_connection(self) -> bool:
        """Check if the account credentials are valid."""
        pass
        
    @abstractmethod
    async def publish(self, variation: PlatformVariation) -> PublishResult:
        """Publish the given variation to the platform."""
        pass
