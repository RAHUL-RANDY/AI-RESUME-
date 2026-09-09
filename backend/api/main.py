import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv

from backend.database.mongo import DatabaseManager
from backend.routes import (
    auth,
    resume,
    matching,
    prediction,
    recommendation,
    roadmap,
    mentor,
    recruiter,
    admin,
    subscription,
    voice_interview,
    outreach,
    job_tracker,
    developer_profile,
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await DatabaseManager.connect()
    yield
    # Shutdown
    await DatabaseManager.close()

app = FastAPI(
    title="AI Career Intelligence Platform API",
    description="Enterprise full-stack API for resume parsing, ATS scoring, ML predictions, and AI career mentoring.",
    version="1.0.0",
    lifespan=lifespan
)

# GZip compression middleware for all responses > 1KB (shrinks payloads by up to 75%)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(matching.router)
app.include_router(prediction.router)
app.include_router(recommendation.router)
app.include_router(roadmap.router)
app.include_router(mentor.router)
app.include_router(recruiter.router)
app.include_router(admin.router)
app.include_router(subscription.router)
app.include_router(voice_interview.router)
app.include_router(outreach.router)
app.include_router(job_tracker.router)
app.include_router(developer_profile.router)

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

@app.get("/api/health", tags=["Health"])
async def health_check():
    backend_status = "fallback_in_memory" if DatabaseManager.is_fallback else f"{DatabaseManager.active_backend}_connected"
    return {
        "status": "online",
        "service": "AI Career Intelligence Platform API",
        "version": "1.0.0",
        "database": backend_status,
        "database_engine": DatabaseManager.active_backend
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )
