import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
parent_env = Path(__file__).resolve().parent.parent / ".env"
if parent_env.exists():
    load_dotenv(parent_env)

local_env = Path(__file__).resolve().parent / ".env"
if local_env.exists():
    load_dotenv(local_env)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found in environment!")
    exit(1)

print(f"Using API Key: {api_key[:10]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)

if response.status_code != 200:
    print(f"Error fetching models: {response.status_code}")
    print(response.text)
    exit(1)

data = response.json()
models = data.get("models", [])

print("\nAll Available Models supporting BidiGenerateContent / Live API:\n")
for m in models:
    name = m.get("name", "")
    actions = m.get("supportedGenerationMethods", [])
    if "bidiGenerateContent" in actions:
        print(f"- {name} (DisplayName: {m.get('displayName')})")
        print(f"  Description: {m.get('description')}")
        print(f"  Supported methods: {actions}\n")
