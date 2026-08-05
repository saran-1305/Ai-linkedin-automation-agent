import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.session import get_db
from models.content import ContentImport, ImportedContent, ImportStatus, ProcessingStatus
from content_processing.services.processing_service import process_content
from datetime import datetime, timezone

router = APIRouter(prefix="/content", tags=["Content Imports"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/import")
async def import_content(
    background_tasks: BackgroundTasks,
    source: str = Form(...),
    file: UploadFile = File(None),
    url: str = Form(None),
    text_content: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Create parent import session
        content_import = ContentImport(
            source=source,
            status=ImportStatus.PENDING
        )
        db.add(content_import)
        db.commit()
        db.refresh(content_import)
        
        # Create imported content
        imported_content = ImportedContent(
            import_id=content_import.id,
            processing_status=ProcessingStatus.PENDING
        )
        
        metadata = {}
        
        if file:
            # Handle file upload
            file_ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            imported_content.filename = file.filename
            imported_content.storage_path = file_path
            imported_content.mime_type = file.content_type
            
        elif url:
            imported_content.filename = url
            metadata['url'] = url
            
        elif text_content:
            imported_content.filename = "Pasted Text"
            metadata['raw_text'] = text_content
            
        else:
            raise HTTPException(status_code=400, detail="Must provide a file, url, or text_content")
            
        imported_content.metadata_json = metadata
        db.add(imported_content)
        
        content_import.status = ImportStatus.UPLOADING
        db.commit()
        db.refresh(imported_content)
        
        # Kick off background processing
        background_tasks.add_task(process_content, imported_content.id)
        
        content_import.status = ImportStatus.IMPORTED
        db.commit()
        
        return {"status": "success", "import_id": content_import.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/imports")
def get_imports(db: Session = Depends(get_db)):
    imports = db.query(ContentImport).order_by(ContentImport.created_at.desc()).all()
    results = []
    for imp in imports:
        # Get primary content to show status
        content = db.query(ImportedContent).filter(ImportedContent.import_id == imp.id).first()
        results.append({
            "id": imp.id,
            "source": imp.source,
            "status": content.processing_status.value if content else imp.status.value,
            "analysis_status": content.analysis_status.value if content and content.analysis_status else "Pending",
            "created_at": imp.created_at.isoformat(),
            "word_count": content.word_count if content else 0,
            "filename": content.filename if content else ""
        })
    return results

@router.get("/import/{import_id}")
def get_import(import_id: int, db: Session = Depends(get_db)):
    imp = db.query(ContentImport).filter(ContentImport.id == import_id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Import not found")
        
    content = db.query(ImportedContent).filter(ImportedContent.import_id == imp.id).first()
    return {
        "id": imp.id,
        "source": imp.source,
        "status": content.processing_status.value if content else imp.status.value,
        "analysis_status": content.analysis_status.value if content and content.analysis_status else "Pending",
        "created_at": imp.created_at.isoformat(),
        "word_count": content.word_count if content else 0,
        "filename": content.filename if content else ""
    }

@router.delete("/import/{import_id}")
def delete_import(import_id: int, db: Session = Depends(get_db)):
    imp = db.query(ContentImport).filter(ContentImport.id == import_id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Import not found")
        
    db.delete(imp)
    db.commit()
    return {"status": "success"}
