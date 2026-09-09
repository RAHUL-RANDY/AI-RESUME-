import pytest
from ai.skill_gap import normalize_skill, analyze_skill_gap

def test_normalize_synonyms():
    assert normalize_skill("js") == "JavaScript"
    assert normalize_skill("python") == "Python"
    assert normalize_skill("react.js") == "React"
    assert normalize_skill("k8s") == "Kubernetes"
    assert normalize_skill("ml") == "Machine Learning"

def test_skill_gap_set_logic():
    candidate_skills = ["Python", "JS", "React", "Docker", "Postgres"]
    required_skills = ["Python", "JavaScript", "React", "Kubernetes", "AWS"]
    preferred_skills = ["Redis", "CI/CD"]

    res = analyze_skill_gap(candidate_skills, required_skills, preferred_skills)

    # JavaScript and JS normalize to JavaScript, so matching should have Python, JavaScript, React
    assert "Python" in res.matching_skills
    assert "JavaScript" in res.matching_skills
    assert "React" in res.matching_skills

    # Missing should contain Kubernetes and AWS
    assert "Kubernetes" in res.missing_skills
    assert "AWS" in res.missing_skills

    # Optional missing
    assert "Redis" in res.optional_skills
    assert "CI/CD" in res.optional_skills

    # Radar data should have 6 axes
    assert len(res.radar_data) == 6
    for axis in res.radar_data:
        assert 0.0 <= axis.candidate <= 100.0
        assert 0.0 <= axis.requirement <= 100.0
