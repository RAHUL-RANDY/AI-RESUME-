# API Reference Specification

Base URL: `http://localhost:8000/api`

All JSON request and response payloads adhere to strict Pydantic v2 schemas.

---

## Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "password": "SecurePassword123!",
    "role": "candidate"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "uuid-v4-string",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "role": "candidate",
    "created_at": "2026-03-01T12:00:00Z"
  }
  ```

### `POST /api/auth/login`
Authenticates user and returns JWT Bearer token.
- **Request Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `GET /api/auth/me`
Returns currently authenticated user profile (Requires `Authorization: Bearer <token>`).

---

## Resume Analysis (`/api/resume`)

### `POST /api/resume/upload`
Uploads a resume file (`.pdf` or `.docx`), extracts structured entities, and calculates ATS score against an optional job description.
- **Form Data:**
  - `file`: PDF or DOCX file bytes (Required, max 10MB)
  - `job_description`: Target job description string (Optional)
  - `target_role`: Target role title (Default: "Software Engineer")
- **Response (200 OK):**
  ```json
  {
    "resume": {
      "id": "uuid",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "skills": ["Python", "FastAPI", "React", "Docker"],
      "total_experience_years": 4.0,
      "education": [...],
      "experience": [...],
      "projects": [...]
    },
    "ats_result": {
      "overall_score": 86.5,
      "breakdown": {
        "keyword_match": 84.0,
        "skills_match": 88.0,
        "experience_relevance": 90.0,
        "education_match": 95.0,
        "structure_quality": 90.0,
        "formatting_readability": 85.0
      },
      "strengths": [...],
      "deficiencies": [...],
      "recommendations": [...]
    }
  }
  ```

---

## Semantic Matching & Skill Gap (`/api/matching`)

### `POST /api/matching/analyze`
Dense SBERT embedding cosine matching.
- **Request Body:**
  ```json
  {
    "resume_text": "Experienced Python and React developer...",
    "job_description": "Hiring Senior Engineer with Python and Docker...",
    "target_role": "Full Stack Engineer"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "match_score": 0.824,
    "similarity_percentage": 84.2,
    "matched_keywords": ["python", "react", "docker"],
    "missing_keywords": ["kubernetes", "graphql"],
    "summary_analysis": "Exceptional semantic alignment..."
  }
  ```

### `POST /api/matching/skill-gap`
Normalizes skills and produces radar comparison vectors.
- **Request Body:**
  ```json
  {
    "resume_skills": ["Python", "JS", "React"],
    "required_skills": ["Python", "JavaScript", "Kubernetes", "AWS"]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "matching_skills": ["JavaScript", "Python"],
    "missing_skills": ["AWS", "Kubernetes"],
    "gap_percentage": 50.0,
    "coverage_score": 50.0,
    "radar_data": [
      { "subject": "Languages", "candidate": 85, "requirement": 90, "fullMark": 100 },
      ...
    ]
  }
  ```

---

## Machine Learning Predictions (`/api/prediction`)

### `POST /api/prediction/employability`
Random Forest Classifier predicting hiring readiness with SHAP attribution.
- **Request Body:**
  ```json
  {
    "programming_skills_count": 8,
    "ml_skills_count": 2,
    "sql_proficiency": 8,
    "cloud_skills_count": 3,
    "projects_count": 4,
    "certifications_count": 2,
    "experience_years": 4.0,
    "education_tier": 2,
    "ats_score": 86.5,
    "resume_match_score": 84.0
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "employability_probability": 88.5,
    "is_employable": true,
    "confidence_level": "High",
    "risk_assessment": "Low Risk: Candidate profile demonstrates strong technical foundation...",
    "top_contributing_features": [
      { "feature": "ATS Score", "value": 86.5, "impact": 0.18, "description": "..." },
      ...
    ]
  }
  ```

### `POST /api/prediction/salary`
Random Forest Regressor predicting total compensation with 95% confidence intervals and SHAP impact.
- **Request Body:**
  ```json
  {
    "experience_years": 4.0,
    "education_tier": 2,
    "skills_count": 12,
    "job_role": "Full Stack Engineer",
    "location_tier": 1,
    "certifications_count": 1,
    "projects_count": 3,
    "technical_expertise_score": 7.5
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "predicted_salary": 152000.0,
    "salary_min": 139800.0,
    "salary_max": 164200.0,
    "currency": "USD",
    "confidence_interval": "95%",
    "top_contributing_features": [...]
  }
  ```

---

## Recommendations & Roadmap

### `POST /api/recommendation/courses`
Content-based filtering against missing competencies.
- **Request Body:**
  ```json
  {
    "missing_skills": ["Kubernetes", "AWS"],
    "career_goal": "Cloud Architect"
  }
  ```

### `POST /api/roadmap/generate`
Constructs dynamic month-by-month learning milestones.

---

## AI Career Mentor & Interview Prep (`/api/mentor`)

### `POST /api/mentor/chat`
Conversational career coaching grounded in candidate's verified profile.

### `POST /api/mentor/interview-questions`
Generates categorized interview questions across HR, Technical, Project, and Behavioral (STAR).

---

## Recruiter & Admin (`/api/recruiter`, `/api/admin`)

- `POST /api/recruiter/bulk-upload`: Batch process multiple resumes and return ranked leaderboard.
- `GET /api/recruiter/candidates`: Retrieve all evaluated candidates.
- `GET /api/admin/stats`: Platform user, parsing, and model health counts.
- `GET /api/admin/models`: Audited ML metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, R², MAE).
