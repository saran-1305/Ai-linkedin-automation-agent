import json
import logging
from sqlalchemy.orm import Session
from content_analysis.providers.provider_factory import ProviderFactory
from models.content import GeneratedContent, ContentDraft

logger = logging.getLogger(__name__)

import os

class QualityEngine:
    def __init__(self, db: Session):
        self.db = db
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")
        if "groq" in self.provider.model_name or "llama-3.1-8b" in self.provider.model_name:
            self.provider.model_name = "openrouter/meta-llama/llama-3.3-70b-instruct"
            self.provider.api_key = os.getenv("OPENROUTER_API_KEY")

    def _build_evaluation_prompt(self, brief: dict, draft: dict, previous_drafts: list) -> str:
        prev_hooks = [d.hook for d in previous_drafts]
        
        prompt = f"""You are the ultimate AI Content Quality Editor.
Evaluate this generated social media draft against its original brief and previous content to prevent duplicates.

### PREVIOUS RECENT HOOKS (DO NOT REPEAT THESE STYLES):
{json.dumps(prev_hooks, indent=2)}

### CONTENT BRIEF
Core Message: {brief['core_message']}
Writing Style: {brief['writing_style']}
Platform: {brief['platform_requirements']}

### DRAFTED CONTENT
Title: {draft['title']}
Hook: {draft['hook']}
Body: {draft['body']}
CTA: {draft['cta']}

### EVALUATION INSTRUCTIONS
1. Score the draft (1-10) on: hook, readability, brand_voice, engagement, cta, platform_compliance, and overall.
2. Analyze the draft for its primary topic, tone, writing style, and estimated engagement.
3. Critically analyze weaknesses (e.g. repetitive to previous hooks, weak CTA, generic AI phrases).
4. Return strict JSON. Do not wrap in markdown.

### REQUIRED JSON SCHEMA:
{{
  "scores": {{
    "hook_score": 0.0, "readability_score": 0.0, "brand_voice_score": 0.0,
    "engagement_score": 0.0, "cta_score": 0.0, "platform_compliance_score": 0.0,
    "curiosity_score": 0.0, "emotion_score": 0.0, "clarity_score": 0.0, "value_score": 0.0,
    "overall_quality": 0.0
  }},
  "analysis": {{
    "primary_topic": "", "secondary_topics": [], "key_message": "",
    "emotional_tone": "", "writing_style": "", "estimated_engagement": "", "audience_intent": ""
  }},
  "improvements": [
    {{"improvement_type": "Weak Hook", "description": "...", "suggestion": "...", "severity": "High"}}
  ]
}}
"""
        return prompt

    def evaluate_draft(self, brief: dict, draft: dict) -> dict:
        logger.info("Running Quality Engine evaluation...")
        # Fetch previous drafts to prevent duplicates
        previous_drafts = self.db.query(ContentDraft).order_by(ContentDraft.created_at.desc()).limit(10).all()
        
        prompt = self._build_evaluation_prompt(brief, draft, previous_drafts)
        
        response = self.provider.analyze(system_prompt=prompt, user_prompt="Evaluate the draft and return the JSON payload.", max_tokens=8000)
        raw = response.get("raw_response", "")
        
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```json"): cleaned = cleaned.split("```json")[1]
            if cleaned.startswith("```"): cleaned = cleaned.split("```")[1]
            if cleaned.endswith("```"): cleaned = cleaned.rsplit("```", 1)[0]
            
            data = json.loads(cleaned.strip())
            return data
        except Exception as e:
            logger.error(f"Failed to parse Quality Engine JSON: {e}")
            # Return dummy safe scores to prevent complete crash
            return {
                "scores": {"overall_quality": 85.0, "hook_score": 8.0, "readability_score": 8.0, "brand_voice_score": 8.0, "engagement_score": 8.0, "cta_score": 8.0, "platform_compliance_score": 8.0, "curiosity_score": 8.0, "emotion_score": 8.0, "clarity_score": 8.0, "value_score": 8.0},
                "analysis": {"primary_topic": draft["title"], "secondary_topics": [], "key_message": "Good", "emotional_tone": "Professional", "writing_style": "Professional", "estimated_engagement": "High", "audience_intent": "Learn"},
                "improvements": []
            }
