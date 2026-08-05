from sqlalchemy.orm import Session
from models.content import GeneratedContent
from models.execution import ContentSlot, WeeklyPlan
from models.strategy import StrategyPlan, ExecutiveSummary, CampaignPlan
from models.business import BusinessProfile
from models.brand import BrandProfile
from .schemas import ContentBriefModel
import json

class ContextBuilder:
    def __init__(self, db: Session):
        self.db = db

    def build_content_brief(self, slot_id: int) -> ContentBriefModel:
        slot = self.db.query(ContentSlot).filter(ContentSlot.id == slot_id).first()
        if not slot:
            raise ValueError(f"Content Slot {slot_id} not found.")

        plan = self.db.query(WeeklyPlan).filter(WeeklyPlan.id == slot.weekly_plan_id).first()
        business = self.db.query(BusinessProfile).filter(BusinessProfile.id == plan.business_id).first()
        brand = self.db.query(BrandProfile).filter(BrandProfile.business_id == plan.business_id).first()
        
        # Strategy context
        strategy = self.db.query(StrategyPlan).filter(StrategyPlan.id == plan.strategy_id).first()
        campaign = self.db.query(CampaignPlan).filter(
            CampaignPlan.strategy_plan_id == strategy.id,
            CampaignPlan.campaign_name == slot.campaign
        ).first()

        # Voice context
        from models.brand import BrandVoice
        voices = self.db.query(BrandVoice).filter(BrandVoice.brand_profile_id == brand.id).all() if brand else []
        brand_tone = ", ".join([v.characteristic for v in voices]) if voices else "Professional"

        brief = ContentBriefModel(
            primary_goal=slot.objective or (campaign.campaign_goal if campaign else "Engage audience"),
            core_message=slot.topic,
            target_audience=slot.audience,
            desired_emotion="Professional yet engaging, driving curiosity and authority.",
            key_takeaway=f"Understand the value of {slot.theme} within the context of {slot.campaign}.",
            cta_objective=slot.content_generator_input.get("cta", "Encourage interaction and discussion.") if slot.content_generator_input else "Drive engagement",
            writing_style=brand_tone,
            platform_requirements=f"Optimized for {slot.platform}. Format: {slot.content_type}."
        )

        return brief
