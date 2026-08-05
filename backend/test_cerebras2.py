import requests

api_key = "csk-wwvexxxyk6vpwfp42t9rt34t9hd54tef9t84pvkn48f4jjv9"
url = "https://api.cerebras.ai/v1/models"
headers = {
    "Authorization": f"Bearer {api_key}"
}

try:
    response = requests.get(url, headers=headers)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text)
except Exception as e:
    print("ERROR:", e)
