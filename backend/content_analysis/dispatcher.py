import logging
from sqlalchemy.orm import Session
from models.content import ImportedContent, AnalysisStatus
from database.session import SessionLocal
from content_analysis.orchestrator import AIAnalysisOrchestrator

logger = logging.getLogger(__name__)

class AnalysisDispatcher:
    """
    Decouples the Processing Pipeline from the AI Orchestrator.
    Currently uses BackgroundTasks, but can easily be swapped for Celery/Redis.
    """
    @staticmethod
    def dispatch(imported_content_id: int):
        logger.info(f"Dispatching document {imported_content_id} for analysis")
        
        db: Session = SessionLocal()
        try:
            content_record = db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
            if content_record:
                content_record.analysis_status = AnalysisStatus.QUEUED_FOR_ANALYSIS
                db.commit()
                
            content_record.analysis_status = AnalysisStatus.ANALYZING
            db.commit()
            
            orchestrator = AIAnalysisOrchestrator(db)
            orchestrator.analyze_document(imported_content_id)
            
        except Exception as e:
            logger.error(f"Dispatch failed for {imported_content_id}: {str(e)}")
            db.rollback()
        finally:
            db.close()
