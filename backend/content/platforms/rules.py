from typing import List, Dict, Any

class ValidationResult:
    def __init__(self, rule_name: str, is_valid: bool, feedback: str):
        self.rule_name = rule_name
        self.is_valid = is_valid
        self.feedback = feedback

def validate_linkedin(content: str) -> List[ValidationResult]:
    results = []
    # Rule 1: Not too short, not too long
    char_count = len(content)
    is_length_valid = 100 <= char_count <= 3000
    results.append(ValidationResult("Length Limit", is_length_valid, f"Length is {char_count}. Should be between 100 and 3000 chars."))
    
    # Rule 2: Spacing (check if there are paragraphs, not just one block)
    lines = content.split('\n')
    has_spacing = len([l for l in lines if l.strip() == '']) >= 1
    results.append(ValidationResult("Whitespace formatting", has_spacing, "Good spacing" if has_spacing else "Needs more line breaks for readability."))
    
    return results

def validate_x(content: str) -> List[ValidationResult]:
    results = []
    # Rule 1: Max 280 chars per tweet (assuming single tweet for now)
    char_count = len(content)
    is_length_valid = char_count <= 280
    results.append(ValidationResult("Character Limit", is_length_valid, f"Length is {char_count}. Must be under 280 chars."))
    return results

def validate_instagram(content: str) -> List[ValidationResult]:
    results = []
    # Rule 1: Max 2200 chars
    char_count = len(content)
    is_length_valid = char_count <= 2200
    results.append(ValidationResult("Character Limit", is_length_valid, f"Length is {char_count}. Must be under 2200 chars."))
    return results

def validate_blog(content: str) -> List[ValidationResult]:
    results = []
    # Rule 1: Needs headings
    has_headings = "#" in content
    results.append(ValidationResult("Heading Structure", has_headings, "Contains headings" if has_headings else "Missing Markdown headings for structure."))
    return results

def validate_newsletter(content: str) -> List[ValidationResult]:
    results = []
    # Basic newsletter checks
    has_greeting = "hi" in content.lower() or "hey" in content.lower() or "hello" in content.lower() or "dear" in content.lower()
    results.append(ValidationResult("Personal Greeting", has_greeting, "Contains greeting" if has_greeting else "Consider adding a personal greeting."))
    return results

def validate_platform_rules(platform_name: str, content: str) -> List[ValidationResult]:
    platform_name = platform_name.lower()
    if platform_name == "linkedin":
        return validate_linkedin(content)
    elif platform_name == "x" or platform_name == "twitter":
        return validate_x(content)
    elif platform_name == "instagram":
        return validate_instagram(content)
    elif platform_name == "blog":
        return validate_blog(content)
    elif platform_name == "newsletter":
        return validate_newsletter(content)
    return []
