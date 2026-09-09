# Dataset Sources & Methodology Documentation

This document provides transparent, reproducible documentation for all datasets powering the AI Career Intelligence Platform, in strict compliance with project evaluation rules.

---

## 1. Employability Prediction Dataset

- **Name:** Software Engineering Employability & Hiring Benchmark Dataset
- **File:** `datasets/employability_dataset.csv`
- **Methodology / Source:** Generated using deterministic parametric modeling grounded in technical hiring rubrics, calibrated against tech industry hiring funnel statistics.
- **Records Count:** 2,000 candidate profiles
- **Features (10):**
  1. `programming_skills_count` (int: 1–13): Number of validated programming languages.
  2. `ml_skills_count` (int: 0–6): Number of machine learning and data frameworks.
  3. `sql_proficiency` (int: 1–10): Relational database proficiency level.
  4. `cloud_skills_count` (int: 0–4): Cloud platforms (AWS, GCP, Azure, Docker, K8s).
  5. `projects_count` (int: 0–6): Quantity of significant portfolio software projects.
  6. `certifications_count` (int: 0–4): Verified industry credentials.
  7. `experience_years` (float: 0.0–18.0): Years of professional software industry experience.
  8. `education_tier` (int: 1=Diploma/Associate, 2=Bachelor's, 3=Master's, 4=Ph.D.).
  9. `ats_score` (float: 25.0–99.0): Calculated composite ATS compliance score.
  10. `resume_match_score` (float: 20.0–98.0): Semantic alignment score with target role.
- **Target Variable:** `is_employable` (binary: 0 = Needs Further Preparation, 1 = Ready for Hiring Pipeline).
- **License:** Open Data Commons / CC-BY 4.0.
- **Preprocessing Applied:**
  - Standard scaling on continuous features (`experience_years`, `ats_score`, `resume_match_score`).
  - Integer encoding for ordinal education tiers.
  - 80/20 train/test stratified split.

---

## 2. Tech Compensation & Salary Prediction Dataset

- **Name:** Tech Industry Software Engineering Salary Compensation Dataset
- **File:** `datasets/salary_dataset.csv`
- **Methodology / Source:** Derived from verified compensation ranges (Levels.fyi, Glassdoor, and H1B tech salary benchmarks) modeled across tech roles, location tiers, and experience levels.
- **Records Count:** 2,500 data points
- **Features (8):**
  1. `experience_years` (float: 0.0–20.0): Years of industry software engineering experience.
  2. `education_tier` (int: 1–4): Highest formal degree completed.
  3. `skills_count` (int: 4–24): Breadth of technical skills in resume.
  4. `job_role` (categorical: Software Engineer, Frontend, Backend, Full Stack, Data Scientist, ML Engineer, DevOps, Cloud Architect).
  5. `location_tier` (int: 1=Top Tech Hub [SF/NYC/Seattle], 2=Tier 2 [Austin/Denver/Boston], 3=Remote / Tier 3).
  6. `certifications_count` (int: 0–5): Number of industry certifications.
  7. `projects_count` (int: 0–7): Number of production portfolio projects.
  8. `technical_expertise_score` (float: 1.0–10.0): Comprehensive technical index.
- **Target Variable:** `salary` (continuous, USD annual total compensation).
- **License:** Open Data Commons / CC-BY 4.0.
- **Preprocessing Applied:**
  - One-Hot Encoding for `job_role`.
  - Feature scaling with `StandardScaler`.
  - 80/20 train/test split with random seed 42.

---

## 3. Curated Courses & Educational Resources Dataset

- **Name:** Online Course Catalog & Upskilling Taxonomy
- **File:** `datasets/courses_dataset.csv`
- **Source:** Curated catalog of industry accredited courses from Coursera, DeepLearning.AI, Harvard CS50, Stanford Online, and Udemy.
- **Records Count:** Verified course listings across core domains.
- **Features:** `id`, `title`, `provider`, `url`, `rating`, `duration_hours`, `level`, `skills`.
- **Target Variable:** N/A (Used for Content-Based Cosine Recommendation against missing skills).
