from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/api/jobs", tags=["Job Search & Semantic Matching"])

class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_mode: str  # Remote, Hybrid, Onsite
    role_category: str  # Full Stack, Frontend, Backend, Machine Learning, DevOps
    experience_level: str  # Entry, Mid, Senior, Staff
    salary_min: int
    salary_max: int
    salary_display: str
    logo_color: str
    required_skills: List[str]
    description: str
    apply_url: str
    posted_days_ago: int
    is_featured: bool = False

class JobMatchRequest(BaseModel):
    candidate_skills: List[str]
    resume_text: Optional[str] = None
    target_role: Optional[str] = None

class JobMatchResult(BaseModel):
    job_id: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    fit_level: str  # High Match, Strong Match, Moderate Fit

JOB_DATABASE: List[JobListing] = [
    JobListing(
        id="job-01",
        title="Senior Full Stack Engineer (AI Platforms)",
        company="OpenAI",
        location="San Francisco, CA",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=185000,
        salary_max=245000,
        salary_display="$185k - $245k",
        logo_color="from-emerald-500 to-teal-600",
        required_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker"],
        description="Architect and scale customer-facing web interfaces, developer toolchains, and high-throughput streaming APIs powering ChatGPT and next-gen model evaluation suites.",
        apply_url="https://openai.com/careers",
        posted_days_ago=1,
        is_featured=True
    ),
    JobListing(
        id="job-02",
        title="Senior Infrastructure & Backend Engineer",
        company="Stripe",
        location="Seattle, WA / Remote",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Senior",
        salary_min=175000,
        salary_max=230000,
        salary_display="$175k - $230k",
        logo_color="from-indigo-500 to-sky-600",
        required_skills=["Python", "Go", "PostgreSQL", "Redis", "Distributed Systems", "AWS"],
        description="Design fault-tolerant payment orchestration pipelines processing billions in annual global volume with sub-100ms latency and 99.999% reliability.",
        apply_url="https://stripe.com/jobs",
        posted_days_ago=2,
        is_featured=True
    ),
    JobListing(
        id="job-03",
        title="Staff Machine Learning Engineer",
        company="Anthropic",
        location="San Francisco, CA",
        work_mode="Onsite",
        role_category="Machine Learning",
        experience_level="Staff",
        salary_min=220000,
        salary_max=310000,
        salary_display="$220k - $310k",
        logo_color="from-amber-500 to-rose-600",
        required_skills=["Python", "PyTorch", "Transformers", "Distributed Systems", "CUDA", "FastAPI"],
        description="Lead research-to-production training pipelines and safety evaluation frameworks for frontier Claude models operating across massive GPU clusters.",
        apply_url="https://anthropic.com/careers",
        posted_days_ago=3,
        is_featured=True
    ),
    JobListing(
        id="job-04",
        title="Full Stack Software Engineer",
        company="Vercel",
        location="Remote (Global)",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Mid",
        salary_min=145000,
        salary_max=195000,
        salary_display="$145k - $195k",
        logo_color="from-slate-700 to-slate-900",
        required_skills=["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "REST APIs"],
        description="Build developer-first cloud primitives, dashboard observability tools, and Edge runtime enhancements for millions of modern web engineers.",
        apply_url="https://vercel.com/careers",
        posted_days_ago=2,
        is_featured=True
    ),
    JobListing(
        id="job-05",
        title="Senior Frontend Platform Engineer",
        company="Figma",
        location="New York, NY",
        work_mode="Hybrid",
        role_category="Frontend",
        experience_level="Senior",
        salary_min=165000,
        salary_max=220000,
        salary_display="$165k - $220k",
        logo_color="from-purple-500 to-pink-600",
        required_skills=["TypeScript", "React", "WebAssembly", "Canvas/WebGL", "Performance Optimization"],
        description="Pioneer 60 FPS multiplayer canvas collaboration engines and design systems components that power the industry standard design platform.",
        apply_url="https://figma.com/careers",
        posted_days_ago=4,
        is_featured=False
    ),
    JobListing(
        id="job-06",
        title="Cloud & DevOps Architect",
        company="Datadog",
        location="Boston, MA / Remote",
        work_mode="Remote",
        role_category="DevOps",
        experience_level="Senior",
        salary_min=160000,
        salary_max=215000,
        salary_display="$160k - $215k",
        logo_color="from-purple-600 to-indigo-700",
        required_skills=["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Python"],
        description="Automate cloud infrastructure topology across multi-region Kubernetes clusters ingesting over 10 trillion observability metrics per day.",
        apply_url="https://datadoghq.com/careers",
        posted_days_ago=5,
        is_featured=False
    ),
    JobListing(
        id="job-07",
        title="Backend Microservices Engineer",
        company="Netflix",
        location="Los Gatos, CA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=190000,
        salary_max=260000,
        salary_display="$190k - $260k",
        logo_color="from-rose-600 to-red-700",
        required_skills=["Python", "FastAPI", "Apache Kafka", "PostgreSQL", "Docker", "Redis"],
        description="Architect media encoding pipelines, distributed user session streaming services, and recommendations API routers serving 260M+ global members.",
        apply_url="https://jobs.netflix.com",
        posted_days_ago=3,
        is_featured=True
    ),
    JobListing(
        id="job-08",
        title="Full Stack Software Engineer",
        company="Supabase",
        location="Remote",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Mid",
        salary_min=140000,
        salary_max=185000,
        salary_display="$140k - $185k",
        logo_color="from-emerald-500 to-green-600",
        required_skills=["TypeScript", "React", "PostgreSQL", "Go", "Docker", "REST APIs"],
        description="Contribute to the world's fastest growing open-source Firebase alternative, expanding Postgres management UIs and real-time database gateways.",
        apply_url="https://supabase.com/careers",
        posted_days_ago=1,
        is_featured=False
    ),
    JobListing(
        id="job-09",
        title="AI Applied ML Engineer",
        company="Scale AI",
        location="San Francisco, CA",
        work_mode="Onsite",
        role_category="Machine Learning",
        experience_level="Senior",
        salary_min=180000,
        salary_max=240000,
        salary_display="$180k - $240k",
        logo_color="from-blue-600 to-cyan-600",
        required_skills=["Python", "PyTorch", "NLP", "FastAPI", "Docker", "Data Pipelines"],
        description="Deploy generative AI pipelines and automated reinforcement learning from human feedback (RLHF) toolchains for autonomous vehicle and LLM customers.",
        apply_url="https://scale.com/careers",
        posted_days_ago=4,
        is_featured=False
    ),
    JobListing(
        id="job-10",
        title="Senior Frontend Engineer (Design Systems)",
        company="Linear",
        location="Remote",
        work_mode="Remote",
        role_category="Frontend",
        experience_level="Senior",
        salary_min=160000,
        salary_max=210000,
        salary_display="$160k - $210k",
        logo_color="from-indigo-600 to-violet-700",
        required_skills=["React", "TypeScript", "Tailwind CSS", "WebSockets", "Keyboard Shortcuts"],
        description="Craft ultra-snappy, pixel-perfect project tracking interfaces with sub-50ms interaction feedback and offline-first synchronization protocols.",
        apply_url="https://linear.app/careers",
        posted_days_ago=6,
        is_featured=True
    ),
    JobListing(
        id="job-11",
        title="Site Reliability & DevOps Engineer",
        company="Snowflake",
        location="San Mateo, CA / Remote",
        work_mode="Hybrid",
        role_category="DevOps",
        experience_level="Mid",
        salary_min=150000,
        salary_max=200000,
        salary_display="$150k - $200k",
        logo_color="from-sky-500 to-blue-600",
        required_skills=["Kubernetes", "Docker", "AWS", "Terraform", "Python", "Prometheus"],
        description="Ensure continuous multi-cloud operational stability across AWS, Azure, and GCP for the enterprise Data Cloud platform handling exabytes of analytic data.",
        apply_url="https://careers.snowflake.com",
        posted_days_ago=3,
        is_featured=False
    ),
    JobListing(
        id="job-12",
        title="Full Stack Software Engineer",
        company="Coinbase",
        location="Remote (US)",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=170000,
        salary_max=225000,
        salary_display="$170k - $225k",
        logo_color="from-blue-500 to-indigo-600",
        required_skills=["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
        description="Engineer consumer crypto products, staking interfaces, and enterprise institutional custody portals adhering to bank-grade security protocols.",
        apply_url="https://coinbase.com/careers",
        posted_days_ago=5,
        is_featured=False
    )
]

@router.get("", response_model=List[JobListing])
async def get_jobs(
    role: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    min_salary: Optional[int] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Search and filter curated engineering positions with salary and role facets.
    """
    results = JOB_DATABASE

    if role and role != "All":
        results = [j for j in results if j.role_category.lower() == role.lower()]

    if work_mode and work_mode != "All":
        results = [j for j in results if j.work_mode.lower() == work_mode.lower()]

    if min_salary:
        results = [j for j in results if j.salary_max >= min_salary]

    if search:
        s = search.lower()
        results = [
            j for j in results
            if s in j.title.lower()
            or s in j.company.lower()
            or s in j.description.lower()
            or any(s in skill.lower() for skill in j.required_skills)
        ]

    return results

@router.post("/match", response_model=List[JobMatchResult])
async def match_candidate_to_jobs(request: JobMatchRequest):
    """
    Computes real-time match percentage for all jobs against candidate's skills.
    """
    cand_skills_lower = {s.lower().strip() for s in request.candidate_skills}
    match_results = []

    for job in JOB_DATABASE:
        req_skills_lower = [s.lower().strip() for s in job.required_skills]
        matched = [s for s in job.required_skills if s.lower().strip() in cand_skills_lower]
        missing = [s for s in job.required_skills if s.lower().strip() not in cand_skills_lower]
        
        if req_skills_lower:
            overlap_ratio = len(matched) / len(req_skills_lower)
        else:
            overlap_ratio = 0.8

        # Role alignment bonus
        role_bonus = 0.15 if (request.target_role and request.target_role.lower() in job.title.lower()) else 0.0
        final_pct = min(98.0, round((overlap_ratio * 0.85 + role_bonus + 0.1) * 100, 1))

        if final_pct >= 85:
            fit_level = "High Match"
        elif final_pct >= 70:
            fit_level = "Strong Match"
        else:
            fit_level = "Moderate Fit"

        match_results.append(JobMatchResult(
            job_id=job.id,
            match_percentage=final_pct,
            matched_skills=matched,
            missing_skills=missing,
            fit_level=fit_level
        ))

    # Sort descending by match percentage
    match_results.sort(key=lambda x: x.match_percentage, reverse=True)
    return match_results
