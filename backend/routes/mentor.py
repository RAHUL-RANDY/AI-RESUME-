# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from backend.models.schemas import (
    MentorChatRequest,
    MentorChatResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)
from ai.mentor import chat_with_mentor, generate_interview_questions

router = APIRouter(prefix="/api/mentor", tags=["AI Career Mentor & Interview Intelligence"])

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
