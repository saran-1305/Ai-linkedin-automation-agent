from sqlalchemy.orm import Session
from ..repository.market_repository import MarketRepository
from models.competitor import CompetitorProfile, CompetitorAnalysis, CompetitorSWOT, CompetitorTopic, CompetitorKeyword
from models.market import RawCompetitorPage
from models.brand import BrandProfile
from ..schemas.competitor_ai import CompetitorAIResponse
from content_analysis.providers.provider_factory import ProviderFactory
import json
import logging

logger = logging.getLogger(__name__)

class CompetitorAnalyzer:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MarketRepository(db)
        
    def analyze_competitor(self, competitor_id: int):
        logger.info(f"Starting AI Analysis for competitor {competitor_id}")
        
        competitor = self.repo.get_competitor(competitor_id)
        if not competitor:
            logger.error("Competitor not found")
            return
            
        # 1. Fetch Brand Profile
        brand = self.db.query(BrandProfile).filter(BrandProfile.business_id == competitor.business_id).first()
        brand_context = brand.business_summary if brand else "No brand profile available."
            
        # 2. Fetch Raw Data
        from sqlalchemy import or_
        url_match = competitor.website or competitor.linkedin_url or ""
        
        # We also check by URL because the DB deduplicates raw pages by URL
        clean_url = url_match.replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/") if url_match else ""
        raw_pages = self.db.query(RawCompetitorPage).filter(
            or_(
                RawCompetitorPage.competitor_id == competitor_id,
                RawCompetitorPage.url.contains(clean_url) if clean_url else False
            )
        ).all()
        
        if not raw_pages:
            logger.warning("No raw data found to analyze.")
            return
            
        raw_content = "\\n\\n---\\n\\n".join([page.raw_text for page in raw_pages])
        # Truncate to avoid token limits (Groq free tier limits to 6k tokens per minute)
        # 8000 chars is roughly 2000 tokens, leaving plenty of headroom
        raw_content = raw_content[:8000] 
        
        # 3. Prompt Construction
        prompt = f"""
        You are an expert Market Intelligence AI.
        
        Analyze the following raw website data from a competitor named '{competitor.company_name}'.
        
        OUR BRAND PROFILE:
        {brand_context}
        
        COMPETITOR RAW DATA:
        {raw_content}
        
        Generate a comprehensive structured analysis of this competitor, extracting their profile, conducting a SWOT analysis, and identifying strategic gaps between them and OUR BRAND.
        """
        
        # 4. Generate Structured Data
        try:
            from content_analysis.providers.provider_factory import ProviderFactory
            # Use Groq (BRAND_LLM_MODEL) instead of Ollama since Ollama is struggling with strict JSON schemas
            provider = ProviderFactory.get_provider("BRAND_LLM_MODEL")
            schema_json = CompetitorAIResponse.model_json_schema()
            system_prompt = f"""You are an expert market intelligence AI. 
Analyze the competitor based on the scraped website data and output your analysis in JSON format.
DO NOT output the JSON schema itself. You must generate ACTUAL DATA that conforms to this schema:
{json.dumps(schema_json)}

CRITICAL: The root of your JSON object MUST have exactly these three keys: "profile", "swot", and "gaps".
Do not use uppercase keys like "Competitor Profile". Use the exact lowercase keys."""
            
            response = provider.analyze(system_prompt=system_prompt, user_prompt=prompt)
            
            # Parse JSON
            raw_json = response.get("raw_response", "{}")
            if raw_json.startswith("```json"):
                raw_json = raw_json.split("```json")[1].rsplit("```", 1)[0].strip()
            elif raw_json.startswith("```"):
                raw_json = raw_json.split("```")[1].rsplit("```", 1)[0].strip()
            
            data = json.loads(raw_json)
            
            # Map stubborn LLM keys if they exist
            mapped_data = {}
            for k, v in data.items():
                k_lower = k.lower()
                if "profile" in k_lower:
                    mapped_data["profile"] = v
                elif "swot" in k_lower:
                    mapped_data["swot"] = v
                elif "gap" in k_lower:
                    mapped_data["gaps"] = v
                else:
                    mapped_data[k] = v
            
            result = CompetitorAIResponse(**mapped_data)
            
            self._save_analysis(competitor_id, result)
            logger.info(f"Successfully analyzed competitor {competitor_id}")
            
        except Exception as e:
            logger.error(f"Failed to analyze competitor: {e}")
            self.db.rollback()
            
    def _save_analysis(self, competitor_id: int, result: CompetitorAIResponse):
        # Determine Version
        latest_profile = self.db.query(CompetitorProfile).filter(CompetitorProfile.competitor_id == competitor_id).order_by(CompetitorProfile.version.desc()).first()
        new_version = (latest_profile.version + 1) if latest_profile else 1
        
        # Profile
        profile = CompetitorProfile(
            competitor_id=competitor_id,
            mission=result.profile.mission,
            positioning=result.profile.positioning,
            products=result.profile.products,
            services=result.profile.services,
            audience=result.profile.target_audience,
            brand_voice=result.profile.brand_voice,
            content_style=result.profile.brand_personality,
            marketing_channels=[],
            content_formats=[],
            version=new_version
        )
        self.db.add(profile)
        
        # SWOT
        swot = CompetitorSWOT(
            competitor_id=competitor_id,
            strengths=result.swot.strengths,
            weaknesses=result.swot.weaknesses,
            opportunities=result.swot.opportunities,
            threats=result.swot.threats,
            version=new_version
        )
        self.db.add(swot)
        
        # Analysis Gaps
        analysis = CompetitorAnalysis(
            competitor_id=competitor_id,
            content_gap=result.gaps.content_gap,
            keyword_gap=result.gaps.keyword_gap,
            messaging_gap=result.gaps.messaging_gap,
            version=new_version
        )
        self.db.add(analysis)
        
        # Topics
        for topic in result.profile.topics:
            t = CompetitorTopic(competitor_id=competitor_id, topic_name=topic)
            self.db.add(t)
            
        # Keywords
        for kw in result.profile.keywords:
            k = CompetitorKeyword(competitor_id=competitor_id, keyword=kw)
            self.db.add(k)
            
        self.db.commit()
