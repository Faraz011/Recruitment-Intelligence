from pydantic import BaseModel


class ScorecardExtracted(BaseModel):
    candidate_name: str
    role: str
    interviewer: str | None
    overall_rating: int
    hire_recommendation: str
    strengths: list[str]
    weaknesses: list[str]
    technical_score: int | None
    communication_score: int | None
    culture_fit_score: int | None
    summary: str


class ScorecardCreate(ScorecardExtracted):
    raw_text: str


class ScorecardResponse(ScorecardCreate):
    id: str | None = None
    extracted_at: str | None = None
    created_at: str | None = None
