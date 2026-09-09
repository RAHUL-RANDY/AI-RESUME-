import pytest
from backend.models.schemas import ParsedResume, EducationItem, ExperienceItem
from ai.ats_score import calculate_ats_score

def test_ats_score_calculation_weights():
    resume = ParsedResume(
        name="Taylor Swift",
        email="taylor@example.com",
        phone="555-0199",
        summary="Senior Software Architect with 6 years experience in Cloud and Python.",
        education=[EducationItem(degree="Master of Science", institution="MIT", graduation_year="2018")],
        skills=["Python", "Fastapi", "Docker", "Kubernetes", "Postgresql", "Aws", "Redis"],
        technical_skills=["Python", "Fastapi", "Docker", "Kubernetes", "Postgresql"],
        soft_skills=["Leadership", "Communication"],
        experience=[
            ExperienceItem(
                company="Acme Corp",
                role="Senior Engineer",
                duration="4 years",
                duration_years=4.0,
                description="Engineered high throughput API services reducing latency by 45%."
            )
        ],
        total_experience_years=6.0,
        raw_text="""Taylor Swift
taylor@example.com | 555-0199
Senior Software Architect with 6 years experience in Cloud and Python.
Education: Master of Science, MIT.
Skills: Python, FastAPI, Docker, Kubernetes, PostgreSQL, AWS, Redis.
Experience: Senior Engineer at Acme Corp. Reduced latency by 45% across 10M daily events."""
    )

    job_description = """
    We are seeking a Senior Backend Engineer with 4+ years experience.
    Must have deep expertise in Python, FastAPI, Docker, Kubernetes, and PostgreSQL.
    AWS and Redis knowledge is strongly preferred.
    Master's or Bachelor's degree in Computer Science or related field required.
    """

    res = calculate_ats_score(resume, job_description)

    # Verify score is between 0 and 100
    assert 0.0 <= res.overall_score <= 100.0
    # High match resume should score above 75
    assert res.overall_score >= 75.0

    # Verify exact weighted formula
    b = res.breakdown
    expected = (
        0.25 * b.keyword_match +
        0.25 * b.skills_match +
        0.20 * b.experience_relevance +
        0.15 * b.education_match +
        0.10 * b.structure_quality +
        0.05 * b.formatting_readability
    )
    assert round(res.overall_score, 1) == round(expected, 1)
    assert len(res.strengths) > 0
    assert len(res.recommendations) > 0

def test_ats_score_on_mismatched_resume():
    resume = ParsedResume(
        name="Chef Ramsay",
        email="gordon@kitchen.com",
        phone="555-9999",
        summary="Executive Chef with 10 years experience in culinary arts.",
        education=[],
        skills=["Baking", "Grilling", "Leadership"],
        technical_skills=[],
        soft_skills=["Leadership"],
        experience=[],
        total_experience_years=0.0,
        raw_text="Executive Chef specializing in culinary arts and restaurant management."
    )

    job_description = """
    Senior Machine Learning Scientist.
    Required: Python, PyTorch, Transformers, Deep Learning, Ph.D. in AI.
    """

    res = calculate_ats_score(resume, job_description)
    # Mismatched candidate should have low overall score
    assert res.overall_score < 60.0
    assert len(res.deficiencies) > 0
