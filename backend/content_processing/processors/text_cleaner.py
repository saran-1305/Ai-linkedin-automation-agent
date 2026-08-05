import re

def clean_text(raw_text: str) -> str:
    """
    Generic text cleaning pipeline.
    Tasks:
    - Normalize whitespace and line endings.
    - Remove duplicated blank lines.
    - Remove invisible characters.
    - Trim spaces.
    """
    if not raw_text:
        return ""
        
    # Normalize line endings to standard \n
    text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Remove invisible zero-width spaces and control characters (excluding standard whitespace)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    text = text.replace('\u200b', '')
    
    # Collapse multiple spaces (but not newlines) into a single space
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Collapse 3+ newlines into exactly 2 newlines (paragraph separator)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Trim leading/trailing whitespace
    return text.strip()
