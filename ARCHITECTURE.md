# JD Structura - Architecture & Design Document

---

## System Architecture Overview

```
                        ┌─────────────────────────────────────┐
                        │        Vercel (Frontend)            │
                        │    Next.js 14 React TypeScript      │
                        └──────────────┬──────────────────────┘
                                       │
                                  HTTPS API
                                  REST Calls
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     │
        ┌──────────────────────┐                        │
        │   External Services  │                        │
        ├──────────────────────┤                        │
        │ ✓ Google Gemini API  │                        │
        │ ✓ Vercel (CDN/Edge)  │                        │
        └──────────────────────┘                        │
                                                        │
                    ┌───────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────────┐
        │  Railway/Render (Backend)        │
        │     FastAPI + Uvicorn            │
        │     Python 3.11+                 │
        └──────────┬───────────────────────┘
                   │
        ┌──────────┴───────────┐
        ▼                      ▼
    ┌─────────┐          ┌──────────────┐
    │  Gemini │          │   Supabase   │
    │  2.0    │          │  PostgreSQL  │
    │  API    │          │   (Cloud)    │
    └─────────┘          └──────────────┘
                              ▲
                              │
                         Write/Read
                        Job Listings &
                        Scorecards
```

---

## Frontend Architecture (Next.js)

### Directory Structure

```
frontend/
├── app/                     # App Router (Next.js 14)
│   ├── layout.tsx          # Root layout + React Hot Toast
│   ├── globals.css         # Global styles (Tailwind)
│   ├── page.tsx            # Home page
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout
│       └── page.tsx        # Dashboard page
├── components/             # Reusable React components
│   ├── ExtractionCard.tsx  # Card for displaying extracted JD
│   ├── ScorecardCard.tsx   # Card for displaying scorecard
│   ├── JobTable.tsx        # Table for listings
│   ├── ScorecardTable.tsx  # Table for scorecards
│   ├── FilterBar.tsx       # Filter UI component
│   ├── Badge.tsx           # Badge component (reusable)
│   └── BatchUploader.tsx   # CSV upload component
├── lib/
│   ├── api.ts              # Typed API client functions
│   └── utils.ts            # Utility functions (formatters)
├── package.json            # Dependencies
├── tsconfig.json           # Strict TypeScript config
├── tailwind.config.js      # Tailwind theme
└── .env.local              # Local env vars
```

### Component Hierarchy

```
Home (/)
├── SingleJDTab
│   ├── textarea (raw_text)
│   ├── input (source_url)
│   ├── button (Extract)
│   └── ExtractionCard (display result)
├── BatchUploadTab
│   ├── BatchUploader
│   │   ├── file input
│   │   ├── progress bar
│   │   └── results summary
├── ScorecardTab
│   ├── textarea (feedback)
│   ├── input (candidate_name)
│   ├── input (role)
│   ├── button (Extract)
│   └── ScorecardCard (display result)

Dashboard (/dashboard)
├── ListingsTab
│   ├── StatsBar (3 cards)
│   ├── FilterBar
│   ├── ExportButton
│   ├── JobTable
│   │   ├── Rows with Delete buttons
│   │   └── Delete handler
│   └── Pagination
├── ScorecardTab
│   ├── StatsBar (3 cards)
│   ├── FilterBar
│   ├── ExportButton
│   ├── ScorecardTable
│   │   ├── Rows with Delete buttons
│   │   └── Delete handler
│   └── Pagination
```

### State Management Pattern

- Uses React hooks (`useState`, `useEffect`)
- Local state for filters, pagination, loading states
- API calls in `useEffect` with dependency arrays
- Delete operations with Set<string> for tracking in-progress deletions

### API Client Pattern

All async functions in `lib/api.ts`:

```typescript
export async function extractJD(
  raw_text: string,
  source_url?: string,
): Promise<JobListing> {
  // Typed request/response
  const response = await fetch(`${API_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text, source_url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to extract JD");
  }

  return response.json();
}
```

### Error Handling

- Try-catch blocks in components
- Toast notifications for all errors
- Descriptive error messages from API

---

## Backend Architecture (FastAPI)

### Directory Structure

```
backend/
├── main.py                 # FastAPI app + routing
├── config.py               # Environment loading
├── gemini.py               # Gemini extraction logic
├── supabase_client.py      # Supabase singleton
├── routes/                 # API route handlers
│   ├── extract.py          # POST /api/extract
│   ├── batch.py            # POST /api/batch
│   ├── listings.py         # GET/DELETE /api/listings
│   ├── scorecard.py        # POST /api/scorecard
│   └── scorecards.py       # GET/DELETE /api/scorecards
├── models/                 # Pydantic models
│   ├── job_listing.py      # JobListingExtracted, JobListingCreate
│   └── scorecard.py        # ScorecardExtracted, ScorecardCreate
└── requirements.txt        # Python dependencies
```

### Request/Response Flow

```
Frontend HTTP Request
        ↓
FastAPI Route Handler
        ↓
Pydantic Validation (input)
        ↓
Business Logic (Gemini call OR DB query)
        ↓
Pydantic Validation (output)
        ↓
Response to Frontend
```

### Route Handler Pattern

```python
@router.post("/extract", response_model=JobListingResponse)
async def extract_job_description(request: ExtractJDRequest):
    # 1. Validate input
    if not request.raw_text or not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")

    try:
        # 2. Call Gemini
        extracted = extract_jd(request.raw_text)

        # 3. Create model
        job_listing = JobListingCreate(
            raw_text=request.raw_text,
            source_url=request.source_url,
            **extracted.model_dump()
        )

        # 4. Save to DB
        db = get_supabase()
        response = db.table("job_listings").insert({...}).execute()

        # 5. Return result
        if response.data:
            return JobListingResponse(**response.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to save")

    except ValueError as e:
        # Gemini parse error
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
```

### Gemini Integration Pattern

````python
def extract_jd(raw_text: str) -> JobListingExtracted:
    try:
        # 1. Initialize Gemini client
        model = genai.GenerativeModel("gemini-2.0-flash")

        # 2. Format prompt with user input
        prompt = JD_EXTRACTION_PROMPT.format(raw_text=raw_text)

        # 3. Call API
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # 4. Handle markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        # 5. Parse JSON
        data = json.loads(response_text)

        # 6. Validate with Pydantic
        return JobListingExtracted(**data)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Failed to parse Gemini response as JSON: {str(e)}\n"
            f"Raw response:\n{response_text}"
        )
````

### Batch Processing Pattern

```python
@router.post("/batch")
async def batch_upload(file: UploadFile = File(...)):
    # 1. Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # 2. Read and parse CSV
    contents = await file.read()
    text = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    # 3. Initialize result tracking
    result = BatchProcessResult()
    db = get_supabase()

    # 4. Process each row
    for row in reader:
        raw_text = row.get("raw_text", "").strip()

        if not raw_text:
            result.skipped += 1
            continue

        try:
            extracted = extract_jd(raw_text)
            # Insert to DB
            result.succeeded += 1
        except Exception as e:
            result.failed += 1
            result.results.append({"error": str(e)})

    return result.to_dict()
```

### Database Access Pattern

```python
from supabase_client import get_supabase

db = get_supabase()

# Read
response = db.table("job_listings").select("*").execute()
data = response.data

# Insert
response = db.table("job_listings").insert({...}).execute()
data = response.data[0]

# Filter
response = db.table("job_listings").select("*").eq("seniority", "Senior").execute()

# Delete
db.table("job_listings").delete().eq("id", listing_id).execute()

# Paginate
response = db.table("job_listings").select("*").range(0, 19).execute()
```

---

## Data Models

### Job Listing Extraction

```
Input: raw_text (string)
         ↓
    Gemini API
         ↓
Output JSON:
{
  "role": "Senior Engineer",
  "company": "TechCorp",
  "location": "Remote",
  "seniority": "Senior",
  "employment_type": "Full-time",
  "remote_type": "Remote",
  "salary_min": 150000,
  "salary_max": 200000,
  "salary_currency": "USD",
  "skills_required": ["Python", "Go", "Microservices"],
  "experience_years_min": 8,
  "experience_years_max": null
}
         ↓
Pydantic Validation
         ↓
Save to job_listings table
```

### Interview Scorecard Extraction

```
Input: raw_text (string)
         ↓
    Gemini API
         ↓
Output JSON:
{
  "candidate_name": "Alex Smith",
  "role": "Senior Engineer",
  "interviewer": "John Doe",
  "overall_rating": 4,
  "hire_recommendation": "Yes",
  "strengths": ["Problem Solving", "Communication"],
  "weaknesses": ["Trade-offs"],
  "technical_score": 5,
  "communication_score": 4,
  "culture_fit_score": 5,
  "summary": "Strong candidate..."
}
         ↓
Pydantic Validation
         ↓
Save to interview_scorecards table
```

---

## Database Design

### Normalization Strategy

- Tables: `job_listings`, `interview_scorecards`
- No joins needed (denormalized by design)
- Each record is self-contained

### Indexing Strategy

```sql
-- For filtering on dashboard
CREATE INDEX idx_job_listings_role ON job_listings(role);
CREATE INDEX idx_job_listings_seniority ON job_listings(seniority);
CREATE INDEX idx_job_listings_remote_type ON job_listings(remote_type);
CREATE INDEX idx_job_listings_extracted_at ON job_listings(extracted_at DESC);

-- For sorting and filtering scorecards
CREATE INDEX idx_scorecards_hire_rec ON interview_scorecards(hire_recommendation);
CREATE INDEX idx_scorecards_extracted_at ON interview_scorecards(extracted_at DESC);
```

### Query Patterns

```sql
-- Filter + Paginate
SELECT * FROM job_listings
WHERE seniority = 'Senior' AND remote_type = 'Remote'
ORDER BY extracted_at DESC
LIMIT 20 OFFSET 0;

-- Text search
SELECT * FROM job_listings
WHERE role ILIKE '%Backend%'
LIMIT 20;

-- Count
SELECT COUNT(*) FROM job_listings;

-- Delete
DELETE FROM job_listings WHERE id = 'uuid-value';
```

---

## API Contract

### Request/Response Examples

**POST /api/extract**

```
Request:
{
  "raw_text": "Senior Engineer needed...",
  "source_url": "https://example.com/job/123"
}

Response (200):
{
  "id": "uuid",
  "raw_text": "...",
  "role": "Senior Engineer",
  ...
  "extracted_at": "2024-01-01T12:00:00Z"
}

Error Response (400):
{ "detail": "Failed to parse Gemini response as JSON: ..." }
```

**POST /api/batch**

```
Request: multipart/form-data
- file: <csv file>

Response (200):
{
  "results": [...],
  "succeeded": 20,
  "failed": 2,
  "skipped": 1
}
```

**GET /api/listings**

```
Request: ?role=Backend&seniority=Senior&page=1

Response (200):
{
  "data": [...],
  "total": 125,
  "page": 1,
  "total_pages": 7
}
```

---

## Error Handling Strategy

### Frontend

- All API calls wrapped in try-catch
- Toast notifications for user feedback
- User-friendly error messages
- Validation before API calls

### Backend

- Input validation with Pydantic (automatic)
- Try-except in route handlers
- Descriptive error messages
- HTTP status codes (400, 500, etc.)

### Gemini Integration

- JSON parse errors caught and logged
- Raw Gemini response returned in error message
- Validation ensures all fields present

---

## Deployment Considerations

### Frontend (Vercel)

- No API calls during build time ✓
- Environment variable: `NEXT_PUBLIC_API_URL`
- Automatic deployments from GitHub
- Edge caching for static assets

### Backend (Railway/Render)

- Python 3.11+ runtime
- `requirements.txt` for dependency management
- Set environment variables in dashboard
- Automatic scaling based on load

### Database (Supabase)

- Cloud-managed PostgreSQL
- Automatic backups
- Row-level security ready
- Connection pooling built-in

---

## Performance Optimizations

1. **Frontend**
   - Pagination (20 records per page)
   - Lazy loading components
   - Optimized re-renders with React hooks

2. **Backend**
   - Async/await for all I/O operations
   - Database indexes on filter columns
   - Connection pooling with Supabase

3. **Database**
   - Indexes on frequently filtered columns
   - Denormalized design (no complex joins)
   - TIMESTAMPTZ for fast sorting

---

## Security Best Practices

1. **Credentials**
   - Environment variables for all secrets
   - `.env` files in `.gitignore`
   - Service key only in backend

2. **API**
   - CORS configured appropriately
   - Input validation with Pydantic
   - Error messages don't leak sensitive data

3. **Database**
   - Service key for backend access
   - Row-level security ready in Supabase
   - No direct client access to database

---

## Testing Strategy

### Unit Tests (Backend)

- Test Pydantic model validation
- Mock Gemini API responses
- Test database insert/delete

### Integration Tests (Backend)

- Test full extraction pipeline
- Test batch processing
- Test error scenarios

### E2E Tests (Frontend + Backend)

- Extract single JD
- Batch upload CSV
- View in dashboard
- Delete record
- Extract scorecard

See [TESTING.md](./TESTING.md) for detailed test cases.

---

## Future Enhancements

1. **Authentication**
   - User accounts
   - Row-level security in Supabase
   - JWT tokens

2. **Advanced Features**
   - ML-based duplicate detection
   - Salary trend analysis
   - Skill gap analysis

3. **Performance**
   - Redis caching for dashboard filters
   - WebSockets for real-time updates
   - GraphQL API alternative

4. **Analytics**
   - Dashboard metrics
   - Extraction success rates
   - User behavior tracking

---

**Architecture designed for scalability, maintainability, and ease of deployment.**
