from typing import Dict, Any
from models.analytics import PostMetrics

class AnalyticsNormalizer:
    """
    Normalizes provider-specific metrics into the standardized PostMetrics schema.
    """

    @staticmethod
    def normalize_linkedin_metrics(raw_data: Dict[str, Any]) -> PostMetrics:
        """
        Normalizes LinkedIn API response into PostMetrics.
        """
        social_actions = raw_data.get("socialActions", {})
        
        likes = social_actions.get("likesSummary", {}).get("count", 0)
        comments = social_actions.get("commentsSummary", {}).get("count", 0)
        shares = social_actions.get("sharesSummary", {}).get("count", 0)
        
        impressions = raw_data.get("impressions", 0)
        clicks = raw_data.get("clicks", 0)

        # Calculate a basic engagement rate
        total_engagements = likes + comments + shares + clicks
        engagement_rate = (total_engagements / impressions * 100) if impressions > 0 else 0.0

        return PostMetrics(
            impressions=impressions,
            likes=likes,
            comments=comments,
            shares=shares,
            clicks=clicks,
            engagement_rate=round(engagement_rate, 2)
        )

    @staticmethod
    def normalize(platform: str, raw_data: Dict[str, Any]) -> PostMetrics:
        """
        Dispatches to the correct normalizer based on platform.
        """
        platform = platform.lower()
        if platform == "linkedin":
            return AnalyticsNormalizer.normalize_linkedin_metrics(raw_data)
        # elif platform == "x":
        #     return AnalyticsNormalizer.normalize_x_metrics(raw_data)
        else:
            raise ValueError(f"No normalizer available for platform: {platform}")
