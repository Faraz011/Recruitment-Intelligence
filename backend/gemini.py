import json
import logging
from groq import Groq
from config import GROQ_API_KEY
from models.job_listing import JobListingExtracted
from models.scorecard import ScorecardExtracted

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Groq client with llama-3.3-70b-versatile model
logger.info(f"Initializing Groq client...")
logger.info(f"GROQ_API_KEY present: {bool(GROQ_API_KEY)}")
logger.info(f"GROQ_API_KEY first 10 chars: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'NONE'}")

try:
    client = Groq(api_key=GROQ_API_KEY)
    logger.info(f"✓ Groq client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Groq client: {str(e)}")
    raise ValueError(f"Groq API initialization failed: {str(e)}")

JD_EXTRACTION_PROMPT = """You are a structured data extraction engine. Extract information from the job description 
below and return ONLY a valid JSON object with these exact keys:
role, company, location, seniority, employment_type, remote_type, 
salary_min, salary_max, salary_currency, skills_required (array), 
experience_years_min, experience_years_max.

Rules:
- If a field is not mentioned, use null (for numbers) or "Not mentioned" (for strings)
- skills_required must be an array of strings, max 15 items
- seniority must be one of: Junior, Mid, Senior, Lead, Executive, Not mentioned
- remote_type must be one of: Remote, Hybrid, On-site, Not mentioned
- employment_type must be one of: Full-time, Part-time, Contract, Internship, Not mentioned
- salary values must be annual integers in the stated currency, null if not found
- Return ONLY the JSON. No explanation, no markdown, no backticks.

Job Description:
{raw_text}"""

SCORECARD_EXTRACTION_PROMPT = """You are an interview evaluation engine. Extract and score information from the raw 
interview feedback below and return ONLY a valid JSON object with these exact keys:
candidate_name, role, interviewer, overall_rating, hire_recommendation,
strengths (array), weaknesses (array), technical_score, 
communication_score, culture_fit_score, summary.

Rules:
- overall_rating, technical_score, communication_score, culture_fit_score must be integers 1-5
- hire_recommendation must be one of: Strong Yes, Yes, Maybe, No, Strong No
- strengths and weaknesses must be arrays of strings, max 5 items each
- summary must be 2-3 sentences
- If a field cannot be determined, use null for numbers, "Not mentioned" for strings, [] for arrays
- Return ONLY the JSON. No explanation, no markdown, no backticks.

Interview Feedback:
{raw_text}"""


def extract_jd(raw_text: str) -> JobListingExtracted:
    """Extract structured job listing data from raw text using Groq Llama."""
    response_text = None
    try:
        logger.info(f"=== STARTING JD EXTRACTION ===")
        logger.info(f"Input text length: {len(raw_text)} chars")
        
        prompt = JD_EXTRACTION_PROMPT.format(raw_text=raw_text)
        logger.info(f"Prompt length: {len(prompt)} chars")
        logger.info(f"Calling Groq API (llama-3.3-70b-versatile)...")
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=1024
        )
        
        logger.info(f"✓ API Response received")
        logger.info(f"  Response object type: {type(response)}")
        logger.info(f"  Response object: {response}")
        logger.info(f"  Choices count: {len(response.choices)}")
        logger.info(f"  First choice: {response.choices[0]}")
        logger.info(f"  Message content type: {type(response.choices[0].message.content)}")
        
        if not response.choices or not response.choices[0].message.content:
            logger.error("❌ Empty response from Groq API")
            raise ValueError("Groq API returned empty response")
        
        response_text = response.choices[0].message.content.strip()
        logger.info(f"  Response length: {len(response_text)} chars")
        logger.info(f"  Response (first 500 chars): {response_text[:500]}")
        
        # Check if it's valid JSON
        if response_text.startswith("{"):
            logger.info("✓ Response starts with JSON marker")
        else:
            logger.warning(f"⚠ Response does not start with '{{', starts with: {response_text[:50]}")
        
        # Handle markdown code blocks
        if "```json" in response_text:
            logger.info("Found ```json markers, extracting JSON...")
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif response_text.startswith("```"):
            logger.info("Found ``` markers, extracting...")
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        if not response_text:
            logger.error("❌ Empty response after code block removal")
            raise ValueError("Response is empty after processing")
        
        logger.info(f"Cleaned response length: {len(response_text)} chars")
        logger.info(f"Cleaned response (first 300 chars): {response_text[:300]}")
        
        logger.info("Attempting JSON parse...")
        data = json.loads(response_text)
        logger.info(f"✓ Successfully parsed JSON with {len(data)} fields")
        logger.info(f"Parsed data: {data}")
        
        result = JobListingExtracted(**data)
        logger.info(f"✓ JD Extraction complete: {result.role} at {result.company}")
        return result
    
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse error at position {e.pos}: {str(e)}")
        logger.error(f"   Response was: {response_text}")
        raise ValueError(
            f"Failed to parse Groq response as JSON: {str(e)}\n"
            f"Raw response:\n{response_text}"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        raise ValueError(f"JD extraction failed: {str(e)}")


def extract_scorecard(raw_text: str) -> ScorecardExtracted:
    """Extract structured interview scorecard data from raw text using Groq Llama."""
    response_text = None
    try:
        logger.info(f"Starting scorecard extraction with {len(raw_text)} chars of text")
        
        prompt = SCORECARD_EXTRACTION_PROMPT.format(raw_text=raw_text)
        logger.info(f"Prompt length: {len(prompt)}")
        
        logger.info("Calling Groq API with llama-3.3-70b-versatile...")
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=1024
        )
        
        logger.info(f"✓ Groq response received")
        logger.info(f"  - Tokens used: {response.usage.completion_tokens}")
        logger.info(f"  - Stop reason: {response.choices[0].finish_reason}")
        
        if not response.choices or not response.choices[0].message.content:
            logger.error("❌ Empty response from Groq API")
            raise ValueError("Groq API returned empty response")
        
        response_text = response.choices[0].message.content.strip()
        logger.info(f"  - Response length: {len(response_text)} chars")
        logger.info(f"  - First 200 chars: {response_text[:200]}")
        
        # Handle markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        if not response_text:
            logger.error("❌ Empty response after code block removal")
            raise ValueError("Response is empty after processing")
        
        logger.info(f"Cleaned response (first 150 chars): {response_text[:150]}")
        data = json.loads(response_text)
        logger.info(f"✓ Successfully parsed JSON with {len(data)} fields")
        return ScorecardExtracted(**data)
    
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse error at position {e.pos}: {str(e)}")
        logger.error(f"   Response text: {response_text}")
        raise ValueError(
            f"Failed to parse Groq response as JSON: {str(e)}\n"
            f"Raw response:\n{response_text}"
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        raise ValueError(f"Scorecard extraction failed: {str(e)}")
