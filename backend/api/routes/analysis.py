from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database.session import get_db
from models.analysis import DocumentAnalysis
from models.content import ImportedContent, AnalysisStatus
from content_analysis.dispatcher import AnalysisDispatcher

router = APIRouter(prefix="/analysis", tags=["Content Intelligence Analysis"])

@router.get("/{document_id}")
def get_analysis(document_id: int, db: Session = Depends(get_db)):
    """Get the full structured analysis for a document"""
    analysis = db.query(DocumentAnalysis).filter(DocumentAnalysis.imported_content_id == document_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found or still processing.")
        
    return {
        "id": analysis.id,
        "document_type": analysis.document_type,
        "summary": analysis.summary,
        "overall_confidence": analysis.overall_confidence,
        "analyzed_at": analysis.created_at,
        "topics": [{"name": t.topic_name, "type": t.topic_type, "confidence": t.confidence} for t in analysis.topics],
        "keywords": [{"name": k.keyword, "type": k.keyword_type} for k in analysis.keywords],
        "writing_styles": [s.style_name for s in analysis.styles],
        "tones": [{"name": t.tone_name, "confidence": t.confidence} for t in analysis.tones],
        "audiences": [{"segment": a.audience_segment, "confidence": a.confidence} for a in analysis.audiences],
        "ctas": [{"text": c.cta_text, "type": c.cta_type} for c in analysis.ctas],
        "content_pillars": [p.pillar_name for p in analysis.pillars]
    }

@router.get("/{document_id}/status")
def get_analysis_status(document_id: int, db: Session = Depends(get_db)):
    """Check the processing status of the analysis"""
    content = db.query(ImportedContent).filter(ImportedContent.id == document_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    return {
        "document_id": document_id,
        "analysis_status": content.analysis_status,
        "analyzed_at": content.analyzed_at
    }

@router.post("/{document_id}/retry")
def retry_analysis(document_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Retry a failed or stuck analysis"""
    content = db.query(ImportedContent).filter(ImportedContent.id == document_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    content.analysis_status = AnalysisStatus.QUEUED_FOR_ANALYSIS
    db.commit()
    
    background_tasks.add_task(AnalysisDispatcher.dispatch, document_id)
    
    return {"status": "success", "message": "Analysis queued for retry."}
