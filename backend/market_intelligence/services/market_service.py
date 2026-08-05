from sqlalchemy.orm import Session
from ..repository.market_repository import MarketRepository
from ..collectors.competitor_collector import CompetitorCollector
from ..collectors.trend_collector import TrendCollector
from ..analyzers.competitor_analyzer import CompetitorAnalyzer
from ..schemas.market import CompetitorCreate
from models.competitor import Competitor
import logging

logger = logging.getLogger(__name__)

class MarketIntelligenceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MarketRepository(db)
        self.collector = CompetitorCollector()
        self.trend_collector = TrendCollector()
        self.analyzer = CompetitorAnalyzer(db)
        
    def add_competitor(self, business_id: int, data: CompetitorCreate) -> Competitor:
        return self.repo.add_competitor(business_id, data)
        
    def get_competitors(self, business_id: int):
        return self.repo.get_competitors(business_id)

    def delete_competitor(self, competitor_id: int) -> bool:
        return self.repo.delete_competitor(competitor_id)

    def refresh_competitor_background(self, competitor_id: int):
        """
        Background job entrypoint.
        """
        logger.info(f"Starting background refresh for competitor {competitor_id}")
        
        try:
            competitor = self.repo.get_competitor(competitor_id)
            if not competitor:
                logger.error(f"Competitor {competitor_id} not found")
                return
                
            # 1. Collect Raw Data
            url_to_collect = competitor.website or competitor.linkedin_url
            if url_to_collect:
                raw_data = self.collector.collect(url_to_collect)
                
                # 2. Store Raw Data
                from models.market import RawCompetitorPage
                for item in raw_data:
                    existing_page = self.db.query(RawCompetitorPage).filter(RawCompetitorPage.url == item.get("url")).first()
                    if existing_page:
                        existing_page.raw_text = item.get("raw_text", "")
                    else:
                        page = RawCompetitorPage(
                            competitor_id=competitor_id,
                            source_provider="website",
                            url=item.get("url"),
                            raw_text=item.get("raw_text", "")
                        )
                        self.db.add(page)
                self.db.commit()
            
            # 3. Analyze Data
            self.analyzer.analyze_competitor(competitor_id)
            
            logger.info(f"Completed background refresh for competitor {competitor_id}")
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to refresh competitor {competitor_id}: {e}")
            
    def refresh_trends_background(self):
        """
        Background job entrypoint for Trends
        """
        logger.info("Starting background refresh for all active trends")
        
        # 1. Get all active trend sources (topics)
        # For now, let's inject a default one if none exist for demo purposes
        sources = self.repo.get_trend_sources()
        if not sources:
            from market_intelligence.schemas.market import TrendSourceCreate
            from models.brand import BrandProfile
            
            # Fetch user's Brand Profile to seed personalized trends
            brand_profile = self.db.query(BrandProfile).first()
            if brand_profile and brand_profile.primary_industry:
                base_query = brand_profile.primary_industry
                sources = [
                    self.repo.add_trend_source(TrendSourceCreate(
                        name=f"{base_query} Trends", 
                        provider_type="google_news", 
                        url_or_query=base_query
                    ))
                ]
                # If they have topics, add the top topic
                if brand_profile.topics and len(brand_profile.topics) > 0:
                    top_topic = brand_profile.topics[0].topic_name
                    sources.append(self.repo.add_trend_source(TrendSourceCreate(
                        name=f"{top_topic} News", 
                        provider_type="google_news", 
                        url_or_query=top_topic
                    )))
            else:
                default_source = self.repo.add_trend_source(TrendSourceCreate(
                    name="LinkedIn Growth", 
                    provider_type="google_news", 
                    url_or_query="LinkedIn Growth Strategy"
                ))
                sources = [default_source]
            
        try:
            for source in sources:
                logger.info(f"Collecting trends for: {source.name} using {source.provider_type}")
                
                # 2. Collect Raw Data
                raw_data = self.trend_collector.collect(source.url_or_query, source.provider_type)
                
                # 3. Store Raw Data
                from models.market import RawNews
                for item in raw_data:
                    # Check if already exists by URL
                    existing = self.db.query(RawNews).filter(RawNews.url == item.get("url")).first()
                    if not existing and item.get("url"):
                        news = RawNews(
                            source_provider=source.provider_type,
                            url=item.get("url"),
                            published_date=item.get("published_date"),
                            raw_text=f"Title: {item.get('title')}\\nAuthor: {item.get('author')}\\nSummary: {item.get('raw_text')}"
                        )
                        self.db.add(news)
            
            self.db.commit()
            logger.info("Completed background refresh for trends")
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to refresh trends: {e}")
