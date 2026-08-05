def sanitize_confidence(value):
    """Ensure confidence is between 0.0 and 1.0"""
    try:
        val = float(value)
        if val < 0.0: return 0.0
        if val > 1.0: return 1.0
        return val
    except (TypeError, ValueError):
        return 0.0

def normalize_text(value: str) -> str:
    """Basic text normalization for strings"""
    if not value:
        return ""
    return str(value).strip()
