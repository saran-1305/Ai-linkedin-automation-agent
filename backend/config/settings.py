from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LinkedIn Growth Agent"
    API_V1_STR: str = "/api"
    
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:5173"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    DATABASE_URL: PostgresDsn
    
    # OAuth Configurations
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None
    OAUTH_REDIRECT_URI: str = "http://localhost:5173/publishing/callback"

    # Email (transactional, e.g. publishing approval requests/reminders)
    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: str = "LinkedIn Growth Agent <onboarding@resend.dev>"
    FRONTEND_BASE_URL: str = "http://localhost:5173"

    # Auth
    JWT_SECRET_KEY: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
