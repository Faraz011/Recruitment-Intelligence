# Frontend Deployment on Vercel

## Step 1: Get Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your **"recruitment-intelligence-backend"** service
3. Copy the **Service URL** (looks like: `https://recruitment-intelligence-backend-xxxx.onrender.com`)
4. Keep this ready for Step 2

## Step 2: Deploy Frontend to Vercel

### Option A: Via GitHub (Recommended)
1. Go to [Vercel](https://vercel.com)
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Choose: `Faraz011/Recruitment-Intelligence`
5. Select **Root directory**: `/frontend` (not `/`)
6. Click **Deploy**

### Option B: Via Vercel CLI
```bash
cd frontend
vercel --prod
```

## Step 3: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com` (from Step 1)
   - **Environment**: Select **Production**
4. Click **Save**

Example:
```
NEXT_PUBLIC_API_URL = https://recruitment-intelligence-backend-abc123.onrender.com
```

## Step 4: Redeploy on Vercel

1. After adding the environment variable, trigger a **redeploy**:
   - Go to **Deployments**
   - Click the latest deployment
   - Click **"Redeploy"** button

2. Wait for deployment to complete (~2-3 minutes)

## Step 5: Verify the Frontend

1. Open your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Try extracting a job description
3. You should see results without 404 errors

## Troubleshooting

### Still Getting 404 Errors?
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel Dashboard
- Verify the Render backend URL is accessible (visit it in browser)
- Check browser **DevTools** → **Network** tab to see actual API calls
- Ensure backend Render service is running (green check in Render Dashboard)

### White Blank Screen?
- Check Vercel build logs for errors
- Verify environment variable is set BEFORE deploying
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Message Port Closed Error?
- This usually means the frontend can't communicate with backend
- Verify `NEXT_PUBLIC_API_URL` includes `https://` (not `http://`)
- Ensure no CORS issues (backend should accept Vercel domain)

## Environment Variable Format

✅ **Correct**: `https://recruitment-intelligence-backend-abc123.onrender.com`
❌ **Wrong**: `http://localhost:8000` (won't work on Vercel)
❌ **Wrong**: `localhost:8000`
❌ **Wrong**: Missing protocol

---

**Local Testing**:
To test locally with Render backend:
```bash
# In frontend directory
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com npm run dev
```
