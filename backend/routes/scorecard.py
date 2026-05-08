from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from gemini import extract_scorecard
from supabase_client import get_supabase
from models.scorecard import ScorecardCreate, ScorecardResponse

logger = logging.getLogger(__name__)
router = APIRouter()


class ExtractScorecardRequest(BaseModel):
    raw_text: str
    candidate_name: str | None = None
    role: str | None = None


@router.post("/scorecard", response_model=ScorecardResponse)
async def extract_interview_scorecard(request: ExtractScorecardRequest):
    """Extract structured data from raw interview feedback."""
    if not request.raw_text or not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")
    
    try:
        logger.info(f"Extracting scorecard from {len(request.raw_text)} chars")
        extracted = extract_scorecard(request.raw_text)
        logger.info(f"✓ Scorecard extracted: {extracted.candidate_name} - Rating: {extracted.overall_rating}/5")
        
        # Override with provided values if any
        if request.candidate_name:
            extracted.candidate_name = request.candidate_name
        if request.role:
            extracted.role = request.role
        
        scorecard = ScorecardCreate(
            raw_text=request.raw_text,
            **extracted.model_dump()
        )
        
        logger.info(f"Inserting into database...")
        db = get_supabase()
        response = db.table("interview_scorecards").insert({
            "raw_text": scorecard.raw_text,
            "candidate_name": scorecard.candidate_name,
            "role": scorecard.role,
            "interviewer": scorecard.interviewer,
            "overall_rating": scorecard.overall_rating,
            "hire_recommendation": scorecard.hire_recommendation,
            "strengths": scorecard.strengths,
            "weaknesses": scorecard.weaknesses,
            "technical_score": scorecard.technical_score,
            "communication_score": scorecard.communication_score,
            "culture_fit_score": scorecard.culture_fit_score,
            "summary": scorecard.summary,
        })
        
        logger.info(f"Database response: {response.data}")
        
        if response.data and len(response.data) > 0:
            logger.info(f"✓ Saved to database with ID: {response.data[0].get('id')}")
            return ScorecardResponse(**response.data[0])
        else:
            # If database didn't return the data, construct response from extraction
            logger.warning(f"⚠ Database insert successful but no data returned, using extraction data")
            response_dict = {
                "raw_text": scorecard.raw_text,
                "candidate_name": scorecard.candidate_name,
                "role": scorecard.role,
                "interviewer": scorecard.interviewer,
                "overall_rating": scorecard.overall_rating,
                "hire_recommendation": scorecard.hire_recommendation,
                "strengths": scorecard.strengths,
                "weaknesses": scorecard.weaknesses,
                "technical_score": scorecard.technical_score,
                "communication_score": scorecard.communication_score,
                "culture_fit_score": scorecard.culture_fit_score,
                "summary": scorecard.summary,
                "id": None,  # ID will be set by database
                "extracted_at": None,
                "created_at": None,
            }
            return ScorecardResponse(**response_dict)
    
    except ValueError as e:
        logger.error(f"❌ Extraction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Request failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

