import os
from pypdf import PdfReader

def extract_pdf(file_path: str) -> tuple[str, dict]:
    """
    Extracts text and metadata from a PDF file.
    """
    if not file_path or not os.path.exists(file_path):
        raise ValueError(f"Invalid PDF file path: {file_path}")
        
    reader = PdfReader(file_path)
    text_blocks = []
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_blocks.append(page_text)
            
    extracted_text = "\n\n".join(text_blocks)
    
    metadata = {
        "source_type": "pdf",
        "page_count": len(reader.pages),
        "filename": os.path.basename(file_path)
    }
    
    if reader.metadata:
        if reader.metadata.title:
            metadata["title"] = reader.metadata.title
        if reader.metadata.author:
            metadata["author"] = reader.metadata.author
            
    return extracted_text, metadata
