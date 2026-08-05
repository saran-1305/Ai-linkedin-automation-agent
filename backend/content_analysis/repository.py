import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.analysis import (
    AnalysisRun, DocumentAnalysis, AnalysisTopic, AnalysisKeyword, 
    AnalysisPillar, AnalysisCTA, AnalysisAudience, AnalysisTone, AnalysisStyle
)
from models.content import ImportedContent, AnalysisStatus
from content_analysis.schemas import DocumentAnalysisResponse
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AnalysisRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_analysis(self, imported_content_id: int, execution_data: Dict[str, Any], parsed_data: DocumentAnalysisResponse):
        """
        Saves the analysis run AND the normalized data in a single transaction.
        Rolls back if any insert fails.
        """
        try:
            # 1. Update ImportedContent status
            content_record = self.db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
            if not content_record:
                raise ValueError(f"ImportedContent {imported_content_id} not found.")

            from datetime import datetime
            content_record.analysis_status = AnalysisStatus.ANALYZED
            content_record.analyzed_at = datetime.utcnow()

            # 2. Save AnalysisRun (Telemetry)
            run_record = AnalysisRun(
                imported_content_id=imported_content_id,
                provider=execution_data.get('provider', 'unknown'),
                model_name=execution_data.get('model_name', 'unknown'),
                prompt_version="v1.0",
                analysis_version="v1.0",
                raw_prompt=execution_data.get('system_prompt', '') + "\n\n" + execution_data.get('user_prompt', ''),
                raw_response=execution_data.get('raw_response', ''),
                execution_time_ms=execution_data.get('latency_ms', 0),
                input_tokens=execution_data.get('input_tokens', 0),
                output_tokens=execution_data.get('output_tokens', 0),
                total_tokens=execution_data.get('total_tokens', 0),
                estimated_cost=execution_data.get('estimated_cost', 0.0),
                status="Success"
            )
            self.db.add(run_record)

            # 3. Clean previous analysis if exists
            self.db.query(DocumentAnalysis).filter(DocumentAnalysis.imported_content_id == imported_content_id).delete()

            # 4. Save Normalized DocumentAnalysis
            doc_analysis = DocumentAnalysis(
                imported_content_id=imported_content_id,
                document_type=parsed_data.document_type,
                summary=parsed_data.summary,
                overall_confidence=parsed_data.overall_confidence
            )
            self.db.add(doc_analysis)
            self.db.flush() # flush to get doc_analysis.id

            # 5. Save 1-to-Many Relationships
            for topic in parsed_data.topics:
                self.db.add(AnalysisTopic(document_analysis_id=doc_analysis.id, topic_type=topic.topic_type, topic_name=topic.topic_name, confidence=topic.confidence))
            
            for keyword in parsed_data.keywords:
                self.db.add(AnalysisKeyword(document_analysis_id=doc_analysis.id, keyword_type=keyword.keyword_type, keyword=keyword.keyword))
                
            for pillar in parsed_data.content_pillars:
                self.db.add(AnalysisPillar(document_analysis_id=doc_analysis.id, pillar_name=pillar))
                
            for cta in parsed_data.ctas:
                self.db.add(AnalysisCTA(document_analysis_id=doc_analysis.id, cta_text=cta.cta_text, cta_type=cta.cta_type))
                
            for audience in parsed_data.audiences:
                self.db.add(AnalysisAudience(document_analysis_id=doc_analysis.id, audience_segment=audience.audience_segment, confidence=audience.confidence))
                
            for tone in parsed_data.tones:
                self.db.add(AnalysisTone(document_analysis_id=doc_analysis.id, tone_name=tone.tone_name, confidence=tone.confidence))
                
            for style in parsed_data.writing_styles:
                self.db.add(AnalysisStyle(document_analysis_id=doc_analysis.id, style_name=style))

            self.db.commit()
            
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"Database error saving analysis for {imported_content_id}: {str(e)}")
            self._mark_failed(imported_content_id, execution_data, str(e))
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Unexpected error saving analysis for {imported_content_id}: {str(e)}")
            self._mark_failed(imported_content_id, execution_data, str(e))
            raise

    def _mark_failed(self, imported_content_id: int, execution_data: Dict[str, Any], error_msg: str):
        try:
            content_record = self.db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
            if content_record:
                content_record.analysis_status = AnalysisStatus.FAILED
                
            run_record = AnalysisRun(
                imported_content_id=imported_content_id,
                provider=execution_data.get('provider', 'unknown'),
                model_name=execution_data.get('model_name', 'unknown'),
                raw_prompt=execution_data.get('system_prompt', '') + "\n\n" + execution_data.get('user_prompt', ''),
                raw_response=execution_data.get('raw_response', ''),
                status="Failed",
                error_message=error_msg
            )
            self.db.add(run_record)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.critical(f"Failed to write failure state to DB for {imported_content_id}: {str(e)}")
