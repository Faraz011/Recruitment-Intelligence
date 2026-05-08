from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from gemini import extract_jd
from supabase_client import get_supabase
from models.job_listing import JobListingCreate, JobListingResponse

logger = logging.getLogger(__name__)
router = APIRouter()


class ExtractJDRequest(BaseModel):
    raw_text: str
    source_url: str | None = None


@router.post("/extract", response_model=JobListingResponse)
async def extract_job_description(request: ExtractJDRequest):
    """Extract structured data from a raw job description."""
    if not request.raw_text or not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")
    
    try:
        logger.info(f"Extracting JD from {len(request.raw_text)} chars")
        extracted = extract_jd(request.raw_text)
        logger.info(f"✓ JD extracted successfully: {extracted.role} at {extracted.company}")
        
        job_listing = JobListingCreate(
            raw_text=request.raw_text,
            source_url=request.source_url,
            **extracted.model_dump()
        )
        
        logger.info(f"Inserting into database...")
        db = get_supabase()
        response = db.table("job_listings").insert(
            {
                "raw_text": job_listing.raw_text,
                "role": job_listing.role,
                "company": job_listing.company,
                "location": job_listing.location,
                "seniority": job_listing.seniority,
                "employment_type": job_listing.employment_type,
                "remote_type": job_listing.remote_type,
                "salary_min": job_listing.salary_min,
                "salary_max": job_listing.salary_max,
                "salary_currency": job_listing.salary_currency,
                "skills_required": job_listing.skills_required,
                "experience_years_min": job_listing.experience_years_min,
                "experience_years_max": job_listing.experience_years_max,
                "source_url": job_listing.source_url,
            }
        )
        
        logger.info(f"Database response: {response.data}")
        
        if response.data and len(response.data) > 0:
            logger.info(f"✓ Saved to database with ID: {response.data[0].get('id')}")
            return JobListingResponse(**response.data[0])
        else:
            # If database didn't return the data, construct response from extraction
            logger.warning(f"⚠ Database insert successful but no data returned, using extraction data")
            # For now, return a response without database ID (we'll need to fetch it separately)
            response_dict = {
                "raw_text": job_listing.raw_text,
                "role": job_listing.role,
                "company": job_listing.company,
                "location": job_listing.location,
                "seniority": job_listing.seniority,
                "employment_type": job_listing.employment_type,
                "remote_type": job_listing.remote_type,
                "salary_min": job_listing.salary_min,
                "salary_max": job_listing.salary_max,
                "salary_currency": job_listing.salary_currency,
                "skills_required": job_listing.skills_required,
                "experience_years_min": job_listing.experience_years_min,
                "experience_years_max": job_listing.experience_years_max,
                "source_url": job_listing.source_url,
                "id": None,  # ID will be set by database
                "extracted_at": None,
                "created_at": None,
            }
            return JobListingResponse(**response_dict)
    
    except ValueError as e:
        logger.error(f"❌ Extraction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Request failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

