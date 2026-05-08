from fastapi import APIRouter, UploadFile, File, HTTPException
from gemini import extract_jd
from supabase_client import get_supabase
import csv
import io

router = APIRouter()


class BatchProcessResult:
    def __init__(self):
        self.succeeded = 0
        self.failed = 0
        self.skipped = 0
        self.results = []
    
    def to_dict(self):
        return {
            "results": self.results,
            "succeeded": self.succeeded,
            "failed": self.failed,
            "skipped": self.skipped
        }


@router.post("/batch")
async def batch_upload(file: UploadFile = File(...)):
    """Process a CSV file with raw job descriptions."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        text = contents.decode("utf-8")
        reader = csv.DictReader(io.StringIO(text))
        
        if not reader.fieldnames or "raw_text" not in reader.fieldnames:
            raise HTTPException(
                status_code=400, 
                detail="CSV must have 'raw_text' column"
            )
        
        result = BatchProcessResult()
        db = get_supabase()
        
        for row_idx, row in enumerate(reader, start=1):
            raw_text = row.get("raw_text", "").strip()
            source_url = row.get("source_url", "").strip() or None
            
            if not raw_text:
                result.skipped += 1
                continue
            
            try:
                extracted = extract_jd(raw_text)
                
                response = db.table("job_listings").insert({
                    "raw_text": raw_text,
                    "role": extracted.role,
                    "company": extracted.company,
                    "location": extracted.location,
                    "seniority": extracted.seniority,
                    "employment_type": extracted.employment_type,
                    "remote_type": extracted.remote_type,
                    "salary_min": extracted.salary_min,
                    "salary_max": extracted.salary_max,
                    "salary_currency": extracted.salary_currency,
                    "skills_required": extracted.skills_required,
                    "experience_years_min": extracted.experience_years_min,
                    "experience_years_max": extracted.experience_years_max,
                    "source_url": source_url,
                })
                
                if response.data:
                    result.results.append(response.data[0])
                    result.succeeded += 1
                else:
                    result.failed += 1
                    result.results.append({
                        "error": "Failed to save to database",
                        "raw_text": raw_text[:100]
                    })
            
            except Exception as e:
                result.failed += 1
                result.results.append({
                    "error": str(e),
                    "raw_text": raw_text[:100]
                })
        
        return result.to_dict()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")
