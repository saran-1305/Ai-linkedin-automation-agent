from functools import lru_cache
from config.settings import settings
from .base import EmailProvider
from .resend_provider import ResendProvider


@lru_cache
def get_email_provider() -> EmailProvider:
    return ResendProvider(
        api_key=settings.RESEND_API_KEY or "",
        from_address=settings.EMAIL_FROM_ADDRESS,
    )
