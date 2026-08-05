import logging
import hashlib
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from models.content import ImportedContent, ContentChunk, ProcessingStatus, AnalysisStatus
from database.session import SessionLocal
from content_processing.services import extraction_service
from content_processing.processors import text_cleaner, language_detector, statistics, chunker
from content_analysis.dispatcher import AnalysisDispatcher

logger = logging.getLogger(__name__)

def process_content(imported_content_id: int, background_tasks: BackgroundTasks = None):
    """
    The orchestrator pipeline for processing content:
    Import -> Extract -> Clean -> Normalize -> Generate Statistics -> Chunk -> Save
    """
    db: Session = SessionLocal()
    try:
        content_record = db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
        if not content_record:
            logger.error(f"ImportedContent {imported_content_id} not found.")
            return

        source = content_record.import_session.source
        
        # 1. EXTRACT
        content_record.processing_status = ProcessingStatus.EXTRACTING
        db.commit()
        
        file_path = content_record.storage_path
        url = content_record.metadata_json.get('url') if content_record.metadata_json else None
        raw_text = content_record.metadata_json.get('raw_text') if content_record.metadata_json else None
        
        extracted_text, metadata = extraction_service.extract_content(
            source=source,
            file_path=file_path,
            url=url,
            raw_text=raw_text
        )
        
        content_record.extracted_text = extracted_text
        
        existing_meta = content_record.metadata_json or {}
        existing_meta.update(metadata)
        content_record.metadata_json = existing_meta
        db.commit()
        
        # 2. CLEAN & NORMALIZE
        content_record.processing_status = ProcessingStatus.CLEANING
        db.commit()
        
        cleaned_text = text_cleaner.clean_text(extracted_text)
        content_record.cleaned_text = cleaned_text
        
        hash_obj = hashlib.sha256(cleaned_text.encode('utf-8'))
        content_record.content_hash = hash_obj.hexdigest()
        
        # 3. DETECT LANGUAGE & GENERATE STATISTICS
        content_record.language = language_detector.detect_language(cleaned_text)
        
        stats = statistics.generate_statistics(cleaned_text)
        content_record.word_count = stats['word_count']
        content_record.sentence_count = stats['sentence_count']
        content_record.paragraph_count = stats['paragraph_count']
        content_record.estimated_read_time = stats['estimated_read_time']
        db.commit()
        
        # 4. CHUNK
        content_record.processing_status = ProcessingStatus.CHUNKING
        db.commit()
        
        chunks_data = chunker.chunk_text(cleaned_text, target_word_count=500)
        
        for idx, chunk_info in enumerate(chunks_data):
            new_chunk = ContentChunk(
                imported_content_id=content_record.id,
                chunk_index=idx,
                text_content=chunk_info['text_content'],
                word_count=chunk_info['word_count'],
                token_estimate=chunk_info['token_estimate'],
                start_offset=chunk_info['start_offset'],
                end_offset=chunk_info['end_offset']
            )
            db.add(new_chunk)
            
        # 5. COMPLETED (Triggers Analysis Phase)
        content_record.processing_status = ProcessingStatus.COMPLETED
        content_record.analysis_status = AnalysisStatus.READY_FOR_AI
        db.commit()
        
        logger.info(f"Successfully processed ImportedContent {imported_content_id}")
        
        # Trigger Analysis Dispatcher asynchronously if possible, otherwise call it
        # Since we are already in a background task, calling dispatch directly will block this thread,
        # but the API response has already been returned, so it's perfectly fine.
        AnalysisDispatcher.dispatch(imported_content_id)
        
    except Exception as e:
        logger.error(f"Error processing ImportedContent {imported_content_id}: {str(e)}", exc_info=True)
        # Attempt to mark as failed
        db.rollback()
        try:
            content_record = db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
            if content_record:
                content_record.processing_status = ProcessingStatus.FAILED
                content_record.processing_error = str(e)
                db.commit()
        except Exception as inner_e:
            logger.error(f"Failed to set FAILED status: {str(inner_e)}")
            db.rollback()
    finally:
        db.close()
