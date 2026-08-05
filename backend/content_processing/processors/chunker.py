import re

def chunk_text(text: str, target_word_count: int = 500) -> list[dict]:
    """
    Splits text into logical chunks of roughly `target_word_count` words.
    Does NOT split in the middle of paragraphs.
    """
    if not text:
        return []
        
    paragraphs = text.split('\n\n')
    chunks = []
    
    current_chunk = []
    current_word_count = 0
    current_start_offset = 0
    
    global_offset = 0
    
    for para in paragraphs:
        para_word_count = len(re.findall(r'\b\w+\b', para))
        para_length_chars = len(para)
        
        # If adding this paragraph exceeds target significantly (e.g. +20%), push current chunk
        if current_word_count + para_word_count > target_word_count * 1.2 and current_chunk:
            chunk_text_content = "\n\n".join(current_chunk)
            chunks.append({
                "text_content": chunk_text_content,
                "word_count": current_word_count,
                "start_offset": current_start_offset,
                "end_offset": current_start_offset + len(chunk_text_content),
                # A rough token estimate for LLMs (words * 1.3)
                "token_estimate": int(current_word_count * 1.3)
            })
            current_chunk = []
            current_word_count = 0
            # Next chunk starts after current global offset
            # +2 accounts for the '\n\n' that joins paragraphs usually
            current_start_offset = global_offset
            
        current_chunk.append(para)
        current_word_count += para_word_count
        global_offset += para_length_chars + 2 # +2 for '\n\n'
        
    # Append remaining chunk
    if current_chunk:
        chunk_text_content = "\n\n".join(current_chunk)
        chunks.append({
            "text_content": chunk_text_content,
            "word_count": current_word_count,
            "start_offset": current_start_offset,
            "end_offset": current_start_offset + len(chunk_text_content),
            "token_estimate": int(current_word_count * 1.3)
        })
        
    return chunks
