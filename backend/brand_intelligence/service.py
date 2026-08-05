import logging
from sqlalchemy.orm import Session
from .aggregator import BrandAggregator
from .prompt_builder import build_brand_intelligence_system_prompt, build_brand_intelligence_user_prompt
from .response_parser import BrandResponseParser
from .repository import BrandRepository
from .version_manager import VersionManager
from content_analysis.providers.provider_factory import ProviderFactory
from models.brand import BrandProfile

logger = logging.getLogger(__name__)

class BrandIntelligenceService:
    def __init__(self, db: Session):
        self.db = db
        self.aggregator = BrandAggregator(db)
        self.repository = BrandRepository(db)
        self.version_manager = VersionManager(db)
        self.provider = ProviderFactory.get_provider(model_env_var="BRAND_LLM_MODEL")

    def regenerate_brand_profile(self, business_id: int) -> BrandProfile:
        """
        Main pipeline to aggregate knowledge and rebuild the Brand Profile.
        """
        logger.info(f"Starting Brand Intelligence regeneration for business {business_id}")
        
        # 1. Aggregate
        business_profile = self.aggregator.get_business_profile()
        if not business_profile:
            logger.error(f"Cannot generate brand intelligence: Business profile {business_id} not found.")
            raise ValueError("Business Profile not found")
            
        aggregated_data = self.aggregator.aggregate_data()
        
        if aggregated_data["total_documents"] == 0:
            logger.warning("No analyzed documents found. Brand Profile may be empty.")

        # 2. Build Prompts
        system_prompt = build_brand_intelligence_system_prompt()
        user_prompt = build_brand_intelligence_user_prompt(aggregated_data, business_profile)

        # 3. Request LLM
        logger.info(f"Sending Brand Intelligence aggregation request to {self.provider.__class__.__name__}")
        llm_result = self.provider.analyze(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=8000)
        
        # 4. Parse Response
        try:
            parsed_data = BrandResponseParser.parse(llm_result["raw_response"])
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.debug(f"Raw Response: {llm_result['raw_response']}")
            raise

        # 5. Version and Save
        next_version = self.version_manager.get_next_version(business_id)
        version_info = {
            "version": next_version,
            "document_count": aggregated_data["total_documents"],
            "analysis_count": aggregated_data["total_documents"], # Roughly 1 analysis per doc
            "model_name": llm_result["model_name"],
            "prompt_version": "v1",
            "generation_duration": llm_result["latency_ms"]
        }
        
        logger.info(f"Saving Brand Profile Version {next_version}")
        brand_profile = self.repository.save_brand_intelligence(business_id, parsed_data, version_info)
        
        logger.info(f"Successfully generated Brand Intelligence for business {business_id}")
        return brand_profile
