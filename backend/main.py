import logging
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=False)

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from api.dependencies import get_current_user_id
from api.routes import business, content, content_imports, analysis, brand, competitors, trends, strategy, execution, publishing, workflow, analytics, analytics_dashboard, performance_ai, recommendations, settings as app_settings, ai_memory, orchestration, approvals, auth
from contextlib import asynccontextmanager
from publishing.scheduler.core import scheduler as publishing_scheduler
from analytics.services.analytics_scheduler import AnalyticsScheduler
from analytics.services.analytics_collector import AnalyticsCollector
from analytics.repositories.analytics_repository import AnalyticsRepository
from publishing.approval_reminder_scheduler import approval_reminder_scheduler

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start APScheduler instances
    logger.info("Starting up backend application...")
    publishing_scheduler.start()
    
    # Initialize and start analytics scheduler
    repo = AnalyticsRepository()
    collector = AnalyticsCollector(repo)
    analytics_scheduler = AnalyticsScheduler(collector)
    await analytics_scheduler.start()

    await approval_reminder_scheduler.start()

    yield

    # Shutdown: Clean up background tasks
    logger.info("Shutting down backend application...")
    publishing_scheduler.shutdown()
    await analytics_scheduler.stop()
    await approval_reminder_scheduler.stop()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="LinkedIn Growth Agent API",
        lifespan=lifespan
    )

    # Set all CORS enabled origins
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Public routers - no login required.
    # - auth: login/register have to be reachable before a token exists.
    # - approvals: reviewers reach these via emailed magic links and don't have
    #   app accounts at all; the token itself is the credential. The one
    #   sensitive endpoint in this router (requesting an approval) is protected
    #   individually in api/routes/approvals.py instead of at the router level.
    app.include_router(auth.router, prefix="/api")
    app.include_router(approvals.router, prefix="/api")

    # Everything else requires a logged-in user.
    protected = [Depends(get_current_user_id)]
    app.include_router(business.router, prefix="/api", dependencies=protected)
    app.include_router(content.router, prefix="/api", dependencies=protected)
    app.include_router(content_imports.router, prefix="/api", dependencies=protected)
    app.include_router(analysis.router, prefix="/api", dependencies=protected)
    app.include_router(brand.router, prefix="/api", dependencies=protected)
    app.include_router(competitors.router, prefix="/api", dependencies=protected)
    app.include_router(trends.router, prefix="/api", dependencies=protected)
    app.include_router(strategy.router, prefix="/api", dependencies=protected)
    app.include_router(execution.router, prefix="/api", dependencies=protected)
    app.include_router(publishing.router, prefix="/api", dependencies=protected)
    app.include_router(workflow.router, prefix="/api", dependencies=protected)
    app.include_router(analytics.router, prefix="/api", dependencies=protected)
    app.include_router(analytics_dashboard.router, prefix="/api", dependencies=protected)
    app.include_router(performance_ai.router, prefix="/api", dependencies=protected)
    app.include_router(recommendations.router, prefix="/api", dependencies=protected)
    app.include_router(app_settings.router, prefix="/api", dependencies=protected)
    app.include_router(ai_memory.router, prefix="/api", dependencies=protected)
    app.include_router(orchestration.router, prefix="/api", dependencies=protected)

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok", "message": "Service is healthy"}

    @app.get("/debug/cors")
    async def debug_cors():
        return {"origins": [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]}

    # Catch-all: silently reject unknown routes (e.g. from browser extensions probing localhost)
    from fastapi import Request
    from fastapi.responses import JSONResponse

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def catch_all(request: Request, full_path: str):
        # Only log if it's actually one of our /api/ paths that's truly missing
        if full_path.startswith("api/"):
            logger.warning(f"Unknown API route accessed: /{full_path}")
        # Otherwise silently ignore (browser extensions, other apps probing the port)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    return app

app = create_app()

# Silence noisy 404 access log spam from uvicorn for external probes
class _SuppressExternalProbes(logging.Filter):
    _KNOWN_EXTERNAL_PREFIXES = (
        "/api/arc/", "/api/community/", "/api/store/",
    )
    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        for prefix in self._KNOWN_EXTERNAL_PREFIXES:
            if prefix in msg and "404" in msg:
                return False  # suppress
        return True

logging.getLogger("uvicorn.access").addFilter(_SuppressExternalProbes())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
    
    
    
    
    
    
