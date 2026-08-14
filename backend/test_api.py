import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {bool(api_key)}")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")
    try:
        response = model.generate_content("Say hello")
        print("Success:", response.text)
    except Exception as e:
        print("Error:", e)
