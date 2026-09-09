import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from backend.database.mongo import DatabaseManager

router = APIRouter(prefix="/api/tracker", tags=["Job Application Tracker & Kanban"])

class JobApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    role: str
    location: Optional[str] = "Remote / Hybrid"
    salary: Optional[str] = "$120,000 - $150,000"
    status: str = Field(default="Wishlist", description="Wishlist, Applied, Interviewing, Offer, Rejected")
    applied_date: Optional[str] = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    next_step: Optional[str] = "Follow up with recruiter"
    notes: Optional[str] = ""
    job_url: Optional[str] = ""
    contact_email: Optional[str] = ""

class UpdateApplicationStatus(BaseModel):
    status: str
    next_step: Optional[str] = None
    notes: Optional[str] = None

# In-memory store initialized with realistic initial items
_applications_store: Dict[str, Dict[str, Any]] = {
    "app-1": {
        "id": "app-1",
        "company": "Stripe",
        "role": "Staff Software Engineer - Infrastructure",
        "location": "San Francisco, CA / Remote",
        "salary": "$210,000 - $260,000",
        "status": "Interviewing",
        "applied_date": "2026-09-02",
        "next_step": "System Design Round (Virtual Onsite)",
        "notes": "Reviewed distributed consensus and rate-limiting patterns.",
        "job_url": "https://stripe.com/jobs",
        "contact_email": "recruiting@stripe.com"
    },
    "app-2": {
        "id": "app-2",
        "company": "Vercel",
        "role": "Senior Cloud Platform Engineer",
        "location": "Remote (Global)",
        "salary": "$175,000 - $215,000",
        "status": "Applied",
        "applied_date": "2026-09-05",
        "next_step": "Recruiter Screen pending",
        "notes": "Submitted with tailored ATS resume highlighting Next.js edge runtimes.",
        "job_url": "https://vercel.com/careers",
        "contact_email": "talent@vercel.com"
    },
    "app-3": {
        "id": "app-3",
        "company": "OpenAI",
        "role": "Full Stack AI Applications Engineer",
        "location": "San Francisco, CA",
        "salary": "$240,000 - $310,000",
        "status": "Offer",
        "applied_date": "2026-08-20",
        "next_step": "Review benefits & stock package before signing",
        "notes": "Total compensation offer received. Discussing start date.",
        "job_url": "https://openai.com/careers",
        "contact_email": "careers@openai.com"
    },
    "app-4": {
        "id": "app-4",
        "company": "Datadog",
        "role": "Backend Systems Engineer",
        "location": "New York, NY / Remote",
        "salary": "$165,000 - $195,000",
        "status": "Wishlist",
        "applied_date": "2026-09-08",
        "next_step": "Connect with hiring manager on LinkedIn",
        "notes": "Need to tailor resume for APM and telemetry tracing experience.",
        "job_url": "https://datadog.com/careers",
        "contact_email": "careers@datadog.com"
    }
}

@router.get("/applications", response_model=List[JobApplication])
async def list_applications(status: Optional[str] = None):
    """
    Returns candidate's tracked job applications, optionally filtered by status.
    """
    apps = list(_applications_store.values())
    if status:
        apps = [a for a in apps if a.get("status", "").lower() == status.lower()]
    # Sort latest applied date first
    apps.sort(key=lambda x: x.get("applied_date", ""), reverse=True)
    return [JobApplication(**a) for a in apps]

@router.post("/applications", response_model=JobApplication)
async def create_application(app_in: JobApplication):
    """
    Adds a new job application to the Kanban tracker.
    """
    app_data = app_in.model_dump()
    _applications_store[app_data["id"]] = app_data
    return JobApplication(**app_data)

@router.put("/applications/{app_id}", response_model=JobApplication)
async def update_application(app_id: str, update: UpdateApplicationStatus):
    """
    Updates status, notes, or next steps of an application (e.g. dragging across Kanban).
    """
    if app_id not in _applications_store:
        raise HTTPException(status_code=404, detail="Application not found")
    
    current = _applications_store[app_id]
    current["status"] = update.status
    if update.next_step is not None:
        current["next_step"] = update.next_step
    if update.notes is not None:
        current["notes"] = update.notes
    
    _applications_store[app_id] = current
    return JobApplication(**current)

@router.delete("/applications/{app_id}")
async def delete_application(app_id: str):
    """
    Deletes an application from the tracker.
    """
    if app_id in _applications_store:
        del _applications_store[app_id]
        return {"success": True, "message": "Application removed"}
    raise HTTPException(status_code=404, detail="Application not found")

@router.get("/stats")
async def get_tracker_stats():
    """
    Calculates summary pipeline metrics: Total, Wishlist, Applied, Interviewing, Offer, Conversion rate.
    """
    apps = list(_applications_store.values())
    total = len(apps)
    wishlist = sum(1 for a in apps if a.get("status") == "Wishlist")
    applied = sum(1 for a in apps if a.get("status") == "Applied")
    interviewing = sum(1 for a in apps if a.get("status") == "Interviewing")
    offers = sum(1 for a in apps if a.get("status") == "Offer")
    rejected = sum(1 for a in apps if a.get("status") == "Rejected")
    
    interview_rate = round((interviewing + offers) / max(1, applied + interviewing + offers) * 100, 1)
    
    return {
        "total_active": total,
        "wishlist": wishlist,
        "applied": applied,
        "interviewing": interviewing,
        "offers": offers,
        "rejected": rejected,
        "interview_conversion_rate": f"{interview_rate}%"
    }
