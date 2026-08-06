import logging

from sqlalchemy.orm import Session

from models.content import PlatformVariation
from .pexels_provider import PexelsProvider
from .keyword_extractor import KeywordExtractor

logger = logging.getLogger(__name__)


class VisualIntelligenceService:
    def __init__(self, db: Session):
        self.db = db
        self.pexels = PexelsProvider()
        self.extractor = KeywordExtractor()

    @staticmethod
    def _score_photo(photo: dict) -> float:
        # Pexels doesn't expose an engagement/quality metric; prefer larger,
        # landscape-oriented images as a simple, deterministic proxy for "best".
        width = photo.get("width") or 0
        height = photo.get("height") or 0
        is_landscape = width > height
        return (width * height) * (1.2 if is_landscape else 1.0)

    def select_image_for_variation(self, variation_id: int) -> PlatformVariation:
        variation = self.db.query(PlatformVariation).filter(PlatformVariation.id == variation_id).first()
        if not variation:
            raise ValueError(f"PlatformVariation {variation_id} not found")

        text = variation.body or variation.title or ""
        extraction = self.extractor.extract(text)
        query = ", ".join(extraction["keywords"]) or "business professional"

        results = self.pexels.search(query, per_page=5)
        if not results:
            logger.info(f"No Pexels results for variation {variation_id} (query='{query}'); leaving unattached.")
            variation.image_selection_reasoning = f"No image attached: no Pexels results for query '{query}'."
            self.db.commit()
            return variation

        best = max(results, key=self._score_photo)
        src = best.get("src", {}) or {}

        variation.image_url = src.get("large") or src.get("original")
        variation.image_thumbnail_url = src.get("medium")
        variation.image_source = "pexels"
        variation.image_external_id = str(best.get("id")) if best.get("id") is not None else None
        photographer = best.get("photographer")
        variation.image_attribution = f"Photo by {photographer} on Pexels" if photographer else "Photo via Pexels"
        variation.image_selection_reasoning = (
            f"Selected for style '{extraction['visual_style']}' using search query '{query}'."
        )
        self.db.commit()
        self.db.refresh(variation)
        return variation
