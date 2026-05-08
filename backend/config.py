import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not set in environment")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL not set in environment")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY not set in environment")

# API Configuration
API_PREFIX = "/api"
