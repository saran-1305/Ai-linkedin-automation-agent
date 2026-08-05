import logging
from typing import Optional
import httpx
from .base import EmailProvider, EmailSendResult

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class ResendProvider(EmailProvider):
    def __init__(self, api_key: str, from_address: str):
        self.api_key = api_key
        self.from_address = from_address

    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        reply_to: Optional[str] = None,
    ) -> EmailSendResult:
        if not self.api_key:
            logger.warning(f"RESEND_API_KEY not configured; skipping send to {to} ({subject!r}).")
            return EmailSendResult(success=False, error_message="Email provider not configured (missing RESEND_API_KEY).")

        payload = {
            "from": self.from_address,
            "to": [to],
            "subject": subject,
            "html": html_body,
        }
        if text_body:
            payload["text"] = text_body
        if reply_to:
            payload["reply_to"] = reply_to

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
                response = await client.post(RESEND_API_URL, json=payload, headers=headers)

            if response.status_code >= 400:
                logger.error(f"Resend send failed ({response.status_code}) to {to}: {response.text}")
                return EmailSendResult(success=False, error_message=f"HTTP {response.status_code}: {response.text}")

            data = response.json()
            return EmailSendResult(success=True, provider_message_id=data.get("id"))
        except httpx.RequestError as e:
            logger.error(f"Resend send network error to {to}: {e}")
            return EmailSendResult(success=False, error_message=f"Network error: {e}")
