import re
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.services.openai_service import generate_chat_response, get_openai_key

router = APIRouter(prefix="/api/outreach", tags=["AI Outreach & Cover Letter Suite"])

class CoverLetterRequest(BaseModel):
    full_name: str = Field(..., description="Candidate's full name")
    target_role: str = Field(..., description="Target role (e.g. Senior Backend Engineer)")
    company_name: str = Field(..., description="Target company (e.g. Stripe)")
    job_description: Optional[str] = Field(default="", description="Job description or key responsibilities")
    key_skills: Optional[str] = Field(default="Python, FastAPI, System Design, PostgreSQL, Cloud Architecture", description="Comma-separated skills")
    experience_summary: Optional[str] = Field(default="4+ years designing high-throughput distributed backend services", description="Summary of track record")
    tone: Optional[str] = Field(default="confident_professional", description="professional, confident_professional, energetic_innovator, executive")

class ColdOutreachRequest(BaseModel):
    full_name: str = Field(..., description="Candidate's full name")
    recipient_name: Optional[str] = Field(default="Hiring Manager", description="Recipient name or title")
    target_role: str = Field(..., description="Target role applied for")
    company_name: str = Field(..., description="Target company")
    top_accomplishment: Optional[str] = Field(default="Scaled a microservice pipeline handling 25M daily requests", description="Biggest accomplishment")
    portfolio_url: Optional[str] = Field(default="", description="Link to GitHub / Portfolio")

class CoverLetterResponse(BaseModel):
    cover_letter: str
    ats_alignment_keywords: List[str]
    subject_line: str
    word_count: int

class ColdOutreachResponse(BaseModel):
    cold_email_subject: str
    cold_email_body: str
    linkedin_dm: str
    follow_up_email: str

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(req: CoverLetterRequest):
    """
    Generates tailored, high-converting ATS-optimized cover letter.
    """
    skills_list = [s.strip() for s in req.key_skills.split(",") if s.strip()] if req.key_skills else ["Technical Leadership", "System Design", "Problem Solving"]
    
    openai_key = get_openai_key()
    if openai_key:
        try:
            system_prompt = f"""You are a top-tier tech executive career coach.
Write an authentic, punchy, non-generic, ATS-optimized cover letter for:
Candidate: {req.full_name}
Target Role: {req.target_role}
Company: {req.company_name}
Tone: {req.tone}
Key Skills: {req.key_skills}
Experience: {req.experience_summary}
Job Description Context: {req.job_description}

Guidelines:
- 3 to 4 impactful paragraphs (approx 250-320 words).
- Hook the reader in paragraph 1 with genuine passion for {req.company_name}'s mission.
- Highlight concrete measurable outcomes in paragraph 2 using candidate's skills ({req.key_skills}).
- Align with culture & technical scale in paragraph 3.
- Professional close with a call to action.
- Do NOT use cliché buzzwords like 'synergy' or 'detail-oriented self-starter'.
Return ONLY the cover letter text.
"""
            letter = await generate_chat_response(
                messages=[{"role": "user", "content": f"Generate cover letter for {req.target_role} at {req.company_name}."}],
                system_prompt=system_prompt,
                model="gpt-4o-mini",
                temperature=0.5,
                max_tokens=650
            )
            if letter:
                words = len(re.findall(r'\b\w+\b', letter))
                return CoverLetterResponse(
                    cover_letter=letter.strip(),
                    ats_alignment_keywords=skills_list[:6],
                    subject_line=f"Application for {req.target_role} — {req.full_name}",
                    word_count=words
                )
        except Exception:
            pass

    # Intelligent template fallback
    fallback_letter = f"""Dear {req.company_name} Hiring Team,

I am writing to express my enthusiastic interest in the {req.target_role} position at {req.company_name}. Having tracked {req.company_name}'s rapid engineering innovation and market leadership, I am eager to bring my background in {req.experience_summary} to your team.

Throughout my career, I have focused on engineering resilient, scalable solutions that bridge technical rigor with measurable business value. In my recent engagements, I spearheaded the design and implementation of systems utilizing {', '.join(skills_list[:4])}, leading to marked improvements in throughput, system reliability, and developer velocity. I thrive on diving into complex distributed systems problems and optimizing critical bottlenecks under demanding production SLAs.

What draws me specifically to {req.company_name} is your commitment to technical excellence and user-centric architecture. With my hands-on proficiency in {req.key_skills}, I am confident in my ability to immediately contribute to your engineering milestones, partner cross-functionally with product stakeholders, and champion modern engineering best practices.

I would welcome the opportunity to discuss how my skill set and drive align with {req.company_name}’s strategic roadmap. Thank you for your time and consideration.

Warm regards,

{req.full_name}"""

    return CoverLetterResponse(
        cover_letter=fallback_letter,
        ats_alignment_keywords=skills_list[:6],
        subject_line=f"Application for {req.target_role} — {req.full_name}",
        word_count=len(re.findall(r'\b\w+\b', fallback_letter))
    )

@router.post("/cold-outreach", response_model=ColdOutreachResponse)
async def generate_cold_outreach(req: ColdOutreachRequest):
    """
    Generates personalized Recruiter Cold Email, Hiring Manager LinkedIn DM,
    and a polite follow-up template.
    """
    portfolio_text = f" You can view my technical work and repositories here: {req.portfolio_url}." if req.portfolio_url else ""
    recipient = req.recipient_name or "Hiring Team"

    cold_email_subject = f"Quick question re: {req.target_role} at {req.company_name} ({req.full_name})"
    
    cold_email_body = f"""Hi {recipient},

I noticed that {req.company_name} is scaling its engineering efforts for the {req.target_role} role.

In my recent work, I {req.top_accomplishment.lower().strip('.')}, with a strong emphasis on operational reliability and clean architecture.{portfolio_text}

I’d love to share how I can bring similar impact to {req.company_name}'s technical roadmap. Would you be open to a brief 10-minute chat this Thursday or Friday?

Best,
{req.full_name}"""

    linkedin_dm = f"""Hi {recipient}, hope you're having a great week! I saw {req.company_name} is hiring for the {req.target_role}. With my track record in {req.top_accomplishment.lower().strip('.')}, I’d love to connect and see if my background aligns with what your team is building.{portfolio_text} Thanks! — {req.full_name}"""

    follow_up_email = f"""Hi {recipient},

Following up briefly on my earlier note regarding the {req.target_role} opening at {req.company_name}. 

I understand you have a full schedule. If the timing isn't right, no problem at all — I'd still be grateful to stay in touch for future technical openings.

Best regards,
{req.full_name}"""

    return ColdOutreachResponse(
        cold_email_subject=cold_email_subject,
        cold_email_body=cold_email_body,
        linkedin_dm=linkedin_dm,
        follow_up_email=follow_up_email
    )
