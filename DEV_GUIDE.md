# JD Structura - Developer Guide

Welcome! This guide helps you work with and extend the JD Structura codebase.

---

## Getting Started

### Local Development Setup

```bash
# 1. Install dependencies
cd frontend && npm install
cd backend && pip install -r requirements.txt

# 2. Configure environment
# frontend/.env.local (copy from .env.example)
# backend/.env (copy from .env.example and fill in API keys)

# 3. Start servers
# Terminal 1
cd backend && uvicorn main:app --reload

# Terminal 2
cd frontend && npm run dev
```

### Directory Navigation

```bash
# Frontend development
cd frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint

# Backend development
cd backend
uvicorn main:app --reload  # Start with hot reload
python -m pytest    # Run tests (if added)

# Scraper usage
cd scripts
python scrape_jds.py  # Fetch fresh job descriptions
```

---

## Frontend Development

### Adding a New Component

**File: `frontend/components/MyComponent.tsx`**

```typescript
"use client";  // Must be Client Component if using hooks

import { useState } from "react";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
      toast.success("Action completed!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
    >
      {isLoading ? "Loading..." : title}
    </button>
  );
}
```

### Adding a New Page

**File: `frontend/app/mypage/page.tsx`**

```typescript
"use client";  // If using hooks

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold">My Page</h1>
    </div>
  );
}
```

### Adding a New API Call

**In: `frontend/lib/api.ts`**

```typescript
export interface MyModel {
  id: string;
  name: string;
  // ... other fields
}

export async function fetchMyData(): Promise<MyModel[]> {
  const response = await fetch(`${API_URL}/api/myendpoint`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch");
  }

  return response.json();
}
```

### Styling Guidelines

- Use **Tailwind CSS** for all styles
- Color palette defined in `tailwind.config.js`
- Custom utilities in `app/globals.css`
- Mobile-first approach

### TypeScript Best Practices

- ✅ Use strict mode (already enabled)
- ✅ No `any` types
- ✅ Define interfaces for data structures
- ✅ Use `const` for components (functional style)
- ✅ Destructure props

---

## Backend Development

### Adding a New Route

**File: `backend/routes/myroute.py`**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class MyRequest(BaseModel):
    name: str
    value: int

@router.post("/myendpoint")
async def my_endpoint(request: MyRequest):
    """
    My endpoint description.

    Args:
        request: The request body

    Returns:
        Result data

    Raises:
        HTTPException: If operation fails
    """
    try:
        # Your logic here
        result = {"status": "success", "data": request.name}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Then register in: `backend/main.py`**

```python
from routes import myroute

app.include_router(myroute.router, prefix=API_PREFIX, tags=["myroute"])
```

### Adding a New Pydantic Model

**File: `backend/models/mymodel.py`**

```python
from pydantic import BaseModel, Field
from typing import Optional

class MyExtracted(BaseModel):
    field1: str
    field2: Optional[int] = None
    field3: list[str] = Field(default=[])

class MyCreate(MyExtracted):
    raw_text: str

class MyResponse(MyCreate):
    id: str
    created_at: str
```

### Adding Gemini Extraction Logic

**In: `backend/gemini.py`**

````python
def extract_mydata(raw_text: str) -> MyExtracted:
    """Extract structured data using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""Extract data from this text:
{raw_text}

Return only valid JSON."""

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Handle markdown
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        data = json.loads(response_text)
        return MyExtracted(**data)

    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse error: {str(e)}\nRaw: {response_text}")
    except Exception as e:
        raise ValueError(f"Extraction failed: {str(e)}")
````

### Database Queries

**Using Supabase Python Client:**

```python
from supabase_client import get_supabase

db = get_supabase()

# Read all
response = db.table("job_listings").select("*").execute()
data = response.data

# Read with filter
response = db.table("job_listings").select("*").eq("seniority", "Senior").execute()

# Read with pagination
response = db.table("job_listings").select("*").range(0, 19).execute()

# Insert
response = db.table("job_listings").insert({
    "raw_text": "...",
    "role": "Engineer",
    # ... other fields
}).execute()

saved_record = response.data[0]

# Update
response = db.table("job_listings").update({
    "role": "Senior Engineer"
}).eq("id", listing_id).execute()

# Delete
db.table("job_listings").delete().eq("id", listing_id).execute()

# Count
response = db.table("job_listings").select("*", count="exact").execute()
total = len(response.data)
```

### Error Handling

**Pattern to follow:**

```python
from fastapi import HTTPException

@router.post("/myendpoint")
async def my_function(request: MyRequest):
    # Validate input
    if not request.name or not request.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    try:
        # Your logic
        result = process_data(request)

        # Validate output
        if not result:
            raise HTTPException(status_code=500, detail="Processing failed")

        return result

    except ValueError as e:
        # User input error
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError as e:
        # Missing required field
        raise HTTPException(status_code=400, detail=f"Missing field: {str(e)}")
    except Exception as e:
        # Unexpected error
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
```

---

## Common Tasks

### Task: Add a new filter to Dashboard

1. **Update API route** → Add query parameter in `listings.py`
2. **Update FilterBar component** → Add dropdown in `FilterBar.tsx`
3. **Update dashboard page** → Pass filter to API call

### Task: Add a new scorecard field

1. **Update Gemini prompt** → Add field to extraction prompt in `gemini.py`
2. **Update Pydantic model** → Add field to `ScorecardExtracted` in `scorecard.py`
3. **Update database** → Add column in Supabase SQL Editor
4. **Update UI** → Display field in `ScorecardCard.tsx`

### Task: Optimize database query

1. Identify slow query in browser DevTools (Network tab)
2. Add index in Supabase:
   ```sql
   CREATE INDEX idx_name ON table_name(column);
   ```
3. Test performance improvement

### Task: Add new environment variable

1. Add to `.env` and `.env.example`
2. Load in `backend/config.py`:
   ```python
   MY_VAR = os.getenv("MY_VAR")
   if not MY_VAR:
       raise ValueError("MY_VAR not set")
   ```
3. Use in code: `from config import MY_VAR`

---

## Testing Your Changes

### Manual Testing

```bash
# 1. Start both servers
cd backend && uvicorn main:app --reload &
cd frontend && npm run dev &

# 2. Open http://localhost:3000
# 3. Test your feature
# 4. Check console logs for errors
```

### API Testing with cURL

```bash
# Test extraction endpoint
curl -X POST http://localhost:8000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"raw_text": "Senior Engineer...", "source_url": "https://..."}'

# Test health check
curl http://localhost:8000/

# Test listings (with filter)
curl "http://localhost:8000/api/listings?seniority=Senior&page=1"
```

### Browser DevTools

- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls, response times
- **Application**: Check stored data, cookies
- **Performance**: Track load times

---

## Code Quality

### Formatting

```bash
# Frontend - Prettier (auto with VSCode)
# Backend - Black (auto with IDE extensions)
```

### Linting

```bash
cd frontend
npm run lint      # ESLint
```

### TypeScript Checking

```bash
cd frontend
npx tsc --noEmit  # Type checking without emit
```

---

## Debugging Tips

### Frontend Debugging

```typescript
// Add console logs
console.log("Variable:", myVar);

// Set breakpoints in DevTools (F12 → Sources)
// Step through code

// React DevTools extension helpful
```

### Backend Debugging

```python
# Add print statements
print(f"Debug: {variable}")

# Use logging module
import logging
logger = logging.getLogger(__name__)
logger.info(f"Info: {data}")

# Stop at breakpoint with debugger
import pdb; pdb.set_trace()
```

### API Debugging

```bash
# Check response status
curl -i http://localhost:8000/api/listings

# Pretty print JSON
curl http://localhost:8000/api/listings | python -m json.tool

# Check headers
curl -v http://localhost:8000/
```

---

## Version Control

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Convention

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code refactoring
perf: performance improvement
test: add tests
chore: dependency updates
```

---

## Performance Optimization

### Frontend

- Memoize expensive components: `React.memo()`
- Use `useCallback` for event handlers
- Lazy load large components
- Use CSS for animations (not JS)

### Backend

- Use async/await for all I/O
- Database indexes on filter columns
- Connection pooling
- Cache frequently accessed data

### Database

- Add indexes:
  ```sql
  CREATE INDEX idx_name ON table(column);
  ```
- Monitor slow queries:
  ```sql
  SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
  ```

---

## Documentation

### Code Comments

```python
# Good: Explain WHY, not WHAT
# We use DESC order for most recent first
result = db.table("items").select("*").order("created_at", desc=True).execute()

# Bad: States the obvious
# Loop through items
for item in items:
    ...
```

### Docstrings

```python
def extract_jd(raw_text: str) -> JobListingExtracted:
    """
    Extract structured job listing data from raw text using Gemini.

    Args:
        raw_text: Raw job description text from web or user input

    Returns:
        JobListingExtracted: Structured data with validation

    Raises:
        ValueError: If Gemini returns invalid JSON or extraction fails
    """
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Gemini API**: https://ai.google.dev/docs

---

## Getting Help

1. **Check existing code** for similar patterns
2. **Read error messages carefully** (often very descriptive)
3. **Check browser console** (Frontend) or terminal (Backend)
4. **Review documentation** (README, ARCHITECTURE, etc.)
5. **Search GitHub issues** for similar problems
6. **Ask in comments** or create an issue

---

## Before Committing

- [ ] All features working locally
- [ ] No console errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] `.env` files not committed
- [ ] Build succeeds (`npm run build`, `python -m py_compile backend/*.py`)

---

**Happy coding! 🚀**

Remember: Write code for tomorrow's you, and tomorrow's developers.
