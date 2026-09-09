from typing import Optional
from fastapi import APIRouter, Query
from backend.models.schemas import RecommendationRequest, RecommendationResponse
from ai.recommendation import recommend_courses

router = APIRouter(prefix="/api/recommendation", tags=["Course Recommendations"])

@router.post("/courses", response_model=RecommendationResponse)
async def get_course_recommendations(req: RecommendationRequest):
    """
    Returns ranked courses from accredited platforms addressing candidate's skill gaps and target role.
    """
    return recommend_courses(
        missing_skills=req.missing_skills,
        career_goal=req.career_goal,
        experience_level=req.experience_level,
        category=req.category,
        target_role=req.target_role,
        pricing_type=req.pricing_type or "all",
        top_k=req.top_k or 12
    )

@router.get("/all", response_model=RecommendationResponse)
async def get_all_courses(
    category: Optional[str] = Query(None),
    target_role: Optional[str] = Query(None),
    pricing_type: Optional[str] = Query("all")
):
    """
    Returns the comprehensive catalog of targeted tech courses with optional category, target job role & pricing filters.
    """
    return recommend_courses(
        missing_skills=[],
        career_goal=None,
        experience_level=None,
        category=category,
        target_role=target_role,
        pricing_type=pricing_type or "all",
        top_k=150
    )
