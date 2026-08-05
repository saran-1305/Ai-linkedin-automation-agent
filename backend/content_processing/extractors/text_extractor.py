import os

def extract_text(file_path: str = None, raw_text: str = None) -> tuple[str, dict]:
    """
    Extracts text from a pure text paste or text file.
    Returns (extracted_text, metadata_dict)
    """
    if raw_text is not None:
        return raw_text, {"source_type": "paste"}
        
    if file_path and os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        return content, {"source_type": "text_file", "filename": os.path.basename(file_path)}
        
    raise ValueError("No valid text or file_path provided for extraction.")
