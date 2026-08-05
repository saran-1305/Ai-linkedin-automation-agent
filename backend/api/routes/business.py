from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_db
from schemas.business import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileResponse
from services.business_service import BusinessProfileService
from utils.extractors import extract_text_from_file
import logging
import uuid
import asyncio
from fastapi import UploadFile, File, BackgroundTasks

# Simple in-memory task store for demonstration
EXTRACTION_TASKS = {}

router = APIRouter(prefix="/business/profiles", tags=["Business Profile"])
logger = logging.getLogger(__name__)

@router.post("", response_model=BusinessProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(profile: BusinessProfileCreate, db: Session = Depends(get_db)):
    logger.info("Creating new business profile")
    service = BusinessProfileService(db)
    return service.create_profile(profile)

def process_extraction(task_id: str, combined_text: str):
    """Background task to process extracted text and populate business profile schema."""
    try:
        EXTRACTION_TASKS[task_id]["status"] = "processing_ai"
        
        # Here we instantiate an agent directly, though normally we'd inject it or use the service
        from agents.business_understanding.agent import BusinessUnderstandingAgent
        agent = BusinessUnderstandingAgent()
        
        # We need a method to process raw text. Let's assume the agent can parse this.
        # If the agent only takes Pydantic models, we might need a text-to-pydantic parser.
        # For now, we will add an `extract_from_text` method to the agent.
        extracted_data = agent.extract_from_text(combined_text)
        
        EXTRACTION_TASKS[task_id]["status"] = "completed"
        EXTRACTION_TASKS[task_id]["result"] = extracted_data
    except Exception as e:
        logger.error(f"Extraction failed for task {task_id}: {e}")
        EXTRACTION_TASKS[task_id]["status"] = "failed"
        EXTRACTION_TASKS[task_id]["error"] = str(e)

@router.post("/extract", status_code=status.HTTP_202_ACCEPTED)
async def extract_business_profile(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    MAX_SIZE = 20 * 1024 * 1024
    combined_text = ""
    
    for file in files:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 20MB limit.")
        
        text = extract_text_from_file(file.filename, content)
        if text:
            combined_text += f"\n--- Source: {file.filename} ---\n{text}\n"
    
    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="No readable text extracted from files.")

    task_id = str(uuid.uuid4())
    EXTRACTION_TASKS[task_id] = {"status": "extracting", "result": None}
    
    background_tasks.add_task(process_extraction, task_id, combined_text)
    
    return {"task_id": task_id, "status": "processing"}

@router.get("/extract/status/{task_id}")
def get_extraction_status(task_id: str):
    if task_id not in EXTRACTION_TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    return EXTRACTION_TASKS[task_id]

@router.get("/{profile_id}", response_model=BusinessProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    service = BusinessProfileService(db)
    profile = service.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Business Profile not found")
    return profile

@router.get("", response_model=List[BusinessProfileResponse])
def get_all_profiles(db: Session = Depends(get_db)):
    service = BusinessProfileService(db)
    return service.get_all_profiles()

@router.put("/{profile_id}", response_model=BusinessProfileResponse)
def update_profile(profile_id: int, profile: BusinessProfileUpdate, db: Session = Depends(get_db)):
    service = BusinessProfileService(db)
    updated_profile = service.update_profile(profile_id, profile)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="Business Profile not found")
    return updated_profile

@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    service = BusinessProfileService(db)
    success = service.delete_profile(profile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business Profile not found")
    return None
