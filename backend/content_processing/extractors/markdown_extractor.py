import os
from bs4 import BeautifulSoup
import markdown

def extract_markdown(file_path: str = None, raw_text: str = None) -> tuple[str, dict]:
    """
    Converts markdown to plain text by rendering HTML and stripping tags.
    """
    content = ""
    source_type = "markdown_paste"
    filename = None
    
    if raw_text is not None:
        content = raw_text
    elif file_path and os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        source_type = "markdown_file"
        filename = os.path.basename(file_path)
    else:
        raise ValueError("No valid markdown or file_path provided.")

    # Convert markdown to HTML
    html = markdown.markdown(content)
    
    # Strip HTML tags
    soup = BeautifulSoup(html, "html.parser")
    clean_text = soup.get_text(separator="\n\n")
    
    meta = {"source_type": source_type}
    if filename:
        meta["filename"] = filename
        
    return clean_text, meta
