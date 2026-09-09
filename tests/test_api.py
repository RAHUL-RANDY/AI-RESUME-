import pytest
from httpx import AsyncClient, ASGITransport
from backend.api.main import app

@pytest.mark.asyncio
async def test_full_api_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Health
        h_resp = await ac.get("/api/health")
        assert h_resp.status_code == 200

        # 2. Matching
        m_payload = {
            "resume_text": "Experienced Python Engineer proficient in FastAPI, PostgreSQL, and Docker.",
            "job_description": "Hiring Python Developer with FastAPI and Docker experience."
        }
        m_resp = await ac.post("/api/matching/analyze", json=m_payload)
        assert m_resp.status_code == 200
        assert m_resp.json()["similarity_percentage"] > 50.0

        # 3. Skill Gap
        gap_payload = {
            "resume_skills": ["Python", "FastAPI", "Docker"],
            "required_skills": ["Python", "FastAPI", "Kubernetes", "AWS"]
        }
        gap_resp = await ac.post("/api/matching/skill-gap", json=gap_payload)
        assert gap_resp.status_code == 200
        data = gap_resp.json()
        assert "Kubernetes" in data["missing_skills"]
        assert len(data["radar_data"]) == 6

        # 4. Employability Prediction
        emp_payload = {
            "programming_skills_count": 8,
            "ml_skills_count": 2,
            "sql_proficiency": 8,
            "cloud_skills_count": 3,
            "projects_count": 4,
            "certifications_count": 2,
            "experience_years": 4.0,
            "education_tier": 2,
            "ats_score": 85.0,
            "resume_match_score": 80.0
        }
        emp_resp = await ac.post("/api/prediction/employability", json=emp_payload)
        assert emp_resp.status_code == 200
        assert "employability_probability" in emp_resp.json()

        # 5. Salary Prediction
        sal_payload = {
            "experience_years": 4.0,
            "education_tier": 2,
            "skills_count": 12,
            "job_role": "Backend Engineer",
            "location_tier": 1,
            "certifications_count": 1,
            "projects_count": 3,
            "technical_expertise_score": 7.5
        }
        sal_resp = await ac.post("/api/prediction/salary", json=sal_payload)
        assert sal_resp.status_code == 200
        assert sal_resp.json()["predicted_salary"] > 90000.0

        # 6. Recommendations
        rec_payload = {
            "missing_skills": ["Kubernetes", "AWS"],
            "career_goal": "Cloud Architect"
        }
        rec_resp = await ac.post("/api/recommendation/courses", json=rec_payload)
        assert rec_resp.status_code == 200
        assert len(rec_resp.json()["recommended_courses"]) > 0

        # 7. Roadmap
        rd_payload = {
            "target_role": "Full Stack Engineer",
            "missing_skills": ["Kubernetes", "AWS", "GraphQL"],
            "experience_years": 3.0
        }
        rd_resp = await ac.post("/api/roadmap/generate", json=rd_payload)
        assert rd_resp.status_code == 200
        assert len(rd_resp.json()["milestones"]) >= 3

        # 8. Mentor Chat
        chat_payload = {
            "messages": [{"role": "user", "content": "How do I prepare for a senior backend role?"}],
            "target_role": "Senior Backend Engineer",
            "missing_skills": ["Kafka"]
        }
        chat_resp = await ac.post("/api/mentor/chat", json=chat_payload)
        assert chat_resp.status_code == 200
        assert len(chat_resp.json()["reply"]) > 20

        # 9. Interview Questions
        iq_payload = {
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "experience_years": 3.0
        }
        iq_resp = await ac.post("/api/mentor/interview-questions", json=iq_payload)
        assert iq_resp.status_code == 200
        assert len(iq_resp.json()["questions"]) >= 4

        # 10. Recruiter Candidates
        cand_resp = await ac.get("/api/recruiter/candidates")
        assert cand_resp.status_code == 200
        assert len(cand_resp.json()) >= 1

        # 11. Admin Stats & Models
        stats_resp = await ac.get("/api/admin/stats")
        assert stats_resp.status_code == 200
        models_resp = await ac.get("/api/admin/models")
        assert models_resp.status_code == 200
