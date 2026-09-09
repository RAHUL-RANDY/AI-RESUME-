from fastapi import APIRouter
from backend.models.schemas import (
    MatchRequest,
    MatchResponse,
    SkillGapRequest,
    SkillGapResponse,
)
from ai.resume_matching import analyze_resume_match
from ai.skill_gap import analyze_skill_gap

router = APIRouter(prefix="/api/matching", tags=["Matching & Skill Gap"])

@router.post("/analyze", response_model=MatchResponse)
async def analyze_match(req: MatchRequest):
    """
    SBERT Dense Embedding cosine similarity matching between resume text and job description.
    """
    return analyze_resume_match(req.resume_text, req.job_description, req.target_role)

@router.post("/skill-gap", response_model=SkillGapResponse)
async def get_skill_gap(req: SkillGapRequest):
    """
    Normalizes skill taxonomies, performs set difference, and constructs radar chart vectors.
    """
    return analyze_skill_gap(req.resume_skills, req.required_skills, req.preferred_skills)
