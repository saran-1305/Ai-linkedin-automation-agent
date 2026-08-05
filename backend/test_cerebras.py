import os
from litellm import completion

api_key = "csk-wwvexxxyk6vpwfp42t9rt34t9hd54tef9t84pvkn48f4jjv9"
os.environ["CEREBRAS_API_KEY"] = api_key

models_to_test = [
    "cerebras/llama3.1-8b",
    "cerebras/llama-3.1-8b",
    "cerebras/llama3.1-70b",
    "cerebras/llama3.3-70b",
    "cerebras/llama-3.3-70b"
]

for model in models_to_test:
    try:
        print(f"Testing {model}...")
        response = completion(
            model=model,
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print(f"SUCCESS with {model}")
    except Exception as e:
        print(f"FAILED with {model}: {e}")
