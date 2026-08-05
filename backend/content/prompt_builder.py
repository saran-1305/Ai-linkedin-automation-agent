from .schemas import ContentBriefModel
import json

class PromptBuilder:
    def build_generation_prompt(self, brief: ContentBriefModel, schema_json: dict) -> str:
        prompt = f"""You are an elite Senior Content Strategist and Expert Copywriter.
Your task is to write a highly engaging, production-ready piece of content based strictly on the provided Content Brief.

### CONTENT BRIEF
Primary Goal: {brief.primary_goal}
Core Message: {brief.core_message}
Target Audience: {brief.target_audience}
Desired Emotion: {brief.desired_emotion}
Key Takeaway: {brief.key_takeaway}
CTA Objective: {brief.cta_objective}
Writing Style: {brief.writing_style}
Platform Rules: {brief.platform_requirements}

### WRITING RULES
1. HOOK: Generate 3 internal hook ideas based on Curiosity, Emotion, and Value. Select the strongest one for the final output.
2. BODY: Deliver one clear core message using natural storytelling. Keep paragraphs concise (1-2 sentences).
3. CTA: End with a strong, single action-oriented CTA.
4. TONE: Be authentic, conversational, and credible. Maintain the Writing Style strictly.
5. RESTRICTIONS:
   - NO emojis unless absolutely necessary for the brand tone.
   - NO clichés or buzzwords (e.g., "In today's fast-paced world", "Unlock your potential").
   - NO AI-sounding phrases. Write like a human expert.

### OUTPUT REQUIREMENTS
You must output a strictly valid JSON object adhering to this schema. DO NOT wrap it in Markdown formatting (no ```json).
Schema:
{json.dumps(schema_json)}
"""
        return prompt

    def build_review_prompt(self, brief: ContentBriefModel, draft_json: dict) -> str:
        prompt = f"""You are an elite Content Quality Editor.
Critique the following drafted content against its original brief and professional writing standards.

### CONTENT BRIEF
Core Message: {brief.core_message}
Writing Style: {brief.writing_style}
Platform: {brief.platform_requirements}

### DRAFTED CONTENT
{json.dumps(draft_json, indent=2)}

### TASK
Evaluate the draft. Does it sound like an AI wrote it? Does it use clichés? Is the hook weak?
Rewrite the content to dramatically improve human authenticity, conciseness, and emotional impact.
Return the improved draft in the exact same JSON format as the original. DO NOT wrap it in Markdown formatting.
"""
        return prompt
