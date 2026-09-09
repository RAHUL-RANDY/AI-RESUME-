from typing import List, Dict, Set, Tuple, Optional
from backend.models.schemas import SkillGapResponse, RadarAxisData

# Comprehensive synonym dictionary
SKILL_SYNONYMS: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "golang": "Go",
    "go": "Go",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "tf": "TensorFlow",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "mysql": "MySQL",
    "sql": "SQL",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "github actions": "GitHub Actions",
    "git": "Git",
    "linux": "Linux"
}

# Domain axes for radar chart
AXIS_TAXONOMY = {
    "Languages": {"Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "SQL"},
    "Frameworks": {"React", "Vue.js", "Angular", "FastAPI", "Django", "Flask", "Node.js", "Spring Boot"},
    "Cloud & DevOps": {"AWS", "Google Cloud Platform", "Azure", "Docker", "Kubernetes", "CI/CD", "Linux"},
    "Databases": {"PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "SQL"},
    "AI & Data": {"Machine Learning", "Deep Learning", "Natural Language Processing", "TensorFlow", "PyTorch", "Pandas", "Scikit-Learn"},
    "Collaboration": {"Leadership", "Communication", "Teamwork", "Problem Solving", "Agile"}
}

def normalize_skill(skill: str) -> str:
    """Standardizes skill name using synonym dictionary."""
    clean = skill.strip().lower()
    return SKILL_SYNONYMS.get(clean, skill.strip().title())

def normalize_skill_list(skills: List[str]) -> List[str]:
    """Deduplicates and standardizes a list of skills."""
    seen = set()
    result = []
    for s in skills:
        norm = normalize_skill(s)
        if norm and norm.lower() not in seen:
            seen.add(norm.lower())
            result.append(norm)
    return result

def compute_radar_data(candidate_skills: Set[str], required_skills: Set[str]) -> List[RadarAxisData]:
    """Generates 0-100 radar comparison across core architectural axes."""
    cand_lower = {s.lower() for s in candidate_skills}
    req_lower = {s.lower() for s in required_skills}

    radar_axes = []
    for axis, skills_in_axis in AXIS_TAXONOMY.items():
        axis_lower = {s.lower() for s in skills_in_axis}
        
        # Required skills in this category
        req_in_axis = req_lower.intersection(axis_lower)
        cand_in_axis = cand_lower.intersection(axis_lower)

        # Baseline benchmark: if job requires them, requirement is 85-100, otherwise standard baseline 50
        req_score = min(100.0, max(50.0, float(len(req_in_axis) * 35.0))) if req_in_axis else 50.0
        
        # Candidate score based on count of matching skills in axis
        cand_score = min(100.0, float(len(cand_in_axis) * 35.0)) if cand_in_axis else 25.0

        radar_axes.append(
            RadarAxisData(
                subject=axis,
                candidate=round(cand_score, 1),
                requirement=round(req_score, 1),
                fullMark=100.0
            )
        )

    return radar_axes

def analyze_skill_gap(
    candidate_skills: List[str],
    required_skills: List[str],
    preferred_skills: Optional[List[str]] = None
) -> SkillGapResponse:
    """
    Executes set difference and overlap calculation on normalized skills.
    """
    if preferred_skills is None:
        preferred_skills = []

    norm_candidate = set(normalize_skill_list(candidate_skills))
    norm_required = set(normalize_skill_list(required_skills))
    norm_preferred = set(normalize_skill_list(preferred_skills))

    candidate_lookup = {s.lower(): s for s in norm_candidate}

    matching = []
    missing = []
    for req in norm_required:
        if req.lower() in candidate_lookup:
            matching.append(req)
        else:
            missing.append(req)

    optional = []
    for pref in norm_preferred:
        if pref.lower() not in candidate_lookup:
            optional.append(pref)

    total_req_count = len(norm_required)
    match_count = len(matching)
    
    coverage = (match_count / total_req_count * 100.0) if total_req_count > 0 else 100.0
    gap = 100.0 - coverage

    radar_data = compute_radar_data(norm_candidate, norm_required)

    return SkillGapResponse(
        matching_skills=sorted(matching),
        missing_skills=sorted(missing),
        optional_skills=sorted(optional),
        gap_percentage=round(gap, 1),
        coverage_score=round(coverage, 1),
        radar_data=radar_data
    )
