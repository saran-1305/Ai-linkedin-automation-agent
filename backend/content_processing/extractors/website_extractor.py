import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def extract_website(url: str) -> tuple[str, dict]:
    """
    Extracts main article text from a Website URL.
    Removes scripts, styles, nav, header, footer, etc.
    """
    if not url:
        raise ValueError("Invalid URL provided.")
        
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError(f"Invalid URL format: {url}")
        
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = httpx.get(url, headers=headers, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise ValueError(f"HTTP error occurred: {e.response.status_code}")
    except httpx.RequestError as e:
        raise ValueError(f"Request error occurred: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Extract Metadata before destruction
    title = soup.title.string if soup.title else ""
    meta_desc = ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag and desc_tag.get("content"):
        meta_desc = desc_tag["content"]
        
    # Remove unwanted elements
    for element in soup(["script", "style", "nav", "header", "footer", "aside", "form"]):
        element.decompose()
        
    # Heuristics: remove common ad/cookie/comment containers
    for element in soup.find_all(class_=lambda c: c and any(sub in c.lower() for sub in ["ad", "cookie", "comment", "sidebar", "popup", "banner"])):
        element.decompose()

    # Try to find the main article container, fallback to body
    main_content = soup.find("main") or soup.find("article") or soup.find("body") or soup
    
    clean_text = main_content.get_text(separator="\n\n", strip=True)
    
    metadata = {
        "source_type": "website",
        "url": url,
        "title": title.strip() if title else "",
        "meta_description": meta_desc.strip()
    }
            
    return clean_text, metadata
