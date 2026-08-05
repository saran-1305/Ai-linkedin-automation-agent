import os
from content_processing.extractors import (
    pdf_extractor,
    docx_extractor,
    markdown_extractor,
    csv_extractor,
    website_extractor,
    text_extractor,
    pptx_extractor
)

def extract_content(source: str, file_path: str = None, url: str = None, raw_text: str = None) -> tuple[str, dict]:
    """
    Routes the input to the appropriate extractor based on the source type.
    Supported sources: PDF, DOCX, Markdown, CSV, Website URL, Paste Text
    Returns (extracted_text, metadata)
    """
    
    if source == 'PDF':
        return pdf_extractor.extract_pdf(file_path)
        
    elif source == 'DOCX':
        return docx_extractor.extract_docx(file_path)
        
    elif source == 'Markdown':
        return markdown_extractor.extract_markdown(file_path=file_path, raw_text=raw_text)
        
    elif source == 'CSV':
        return csv_extractor.extract_csv(file_path)
        
    elif source == 'Website URL':
        return website_extractor.extract_website(url)
        
    elif source == 'Paste Text':
        return text_extractor.extract_text(file_path=file_path, raw_text=raw_text)
        
    elif source == 'PPTX':
        return pptx_extractor.extract_pptx(file_path)
        
    else:
        raise ValueError(f"Unsupported extraction source: {source}")
