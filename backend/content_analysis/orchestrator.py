import logging
from sqlalchemy.orm import Session
from models.content import ImportedContent
from content_analysis.prompt_builder import PromptBuilder
from content_analysis.providers.provider_factory import ProviderFactory
from content_analysis.response_parser import ResponseParser
from content_analysis.repository import AnalysisRepository

logger = logging.getLogger(__name__)

class AIAnalysisOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.prompt_builder = PromptBuilder()
        self.provider = ProviderFactory.get_provider()
        self.parser = ResponseParser()
        self.repository = AnalysisRepository(db)

    def analyze_document(self, imported_content_id: int):
        """
        The single orchestrator flow:
        Build Prompt -> LLM -> Parser -> Repository
        """
        logger.info(f"Analysis Started for ImportedContent {imported_content_id}")
        
        # 1. Fetch data
        content_record = self.db.query(ImportedContent).filter(ImportedContent.id == imported_content_id).first()
        if not content_record or not content_record.cleaned_text:
            logger.error("Document not found or has no cleaned text.")
            return

        # 2. Build Prompts
        system_prompt = self.prompt_builder.build_system_prompt()
        user_prompt = self.prompt_builder.build_user_prompt(
            document_text=content_record.cleaned_text,
            source=content_record.import_session.source,
            word_count=content_record.word_count or 0,
            language=content_record.language or "unknown"
        )
        
        logger.info(f"Prompt Generated for {imported_content_id}")

        execution_data = {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt
        }

        try:
            # 3. Call LLM
            logger.info("Executing Content Analysis LLM...")
            llm_result = self.provider.analyze(system_prompt, user_prompt, max_tokens=8000)
            execution_data.update(llm_result)
            logger.info("LLM Response Received")

            # 4. Parse Response
            parsed_data = self.parser.parse_v1(llm_result["raw_response"])
            logger.info("Response Parsed Successfully")

            # 5. Save to Repository (Single Transaction)
            self.repository.save_analysis(imported_content_id, execution_data, parsed_data)
            logger.info("Analysis Completed & Database Updated")

            # 6. Trigger Brand Intelligence Regeneration
            try:
                from models.business import BusinessProfile
                from brand_intelligence.service import BrandIntelligenceService
                biz = self.db.query(BusinessProfile).first()
                if biz:
                    logger.info("Triggering Brand Intelligence Regeneration")
                    svc = BrandIntelligenceService(self.db)
                    svc.regenerate_brand_profile(biz.id)
            except Exception as e:
                logger.error(f"Failed to regenerate brand intelligence: {e}")

        except Exception as e:
            logger.error(f"Analysis failed for {imported_content_id}: {str(e)}", exc_info=True)
            self.repository._mark_failed(imported_content_id, execution_data, str(e))
