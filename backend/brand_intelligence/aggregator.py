from sqlalchemy.orm import Session
from models.analysis import DocumentAnalysis
from models.business import BusinessProfile
from collections import defaultdict
from typing import Dict, Any

class BrandAggregator:
    def __init__(self, db: Session):
        self.db = db

    def aggregate_data(self) -> Dict[str, Any]:
        """
        Gathers all normalized document analyses and aggregates them into a single data structure.
        """
        analyses = self.db.query(DocumentAnalysis).all()
        
        aggregated = {
            "total_documents": len(analyses),
            "topics": [],
            "keywords": [],
            "pillars": [],
            "ctas": [],
            "audiences": [],
            "tones": [],
            "styles": []
        }
        
        from collections import Counter
        
        topics_counter = Counter()
        keywords_counter = Counter()
        pillars_counter = Counter()
        ctas_counter = Counter()
        audiences_counter = Counter()
        tones_counter = Counter()
        styles_counter = Counter()
        
        if not analyses:
            return aggregated
            
        for doc in analyses:
            for t in doc.topics:
                topics_counter[(t.topic_name, t.topic_type)] += 1
            for k in doc.keywords:
                keywords_counter[(k.keyword, k.keyword_type)] += 1
            for p in doc.pillars:
                pillars_counter[p.pillar_name] += 1
            for c in doc.ctas:
                ctas_counter[(c.cta_text, c.cta_type)] += 1
            for a in doc.audiences:
                audiences_counter[a.audience_segment] += 1
            for tone in doc.tones:
                tones_counter[tone.tone_name] += 1
            for s in doc.styles:
                styles_counter[s.style_name] += 1

        # Only take top 25 items for each category to keep prompt size < 6000 tokens for Groq limits
        aggregated["topics"] = [{"name": name, "type": ttype, "frequency": count} for ((name, ttype), count) in topics_counter.most_common(25)]
        aggregated["keywords"] = [{"keyword": kw, "type": ktype, "frequency": count} for ((kw, ktype), count) in keywords_counter.most_common(25)]
        aggregated["pillars"] = [{"name": name, "frequency": count} for (name, count) in pillars_counter.most_common(15)]
        aggregated["ctas"] = [{"text": text, "type": ctype, "frequency": count} for ((text, ctype), count) in ctas_counter.most_common(15)]
        aggregated["audiences"] = [{"segment": name, "frequency": count} for (name, count) in audiences_counter.most_common(15)]
        aggregated["tones"] = [{"tone": name, "frequency": count} for (name, count) in tones_counter.most_common(15)]
        aggregated["styles"] = [{"style": name, "frequency": count} for (name, count) in styles_counter.most_common(15)]
                
        return aggregated

    def get_business_profile(self) -> dict:
        profile = self.db.query(BusinessProfile).first()
        if not profile:
            return {}
        return {
            "company_name": profile.company_name,
            "industry": profile.industry,
            "description": profile.description,
            "products": profile.products,
            "services": profile.services,
            "usp": profile.usp,
            "primary_audience": profile.primary_audience,
            "marketing_goals": profile.marketing_goals,
            "brand_voice": profile.brand_voice
        }
