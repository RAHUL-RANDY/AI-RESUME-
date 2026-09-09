import pytest
from ai.resume_matching import analyze_resume_match

def test_semantic_match_high_similarity():
    resume = """
    Senior Python Developer with 5 years experience in building microservices using FastAPI,
    PostgreSQL, Redis, Docker, and Kubernetes on AWS. Designed REST APIs and distributed systems.
    """
    job_desc = """
    We are hiring a Senior Python Engineer. Requirements:
    - 4+ years of backend development with Python and FastAPI
    - Strong experience with PostgreSQL, Redis, and containerization using Docker and Kubernetes
    - Cloud experience with AWS is required.
    """
    res = analyze_resume_match(resume, job_desc)
    assert res.similarity_percentage >= 60.0
    assert "fastapi" in [k.lower() for k in res.matched_keywords]
    assert len(res.summary_analysis) > 10

def test_semantic_match_unrelated():
    resume = """
    Certified Pastry Chef with experience in French baking, sourdough bread, cakes, and culinary arts.
    """
    job_desc = """
    Looking for a Rust systems engineer to build high-frequency trading matching engines.
    """
    res = analyze_resume_match(resume, job_desc)
    assert res.similarity_percentage < 50.0
