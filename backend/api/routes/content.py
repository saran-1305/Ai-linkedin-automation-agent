from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.session import get_db
from content.orchestrator import AIContentOrchestrator
from models.content import GeneratedContent, ContentDraft
from models.execution import ContentSlot, WeeklyPlan
from content.platforms.engine import MultiPlatformEngine
from models.content import PlatformContent

router = APIRouter(prefix="/content", tags=["Content Generator"])

@router.post("/generate/{slot_id}")
def generate_content(slot_id: int, db: Session = Depends(get_db)):
    """Triggers the AI Content Orchestrator for a specific ContentSlot"""
    orchestrator = AIContentOrchestrator(db)
    try:
        content = orchestrator.generate_content_for_slot(slot_id)
        return {"status": "success", "content_id": content.id, "version": content.version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/slot/{slot_id}")
def get_content_for_slot(slot_id: int, db: Session = Depends(get_db)):
    """Fetch the generated content for a specific slot, if it exists"""
    content = db.query(GeneratedContent).filter(GeneratedContent.content_slot_id == slot_id).first()
    if not content:
        return None
        
    draft = db.query(ContentDraft).filter(ContentDraft.content_id == content.id).order_by(ContentDraft.version.desc()).first()
    
    return {
        "id": content.id,
        "status": content.status,
        "version": content.version,
        "confidence": content.confidence,
        "draft": {
            "title": draft.title,
            "hook": draft.hook,
            "body": draft.body,
            "cta": draft.cta,
            "hashtags": draft.hashtags
        } if draft else None,
        "metadata": {
            "platform": content.metadata_info.platform,
            "tone": content.metadata_info.tone,
            "campaign": content.metadata_info.campaign,
            "audience": content.metadata_info.audience,
            "content_type": content.metadata_info.content_type,
            "estimated_read_time": content.metadata_info.estimated_read_time
        } if content.metadata_info else None,
        "reasoning": {
            "hook_strategy": content.reasoning.hook_strategy,
            "body_strategy": content.reasoning.body_strategy,
            "cta_strategy": content.reasoning.cta_strategy,
            "campaign_alignment": content.reasoning.campaign_alignment,
            "audience_alignment": content.reasoning.audience_alignment,
            "trend_alignment": content.reasoning.trend_alignment
        } if content.reasoning else None,
        "scores": {
            "curiosity_score": content.scores.curiosity_score if content.scores else 0,
            "emotion_score": content.scores.emotion_score if content.scores else 0,
            "clarity_score": content.scores.clarity_score if content.scores else 0,
            "value_score": content.scores.value_score if content.scores else 0,
            "hook_score": content.scores.hook_score if content.scores else 0,
            "readability_score": content.scores.readability_score if content.scores else 0,
            "brand_voice_score": content.scores.brand_voice_score if content.scores else 0,
            "engagement_score": content.scores.engagement_score if content.scores else 0,
            "cta_score": content.scores.cta_score if content.scores else 0,
            "platform_compliance_score": content.scores.platform_compliance_score if content.scores else 0,
            "overall_quality": content.scores.overall_quality if content.scores else 0
        },
        "analysis": {
            "primary_topic": content.analyses.primary_topic,
            "secondary_topics": content.analyses.secondary_topics,
            "key_message": content.analyses.key_message,
            "emotional_tone": content.analyses.emotional_tone,
            "writing_style": content.analyses.writing_style,
            "estimated_engagement": content.analyses.estimated_engagement,
            "audience_intent": content.analyses.audience_intent
        } if content.analyses else None,
        "improvements": [
            {
                "improvement_type": imp.improvement_type,
                "description": imp.description,
                "suggestion": imp.suggestion,
                "severity": imp.severity
            } for imp in content.improvements
        ] if content.improvements else []
    }

@router.get("/slots")
def get_active_content_slots(business_id: int = 1, db: Session = Depends(get_db)):
    """Returns all slots for the active weekly plan so the user can select one to generate"""
    active_plan = db.query(WeeklyPlan).filter(
        WeeklyPlan.business_id == business_id,
        WeeklyPlan.status == "Active"
    ).order_by(WeeklyPlan.version.desc()).first()
    
    if not active_plan:
        return []
        
    slots = db.query(ContentSlot).filter(ContentSlot.weekly_plan_id == active_plan.id).all()
    
    # Check generation status for each slot
    result = []
    for slot in slots:
        gc = db.query(GeneratedContent).filter(GeneratedContent.content_slot_id == slot.id).first()
        result.append({
            "slot_id": slot.id,
            "day_of_week": slot.day_of_week,
            "platform": slot.platform,
            "topic": slot.topic,
            "content_type": slot.content_type,
            "priority": slot.priority,
            "generated": gc is not None,
            "content_id": gc.id if gc else None
        })
        
    return result

@router.post("/generate-platform/{content_id}")
def generate_platform_content(content_id: int, platform: str, db: Session = Depends(get_db)):
    """Generate variations for a specific platform using the blueprint"""
    engine = MultiPlatformEngine(db)
    try:
        platform_content = engine.generate_for_platform(content_id, platform)
        return {"status": "success", "platform_content_id": platform_content.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-all-platforms/{content_id}")
def generate_all_platforms(content_id: int, db: Session = Depends(get_db)):
    """Generate variations for all default platforms"""
    engine = MultiPlatformEngine(db)
    platforms = ["LinkedIn", "X", "Instagram", "Blog", "Newsletter"]
    results = []
    
    for platform in platforms:
        try:
            pc = engine.generate_for_platform(content_id, platform)
            results.append({"platform": platform, "status": "success", "id": pc.id})
        except Exception as e:
            results.append({"platform": platform, "status": "failed", "error": str(e)})
            
    return {"status": "completed", "results": results}

@router.get("/platform/{content_id}/{platform_name}")
def get_platform_variations(content_id: int, platform_name: str, db: Session = Depends(get_db)):
    """Get the variations for a specific platform"""
    pc = db.query(PlatformContent).filter(
        PlatformContent.content_id == content_id,
        PlatformContent.platform_name == platform_name
    ).first()
    
    if not pc:
        return None
        
    return {
        "id": pc.id,
        "platform_name": pc.platform_name,
        "status": pc.status,
        "variations": [
            {
                "id": v.id,
                "variation_label": v.variation_label,
                "title": v.title,
                "body": v.body,
                "hashtags": v.hashtags,
                "optimization_score": v.optimization_score,
                "reasoning": v.reasoning,
                "rule_validations": [
                    {
                        "rule_name": r.rule_name,
                        "is_valid": r.is_valid,
                        "feedback": r.feedback
                    } for r in v.rule_validations
                ]
            } for v in pc.variations
        ]
    }

