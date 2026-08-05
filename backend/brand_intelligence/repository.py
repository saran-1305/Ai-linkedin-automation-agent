from sqlalchemy.orm import Session
from models.business import BusinessProfile
from models.brand import (
    BrandProfile, BrandPersonality, BrandVoice, BrandVocabulary,
    BrandContentPillar, BrandTargetAudience, BrandCtaPattern,
    BrandTopic, BrandKeyword, BrandStorytellingPattern,
    BrandPostingPattern, BrandConfidenceScore, BrandMemoryVersion
)
from .schemas import BrandIntelligenceOutput
from datetime import datetime

class BrandRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_brand_intelligence(self, business_id: int, data: BrandIntelligenceOutput, version_info: dict) -> BrandProfile:
        try:
            # Delete existing BrandProfile for this business (which cascades deletes to children)
            existing_profile = self.db.query(BrandProfile).filter(BrandProfile.business_id == business_id).first()
            if existing_profile:
                self.db.delete(existing_profile)
                self.db.flush()

            # 1. Create main profile
            profile = BrandProfile(
                business_id=business_id,
                business_summary=data.brand_profile.business_summary,
                core_mission=data.brand_profile.core_mission,
                primary_industry=data.brand_profile.primary_industry,
                primary_expertise=data.brand_profile.primary_expertise,
                primary_services=data.brand_profile.primary_services,
                unique_selling_points=data.brand_profile.unique_selling_points,
                value_proposition=data.brand_profile.value_proposition,
                communication_objectives=data.brand_profile.communication_objectives,
                brand_vision=data.brand_profile.brand_vision,
                brand_positioning=data.brand_profile.brand_positioning,
            )
            self.db.add(profile)
            self.db.flush()

            # 2. Add all related entities
            for p in data.personalities:
                self.db.add(BrandPersonality(brand_profile_id=profile.id, trait=p.trait, confidence=p.confidence))
            for v in data.voices:
                self.db.add(BrandVoice(brand_profile_id=profile.id, characteristic=v.characteristic, confidence=v.confidence))
            for v in data.vocabularies:
                self.db.add(BrandVocabulary(brand_profile_id=profile.id, word_or_phrase=v.word_or_phrase, category=v.category, frequency=v.frequency))
            for cp in data.pillars:
                self.db.add(BrandContentPillar(brand_profile_id=profile.id, pillar_name=cp.pillar_name, pillar_type=cp.pillar_type, confidence=cp.confidence, frequency=cp.frequency))
            for a in data.audiences:
                self.db.add(BrandTargetAudience(brand_profile_id=profile.id, audience_segment=a.audience_segment, audience_type=a.audience_type, confidence=a.confidence))
            for c in data.cta_patterns:
                self.db.add(BrandCtaPattern(brand_profile_id=profile.id, cta_text=c.cta_text, frequency=c.frequency))
            for t in data.topics:
                self.db.add(BrandTopic(brand_profile_id=profile.id, topic_name=t.topic_name, topic_type=t.topic_type, frequency=t.frequency, rank=t.rank))
            for k in data.keywords:
                self.db.add(BrandKeyword(brand_profile_id=profile.id, keyword=k.keyword, keyword_type=k.keyword_type, frequency=k.frequency))
            for sp in data.storytelling_patterns:
                self.db.add(BrandStorytellingPattern(brand_profile_id=profile.id, pattern_name=sp.pattern_name, frequency=sp.frequency))
            
            if data.posting_patterns:
                pp = data.posting_patterns
                self.db.add(BrandPostingPattern(
                    brand_profile_id=profile.id,
                    avg_sentence_length=pp.avg_sentence_length,
                    paragraph_structure=pp.paragraph_structure,
                    vocabulary_complexity=pp.vocabulary_complexity,
                    storytelling_preference=pp.storytelling_preference,
                    educational_vs_promotional_ratio=pp.educational_vs_promotional_ratio,
                    technical_depth=pp.technical_depth,
                    reading_difficulty=pp.reading_difficulty,
                    content_strategy=pp.content_strategy,
                    strategy_confidence=pp.strategy_confidence
                ))
                
            for cs in data.confidence_scores:
                self.db.add(BrandConfidenceScore(brand_profile_id=profile.id, category=cs.category, current_confidence=cs.current_confidence, knowledge_coverage=cs.knowledge_coverage, data_completeness=cs.data_completeness))

            # 3. Create version record
            self.db.add(BrandMemoryVersion(
                brand_profile_id=profile.id,
                version=version_info["version"],
                document_count=version_info["document_count"],
                analysis_count=version_info["analysis_count"],
                model_name=version_info["model_name"],
                prompt_version=version_info["prompt_version"],
                generation_duration=version_info["generation_duration"]
            ))

            self.db.commit()
            return profile

        except Exception as e:
            self.db.rollback()
            raise e
