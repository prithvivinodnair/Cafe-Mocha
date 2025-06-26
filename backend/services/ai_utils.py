from dotenv import load_dotenv
import os
import re
from google import generativeai as genai


load_dotenv()
API_KEY = os.getenv("api_key")
genai.configure(api_key=API_KEY)

def generate_insights(title: str, snapshot: dict) -> str:
    prompt = f"""
You are a business analyst. Give 4 insights and 3 recommendations.
Snapshot:
{snapshot}

Insights:
- ...
Recommendations:
- Action: ...
  Why it matters: ...
  How to implement: ...
"""

    model = genai.GenerativeModel("gemini-1.5-flash-002")
    chat = model.start_chat()
    response = chat.send_message(prompt)
    return re.sub(r"◁think▷.*?◁/think▷", "", response.text, flags=re.DOTALL).strip()
