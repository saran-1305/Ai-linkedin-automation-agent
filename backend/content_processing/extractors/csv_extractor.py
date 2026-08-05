import os
import pandas as pd

def extract_csv(file_path: str) -> tuple[str, dict]:
    """
    Extracts text from a CSV file.
    Reads every row, merges meaningful textual columns, ignores empty values.
    """
    if not file_path or not os.path.exists(file_path):
        raise ValueError(f"Invalid CSV file path: {file_path}")
        
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV: {str(e)}")
        
    text_blocks = []
    
    for _, row in df.iterrows():
        # Filter out NaNs and empty strings
        row_values = [str(val).strip() for val in row.values if pd.notna(val) and str(val).strip()]
        if row_values:
            text_blocks.append(" ".join(row_values))
            
    extracted_text = "\n\n".join(text_blocks)
    
    metadata = {
        "source_type": "csv",
        "row_count": len(df),
        "column_count": len(df.columns),
        "filename": os.path.basename(file_path)
    }
            
    return extracted_text, metadata
