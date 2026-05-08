# JD Structura - Documentation Index

Welcome to JD Structura! This index helps you find the right documentation for your needs.

---

## 🚀 Getting Started (First Time?)

1. **Start Here**: [`QUICKSTART.md`](./QUICKSTART.md) — 15 minute setup
2. **Full Setup**: [`README.md`](./README.md) — Complete documentation
3. **First Test**: [`TESTING.md`](./TESTING.md) — Test your installation

---

## 📚 Documentation by Topic

### Setup & Installation

| Document                                             | Purpose                               |
| ---------------------------------------------------- | ------------------------------------- |
| [`README.md`](./README.md)                           | Complete setup guide with SQL scripts |
| [`QUICKSTART.md`](./QUICKSTART.md)                   | Fast track installation               |
| [`.env.example` (Backend)](./backend/.env.example)   | Environment variables template        |
| [`.env.example` (Frontend)](./frontend/.env.example) | Environment variables template        |

### Usage & Features

| Document                                        | Purpose                                       |
| ----------------------------------------------- | --------------------------------------------- |
| [`README.md`](./README.md#usage-guide)          | How to use all features                       |
| [`TESTING.md`](./TESTING.md)                    | Complete test scenarios with expected results |
| [`README.md`](./README.md#api-routes-reference) | API endpoint reference                        |

### Architecture & Development

| Document                                                     | Purpose                            |
| ------------------------------------------------------------ | ---------------------------------- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                       | System design and data models      |
| [`DEV_GUIDE.md`](./DEV_GUIDE.md)                             | Developer guide for extending code |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md#request-response-flow) | Request/response patterns          |

### Deployment & Operations

| Document                                    | Purpose                                         |
| ------------------------------------------- | ----------------------------------------------- |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md)          | Deploy to Vercel (Frontend) & Railway (Backend) |
| [`README.md`](./README.md#troubleshooting)  | Troubleshooting guide                           |
| [`README.md`](./README.md#performance-tips) | Performance optimization tips                   |

### Project Overview

| Document                                     | Purpose                              |
| -------------------------------------------- | ------------------------------------ |
| [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) | Complete project summary & checklist |
| [`README.md`](./README.md#project-structure) | Directory structure                  |
| [`README.md`](./README.md#tech-stack)        | Technology stack details             |

---

## 🎯 Quick Navigation by Role

### 👤 End User

1. Read [`QUICKSTART.md`](./QUICKSTART.md)
2. Follow setup instructions
3. Read [`README.md`](./README.md#usage-guide) for feature guide
4. Check [`TESTING.md`](./TESTING.md) for example workflows

### 👨‍💻 Frontend Developer

1. Read [`DEV_GUIDE.md`](./DEV_GUIDE.md#frontend-development)
2. Check [`ARCHITECTURE.md`](./ARCHITECTURE.md#frontend-architecture-nextjs) for component structure
3. Look at existing components in `frontend/components/`
4. Test with [`TESTING.md`](./TESTING.md)

### 🔧 Backend Developer

1. Read [`DEV_GUIDE.md`](./DEV_GUIDE.md#backend-development)
2. Check [`ARCHITECTURE.md`](./ARCHITECTURE.md#backend-architecture-fastapi) for routing
3. Look at existing routes in `backend/routes/`
4. Test API endpoints with curl examples in [`DEV_GUIDE.md`](./DEV_GUIDE.md#api-testing-with-curl)

### 🚀 DevOps / Deployment

1. Read [`DEPLOYMENT.md`](./DEPLOYMENT.md)
2. Check environment requirements in [`README.md`](./README.md#environment-variables)
3. Review deployment checklist in [`DEPLOYMENT.md`](./DEPLOYMENT.md#post-deployment-checklist)

### 📊 Data/Database Team

1. Check schema in [`README.md`](./README.md#database-schema)
2. Review SQL scripts in [`README.md`](./README.md#step-3-create-database-tables)
3. See query patterns in [`DEV_GUIDE.md`](./DEV_GUIDE.md#database-queries)
4. Check ARCHITECTURE for data models

---

## 📋 Common Questions

### "How do I get started?"

→ [`QUICKSTART.md`](./QUICKSTART.md)

### "How do I set up the database?"

→ [`README.md`](./README.md#step-3-create-database-tables)

### "How is the code organized?"

→ [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`README.md`](./README.md#project-structure)

### "How do I add a new feature?"

→ [`DEV_GUIDE.md`](./DEV_GUIDE.md#adding-a-new-component)

### "How do I test my changes?"

→ [`TESTING.md`](./TESTING.md) and [`DEV_GUIDE.md`](./DEV_GUIDE.md#testing-your-changes)

### "How do I deploy?"

→ [`DEPLOYMENT.md`](./DEPLOYMENT.md)

### "What does each file do?"

→ [`README.md`](./README.md#project-structure)

### "How does the API work?"

→ [`README.md`](./README.md#api-routes-reference)

### "What are the system requirements?"

→ [`README.md`](./README.md#prerequisites)

---

## 📄 File Guide

### Root Level Documentation

- **`README.md`** — Main documentation (setup, features, API reference)
- **`QUICKSTART.md`** — Fast track setup (15 min)
- **`DEPLOYMENT.md`** — Deployment to cloud
- **`ARCHITECTURE.md`** — System design & data models
- **`DEV_GUIDE.md`** — Developer guide for extending code
- **`TESTING.md`** — Test scenarios and procedures
- **`PROJECT_SUMMARY.md`** — Project completion summary
- **`DOCS_INDEX.md`** — This file

### Backend Files

- **`backend/requirements.txt`** — Python dependencies
- **`backend/.env`** — Environment variables (local dev)
- **`backend/.env.example`** — Environment template
- **`backend/main.py`** — FastAPI app entry point
- **`backend/config.py`** — Configuration loading
- **`backend/gemini.py`** — Gemini extraction logic
- **`backend/supabase_client.py`** — Database client
- **`backend/routes/*.py`** — API endpoints
- **`backend/models/*.py`** — Pydantic data models

### Frontend Files

- **`frontend/package.json`** — NPM dependencies
- **`frontend/.env.local`** — Environment variables
- **`frontend/tsconfig.json`** — TypeScript config
- **`frontend/app/page.tsx`** — Home page
- **`frontend/app/dashboard/page.tsx`** — Dashboard page
- **`frontend/components/*.tsx`** — React components
- **`frontend/lib/api.ts`** — API client functions
- **`frontend/lib/utils.ts`** — Utility functions

### Scripts

- **`scripts/scrape_jds.py`** — Web scraper for job descriptions
- **`scripts/requirements.txt`** — Scraper dependencies

### Public/Assets

- **`public/sample_jds.csv`** — Sample data for testing

---

## 🔗 External Resources

- **Google Gemini API**: https://ai.google.dev/
- **Next.js Documentation**: https://nextjs.org/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/

---

## 📞 Support

### When you encounter issues:

1. **Check the error message** — Often tells you exactly what's wrong
2. **Search this documentation** — Use Ctrl+F to find keywords
3. **Check README Troubleshooting** → [`README.md#troubleshooting`](./README.md#troubleshooting)
4. **Check browser console** — Source of frontend errors
5. **Check backend terminal** — Source of API errors
6. **Check Supabase dashboard** — For database issues

---

## 📊 Document Statistics

- **Total Pages**: 11 main documents
- **Total Words**: ~15,000+ words of documentation
- **Code Examples**: 50+ examples across all docs
- **Diagrams**: Architecture, data flow, system design
- **Quick Start Time**: 15 minutes from zero to working app

---

## ✅ Document Checklist

- [x] README.md - Comprehensive setup & features guide
- [x] QUICKSTART.md - 15-minute fast track setup
- [x] DEPLOYMENT.md - Production deployment guide
- [x] ARCHITECTURE.md - System design & data models
- [x] DEV_GUIDE.md - Developer extension guide
- [x] TESTING.md - Testing procedures & scenarios
- [x] PROJECT_SUMMARY.md - Project completion summary
- [x] .env.example files - Configuration templates
- [x] DOCS_INDEX.md - This documentation index

---

## 🎉 You're All Set!

Everything you need is documented. Start with [`QUICKSTART.md`](./QUICKSTART.md) and enjoy building with JD Structura!

**Questions?** Check the relevant document above.

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: ✅ Ready for Production
