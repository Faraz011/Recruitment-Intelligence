from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import API_PREFIX
from routes import extract, batch, listings, scorecard, scorecards
from keep_alive import start_keep_alive_scheduler

app = FastAPI(
    title="JD Structura API",
    description="Recruitment Intelligence Pipeline",
    version="1.0.0"
)

# Start keep-alive scheduler to prevent Render cold starts
start_keep_alive_scheduler()

# CORS middleware for local dev and Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def health_check():
    return {"status": "ok"}

# Register routers
app.include_router(extract.router, prefix=API_PREFIX, tags=["extraction"])
app.include_router(batch.router, prefix=API_PREFIX, tags=["batch"])
app.include_router(listings.router, prefix=API_PREFIX, tags=["listings"])
app.include_router(scorecard.router, prefix=API_PREFIX, tags=["scorecard"])
app.include_router(scorecards.router, prefix=API_PREFIX, tags=["scorecards"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
