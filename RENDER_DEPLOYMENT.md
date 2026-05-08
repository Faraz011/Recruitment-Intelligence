# Render.com Deployment Guide

## Pre-Deployment Checklist ✅

- [x] Python 3.11 compatible code
- [x] `requirements.txt` with all dependencies
- [x] `Procfile` configured for deployment
- [x] `render.yaml` with service configuration
- [x] `.env.example` with all required variables
- [x] `main.py` with proper app initialization
- [x] CORS middleware configured
- [x] Environment variables properly loaded from config.py
- [x] Supabase database created with tables
- [x] Groq API key obtained

## Deployment Steps

### Step 1: Push Changes to GitHub
```powershell
cd C:\Users\Faraz\Recruitment-Intelligence
git add -A
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub
1. Go to https://render.com
2. Sign in with GitHub (or create account)
3. Click "New +" → "Web Service"
4. Select the "Recruitment-Intelligence" repository
5. Click "Connect"

### Step 3: Configure Web Service
- **Name**: `recruitment-intelligence-api`
- **Environment**: `Python 3.11`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Free tier works fine for testing

### Step 4: Add Environment Variables
In Render dashboard, add these environment variables:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT**: Never commit `.env` to GitHub. Only use `.env.example`

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy from the `Procfile`
3. Watch the logs for any errors
4. Once deployed, you'll get a public URL like: `https://recruitment-intelligence-api.onrender.com`

## Deployment Checklist (Render Dashboard)

- [ ] Repository connected to GitHub
- [ ] Branch set to `main`
- [ ] Root directory set to ` ` (project root)
- [ ] All 3 environment variables added (GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY)
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Python version: 3.11

## Verify Deployment

Once deployed, test the endpoints:

```powershell
# Health check
curl https://recruitment-intelligence-api.onrender.com/

# Extract a job description
$body = @{
    raw_text = "Senior Software Engineer - Python, FastAPI, 5+ years experience"
    source_url = "https://example.com/job"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://recruitment-intelligence-api.onrender.com/api/extract" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

## Expected Response

```json
{
  "raw_text": "...",
  "role": "Senior Software Engineer",
  "company": "...",
  "location": "...",
  "seniority": "Senior",
  "employment_type": "Full-time",
  "remote_type": "...",
  "salary_min": null,
  "salary_max": null,
  "salary_currency": null,
  "skills_required": ["Python", "FastAPI"],
  "experience_years_min": 5,
  "experience_years_max": null,
  "source_url": "https://example.com/job",
  "id": null,
  "extracted_at": null,
  "created_at": null
}
```

## Troubleshooting

### Build Fails: `ModuleNotFoundError: No module named 'groq'`
- Ensure `groq==0.4.2` is in `requirements.txt`
- Check that `requirements.txt` is in backend directory

### App Crashes with `ValueError: GROQ_API_KEY not set`
- Verify all 3 environment variables are set in Render dashboard
- Make sure values don't have quotes around them
- Check for typos in variable names

### CORS Errors
- CORS is already configured in `main.py` with `allow_origins=["*"]`
- This allows requests from any frontend domain

### Database Connection Fails
- Verify Supabase credentials are correct
- Check that tables exist: `job_listings` and `interview_scorecards`
- Ensure service key has proper permissions

## Performance Notes

- **Free Tier**: May spin down after 30 minutes of inactivity
- **Response Time**: ~2-3 seconds for extraction (Groq API time)
- **Rate Limits**: 1000 requests/hour with free Groq tier
- **Database**: Supabase free tier: 2 concurrent connections

## Next Steps

1. **Link Frontend**: Update frontend `.env` with Render API URL
   ```
   NEXT_PUBLIC_API_URL=https://recruitment-intelligence-api.onrender.com
   ```

2. **Deploy Frontend**: Deploy frontend on Vercel pointing to this Render backend

3. **Monitor Logs**: Use Render dashboard → Logs to debug issues

4. **Setup Auto-Deploy**: Render will automatically redeploy on every GitHub push to main
