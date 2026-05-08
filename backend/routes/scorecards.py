from fastapi import APIRouter, HTTPException, Query
from supabase_client import get_supabase

router = APIRouter()


@router.get("/scorecards")
async def get_scorecards(
    candidate_name: str | None = Query(None),
    hire_recommendation: str | None = Query(None),
    role: str | None = Query(None),
    page: int = Query(1, ge=1),
):
    """Get paginated interview scorecards with optional filters."""
    try:
        db = get_supabase()
        
        query = db.table("interview_scorecards").select("*", count="exact")
        
        if candidate_name:
            query = query.ilike("candidate_name", f"%{candidate_name}%")
        if hire_recommendation and hire_recommendation != "All":
            query = query.eq("hire_recommendation", hire_recommendation)
        if role:
            query = query.ilike("role", f"%{role}%")
        
        # Pagination
        page_size = 20
        offset = (page - 1) * page_size
        
        response = query.order("extracted_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        # Get total count
        total_response = db.table("interview_scorecards").select("*", count="exact")
        if candidate_name:
            total_response = total_response.ilike("candidate_name", f"%{candidate_name}%")
        if hire_recommendation and hire_recommendation != "All":
            total_response = total_response.eq("hire_recommendation", hire_recommendation)
        if role:
            total_response = total_response.ilike("role", f"%{role}%")
        
        total_response = total_response.execute()
        total = len(total_response.data)
        
        return {
            "data": response.data,
            "total": total,
            "page": page,
            "total_pages": (total + page_size - 1) // page_size
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch scorecards: {str(e)}")


@router.delete("/scorecards/{scorecard_id}")
async def delete_scorecard(scorecard_id: str):
    """Delete an interview scorecard by ID."""
    try:
        db = get_supabase()
        db.table("interview_scorecards").delete().eq("id", scorecard_id).execute()
        return {"success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete scorecard: {str(e)}")
