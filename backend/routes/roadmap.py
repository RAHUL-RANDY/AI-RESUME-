from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from backend.database.mongo import get_db
from backend.models.schemas import RoadmapResponse
from backend.services.roadmap_service import generate_career_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])

class RoadmapGenerateRequest(BaseModel):
    target_role: str = "Full Stack Engineer"
    missing_skills: List[str] = []
    experience_years: float = 2.0
    user_id: Optional[str] = None

@router.post("/generate", response_model=RoadmapResponse)
async def create_roadmap(req: RoadmapGenerateRequest):
    """
    Constructs an interactive month-by-month career advancement roadmap
    targeted to candidate's missing competencies.
    """
    return generate_career_roadmap(
        target_role=req.target_role,
        missing_skills=req.missing_skills,
        experience_years=req.experience_years,
        user_id=req.user_id
    )

@router.get("/{user_id}", response_model=RoadmapResponse)
async def get_user_roadmap(user_id: str, db = Depends(get_db)):
    """
    Retrieves user profile and computes customized roadmap.
    """
    resume_doc = await db["resumes"].find_one({"user_id": user_id})
    target_role = resume_doc.get("target_role", "Software Engineer") if resume_doc else "Software Engineer"
    exp = resume_doc.get("total_experience_years", 2.0) if resume_doc else 2.0
    
    return generate_career_roadmap(
        target_role=target_role,
        missing_skills=["Docker", "Kubernetes", "AWS", "System Design"],
        experience_years=exp,
        user_id=user_id
    )
