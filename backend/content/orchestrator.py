import logging
import time
import os
from sqlalchemy.orm import Session
from content_analysis.providers.provider_factory import ProviderFactory
from .context_builder import ContextBuilder
from .prompt_builder import PromptBuilder
from .validator import ContentValidator
from .schemas import GeneratedDraftResponse
from models.content import (
    GeneratedContent, ContentDraft, ContentMetadata,
    GenerationReasoning, ContentScore, ContentVersion
)
from models.execution import ContentSlot, WeeklyPlan

logger = logging.getLogger(__name__)

class AIContentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")
        if "groq" in self.provider.model_name or "llama-3.1-8b" in self.provider.model_name:
            self.provider.model_name = "openrouter/meta-llama/llama-3.3-70b-instruct"
            self.provider.api_key = os.getenv("OPENROUTER_API_KEY")
            
        self.context_builder = ContextBuilder(db)
        self.prompt_builder = PromptBuilder()
        self.validator = ContentValidator()

    def _call_llm(self, prompt: str, schema_json: dict) -> dict:
        start_time = time.time()
        response = self.provider.analyze(system_prompt=prompt, user_prompt="Generate the content draft.", max_tokens=8000)
        execution_time_ms = int((time.time() - start_time) * 1000)
        
        is_valid, parsed_data, error = self.validator.parse_and_validate(response.get("raw_response", ""))
        if not is_valid:
            logger.error(f"Generation Validation Failed: {error}. Retrying...")
            # Retry once
            response = self.provider.analyze(system_prompt=prompt, user_prompt="Your previous output was invalid JSON. Generate it strictly adhering to the JSON schema. No markdown formatting.", max_tokens=8000)
            is_valid, parsed_data, error = self.validator.parse_and_validate(response.get("raw_response", ""))
            if not is_valid:
                raise ValueError(f"Failed to generate valid content after retry: {error}")
                
        return parsed_data, execution_time_ms

    def generate_content_for_slot(self, slot_id: int) -> GeneratedContent:
        logger.info(f"Starting Orchestrator pipeline for Slot ID: {slot_id}")
        
        # 1. Build Content Brief
        brief = self.context_builder.build_content_brief(slot_id)
        schema = GeneratedDraftResponse.model_json_schema()
        
        # We handle Phase 1 drafting
        prompt = self.prompt_builder.build_generation_prompt(brief, schema)
        parsed_data, exec_time = self._call_llm(prompt, schema)
        
        # Phase 2: Quality Engine Evaluation
        from content.quality.quality_engine import QualityEngine
        quality_engine = QualityEngine(self.db)
        
        brief_dict = {
            "core_message": brief.core_message,
            "writing_style": brief.writing_style,
            "platform_requirements": brief.platform_requirements
        }
        
        qe_result = quality_engine.evaluate_draft(brief_dict, parsed_data)
        
        # Check auto-regeneration threshold
        total_exec_time = exec_time
        if qe_result["scores"]["overall_quality"] < 7.5:
            logger.warning(f"Draft quality is {qe_result['scores']['overall_quality']}/10. Triggering Auto-Regeneration!")
            # 4. AI Self-Review (Quality check)
            review_prompt = self.prompt_builder.build_review_prompt(brief, parsed_data)
            parsed_data, review_exec_time = self._call_llm(review_prompt, schema)
            total_exec_time += review_exec_time
            # Re-evaluate
            qe_result = quality_engine.evaluate_draft(brief_dict, parsed_data)
        
        # Inject the Phase 2 components into our final data dict before DB save
        parsed_data["scores"] = qe_result["scores"]
        parsed_data["analysis"] = qe_result["analysis"]
        parsed_data["improvements"] = qe_result["improvements"]
        
        final_data = parsed_data
        
        # 5. Save to Repository
        slot = self.db.query(ContentSlot).filter(ContentSlot.id == slot_id).first()
        plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.id == slot.weekly_plan_id).first()
        
        # Check if already generated
        existing = self.db.query(GeneratedContent).filter(GeneratedContent.content_slot_id == slot_id).first()
        version = (existing.version + 1) if existing else 1
        
        if existing:
            gc = existing
            gc.status = "Generated"
            gc.version = version
            gc.confidence = final_data["metadata"]["confidence"]
        else:
            gc = GeneratedContent(
                business_id=plan.business_id,
                execution_plan_id=plan.id,
                content_slot_id=slot.id,
                status="Generated",
                version=version,
                confidence=final_data["metadata"]["confidence"]
            )
            self.db.add(gc)
            self.db.commit()
            self.db.refresh(gc)
            
        # Add Draft
        draft = ContentDraft(
            content_id=gc.id,
            version=version,
            title=final_data["title"],
            hook=final_data["hook"],
            body=final_data["body"],
            cta=final_data["cta"],
            hashtags=final_data["hashtags"]
        )
        self.db.add(draft)
        
        # Add Metadata
        if existing and existing.metadata_info:
            self.db.delete(existing.metadata_info)
        meta = ContentMetadata(
            content_id=gc.id,
            platform=final_data["metadata"]["platform"],
            tone=final_data["metadata"]["tone"],
            campaign=final_data["metadata"]["campaign"],
            audience=final_data["metadata"]["audience"],
            content_type=final_data["metadata"]["content_type"],
            estimated_read_time=final_data["metadata"]["estimated_read_time"]
        )
        self.db.add(meta)
        
        # Add Reasoning
        if existing and existing.reasoning:
            self.db.delete(existing.reasoning)
        reasoning = GenerationReasoning(
            content_id=gc.id,
            version=version,
            **final_data["reasoning"]
        )
        self.db.add(reasoning)
        
        # Add Scores
        if existing and existing.scores:
            self.db.delete(existing.scores)
        scores = ContentScore(
            content_id=gc.id,
            version=version,
            **final_data["scores"]
        )
        self.db.add(scores)
        
        # Add Version Record
        v = ContentVersion(
            content_id=gc.id,
            version=version,
            prompt_version="2.0-quality-engine",
            model=self.provider.model_name,
            execution_time_ms=total_exec_time,
            token_usage=0,
            confidence=final_data["metadata"]["confidence"]
        )
        self.db.add(v)
        
        # Phase 2: Add Analysis
        from models.content import ContentAnalysis, ContentImprovement
        if existing and existing.analyses:
            self.db.delete(existing.analyses)
        analysis = ContentAnalysis(
            content_id=gc.id,
            version=version,
            **final_data["analysis"]
        )
        self.db.add(analysis)
        
        # Phase 2: Add Improvements
        if existing:
            for imp in existing.improvements:
                self.db.delete(imp)
        for imp_data in final_data["improvements"]:
            imp = ContentImprovement(
                content_id=gc.id,
                version=version,
                **imp_data
            )
            self.db.add(imp)
        
        self.db.commit()
        return gc
