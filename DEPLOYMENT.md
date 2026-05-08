# JD Structura - Deployment Guide

## Frontend Deployment (Vercel)

### Option 1: Using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel deploy
```

### Option 2: Using Git Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project" → Import from Git
4. Select your repository
5. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
6. Deploy

### Environment Variables on Vercel

- `NEXT_PUBLIC_API_URL`: Your deployed FastAPI URL

---

## Backend Deployment (Railway)

### Prerequisites

- Railway account (https://railway.app)
- Backend code pushed to GitHub

### Step 1: Create New Project

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository

### Step 2: Configure Environment

In Railway dashboard, set these environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `PYTHON_VERSION`: `3.11`

### Step 3: Deploy

1. Select Python as the language
2. Railway auto-detects `requirements.txt`
3. Click "Deploy"

Railway will automatically detect the Python app and run it.

### Get Your Backend URL

After deployment, Railway provides a public URL like:

```
https://your-railway-deployment.up.railway.app
```

Update your frontend `NEXT_PUBLIC_API_URL` to this URL.

---

## Alternative: Render.com (Backend)

### Deploy Steps

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create → Web Service
3. Connect GitHub repository
4. Select Python environment
5. Set build command: `pip install -r backend/requirements.txt`
6. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
7. Add environment variables
8. Deploy

---

## Database (Supabase)

Supabase is already managed in the cloud, no deployment needed!

Just ensure:

1. You've created the tables (SQL from README.md)
2. Your service key has the right permissions
3. Both frontend and backend have the correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

---

## Troubleshooting Deployments

### "Connection refused" errors

- Verify `NEXT_PUBLIC_API_URL` is correct in frontend
- Check backend is running and accessible

### "Gemini API not working"

- Confirm `GEMINI_API_KEY` is set in backend
- Check API rate limits: https://makersuite.google.com/app/usage
- Free tier has ~60 requests/min limit

### "Database connection failed"

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check that database tables exist
- Ensure IP allowlist isn't blocking your backend

### Cold start times

- Railway/Render may have 10-30 second cold starts
- This is normal for free tiers
- Consider upgrading for consistent performance

---

## Performance Optimization

### Caching Strategy

- Frontend: Vercel Edge caching
- Backend: Add Redis for expensive queries (future enhancement)

### Rate Limiting

- Implement API rate limiting on FastAPI to prevent Gemini API abuse
- Example: 60 requests/min per IP

### Database Indexes

- Already included in README.md SQL script
- These optimize dashboard filters and paginated queries

---

## Monitoring

### Vercel

- Dashboard shows logs and analytics
- Check "Functions" for backend logs

### Railway

- Dashboard shows resource usage
- Real-time logs available

### Supabase

- SQL Editor shows database health
- Check Storage browser for file uploads

---

## Cost Estimates (Monthly)

| Service           | Free Tier    | Paid                              |
| ----------------- | ------------ | --------------------------------- |
| Vercel            | ✅ Limited   | $9-20                             |
| Railway           | ✅ $5 credit | $0.10+/hour of compute            |
| Supabase          | ✅ Generous  | $25+                              |
| Google Gemini API | ✅ Free tier | Pay-as-you-go (~$1 per 1M tokens) |

**Estimated cost for production:** $30-50/month

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] `NEXT_PUBLIC_API_URL` updated in frontend deployment
- [ ] Environment variables set in backend deployment
- [ ] Supabase tables created and accessible
- [ ] Database backup configured in Supabase
- [ ] Gemini API quota verified
- [ ] Test end-to-end flow (→ Extract → Save → View)

---

For issues, check logs in Vercel or Railway dashboard!
