import sys
from market_intelligence.providers.website_provider import WebsiteProvider

try:
    provider = WebsiteProvider()
    data = provider.collect_competitor_data("https://flipkart.com/")
    print(f"Success! Found {len(data)} items.")
    if data:
        print("Keys:", data[0].keys())
        print("Text length:", len(data[0]['raw_text']))
except Exception as e:
    print("ERROR:", e)
