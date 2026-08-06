import logging
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.settings import settings
from database.base import Base
# Import all models here so Alembic can see them
from models.business import BusinessProfile
from models.content import ContentImport, ImportedContent, ContentChunk
from models.analysis import DocumentAnalysis, AnalysisRun, AnalysisTopic, AnalysisKeyword, AnalysisPillar, AnalysisCTA, AnalysisAudience, AnalysisTone, AnalysisStyle
from models.brand import *
from models.competitor import *
from models.market import *
from models.execution import *
from models.strategy import *
from models.publishing import *
from models.user import User
from models.workflow import *
from models.orchestration import *
from models.analytics import *
from models.performance_intelligence import *
from models.recommendation import *
from models.workflow_run import WorkflowRun, ContentPipelineRun
from models.workflow_schedule import WorkflowSchedule
from models.system import *
config = context.config

config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL).replace('%', '%%'))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# apscheduler_jobs is created and owned by APScheduler's SQLAlchemyJobStore at
# runtime (see publishing/scheduler/core.py), not by any SQLAlchemy model in
# this app, so it will never be in target_metadata. Without this filter,
# every autogenerate/check run flags it as a table to drop.
def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and name == "apscheduler_jobs":
        return False
    return True

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata, include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()