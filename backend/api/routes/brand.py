from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.session import get_db
from models.business import BusinessProfile
from models.brand import BrandProfile, BrandMemoryVersion
from brand_intelligence.service import BrandIntelligenceService
import logging

router = APIRouter(prefix="/brand", tags=["brand"])
logger = logging.getLogger(__name__)

def _get_business_id(db: Session) -> int:
    profile = db.query(BusinessProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")
    return profile.id

def _get_brand_profile(db: Session) -> BrandProfile:
    business_id = _get_business_id(db)
    profile = db.query(BrandProfile).filter_by(business_id=business_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand profile not generated yet")
    return profile

@router.get("/profile")
def get_brand_profile(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return {
        "id": profile.id,
        "business_summary": profile.business_summary,
        "core_mission": profile.core_mission,
        "primary_industry": profile.primary_industry,
        "primary_expertise": profile.primary_expertise,
        "primary_services": profile.primary_services,
        "unique_selling_points": profile.unique_selling_points,
        "value_proposition": profile.value_proposition,
        "brand_vision": profile.brand_vision,
        "brand_positioning": profile.brand_positioning,
        "confidence_scores": [{"category": cs.category, "current_confidence": cs.current_confidence} for cs in profile.confidence_scores]
    }

@router.get("/voice")
def get_brand_voice(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"characteristic": v.characteristic, "confidence": v.confidence} for v in profile.voices]

@router.get("/personality")
def get_brand_personality(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"trait": p.trait, "confidence": p.confidence} for p in profile.personalities]

@router.get("/content-pillars")
def get_brand_content_pillars(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"name": p.pillar_name, "type": p.pillar_type, "confidence": p.confidence, "frequency": p.frequency} for p in profile.pillars]

@router.get("/topics")
def get_brand_topics(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"name": t.topic_name, "type": t.topic_type, "frequency": t.frequency} for t in profile.topics]

@router.get("/keywords")
def get_brand_keywords(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"keyword": k.keyword, "type": k.keyword_type, "frequency": k.frequency} for k in profile.keywords]

@router.get("/audiences")
def get_brand_audiences(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"segment": a.audience_segment, "type": a.audience_type, "confidence": a.confidence} for a in profile.audiences]

@router.get("/vocabulary")
def get_brand_vocabulary(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"word_or_phrase": v.word_or_phrase, "category": v.category, "frequency": v.frequency} for v in profile.vocabularies]

@router.get("/storytelling-patterns")
def get_brand_storytelling(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"pattern_name": p.pattern_name, "frequency": p.frequency} for p in profile.storytelling_patterns]

@router.get("/cta-patterns")
def get_brand_cta(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    return [{"cta_text": c.cta_text, "frequency": c.frequency} for c in profile.cta_patterns]

@router.get("/posting-patterns")
def get_brand_posting(db: Session = Depends(get_db)):
    profile = _get_brand_profile(db)
    # Posting pattern is a 1-to-1 or single latest entry
    if not profile.posting_patterns:
        return {}
    pp = profile.posting_patterns[0] if isinstance(profile.posting_patterns, list) else profile.posting_patterns
    return {
        "avg_sentence_length": pp.avg_sentence_length,
        "paragraph_structure": pp.paragraph_structure,
        "vocabulary_complexity": pp.vocabulary_complexity,
        "storytelling_preference": pp.storytelling_preference,
        "educational_vs_promotional_ratio": pp.educational_vs_promotional_ratio,
        "technical_depth": pp.technical_depth,
        "reading_difficulty": pp.reading_difficulty,
        "content_strategy": pp.content_strategy,
        "strategy_confidence": pp.strategy_confidence
    }

@router.get("/versions")
def get_brand_versions(db: Session = Depends(get_db)):
    business_id = _get_business_id(db)
    profile = db.query(BrandProfile).filter_by(business_id=business_id).first()
    if not profile:
        return []
    versions = db.query(BrandMemoryVersion).filter_by(brand_profile_id=profile.id).order_by(BrandMemoryVersion.version.desc()).all()
    return [{"version": v.version, "generated_at": v.generated_at, "document_count": v.document_count} for v in versions]

def background_regenerate(business_id: int):
    # Separate DB session for background task
    from database.session import SessionLocal
    db = SessionLocal()
    try:
        svc = BrandIntelligenceService(db)
        svc.regenerate_brand_profile(business_id)
    except Exception as e:
        logger.error(f"Background regeneration failed: {e}")
    finally:
        db.close()

@router.post("/regenerate")
def trigger_regeneration(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    business_id = _get_business_id(db)
    background_tasks.add_task(background_regenerate, business_id)
    return {"status": "Regeneration started in background"}

import os
@router.get("/debug-env")
def debug_env():
    return {
        "BRAND_LLM_MODEL": os.getenv("BRAND_LLM_MODEL"),
        "ANALYSIS_LLM_MODEL": os.getenv("ANALYSIS_LLM_MODEL")
    }
