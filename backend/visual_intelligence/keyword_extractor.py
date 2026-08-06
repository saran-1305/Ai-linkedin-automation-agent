import json
import logging

from content_analysis.providers.provider_factory import ProviderFactory

logger = logging.getLogger(__name__)


class KeywordExtractor:
    def __init__(self):
        self.provider = ProviderFactory.get_provider("ANALYSIS_LLM_MODEL")

    def extract(self, post_text: str) -> dict:
        prompt = f"""You select a stock photo search query for a LinkedIn post.
Read the post below and return strict JSON only, no markdown:
{{
  "keywords": ["2 to 4 short search terms, e.g. 'team meeting', 'data analytics'"],
  "visual_style": "one short phrase describing the mood/style, e.g. 'bright modern office'"
}}

POST:
{post_text}
"""
        response = self.provider.analyze(system_prompt=prompt, user_prompt="Return the JSON.", max_tokens=300)
        raw = response.get("raw_response", "")
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1]
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            data = json.loads(cleaned.strip())
            keywords = [k for k in (data.get("keywords") or []) if k]
            visual_style = data.get("visual_style") or ""
            return {"keywords": keywords, "visual_style": visual_style}
        except Exception as e:
            logger.warning(f"Failed to parse keyword extraction response, falling back to naive keywords: {e}")
            words = [w.strip(".,!?#") for w in post_text.split() if len(w) > 5][:3]
            return {"keywords": words or ["business"], "visual_style": ""}
