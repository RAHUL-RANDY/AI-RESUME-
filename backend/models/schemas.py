from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CANDIDATE

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    role: Optional[UserRole] = UserRole.CANDIDATE

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    exp: int

# Resume and Parsing Schemas
class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None

class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    duration: Optional[str] = None
    duration_years: float = 0.0
    description: str = ""
    highlights: List[str] = []

class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = []
    link: Optional[str] = None

class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    date: Optional[str] = None

class ParsedResume(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    filename: Optional[str] = None
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: str = ""
    education: List[EducationItem] = []
    skills: List[str] = []
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    languages: List[str] = []
    total_experience_years: float = 0.0
    raw_text: str = ""
    created_at: Optional[str] = None

# ATS Scoring Schemas
class ATSScoreBreakdown(BaseModel):
    keyword_match: float = Field(..., description="Weight 25%")
    skills_match: float = Field(..., description="Weight 25%")
    experience_relevance: float = Field(..., description="Weight 20%")
    education_match: float = Field(..., description="Weight 15%")
    structure_quality: float = Field(..., description="Weight 10%")
    formatting_readability: float = Field(..., description="Weight 5%")

class ATSScoreResponse(BaseModel):
    overall_score: float
    breakdown: ATSScoreBreakdown
    strengths: List[str] = []
    deficiencies: List[str] = []
    recommendations: List[str] = []
    keyword_density: Dict[str, int] = {}

# Semantic Matching Schemas
class MatchRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: Optional[str] = None

class MatchResponse(BaseModel):
    match_score: float
    similarity_percentage: float
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    summary_analysis: str = ""

# Skill Gap Schemas
class SkillGapRequest(BaseModel):
    resume_skills: List[str]
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []

class RadarAxisData(BaseModel):
    subject: str
    candidate: float
    requirement: float
    fullMark: float = 100.0

class SkillGapResponse(BaseModel):
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    optional_skills: List[str] = []
    gap_percentage: float
    coverage_score: float
    radar_data: List[RadarAxisData] = []

# ML Prediction Schemas
class EmployabilityPredictionRequest(BaseModel):
    programming_skills_count: int = 5
    ml_skills_count: int = 2
    sql_proficiency: int = 7
    cloud_skills_count: int = 1
    projects_count: int = 3
    certifications_count: int = 1
    experience_years: float = 2.0
    education_tier: int = 2
    ats_score: float = 75.0
    resume_match_score: float = 70.0

class FeatureContribution(BaseModel):
    feature: str
    value: Any
    impact: float
    description: str

class EmployabilityPredictionResponse(BaseModel):
    employability_probability: float
    is_employable: bool
    confidence_level: str
    risk_assessment: str
    top_contributing_features: List[FeatureContribution] = []

class SalaryPredictionRequest(BaseModel):
    experience_years: float = 3.0
    education_tier: int = 2
    skills_count: int = 12
    job_role: str = "Software Engineer"
    location_tier: int = 1
    certifications_count: int = 1
    projects_count: int = 3
    technical_expertise_score: float = 7.5

class SalaryPredictionResponse(BaseModel):
    predicted_salary: float
    salary_min: float
    salary_max: float
    currency: str = "USD"
    confidence_interval: str = "95%"
    top_contributing_features: List[FeatureContribution] = []

# Course Recommendation Schemas
class CourseItem(BaseModel):
    id: str
    title: str
    provider: str
    url: str
    rating: float
    duration_hours: int
    level: str
    category: Optional[str] = "General Tech"
    target_role: Optional[str] = "All Roles"
    is_free: Optional[bool] = False
    price_display: Optional[str] = "Paid"
    skills_covered: List[str]
    relevance_score: Optional[float] = 0.0

class RecommendationRequest(BaseModel):
    missing_skills: List[str]
    career_goal: Optional[str] = "Full Stack Engineer"
    experience_level: Optional[str] = "Intermediate"
    category: Optional[str] = None
    target_role: Optional[str] = None
    pricing_type: Optional[str] = "all"  # "all", "free", "paid"
    top_k: Optional[int] = 12

class RecommendationResponse(BaseModel):
    recommended_courses: List[CourseItem]
    total: int
    free_count: Optional[int] = 0
    paid_count: Optional[int] = 0
    categories: Optional[List[str]] = []
    roles: Optional[List[str]] = []

# Career Roadmap Schemas
class RoadmapMilestone(BaseModel):
    month: int
    title: str
    focus_skills: List[str]
    goal: str
    action_items: List[str]
    projects_to_build: List[str]
    recommended_certifications: List[str]

class RoadmapResponse(BaseModel):
    user_id: Optional[str] = None
    target_role: str
    estimated_duration_months: int
    milestones: List[RoadmapMilestone]

# AI Mentor & Interview Intelligence Schemas
class ChatMessage(BaseModel):
    role: str # "user" or "assistant" or "system"
    content: str

class MentorChatRequest(BaseModel):
    messages: List[ChatMessage]
    candidate_profile: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = None
    missing_skills: Optional[List[str]] = []

class MentorChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = []

class InterviewQuestion(BaseModel):
    id: str
    category: str # "HR", "Technical", "Project-based", "Behavioral"
    question: str
    context: str
    key_evaluation_points: List[str]
    suggested_structure: str # e.g. STAR method

class InterviewQuestionsRequest(BaseModel):
    target_role: str
    skills: List[str] = []
    experience_years: float = 2.0
    projects: List[str] = []

class InterviewQuestionsResponse(BaseModel):
    target_role: str
    questions: List[InterviewQuestion]

# Recruiter & Admin Schemas
class CandidateSummary(BaseModel):
    id: str
    name: str
    email: str
    target_role: str
    ats_score: float
    match_score: float
    employability_prob: float
    predicted_salary: float
    experience_years: float
    top_skills: List[str]
    uploaded_at: str

class RecruiterRankResponse(BaseModel):
    total_candidates: int
    job_description: str
    candidates: List[CandidateSummary]

class AdminSystemStats(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_resumes_analyzed: int
    employability_model_status: str
    salary_model_status: str
    nlp_models_loaded: bool
