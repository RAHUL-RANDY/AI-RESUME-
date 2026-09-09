from typing import Optional, List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.models.schemas import (
    MentorChatRequest,
    MentorChatResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)
from ai.mentor import chat_with_mentor, generate_interview_questions
from backend.services.openai_service import (
    get_llm_status,
    rewrite_bullet_point,
    generate_tailored_summary,
)

router = APIRouter(prefix="/api/mentor", tags=["AI Career Mentor & Interview Intelligence"])

class RewriteBulletRequest(BaseModel):
    bullet_text: str = Field(..., description="Original resume bullet point to polish")
    target_role: Optional[str] = Field(None, description="Target job title")
    skills: Optional[List[str]] = Field(default=[], description="Target skills to weave in")

class TailorSummaryRequest(BaseModel):
    candidate_name: str = Field(default="Candidate")
    experience_years: float = Field(default=2.0)
    skills: List[str] = Field(default=[])
    target_role: str = Field(default="Software Engineer")
    job_description: Optional[str] = Field(None)

@router.get("/status")
async def get_mentor_llm_status():
    """Returns whether OpenAI or built-in contextual intelligence is currently active."""
    return get_llm_status()

@router.post("/chat", response_model=MentorChatResponse)
async def mentor_chat(req: MentorChatRequest):
    """
    Conversational AI Career Mentor evaluating user questions in the context of their profile.
    """
    return await chat_with_mentor(
        messages=req.messages,
        candidate_profile=req.candidate_profile,
        target_role=req.target_role,
        missing_skills=req.missing_skills
    )

@router.post("/interview-questions", response_model=InterviewQuestionsResponse)
async def get_interview_questions(req: InterviewQuestionsRequest):
    """
    Generates interview questions across HR, Technical, Project, and Behavioral categories.
    """
    return generate_interview_questions(
        target_role=req.target_role,
        skills=req.skills,
        experience_years=req.experience_years,
        projects=req.projects
    )

@router.post("/rewrite-bullet")
async def rewrite_bullet(req: RewriteBulletRequest):
    """
    Rewrites a resume bullet using STAR methodology with action verbs & metrics.
    Powered by OpenAI with intelligent heuristic fallback.
    """
    return await rewrite_bullet_point(
        bullet_text=req.bullet_text,
        target_role=req.target_role,
        skills=req.skills
    )

@router.post("/tailor-summary")
async def tailor_summary(req: TailorSummaryRequest):
    """
    Generates a high-converting ATS professional summary tailored to role and job description.
    Powered by OpenAI with intelligent heuristic fallback.
    """
    return await generate_tailored_summary(
        candidate_name=req.candidate_name,
        experience_years=req.experience_years,
        skills=req.skills,
        target_role=req.target_role,
        job_description=req.job_description
    )
