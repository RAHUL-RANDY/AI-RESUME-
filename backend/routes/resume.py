import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from backend.database.mongo import get_db
from backend.models.schemas import ParsedResume, ATSScoreResponse
from ai.resume_parser import parse_resume_bytes
from ai.ats_score import calculate_ats_score

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/upload")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form("Software Engineer"),
    db = Depends(get_db)
):
    """
    Accepts PDF or DOCX resume, validates format and size, extracts structured entities,
    and calculates dynamic ATS score against the provided job description.
    """
    filename = file.filename or "resume.pdf"
    filename_lower = filename.lower()
    
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx") or filename_lower.endswith(".doc")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx)."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum limit of 10 MB."
        )

    # 1. Parse Resume
    parsed_resume = parse_resume_bytes(file_bytes, filename)
    resume_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    parsed_resume.id = resume_id
    parsed_resume.created_at = now_iso

    # 2. Dynamic ATS Scoring
    ats_result: Optional[ATSScoreResponse] = None
    if job_description and job_description.strip():
        ats_result = calculate_ats_score(parsed_resume, job_description)

    # 3. Store in database
    doc = parsed_resume.model_dump()
    doc["_id"] = resume_id
    doc["target_role"] = target_role
    if ats_result:
        doc["ats_score"] = ats_result.overall_score
        doc["ats_breakdown"] = ats_result.breakdown.model_dump()

    await db["resumes"].insert_one(doc)

    return {
        "resume": parsed_resume,
        "ats_result": ats_result,
        "message": "Resume parsed and evaluated successfully."
    }

@router.get("/{resume_id}", response_model=ParsedResume)
async def get_resume(resume_id: str, db = Depends(get_db)):
    doc = await db["resumes"].find_one({"_id": resume_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found.")
    doc["id"] = str(doc.pop("_id"))
    return ParsedResume(**doc)
