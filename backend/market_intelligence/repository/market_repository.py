from sqlalchemy.orm import Session
from models.competitor import Competitor, CompetitorProfile
from models.market import TrendSource, TrendTopic, RawArticle, RawCompetitorPage
from market_intelligence.schemas.market import CompetitorCreate, TrendSourceCreate

class MarketRepository:
    def __init__(self, db: Session):
        self.db = db

    # ==========================
    # COMPETITORS
    # ==========================
    def add_competitor(self, business_id: int, data: CompetitorCreate) -> Competitor:
        db_obj = Competitor(
            business_id=business_id,
            company_name=data.company_name,
            website=str(data.website) if data.website else None,
            linkedin_url=str(data.linkedin_url) if data.linkedin_url else None,
            twitter_url=str(data.twitter_url) if data.twitter_url else None,
            youtube_url=str(data.youtube_url) if data.youtube_url else None,
            blog_url=str(data.blog_url) if data.blog_url else None,
            description=data.description,
            industry=data.industry,
            priority=data.priority,
            notes=data.notes
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_competitors(self, business_id: int) -> list[Competitor]:
        competitors = self.db.query(Competitor).filter(Competitor.business_id == business_id).all()
        for comp in competitors:
            # Attach latest manually for Pydantic to read
            comp.latest_profile = next((p for p in sorted(comp.profiles, key=lambda x: x.version, reverse=True)), None)
            comp.latest_swot = next((s for s in sorted(comp.swot, key=lambda x: x.version, reverse=True)), None)
            comp.latest_analysis = next((a for a in sorted(comp.analyses, key=lambda x: x.version, reverse=True)), None)
        return competitors
        
    def get_competitor(self, competitor_id: int) -> Competitor:
        comp = self.db.query(Competitor).filter(Competitor.id == competitor_id).first()
        if comp:
            comp.latest_profile = next((p for p in sorted(comp.profiles, key=lambda x: x.version, reverse=True)), None)
            comp.latest_swot = next((s for s in sorted(comp.swot, key=lambda x: x.version, reverse=True)), None)
            comp.latest_analysis = next((a for a in sorted(comp.analyses, key=lambda x: x.version, reverse=True)), None)
        return comp
        
    def delete_competitor(self, competitor_id: int) -> bool:
        comp = self.db.query(Competitor).filter(Competitor.id == competitor_id).first()
        if comp:
            self.db.delete(comp)
            self.db.commit()
            return True
        return False

    # ==========================
    # TRENDS
    # ==========================
    def get_trend_sources(self) -> list[TrendSource]:
        return self.db.query(TrendSource).filter(TrendSource.is_active == 1).all()
        
    def add_trend_source(self, data: TrendSourceCreate) -> TrendSource:
        db_obj = TrendSource(**data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
        
    def get_trend_topics(self) -> list[TrendTopic]:
        return self.db.query(TrendTopic).all()

    # ==========================
    # RAW DATA STORAGE
    # ==========================
    def save_raw_competitor_page(self, comp_id: int, provider: str, raw_text: str, url: str = None):
        page = RawCompetitorPage(
            competitor_id=comp_id,
            source_provider=provider,
            raw_text=raw_text,
            url=url
        )
        self.db.add(page)
        self.db.commit()
