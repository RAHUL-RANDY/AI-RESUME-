import pytest
import fitz
from ai.resume_parser import (
    parse_resume_bytes,
    extract_email,
    extract_phone,
    extract_skills,
    extract_education
)

def create_sample_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    text = """Alex Morgan
alex.morgan@example.com | (555) 019-2834 | linkedin.com/in/alexmorgan | github.com/alexmorgan
San Francisco, CA

SUMMARY
Experienced Full Stack Engineer with 4 years building modern scalable web applications.

EDUCATION
Bachelor of Science in Computer Science, Stanford University (2018 - 2022)

SKILLS
Python, JavaScript, TypeScript, React, FastAPI, Docker, Kubernetes, AWS, PostgreSQL, Redis
Teamwork, Leadership, Problem Solving

EXPERIENCE
Senior Software Engineer (2022 - Present)
- Developed distributed microservices handling 50M requests daily.
- Optimized database indexing in PostgreSQL reducing latency by 40%.

Software Engineer (2020 - 2022)
- Built React frontend dashboards with real-time analytics.

PROJECTS
- AI Career Copilot: Machine learning platform for automated career recommendations using FastAPI and React.
- Cloud Monitoring Agent: Go-based metrics telemetry daemon with Prometheus integration.

CERTIFICATIONS
- AWS Certified Solutions Architect Associate
"""
    page.insert_text((50, 50), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def test_extract_email_and_phone():
    text = "Contact me at dev.lead@techcorp.io or +1 (415) 555-2671"
    assert extract_email(text) == "dev.lead@techcorp.io"
    assert "555-2671" in extract_phone(text)

def test_extract_skills():
    text = "We require Python, React, Docker, Kubernetes, AWS, and strong communication skills."
    all_s, tech, soft = extract_skills(text)
    assert "Python" in tech
    assert "React" in tech
    assert "Docker" in tech
    assert "Communication" in soft

def test_parse_sample_pdf():
    pdf_bytes = create_sample_pdf_bytes()
    resume = parse_resume_bytes(pdf_bytes, "alex_morgan_resume.pdf")
    
    assert resume.email == "alex.morgan@example.com"
    assert resume.name.lower().startswith("alex")
    assert "Python" in resume.skills
    assert "React" in resume.skills
    assert len(resume.education) >= 1
    assert "Stanford" in resume.education[0].institution or "Bachelor" in resume.education[0].degree
    assert resume.total_experience_years >= 2.0

def test_malformed_resume_graceful_handling():
    # Empty or gibberish input should not crash
    empty_resume = parse_resume_bytes(b"", "corrupt.pdf")
    assert empty_resume.name != ""
    assert isinstance(empty_resume.skills, list)
    assert empty_resume.email == ""
