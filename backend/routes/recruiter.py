import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel

from backend.database.mongo import get_db
from backend.models.schemas import (
    CandidateSummary,
    RecruiterRankResponse,
    EmployabilityPredictionRequest,
    SalaryPredictionRequest,
)
from ai.resume_parser import parse_resume_bytes
from ai.ats_score import calculate_ats_score
from ai.resume_matching import analyze_resume_match
from ai.employability import predict_employability
from ai.salary_prediction import predict_salary

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter Portal"])

class RankCandidatesRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = "Software Engineer"

@router.post("/bulk-upload")
async def bulk_upload_resumes(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...),
    target_role: Optional[str] = Form("Software Engineer"),
    db = Depends(get_db)
):
    """
    Accepts batch resume uploads, parses each candidate, runs ML prediction + ATS scoring,
    and constructs a ranked leaderboard for recruiters.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    summaries: List[CandidateSummary] = []

    for file in files:
        filename = file.filename or "candidate.pdf"
        file_bytes = await file.read()
        parsed = parse_resume_bytes(file_bytes, filename)
        
        # 1. ATS & Semantic Match
        ats_res = calculate_ats_score(parsed, job_description)
        match_res = analyze_resume_match(parsed.raw_text, job_description, target_role)

        # 2. ML Employability & Salary Predictions
        emp_req = EmployabilityPredictionRequest(
            programming_skills_count=len(parsed.technical_skills),
            ml_skills_count=1 if any("machine learning" in s.lower() for s in parsed.skills) else 0,
            sql_proficiency=7 if any("sql" in s.lower() for s in parsed.skills) else 4,
            cloud_skills_count=2 if any(c in [s.lower() for s in parsed.skills] for c in ["aws", "docker", "gcp"]) else 0,
            projects_count=len(parsed.projects),
            certifications_count=len(parsed.certifications),
            experience_years=parsed.total_experience_years,
            education_tier=2,
            ats_score=ats_res.overall_score,
            resume_match_score=match_res.similarity_percentage
        )
        emp_res = predict_employability(emp_req)

        sal_req = SalaryPredictionRequest(
            experience_years=parsed.total_experience_years,
            education_tier=2,
            skills_count=len(parsed.skills),
            job_role=target_role or "Software Engineer",
            location_tier=1,
            certifications_count=len(parsed.certifications),
            projects_count=len(parsed.projects),
            technical_expertise_score=7.0
        )
        sal_res = predict_salary(sal_req)

        cand_id = str(uuid.uuid4())
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        summary = CandidateSummary(
            id=cand_id,
            name=parsed.name,
            email=parsed.email or f"applicant_{cand_id[:6]}@example.com",
            target_role=target_role or "Software Engineer",
            ats_score=ats_res.overall_score,
            match_score=match_res.similarity_percentage,
            employability_prob=emp_res.employability_probability,
            predicted_salary=sal_res.predicted_salary,
            experience_years=parsed.total_experience_years,
            top_skills=parsed.skills[:6],
            uploaded_at=now_str
        )
        summaries.append(summary)

        # Save to database
        candidate_doc = summary.model_dump()
        candidate_doc["_id"] = cand_id
        candidate_doc["raw_text"] = parsed.raw_text[:1000]
        await db["candidates"].insert_one(candidate_doc)

    # Sort leaderboard by weighted composite score: 40% match + 30% ATS + 30% Employability
    summaries.sort(
        key=lambda c: (0.40 * c.match_score + 0.30 * c.ats_score + 0.30 * c.employability_prob),
        reverse=True
    )

    return {
        "total_processed": len(summaries),
        "job_description": job_description[:200] + "...",
        "candidates": summaries
    }

@router.get("/candidates", response_model=List[CandidateSummary])
async def get_all_candidates(db = Depends(get_db)):
    """
    Retrieves candidate directory for recruiters.
    """
    cursor = await db["candidates"].find()
    docs = await cursor.to_list(100)
    
    results = []
    for d in docs:
        if "_id" in d and "id" not in d:
            d["id"] = str(d["_id"])
        results.append(CandidateSummary(**d))
    return results
