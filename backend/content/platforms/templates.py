from pydantic import BaseModel
from typing import Dict, Any

class PlatformTemplate(BaseModel):
    name: str
    system_prompt: str
    tone_guidelines: str
    structure_guidelines: str
    hashtag_strategy: str
    cta_style: str

PLATFORM_TEMPLATES: Dict[str, PlatformTemplate] = {
    "LinkedIn": PlatformTemplate(
        name="LinkedIn",
        system_prompt="You are an expert LinkedIn ghostwriter for B2B professionals. Adapt the core blueprint into a highly engaging LinkedIn post.",
        tone_guidelines="Professional, insightful, thought-provoking, and slightly conversational. Use storytelling to share lessons.",
        structure_guidelines="Strong hook (1-2 sentences). Generous use of whitespace (short paragraphs of 1-3 lines). Clear takeaway before the CTA.",
        hashtag_strategy="Use 3-5 highly relevant industry hashtags at the very bottom.",
        cta_style="Encourage discussion in the comments (e.g., 'What are your thoughts on this?')."
    ),
    "X": PlatformTemplate(
        name="X",
        system_prompt="You are a viral X (Twitter) thread writer. Adapt the core blueprint into a concise, punchy post or thread.",
        tone_guidelines="Direct, opinionated, fast-paced, and punchy. Avoid corporate jargon.",
        structure_guidelines="Must start with a bold hook. Use bullet points if listing items. Keep it under 280 characters for a single tweet.",
        hashtag_strategy="0-2 hashtags maximum. Avoid looking spammy.",
        cta_style="Action-oriented (e.g., 'Follow for more', 'RT if you agree')."
    ),
    "Instagram": PlatformTemplate(
        name="Instagram",
        system_prompt="You are a top Instagram strategist. Adapt the core blueprint into a visually complementary and emotional caption.",
        tone_guidelines="Conversational, emotional, relatable, and authentic. Use emojis naturally.",
        structure_guidelines="Catchy first line (visible before 'read more'). Break up text with emojis and line breaks.",
        hashtag_strategy="Place a block of 10-15 relevant hashtags at the bottom.",
        cta_style="Action-oriented for IG (e.g., 'Save this post', 'Link in bio', 'Double tap')."
    ),
    "Blog": PlatformTemplate(
        name="Blog",
        system_prompt="You are an SEO content writer. Adapt the core blueprint into a structured, educational blog post outline or short article.",
        tone_guidelines="Educational, authoritative, and comprehensive.",
        structure_guidelines="Use H1, H2, H3 headings. Include an introduction, body sections, and a conclusion.",
        hashtag_strategy="None. Use SEO keywords naturally in the text instead.",
        cta_style="Direct reader to another article, a product page, or a newsletter signup."
    ),
    "Newsletter": PlatformTemplate(
        name="Newsletter",
        system_prompt="You are an expert email marketer. Adapt the blueprint into a personal, relationship-building email newsletter.",
        tone_guidelines="Personal, warm, direct to the reader (use 'you'), and relationship-driven.",
        structure_guidelines="Catchy subject-line style opening. Conversational flow. Short paragraphs. Clear single focus.",
        hashtag_strategy="None.",
        cta_style="Direct link click (e.g., 'Read the full guide here', 'Reply and let me know')."
    )
}
