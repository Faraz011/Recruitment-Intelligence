from fastapi import APIRouter, HTTPException, Query
from supabase_client import get_supabase
from models.job_listing import JobListingResponse

router = APIRouter()


@router.get("/listings")
async def get_listings(
    role: str | None = Query(None),
    seniority: str | None = Query(None),
    remote_type: str | None = Query(None),
    location: str | None = Query(None),
    page: int = Query(1, ge=1),
):
    """Get paginated job listings with optional filters."""
    try:
        db = get_supabase()
        
        query = db.table("job_listings").select("*", count="exact")
        
        if role:
            query = query.ilike("role", f"%{role}%")
        if seniority and seniority != "Not mentioned":
            query = query.eq("seniority", seniority)
        if remote_type and remote_type != "Not mentioned":
            query = query.eq("remote_type", remote_type)
        if location:
            query = query.ilike("location", f"%{location}%")
        
        # Pagination
        page_size = 20
        offset = (page - 1) * page_size
        
        response = query.order("extracted_at", desc=True).range(offset, offset + page_size - 1).execute()
        
        # Get total count
        total_response = db.table("job_listings").select("*", count="exact")
        if role:
            total_response = total_response.ilike("role", f"%{role}%")
        if seniority and seniority != "Not mentioned":
            total_response = total_response.eq("seniority", seniority)
        if remote_type and remote_type != "Not mentioned":
            total_response = total_response.eq("remote_type", remote_type)
        if location:
            total_response = total_response.ilike("location", f"%{location}%")
        
        total_response = total_response.execute()
        total = len(total_response.data)
        
        return {
            "data": response.data,
            "total": total,
            "page": page,
            "total_pages": (total + page_size - 1) // page_size
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch listings: {str(e)}")


@router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str):
    """Delete a job listing by ID."""
    try:
        db = get_supabase()
        db.table("job_listings").delete().eq("id", listing_id).execute()
        return {"success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete listing: {str(e)}")
