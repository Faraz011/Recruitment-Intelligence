# JD Structura - Quick Start

<details>
<summary><b>📦 One-Command Setup (Recommended)</b></summary>

If you have both Node.js and Python installed:

```bash
# 1. Clone this repo
git clone <repo-url>
cd Recruitment-Intelligence

# 2. Install dependencies
npm install --prefix frontend
pip install -r backend/requirements.txt

# 3. Set environment variables
# Create backend/.env and frontend/.env.local (see README.md)

# 4. Create Supabase tables (paste the SQL from README.md)

# 5. Start servers
npm run dev --prefix frontend &
python -m uvicorn backend.main:app --reload
```

</details>

## Quick Links

- 📘 **Full Documentation**: [README.md](./README.md)
- 📺 **Database Setup**: Paste SQL from README → Supabase Console
- 🔑 **Get API Keys**:
  - Gemini: https://makersuite.google.com/app/apikey
  - Supabase: Project Settings → API

## Folder Guide

| Folder      | Purpose                                 |
| ----------- | --------------------------------------- |
| `frontend/` | Next.js 14 web app (React + TypeScript) |
| `backend/`  | FastAPI Python server                   |
| `scripts/`  | Job scraper utility                     |
| `public/`   | Static files & sample CSVs              |

## Next Steps

1. ✅ Read [README.md](./README.md) for complete setup
2. 🔧 Configure environment variables
3. 🗄️ Create database tables in Supabase
4. 🚀 Start development servers
5. 🌐 Open http://localhost:3000
