from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class SWOTAnalysis(BaseModel):
    strengths: List[str] = Field(description="Key strengths of the competitor based on their website and content")
    weaknesses: List[str] = Field(description="Weaknesses, poor positioning, or missing elements in their strategy")
    opportunities: List[str] = Field(description="Opportunities for OUR brand to capitalize on their weaknesses")
    threats: List[str] = Field(description="Threats this competitor poses to our market share")

class CompetitorProfileExtracted(BaseModel):
    mission: Optional[str] = Field(description="The core mission statement or purpose of the competitor")
    positioning: Optional[str] = Field(description="How they position themselves in the market")
    products: List[str] = Field(description="List of core products they offer")
    services: List[str] = Field(description="List of core services they offer")
    target_audience: List[str] = Field(description="Who they are targeting")
    brand_voice: Optional[str] = Field(description="Their writing style and brand voice")
    brand_personality: Optional[str] = Field(description="The persona they project (e.g., Corporate, Playful, Authoritative)")
    content_pillars: List[str] = Field(description="The main topics they consistently talk about")
    marketing_strategy: Optional[str] = Field(description="Summary of their overall marketing strategy")
    keywords: List[str] = Field(description="SEO or core keywords they target")
    topics: List[str] = Field(description="General topics discussed on their site")
    cta_strategy: Optional[str] = Field(description="How they handle Calls to Action (CTAs)")

class CompetitorGapAnalysis(BaseModel):
    content_gap: Optional[str] = Field(description="What content are they missing that we could create?")
    keyword_gap: Optional[str] = Field(description="Which keywords are they ranking for or ignoring?")
    messaging_gap: Optional[str] = Field(description="How is their messaging inferior or different from ours?")
    opportunities: List[str] = Field(description="Specific actionable opportunities derived from these gaps")

class CompetitorAIResponse(BaseModel):
    profile: CompetitorProfileExtracted
    swot: SWOTAnalysis
    gaps: CompetitorGapAnalysis
