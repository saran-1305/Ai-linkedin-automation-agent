import langdetect
from langdetect import detect_langs

def detect_language(text: str) -> str:
    """
    Detects the dominant language of the text.
    Returns ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de').
    Returns 'unknown' if detection fails.
    """
    if not text or len(text.strip()) < 10:
        return "unknown"
        
    try:
        # Detect probability of languages
        langs = detect_langs(text)
        if langs:
            # Return the highest probability language
            return langs[0].lang
    except Exception:
        pass
        
    return "unknown"
