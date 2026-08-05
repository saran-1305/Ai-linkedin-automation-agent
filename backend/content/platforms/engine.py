import logging
import json
import time
from sqlalchemy.orm import Session
from content_analysis.providers.provider_factory import ProviderFactory
from models.content import GeneratedContent, ContentDraft, PlatformContent, PlatformVariation, PlatformRuleValidation
from .templates import PLATFORM_TEMPLATES
from .rules import validate_platform_rules
import os

logger = logging.getLogger(__name__)

class MultiPlatformEngine:
    def __init__(self, db: Session):
        self.db = db
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")
        if "groq" in self.provider.model_name or "llama-3.1-8b" in self.provider.model_name:
            self.provider.model_name = "openrouter/meta-llama/llama-3.3-70b-instruct"
            self.provider.api_key = os.getenv("OPENROUTER_API_KEY")

    def _build_prompt(self, blueprint_draft: ContentDraft, platform_name: str) -> tuple[str, str]:
        template = PLATFORM_TEMPLATES.get(platform_name)
        if not template:
            raise ValueError(f"Platform {platform_name} is not supported.")
            
        system_prompt = template.system_prompt
        
        user_prompt = f"""
Transform the following Content Blueprint into a highly optimized post for {platform_name}.

--- BASE BLUEPRINT ---
Title: {blueprint_draft.title}
Hook: {blueprint_draft.hook}
Body: {blueprint_draft.body}
CTA: {blueprint_draft.cta}
Hashtags: {', '.join(blueprint_draft.hashtags) if blueprint_draft.hashtags else ''}

--- PLATFORM GUIDELINES ---
Tone: {template.tone_guidelines}
Structure: {template.structure_guidelines}
Hashtags: {template.hashtag_strategy}
CTA: {template.cta_style}

You must output valid JSON only, exactly matching this schema:
{{
  "title": "string (optional, useful for blog/newsletter, can be empty string for X/LinkedIn)",
  "body": "string (the full text of the post, including the hook and CTA formatted naturally)",
  "hashtags": ["list", "of", "strings", "without", "#"],
  "reasoning": "string (briefly explain why you formatted it this way for {platform_name})"
}}
"""
        return system_prompt, user_prompt

    def generate_for_platform(self, content_id: int, platform_name: str, variations_count: int = 3) -> PlatformContent:
        blueprint = self.db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()
        if not blueprint:
            raise ValueError(f"Content Blueprint with ID {content_id} not found.")
            
        draft = self.db.query(ContentDraft).filter(ContentDraft.content_id == content_id).order_by(ContentDraft.version.desc()).first()
        if not draft:
            raise ValueError(f"No draft found for Blueprint ID {content_id}.")
            
        # Check if platform content exists
        platform_content = self.db.query(PlatformContent).filter(
            PlatformContent.content_id == content_id,
            PlatformContent.platform_name == platform_name
        ).first()
        
        if not platform_content:
            platform_content = PlatformContent(
                content_id=content_id,
                platform_name=platform_name,
                status="Generated"
            )
            self.db.add(platform_content)
            self.db.commit()
            self.db.refresh(platform_content)
        else:
            # Delete old variations
            for var in platform_content.variations:
                self.db.delete(var)
            self.db.commit()

        system_prompt, user_prompt = self._build_prompt(draft, platform_name)
        
        labels = ["Version A", "Version B", "Version C"]
        
        for i in range(min(variations_count, len(labels))):
            logger.info(f"Generating {labels[i]} for {platform_name} (Content ID {content_id})")
            
            # Minor variation in prompt to encourage diversity
            variation_prompt = user_prompt
            if i == 1:
                variation_prompt += "\n\nFor this variation, try a more story-driven or emotional angle."
            elif i == 2:
                variation_prompt += "\n\nFor this variation, try a highly analytical, listicle, or data-driven angle."

            response = self.provider.analyze(system_prompt=system_prompt, user_prompt=variation_prompt, max_tokens=8000)
            raw = response.get("raw_response", "")
            
            try:
                # Basic JSON extraction
                if "```json" in raw:
                    raw = raw.split("```json")[1].split("```")[0].strip()
                elif "```" in raw:
                    raw = raw.split("```")[1].split("```")[0].strip()
                    
                data = json.loads(raw)
                
                variation = PlatformVariation(
                    platform_content_id=platform_content.id,
                    variation_label=labels[i],
                    title=data.get("title", ""),
                    body=data.get("body", ""),
                    hashtags=data.get("hashtags", []),
                    reasoning=data.get("reasoning", ""),
                    optimization_score=90.0, # Placeholder, can be calculated
                )
                self.db.add(variation)
                self.db.commit()
                self.db.refresh(variation)
                
                # Apply Rules Engine
                validations = validate_platform_rules(platform_name, variation.body)
                all_valid = True
                for v in validations:
                    rule = PlatformRuleValidation(
                        variation_id=variation.id,
                        rule_name=v.rule_name,
                        is_valid=1 if v.is_valid else 0,
                        feedback=v.feedback
                    )
                    self.db.add(rule)
                    if not v.is_valid:
                        all_valid = False
                
                # Adjust score if invalid
                if not all_valid:
                    variation.optimization_score = 60.0
                    
                self.db.commit()
                
            except Exception as e:
                logger.error(f"Failed to parse generation for {platform_name} {labels[i]}: {e}")
                
        return platform_content
