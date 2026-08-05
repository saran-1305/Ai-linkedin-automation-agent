import re

def generate_statistics(text: str) -> dict:
    """
    Generates content statistics:
    - Character Count
    - Word Count
    - Sentence Count
    - Paragraph Count
    - Estimated Reading Time
    """
    if not text:
        return {
            "char_count": 0,
            "word_count": 0,
            "sentence_count": 0,
            "paragraph_count": 0,
            "estimated_read_time": 0
        }
        
    char_count = len(text)
    
    # Words
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    
    # Sentences (rough estimate based on punctuation)
    sentences = re.split(r'[.!?]+', text)
    sentence_count = len([s for s in sentences if s.strip()])
    
    # Paragraphs (split by double newline)
    paragraphs = text.split('\n\n')
    paragraph_count = len([p for p in paragraphs if p.strip()])
    
    # Estimated Reading Time (Avg reading speed: 238 words per minute)
    read_time = max(1, round(word_count / 238)) if word_count > 0 else 0
    
    return {
        "char_count": char_count,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "estimated_read_time": read_time
    }
