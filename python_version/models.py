"""API client setup for OpenAI/Interfaze"""

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

interfaze = OpenAI(
    api_key=os.getenv("INTERFAZE_API_KEY"),
    base_url="https://api.interfaze.ai/v1",
)

openai = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.openai.com/v1",
)

