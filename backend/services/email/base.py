from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel


class EmailSendResult(BaseModel):
    success: bool
    provider_message_id: Optional[str] = None
    error_message: Optional[str] = None


class EmailProvider(ABC):
    """Abstract interface for outbound transactional email. Swappable so the
    concrete provider (Resend, SES, SMTP, ...) can change without touching
    any code that sends email."""

    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        reply_to: Optional[str] = None,
    ) -> EmailSendResult:
        """Send a single email. Must not raise for provider-side failures -
        report them via EmailSendResult.success/error_message instead, so
        callers (schedulers, request handlers) don't need provider-specific
        exception handling."""
        raise NotImplementedError
