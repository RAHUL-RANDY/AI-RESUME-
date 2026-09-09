import pytest
from backend.models.schemas import EmployabilityPredictionRequest, SalaryPredictionRequest
from ai.employability import predict_employability
from ai.salary_prediction import predict_salary

def test_employability_prediction_ranges_and_shap():
    req = EmployabilityPredictionRequest(
        programming_skills_count=8,
        ml_skills_count=3,
        sql_proficiency=8,
        cloud_skills_count=3,
        projects_count=4,
        certifications_count=2,
        experience_years=5.0,
        education_tier=3,
        ats_score=88.0,
        resume_match_score=82.0
    )
    res = predict_employability(req)
    assert 0.0 <= res.employability_probability <= 100.0
    assert res.is_employable is True
    assert res.confidence_level in ["High", "Moderate", "Elevated Caution"]
    assert len(res.top_contributing_features) > 0

def test_salary_prediction_bounds_and_shap():
    req = SalaryPredictionRequest(
        experience_years=6.0,
        education_tier=3,
        skills_count=15,
        job_role="Machine Learning Engineer",
        location_tier=1,
        certifications_count=2,
        projects_count=4,
        technical_expertise_score=8.5
    )
    res = predict_salary(req)
    assert res.predicted_salary > 100000.0
    assert res.salary_min < res.predicted_salary < res.salary_max
    assert res.currency == "USD"
    assert len(res.top_contributing_features) > 0
    assert any("Machine Learning" in f.feature or "Role" in f.feature or "Experience" in f.feature for f in res.top_contributing_features)
