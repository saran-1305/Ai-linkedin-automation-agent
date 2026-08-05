import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from config.settings import settings
from database.session import SessionLocal

logger = logging.getLogger(__name__)

db_url = str(settings.DATABASE_URL)

jobstores = {
    'default': SQLAlchemyJobStore(url=db_url)
}
executors = {
    'default': ThreadPoolExecutor(20)
}
job_defaults = {
    'coalesce': False,
    'max_instances': 3
}

scheduler = AsyncIOScheduler(jobstores=jobstores, executors=executors, job_defaults=job_defaults)

def execute_publish_job(job_id: int):
    """
    This is the actual function that APScheduler will run.
    We import Orchestrator here to avoid circular imports.
    """
    from publishing.orchestrator import PublishingOrchestrator
    
    logger.info(f"Executing scheduled publish job {job_id}")
    db = SessionLocal()
    try:
        orchestrator = PublishingOrchestrator(db)
        orchestrator.publish_now(job_id)
    except Exception as e:
        logger.error(f"Failed to execute scheduled job {job_id}: {e}")
    finally:
        db.close()

def schedule_job(job_id: int, run_date):
    """
    Add a job to APScheduler
    """
    job_aps = scheduler.add_job(
        execute_publish_job,
        'date',
        run_date=run_date,
        args=[job_id],
        id=f'publish_job_{job_id}',
        replace_existing=True
    )
    return job_aps.id

def cancel_scheduled_job(job_id: int):
    """
    Cancel an existing APScheduler job
    """
    job_id_str = f'publish_job_{job_id}'
    if scheduler.get_job(job_id_str):
        scheduler.remove_job(job_id_str)

def get_scheduler():
    return scheduler
