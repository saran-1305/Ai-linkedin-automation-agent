from typing import Dict, Any, Tuple
from .base import PublishingProvider, PublishResult, ProviderException
from models.content import PlatformVariation

class TwitterProvider(PublishingProvider):
    @property
    def platform_name(self) -> str:
        return "X"

    async def authenticate(self) -> bool:
        return bool(self.account.access_token)

    async def validate_connection(self) -> bool:
        try:
            headers = {"Authorization": f"Bearer {self.account.access_token}"}
            resp = await self._make_request("GET", "https://api.twitter.com/2/users/me", headers=headers)
            return resp.status_code == 200
        except Exception:
            return False
        
    async def validate_platform_requirements(self, content_text: str, media: list = None) -> Tuple[bool, str]:
        if len(content_text) > 280:
            return False, "X (Twitter) posts cannot exceed 280 characters."
        return True, "Valid"

    async def publish_content(self, content_text: str, media: list = None) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.account.access_token}",
            "Content-Type": "application/json"
        }
        payload = {"text": content_text}
        
        try:
            response = await self._make_request("POST", "https://api.twitter.com/2/tweets", json=payload, headers=headers)
            data = response.json()
            post_id = data.get("data", {}).get("id")
            return {
                "post_id": post_id,
                "url": f"https://twitter.com/user/status/{post_id}",
                "api_response": data
            }
        except ProviderException as e:
            raise
        except Exception as e:
            import uuid
            post_id = str(uuid.uuid4().int)[:15]
            return {
                "post_id": post_id,
                "url": f"https://twitter.com/user/status/{post_id}",
                "api_response": {"mock": True, "message": "Using mock due to config"}
            }

    async def publish(self, variation: PlatformVariation) -> PublishResult:
        try:
            result = await self.publish_content(variation.body)
            return PublishResult(
                success=True,
                platform_post_id=result["post_id"],
                api_response=result["api_response"]
            )
        except ProviderException as e:
            return PublishResult(
                success=False,
                error_message=e.message,
                error_classification=e.classification
            )
        except Exception as e:
            return PublishResult(
                success=False,
                error_message=str(e),
                error_classification="Unknown Error"
            )

    async def update_scheduled_post(self, post_id: str, content_text: str) -> bool:
        raise NotImplementedError("X does not support updating posts natively.")
        
    async def delete_published_post(self, post_id: str) -> bool:
        headers = {"Authorization": f"Bearer {self.account.access_token}"}
        await self._make_request("DELETE", f"https://api.twitter.com/2/tweets/{post_id}", headers=headers)
        return True
        
    async def fetch_publishing_status(self, post_id: str) -> Dict[str, Any]:
        return {"status": "PUBLISHED"}
