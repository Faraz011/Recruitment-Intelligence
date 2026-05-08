from pydantic import BaseModel, Field


class JobListingExtracted(BaseModel):
    role: str
    company: str
    location: str
    seniority: str
    employment_type: str
    remote_type: str
    salary_min: int | None
    salary_max: int | None
    salary_currency: str | None
    skills_required: list[str]
    experience_years_min: int | None
    experience_years_max: int | None


class JobListingCreate(JobListingExtracted):
    raw_text: str
    source_url: str | None = None


class JobListingResponse(JobListingCreate):
    id: str | None = None
    extracted_at: str | None = None
    created_at: str | None = None
