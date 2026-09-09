import re
from typing import Dict, List, Any, Tuple
from collections import Counter

from backend.models.schemas import (
    ParsedResume,
    ATSScoreResponse,
    ATSScoreBreakdown,
)

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd",
    "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "role", "job", "candidate", "responsibilities", "requirements",
    "looking", "ideal", "opportunity", "work", "team", "years", "experience", "required", "preferred"
}

def extract_keywords_from_text(text: str, top_n: int = 30) -> List[str]:
    """Extract prominent tokens from text omitting punctuation and common stopwords."""
    cleaned = re.sub(r"[^a-zA-Z0-9+#.-]", " ", text.lower())
    tokens = [token.strip() for token in cleaned.split() if len(token) > 2 and token not in STOPWORDS]
    counts = Counter(tokens)
    return [word for word, count in counts.most_common(top_n)]

def compute_keyword_match(resume_text: str, job_text: str) -> Tuple[float, List[str], List[str], Dict[str, int]]:
    """Evaluates keyword overlap and returns match score (0-100)."""
    jd_keywords = extract_keywords_from_text(job_text, top_n=35)
    if not jd_keywords:
        return 75.0, [], [], {}

    resume_text_lower = resume_text.lower()
    matched = []
    missing = []
    density = {}

    for kw in jd_keywords:
        # Count frequency in resume
        matches = len(re.findall(r"\b" + re.escape(kw) + r"\b", resume_text_lower))
        if matches > 0:
            matched.append(kw)
            density[kw] = matches
        else:
            missing.append(kw)

    match_ratio = len(matched) / len(jd_keywords)
    score = min(100.0, match_ratio * 100.0)
    return round(score, 1), matched, missing, density

def compute_skills_score(resume_skills: List[str], job_text: str) -> Tuple[float, List[str], List[str]]:
    """Calculates skill match percentage against skills indicated in job text."""
    from ai.resume_parser import TECHNICAL_SKILLS_CATALOG, SOFT_SKILLS_CATALOG

    job_text_lower = job_text.lower()
    jd_required_skills = set()
    for s in TECHNICAL_SKILLS_CATALOG.union(SOFT_SKILLS_CATALOG):
        if re.search(r"\b" + re.escape(s) + r"\b", job_text_lower):
            jd_required_skills.add(s.title())

    if not jd_required_skills:
        # Default expectation of standard tech skills if JD is brief
        return 75.0, resume_skills[:5], []

    candidate_skills_lower = {s.lower() for s in resume_skills}
    matched = []
    missing = []

    for req in jd_required_skills:
        if req.lower() in candidate_skills_lower:
            matched.append(req)
        else:
            missing.append(req)

    coverage = (len(matched) / len(jd_required_skills)) * 100.0 if jd_required_skills else 80.0
    return round(min(100.0, coverage), 1), sorted(matched), sorted(missing)

def compute_experience_score(resume: ParsedResume, job_text: str) -> Tuple[float, str]:
    """Scores experience length, career milestones, and quantitative metrics."""
    # Find years requirement in JD (e.g., '3+ years', '5 years of experience')
    exp_matches = re.findall(r"(\d+)\+?\s*years?(?:\s+of)?\s+experience", job_text, re.IGNORECASE)
    required_years = float(exp_matches[0]) if exp_matches else 2.0

    candidate_years = resume.total_experience_years
    
    # Base ratio
    if candidate_years >= required_years:
        base_score = 90.0
    elif candidate_years > 0:
        base_score = (candidate_years / max(1.0, required_years)) * 80.0
    else:
        base_score = 50.0

    # Check for quantitative impact metrics (% improved, $ saved, numbers)
    raw_text = resume.raw_text
    metric_matches = len(re.findall(r"\b\d+[%kKmMbB]?\b|\$\d+", raw_text))
    impact_bonus = min(10.0, metric_matches * 1.5)

    final_score = min(100.0, base_score + impact_bonus)
    comment = f"Candidate has {candidate_years:.1f} years experience (Job target: {required_years:.1f}+ years)."
    return round(final_score, 1), comment

def compute_education_score(resume: ParsedResume, job_text: str) -> Tuple[float, str]:
    """Evaluates candidate degree level against JD requirements."""
    jd_lower = job_text.lower()
    candidate_degrees = [e.degree.lower() for e in resume.education]
    
    requires_phd = "phd" in jd_lower or "doctorate" in jd_lower
    requires_master = "master" in jd_lower or "ms" in jd_lower or "mba" in jd_lower

    has_phd = any("phd" in d or "doctor" in d for d in candidate_degrees)
    has_master = any("master" in d or "ms" in d or "mba" in d for d in candidate_degrees)
    has_bachelor = any("bachelor" in d or "bs" in d or "b.tech" in d or "degree" in d for d in candidate_degrees) or len(resume.education) > 0

    if requires_phd:
        score = 100.0 if has_phd else (80.0 if has_master else 60.0)
        comment = "Ph.D. requirement evaluated."
    elif requires_master:
        score = 100.0 if (has_phd or has_master) else (85.0 if has_bachelor else 60.0)
        comment = "Master's degree requirement evaluated."
    else:
        # Bachelor's or general degree expected
        score = 95.0 if (has_phd or has_master or has_bachelor) else 70.0
        comment = "Bachelor's degree or equivalent verified."

    return round(score, 1), comment

def compute_structure_score(resume: ParsedResume) -> Tuple[float, List[str]]:
    """Evaluates core resume section presence and completeness."""
    score = 0.0
    notes = []

    # 1. Contact Info (20 pts)
    if resume.email and resume.phone:
        score += 20.0
    elif resume.email or resume.phone:
        score += 12.0
        notes.append("Incomplete contact information.")
    else:
        notes.append("Missing email and phone number.")

    # 2. Summary (15 pts)
    if len(resume.summary) > 25:
        score += 15.0
    else:
        notes.append("Add a professional summary statement.")

    # 3. Skills Section (25 pts)
    if len(resume.skills) >= 6:
        score += 25.0
    elif len(resume.skills) > 0:
        score += 15.0
        notes.append("Expand skills inventory.")
    else:
        notes.append("No technical skills detected.")

    # 4. Experience Section (20 pts)
    if resume.experience:
        score += 20.0
    else:
        notes.append("Add detailed work experience section.")

    # 5. Education Section (10 pts)
    if resume.education:
        score += 10.0
    else:
        notes.append("Missing education section.")

    # 6. Projects / Certifications (10 pts)
    if resume.projects or resume.certifications:
        score += 10.0
    else:
        notes.append("Include projects or certifications to demonstrate practical expertise.")

    return round(score, 1), notes

def compute_formatting_score(resume: ParsedResume) -> Tuple[float, List[str]]:
    """Evaluates readability, word count density, and formatting cleanliness."""
    score = 80.0
    notes = []

    raw = resume.raw_text
    word_count = len(raw.split())

    if 350 <= word_count <= 1200:
        score += 20.0
    elif word_count < 200:
        score -= 20.0
        notes.append("Resume is too brief (<200 words). Add detail.")
    elif word_count > 1500:
        score -= 10.0
        notes.append("Resume exceeds standard length. Keep it concise.")

    # Check for bullet points or lists
    if any(char in raw for char in ["•", "-", "*"]):
        score = min(100.0, score + 5.0)

    return round(max(40.0, min(100.0, score)), 1), notes

def calculate_ats_score(resume: ParsedResume, job_description: str) -> ATSScoreResponse:
    """
    Computes dynamic weighted ATS score:
    - Keyword Match: 25%
    - Skills Match: 25%
    - Experience Relevance: 20%
    - Education Match: 15%
    - Structure Quality: 10%
    - Formatting & Readability: 5%
    """
    kw_score, matched_kws, missing_kws, density = compute_keyword_match(resume.raw_text, job_description)
    skills_score, matched_skills, missing_skills = compute_skills_score(resume.skills, job_description)
    exp_score, exp_comment = compute_experience_score(resume, job_description)
    edu_score, edu_comment = compute_education_score(resume, job_description)
    struct_score, struct_notes = compute_structure_score(resume)
    format_score, format_notes = compute_formatting_score(resume)

    overall = (
        0.25 * kw_score +
        0.25 * skills_score +
        0.20 * exp_score +
        0.15 * edu_score +
        0.10 * struct_score +
        0.05 * format_score
    )
    overall = round(max(0.0, min(100.0, overall)), 1)

    breakdown = ATSScoreBreakdown(
        keyword_match=kw_score,
        skills_match=skills_score,
        experience_relevance=exp_score,
        education_match=edu_score,
        structure_quality=struct_score,
        formatting_readability=format_score
    )

    strengths = []
    if kw_score >= 70:
        strengths.append(f"Strong keyword alignment: {len(matched_kws)} job keywords matched.")
    if skills_score >= 70:
        strengths.append(f"Robust technical skills inventory ({len(matched_skills)} key skills identified).")
    if exp_score >= 80:
        strengths.append("Work experience meets or exceeds target role seniority.")
    if struct_score >= 85:
        strengths.append("Clean, ATS-compliant section architecture.")

    deficiencies = []
    if missing_skills:
        deficiencies.append(f"Missing core competencies: {', '.join(missing_skills[:5])}")
    if kw_score < 60:
        deficiencies.append("Low keyword density compared to job description requirements.")
    if struct_notes:
        deficiencies.extend(struct_notes)

    recommendations = []
    if missing_kws:
        recommendations.append(f"Incorporate high-priority job keywords: {', '.join(missing_kws[:6])}.")
    if missing_skills:
        recommendations.append(f"Add projects or coursework highlighting missing skills: {', '.join(missing_skills[:4])}.")
    recommendations.append("Quantify achievements using metrics (e.g., 'Improved API response time by 35%').")
    if format_notes:
        recommendations.extend(format_notes)

    return ATSScoreResponse(
        overall_score=overall,
        breakdown=breakdown,
        strengths=strengths,
        deficiencies=deficiencies,
        recommendations=recommendations,
        keyword_density=density
    )
