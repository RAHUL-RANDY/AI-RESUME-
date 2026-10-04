from typing import List, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/api/jobs", tags=["Job Search & Semantic Matching"])

class ApplySource(BaseModel):
    name: str  # Direct, LinkedIn, Indeed, Wellfound, Glassdoor, RemoteOK, Google Careers
    url: str
    badge: Optional[str] = "Official"
    icon: Optional[str] = None

class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_mode: str  # Remote, Hybrid, Onsite
    role_category: str  # Full Stack, Frontend, Backend, Machine Learning, DevOps, Data Science, Mobile, Security
    experience_level: str  # Entry, Mid, Senior, Staff, Lead
    salary_min: int
    salary_max: int
    salary_display: str
    logo_color: str
    required_skills: List[str]
    description: str
    apply_url: str
    apply_sources: List[ApplySource]
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

def make_sources(company: str, title: str, career_url: str, is_remote: bool = False) -> List[ApplySource]:
    comp_clean = company.replace(" ", "+")
    title_clean = title.replace(" ", "+")
    sources = [
        ApplySource(
            name="Direct Careers",
            url=career_url,
            badge="Official Portal",
            icon="building"
        ),
        ApplySource(
            name="LinkedIn",
            url=f"https://www.linkedin.com/jobs/search/?keywords={title_clean}+{comp_clean}",
            badge="Easy Apply Available",
            icon="linkedin"
        ),
        ApplySource(
            name="Indeed",
            url=f"https://www.indeed.com/jobs?q={title_clean}+{comp_clean}",
            badge="Fast Track",
            icon="indeed"
        ),
        ApplySource(
            name="Glassdoor",
            url=f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={title_clean}+{comp_clean}",
            badge="Verified Salary",
            icon="glassdoor"
        ),
        ApplySource(
            name="Wellfound (AngelList)",
            url=f"https://wellfound.com/jobs?role={title_clean}",
            badge="Direct Founder Pitch",
            icon="wellfound"
        )
    ]
    if is_remote:
        sources.append(
            ApplySource(
                name="RemoteOK",
                url="https://remoteok.com/remote-dev-jobs",
                badge="100% Worldwide Remote",
                icon="globe"
            )
        )
    return sources

JOB_DATABASE: List[JobListing] = [
    # 1. OpenAI
    JobListing(
        id="job-01",
        title="Senior Full Stack Engineer (AI Platforms)",
        company="OpenAI",
        location="San Francisco, CA",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=190000,
        salary_max=255000,
        salary_display="$190k - $255k",
        logo_color="from-emerald-500 to-teal-600",
        required_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "REST APIs"],
        description="Architect customer-facing web interfaces, developer toolchains, and high-throughput streaming APIs powering ChatGPT, Sora, and next-gen model evaluation suites.",
        apply_url="https://openai.com/careers",
        apply_sources=make_sources("OpenAI", "Senior Full Stack Engineer", "https://openai.com/careers"),
        posted_days_ago=1,
        is_featured=True
    ),
    # 2. Stripe
    JobListing(
        id="job-02",
        title="Senior Infrastructure & Backend Engineer",
        company="Stripe",
        location="Seattle, WA / Remote",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Senior",
        salary_min=180000,
        salary_max=235000,
        salary_display="$180k - $235k",
        logo_color="from-indigo-500 to-sky-600",
        required_skills=["Python", "Go", "PostgreSQL", "Redis", "Distributed Systems", "AWS", "Docker"],
        description="Design fault-tolerant payment orchestration pipelines processing hundreds of billions in annual global volume with sub-100ms latency and 99.999% reliability.",
        apply_url="https://stripe.com/jobs",
        apply_sources=make_sources("Stripe", "Senior Backend Engineer", "https://stripe.com/jobs", is_remote=True),
        posted_days_ago=2,
        is_featured=True
    ),
    # 3. Google
    JobListing(
        id="job-03",
        title="Staff Software Engineer (Distributed Cloud Systems)",
        company="Google",
        location="Mountain View, CA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Staff",
        salary_min=225000,
        salary_max=320000,
        salary_display="$225k - $320k",
        logo_color="from-blue-500 to-red-500",
        required_skills=["Go", "C++", "Python", "Kubernetes", "Distributed Systems", "gRPC", "Microservices"],
        description="Pioneer next-generation global Google Cloud compute schedulers and Spanner database replication engines serving billions of enterprise queries.",
        apply_url="https://careers.google.com",
        apply_sources=make_sources("Google", "Staff Software Engineer", "https://careers.google.com"),
        posted_days_ago=1,
        is_featured=True
    ),
    # 4. Anthropic
    JobListing(
        id="job-04",
        title="Staff Machine Learning Engineer (Frontier Alignment)",
        company="Anthropic",
        location="San Francisco, CA",
        work_mode="Onsite",
        role_category="Machine Learning",
        experience_level="Staff",
        salary_min=230000,
        salary_max=325000,
        salary_display="$230k - $325k",
        logo_color="from-amber-500 to-rose-600",
        required_skills=["Python", "PyTorch", "Transformers", "Distributed Systems", "CUDA", "FastAPI"],
        description="Lead research-to-production training pipelines and safety evaluation frameworks for frontier Claude reasoning models operating across tens of thousands of GPUs.",
        apply_url="https://anthropic.com/careers",
        apply_sources=make_sources("Anthropic", "Staff Machine Learning Engineer", "https://anthropic.com/careers"),
        posted_days_ago=2,
        is_featured=True
    ),
    # 5. Microsoft
    JobListing(
        id="job-05",
        title="Principal Cloud & AI Architect (Azure Infrastructure)",
        company="Microsoft",
        location="Redmond, WA / Remote",
        work_mode="Remote",
        role_category="DevOps",
        experience_level="Staff",
        salary_min=195000,
        salary_max=270000,
        salary_display="$195k - $270k",
        logo_color="from-blue-600 to-cyan-500",
        required_skills=["Kubernetes", "Terraform", "Azure", "Docker", "Python", "CI/CD", "Prometheus"],
        description="Architect multi-datacenter AI supercomputing clusters on Azure powering enterprise OpenAI model deployments and confidential cloud enclaves.",
        apply_url="https://careers.microsoft.com",
        apply_sources=make_sources("Microsoft", "Principal Cloud Architect", "https://careers.microsoft.com", is_remote=True),
        posted_days_ago=3,
        is_featured=True
    ),
    # 6. Meta
    JobListing(
        id="job-06",
        title="Senior AI Systems Engineer (Llama Infrastructure)",
        company="Meta",
        location="Menlo Park, CA",
        work_mode="Hybrid",
        role_category="Machine Learning",
        experience_level="Senior",
        salary_min=190000,
        salary_max=265000,
        salary_display="$190k - $265k",
        logo_color="from-blue-600 to-indigo-700",
        required_skills=["Python", "PyTorch", "C++", "CUDA", "Triton", "Ray", "Distributed Systems"],
        description="Scale open-source Llama model inference clusters and low-latency feature stores serving billions of users across Instagram, WhatsApp, and Horizon.",
        apply_url="https://www.metacareers.com",
        apply_sources=make_sources("Meta", "Senior AI Systems Engineer", "https://www.metacareers.com"),
        posted_days_ago=2,
        is_featured=True
    ),
    # 7. Netflix
    JobListing(
        id="job-07",
        title="Senior Backend Microservices Engineer",
        company="Netflix",
        location="Los Gatos, CA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=200000,
        salary_max=280000,
        salary_display="$200k - $280k",
        logo_color="from-rose-600 to-red-700",
        required_skills=["Python", "FastAPI", "Apache Kafka", "PostgreSQL", "Docker", "Redis", "Distributed Systems"],
        description="Architect media encoding pipelines, distributed user session streaming services, and recommendations API routers serving 260M+ global subscribers.",
        apply_url="https://jobs.netflix.com",
        apply_sources=make_sources("Netflix", "Senior Backend Microservices Engineer", "https://jobs.netflix.com"),
        posted_days_ago=3,
        is_featured=True
    ),
    # 8. Apple
    JobListing(
        id="job-08",
        title="Senior Software Engineer (Cloud Services & Core Frameworks)",
        company="Apple",
        location="Cupertino, CA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=185000,
        salary_max=255000,
        salary_display="$185k - $255k",
        logo_color="from-slate-600 to-slate-800",
        required_skills=["Swift", "Python", "Go", "Docker", "PostgreSQL", "Distributed Systems", "REST APIs"],
        description="Power the underlying cloud sync and storage foundations of iCloud, Apple Intelligence, and cross-device continuity for 2+ billion active Apple devices.",
        apply_url="https://jobs.apple.com",
        apply_sources=make_sources("Apple", "Senior Software Engineer", "https://jobs.apple.com"),
        posted_days_ago=4,
        is_featured=False
    ),
    # 9. Amazon / AWS
    JobListing(
        id="job-09",
        title="Software Development Engineer II (AWS Serverless Platform)",
        company="Amazon",
        location="Seattle, WA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Mid",
        salary_min=155000,
        salary_max=205000,
        salary_display="$155k - $205k",
        logo_color="from-amber-600 to-orange-700",
        required_skills=["Java", "Python", "AWS", "Docker", "DynamoDB", "Microservices", "REST APIs"],
        description="Build core multi-tenant microservices within AWS Lambda and EventBridge, handling trillions of monthly serverless function invocations.",
        apply_url="https://amazon.jobs",
        apply_sources=make_sources("Amazon", "Software Development Engineer II", "https://amazon.jobs"),
        posted_days_ago=2,
        is_featured=False
    ),
    # 10. Vercel
    JobListing(
        id="job-10",
        title="Senior Full Stack Software Engineer (Edge Ecosystem)",
        company="Vercel",
        location="Remote (Worldwide)",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=165000,
        salary_max=220000,
        salary_display="$165k - $220k",
        logo_color="from-slate-700 to-slate-900",
        required_skills=["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "WebAssembly"],
        description="Build developer-first cloud primitives, dashboard observability tools, and Edge runtime enhancements for millions of modern web engineers.",
        apply_url="https://vercel.com/careers",
        apply_sources=make_sources("Vercel", "Senior Full Stack Software Engineer", "https://vercel.com/careers", is_remote=True),
        posted_days_ago=1,
        is_featured=True
    ),
    # 11. Figma
    JobListing(
        id="job-11",
        title="Senior Frontend Canvas Platform Engineer",
        company="Figma",
        location="San Francisco, CA / Remote",
        work_mode="Hybrid",
        role_category="Frontend",
        experience_level="Senior",
        salary_min=170000,
        salary_max=225000,
        salary_display="$170k - $225k",
        logo_color="from-purple-500 to-pink-600",
        required_skills=["TypeScript", "React", "WebAssembly", "Canvas/WebGL", "Performance Optimization", "C++"],
        description="Pioneer 60 FPS multiplayer canvas collaboration engines and design systems components that power the industry standard collaborative design platform.",
        apply_url="https://figma.com/careers",
        apply_sources=make_sources("Figma", "Senior Frontend Canvas Engineer", "https://figma.com/careers"),
        posted_days_ago=3,
        is_featured=False
    ),
    # 12. Linear
    JobListing(
        id="job-12",
        title="Senior Frontend & Client Systems Engineer",
        company="Linear",
        location="Remote",
        work_mode="Remote",
        role_category="Frontend",
        experience_level="Senior",
        salary_min=165000,
        salary_max=215000,
        salary_display="$165k - $215k",
        logo_color="from-indigo-600 to-violet-700",
        required_skills=["React", "TypeScript", "Tailwind CSS", "WebSockets", "Keyboard Shortcuts", "Offline-first"],
        description="Craft ultra-snappy, pixel-perfect project tracking interfaces with sub-50ms interaction feedback and offline-first synchronization protocols.",
        apply_url="https://linear.app/careers",
        apply_sources=make_sources("Linear", "Senior Frontend Engineer", "https://linear.app/careers", is_remote=True),
        posted_days_ago=4,
        is_featured=True
    ),
    # 13. Datadog
    JobListing(
        id="job-13",
        title="Cloud & DevOps Infrastructure Architect",
        company="Datadog",
        location="Boston, MA / Remote",
        work_mode="Remote",
        role_category="DevOps",
        experience_level="Senior",
        salary_min=165000,
        salary_max=220000,
        salary_display="$165k - $220k",
        logo_color="from-purple-600 to-indigo-700",
        required_skills=["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Python", "Go"],
        description="Automate cloud infrastructure topology across multi-region Kubernetes clusters ingesting over 10 trillion observability metrics per day.",
        apply_url="https://datadoghq.com/careers",
        apply_sources=make_sources("Datadog", "DevOps Infrastructure Architect", "https://datadoghq.com/careers", is_remote=True),
        posted_days_ago=5,
        is_featured=False
    ),
    # 14. Snowflake
    JobListing(
        id="job-14",
        title="Distributed Database Query Engine Engineer",
        company="Snowflake",
        location="San Mateo, CA / Remote",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=185000,
        salary_max=250000,
        salary_display="$185k - $250k",
        logo_color="from-sky-500 to-blue-600",
        required_skills=["C++", "Java", "SQL", "Distributed Systems", "Query Optimization", "AWS"],
        description="Design vectorized execution kernels, columnar serialization, and autonomous partition pruning for Snowflake's multi-cloud Data Cloud platform.",
        apply_url="https://careers.snowflake.com",
        apply_sources=make_sources("Snowflake", "Query Engine Engineer", "https://careers.snowflake.com"),
        posted_days_ago=3,
        is_featured=False
    ),
    # 15. Databricks
    JobListing(
        id="job-15",
        title="Staff Software Engineer (Apache Spark & Lakehouse)",
        company="Databricks",
        location="San Francisco, CA",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Staff",
        salary_min=215000,
        salary_max=295000,
        salary_display="$215k - $295k",
        logo_color="from-red-500 to-amber-600",
        required_skills=["Scala", "Java", "Python", "Apache Spark", "Distributed Systems", "Kubernetes"],
        description="Drive core engine architectural breakthroughs in Apache Spark, Photon C++ vectorized engine, and Delta Lake governing exabytes of customer analytics.",
        apply_url="https://databricks.com/company/careers",
        apply_sources=make_sources("Databricks", "Staff Software Engineer", "https://databricks.com/company/careers"),
        posted_days_ago=2,
        is_featured=True
    ),
    # 16. Supabase
    JobListing(
        id="job-16",
        title="Full Stack Software Engineer (Open Source Core)",
        company="Supabase",
        location="Remote (Global)",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Mid",
        salary_min=145000,
        salary_max=190000,
        salary_display="$145k - $190k",
        logo_color="from-emerald-500 to-green-600",
        required_skills=["TypeScript", "React", "PostgreSQL", "Go", "Docker", "REST APIs", "SQL"],
        description="Contribute to the world's fastest growing open-source Firebase alternative, expanding Postgres management UIs and real-time database gateways.",
        apply_url="https://supabase.com/careers",
        apply_sources=make_sources("Supabase", "Full Stack Engineer", "https://supabase.com/careers", is_remote=True),
        posted_days_ago=1,
        is_featured=False
    ),
    # 17. Cloudflare
    JobListing(
        id="job-17",
        title="Systems & Networking Engineer (Cloudflare Workers)",
        company="Cloudflare",
        location="Austin, TX / Remote",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Senior",
        salary_min=170000,
        salary_max=230000,
        salary_display="$170k - $230k",
        logo_color="from-orange-500 to-amber-600",
        required_skills=["Rust", "Go", "C++", "Networking", "Distributed Systems", "Linux"],
        description="Engineer edge computing kernels and isolation primitives executing serverless JavaScript and WASM code across Cloudflare's 330+ global data centers.",
        apply_url="https://www.cloudflare.com/careers",
        apply_sources=make_sources("Cloudflare", "Systems Engineer Workers", "https://www.cloudflare.com/careers", is_remote=True),
        posted_days_ago=4,
        is_featured=False
    ),
    # 18. GitHub
    JobListing(
        id="job-18",
        title="Senior Software Engineer (GitHub Copilot Platform)",
        company="GitHub",
        location="Remote",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=175000,
        salary_max=235000,
        salary_display="$175k - $235k",
        logo_color="from-slate-700 to-slate-900",
        required_skills=["TypeScript", "React", "Ruby on Rails", "Node.js", "Docker", "REST APIs"],
        description="Enhance developer ergonomics within Copilot Workspace and GitHub Code Search, empowering over 100 million developers worldwide.",
        apply_url="https://github.com/about/careers",
        apply_sources=make_sources("GitHub", "Senior Software Engineer Copilot", "https://github.com/about/careers", is_remote=True),
        posted_days_ago=3,
        is_featured=True
    ),
    # 19. Uber
    JobListing(
        id="job-19",
        title="Senior Backend Engineer (Marketplace Dispatch & Pricing)",
        company="Uber",
        location="San Francisco, CA / New York, NY",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=180000,
        salary_max=245000,
        salary_display="$180k - $245k",
        logo_color="from-slate-800 to-black",
        required_skills=["Go", "Java", "Kafka", "Redis", "Distributed Systems", "Microservices", "Docker"],
        description="Develop ultra-low latency spatial matchmaking and dynamic pricing algorithms matching millions of riders with drivers in real-time.",
        apply_url="https://www.uber.com/us/en/careers",
        apply_sources=make_sources("Uber", "Senior Backend Engineer Marketplace", "https://www.uber.com/us/en/careers"),
        posted_days_ago=5,
        is_featured=False
    ),
    # 20. Airbnb
    JobListing(
        id="job-20",
        title="Staff Full Stack Engineer (Guest & Host Platform)",
        company="Airbnb",
        location="San Francisco, CA / Remote",
        work_mode="Remote",
        role_category="Full Stack",
        experience_level="Staff",
        salary_min=205000,
        salary_max=280000,
        salary_display="$205k - $280k",
        logo_color="from-rose-500 to-pink-600",
        required_skills=["React", "TypeScript", "Java", "GraphQL", "PostgreSQL", "System Design"],
        description="Spearhead architectural improvements across checkout, booking security, and global payments processing billions in traveler volume.",
        apply_url="https://careers.airbnb.com",
        apply_sources=make_sources("Airbnb", "Staff Full Stack Engineer", "https://careers.airbnb.com", is_remote=True),
        posted_days_ago=2,
        is_featured=True
    ),
    # 21. Spotify
    JobListing(
        id="job-21",
        title="Senior Machine Learning Engineer (Audio Personalization)",
        company="Spotify",
        location="New York, NY / Remote",
        work_mode="Remote",
        role_category="Machine Learning",
        experience_level="Senior",
        salary_min=175000,
        salary_max=235000,
        salary_display="$175k - $235k",
        logo_color="from-emerald-500 to-green-600",
        required_skills=["Python", "PyTorch", "TensorFlow", "BigQuery", "Docker", "Recommendation Systems"],
        description="Build recommendation algorithms powering Discover Weekly, AI DJ, and personalized home feeds for over 600M+ active audio listeners.",
        apply_url="https://www.lifeatspotify.com/jobs",
        apply_sources=make_sources("Spotify", "Senior ML Engineer Personalization", "https://www.lifeatspotify.com/jobs", is_remote=True),
        posted_days_ago=3,
        is_featured=False
    ),
    # 22. Palantir
    JobListing(
        id="job-22",
        title="Forward Deployed Software Engineer (Foundry Core)",
        company="Palantir",
        location="New York, NY",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Mid",
        salary_min=160000,
        salary_max=215000,
        salary_display="$160k - $215k",
        logo_color="from-slate-700 to-slate-900",
        required_skills=["TypeScript", "React", "Java", "Python", "PostgreSQL", "Docker", "Linux"],
        description="Deploy critical operational software for defense, healthcare, and enterprise supply chain leaders with high data fidelity requirements.",
        apply_url="https://www.palantir.com/careers",
        apply_sources=make_sources("Palantir", "Forward Deployed Software Engineer", "https://www.palantir.com/careers"),
        posted_days_ago=4,
        is_featured=False
    ),
    # 23. Razorpay (Top Indian Fintech Unicorn)
    JobListing(
        id="job-23",
        title="Senior Staff Backend Engineer (Core Banking & Payments)",
        company="Razorpay",
        location="Bengaluru, India / Hybrid",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Staff",
        salary_min=120000,
        salary_max=160000,
        salary_display="₹55L - ₹75L / $120k - $160k",
        logo_color="from-blue-600 to-sky-600",
        required_skills=["Go", "PHP", "Python", "MySQL", "Kafka", "Redis", "Microservices", "Docker"],
        description="Architect high-throughput payment gateways, automated settlements, and neo-banking APIs handling over $150 billion in annualized transaction volume.",
        apply_url="https://razorpay.com/jobs",
        apply_sources=make_sources("Razorpay", "Staff Backend Engineer Payments", "https://razorpay.com/jobs"),
        posted_days_ago=1,
        is_featured=True
    ),
    # 24. CRED (High-Decibel Indian Tech Unicorn)
    JobListing(
        id="job-24",
        title="Senior Backend Architect (Distributed Financial Ledgers)",
        company="CRED",
        location="Bengaluru, India",
        work_mode="Onsite",
        role_category="Backend",
        experience_level="Senior",
        salary_min=110000,
        salary_max=155000,
        salary_display="₹50L - ₹70L / $110k - $155k",
        logo_color="from-slate-900 to-black",
        required_skills=["Java", "Go", "Kafka", "PostgreSQL", "Redis", "Distributed Systems", "Docker"],
        description="Design double-entry bookkeeping financial ledgers, gamified rewards mechanisms, and fraud detection engines operating at millisecond latencies.",
        apply_url="https://cred.club/careers",
        apply_sources=make_sources("CRED", "Senior Backend Architect Ledgers", "https://cred.club/careers"),
        posted_days_ago=2,
        is_featured=True
    ),
    # 25. Swiggy (Hyperlocal Delivery Giant)
    JobListing(
        id="job-25",
        title="Principal Software Engineer (Routing & Logistics Engine)",
        company="Swiggy",
        location="Bengaluru, India",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Staff",
        salary_min=115000,
        salary_max=165000,
        salary_display="₹52L - ₹75L / $115k - $165k",
        logo_color="from-amber-500 to-orange-600",
        required_skills=["Java", "Go", "Python", "Kafka", "Redis", "Machine Learning", "System Design"],
        description="Build real-time combinatorial optimization algorithms routing millions of food and grocery deliveries across 500+ Indian cities.",
        apply_url="https://careers.swiggy.com",
        apply_sources=make_sources("Swiggy", "Principal Software Engineer Logistics", "https://careers.swiggy.com"),
        posted_days_ago=3,
        is_featured=False
    ),
    # 26. Zomato / Blinkit
    JobListing(
        id="job-26",
        title="Senior Full Stack Engineer (Quick Commerce Platform)",
        company="Zomato",
        location="Gurugram, India / Hybrid",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=95000,
        salary_max=140000,
        salary_display="₹45L - ₹65L / $95k - $140k",
        logo_color="from-red-600 to-rose-700",
        required_skills=["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "Tailwind CSS"],
        description="Develop instant-dispatch store management platforms, dark-store inventory monitors, and consumer web interfaces powering 10-minute grocery delivery.",
        apply_url="https://www.zomato.com/careers",
        apply_sources=make_sources("Zomato", "Senior Full Stack Engineer Blinkit", "https://www.zomato.com/careers"),
        posted_days_ago=2,
        is_featured=False
    ),
    # 27. Zerodha (Pioneer Indian FinTech)
    JobListing(
        id="job-27",
        title="Senior Systems & Go Engineer (Kite Trading Engine)",
        company="Zerodha",
        location="Bengaluru, India / Remote",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Senior",
        salary_min=100000,
        salary_max=150000,
        salary_display="₹48L - ₹68L / $100k - $150k",
        logo_color="from-blue-500 to-indigo-600",
        required_skills=["Go", "Python", "PostgreSQL", "Redis", "WebSockets", "Linux", "Low Latency"],
        description="Engineer ultra-fast order matching gateways, WebSocket market-depth tickers, and risk management systems for India's largest retail brokerage.",
        apply_url="https://zerodha.com/careers",
        apply_sources=make_sources("Zerodha", "Senior Go Engineer Kite", "https://zerodha.com/careers", is_remote=True),
        posted_days_ago=1,
        is_featured=True
    ),
    # 28. Postman (Global API Platform)
    JobListing(
        id="job-28",
        title="Senior Frontend Architect (API Collaboration Client)",
        company="Postman",
        location="Bengaluru, India / San Francisco / Remote",
        work_mode="Remote",
        role_category="Frontend",
        experience_level="Senior",
        salary_min=135000,
        salary_max=185000,
        salary_display="$135k - $185k",
        logo_color="from-orange-500 to-red-600",
        required_skills=["React", "TypeScript", "Electron", "Node.js", "WebSockets", "CSS Architecture"],
        description="Lead frontend architecture for Postman's desktop and web clients used by 30+ million developers to test, document, and mock APIs.",
        apply_url="https://www.postman.com/company/careers",
        apply_sources=make_sources("Postman", "Senior Frontend Architect", "https://www.postman.com/company/careers", is_remote=True),
        posted_days_ago=4,
        is_featured=False
    ),
    # 29. Flipkart
    JobListing(
        id="job-29",
        title="Software Development Engineer III (Distributed Catalog)",
        company="Flipkart",
        location="Bengaluru, India",
        work_mode="Hybrid",
        role_category="Backend",
        experience_level="Senior",
        salary_min=105000,
        salary_max=145000,
        salary_display="₹48L - ₹65L / $105k - $145k",
        logo_color="from-blue-500 to-yellow-500",
        required_skills=["Java", "HBase", "Kafka", "Elasticsearch", "Distributed Systems", "Docker"],
        description="Scale product catalog indexing and search ranking systems servicing hundreds of millions of concurrent shoppers during Big Billion Days.",
        apply_url="https://www.flipkartcareers.com",
        apply_sources=make_sources("Flipkart", "SDE III Distributed Catalog", "https://www.flipkartcareers.com"),
        posted_days_ago=3,
        is_featured=False
    ),
    # 30. Meesho
    JobListing(
        id="job-30",
        title="Staff Data Scientist / ML Engineer (Personalization)",
        company="Meesho",
        location="Bengaluru, India / Remote",
        work_mode="Hybrid",
        role_category="Data Science",
        experience_level="Staff",
        salary_min=110000,
        salary_max=160000,
        salary_display="₹50L - ₹72L / $110k - $160k",
        logo_color="from-pink-600 to-rose-700",
        required_skills=["Python", "PyTorch", "Spark", "SQL", "Deep Learning", "Transformers", "NLP"],
        description="Deploy graph neural networks and multimodal deep learning models for personalized e-commerce feed discovery across regional vernacular markets.",
        apply_url="https://meesho.io/careers",
        apply_sources=make_sources("Meesho", "Staff Data Scientist Personalization", "https://meesho.io/careers"),
        posted_days_ago=2,
        is_featured=False
    ),
    # 31. Freshworks
    JobListing(
        id="job-31",
        title="Senior Full Stack Engineer (Freddy AI & Enterprise CRM)",
        company="Freshworks",
        location="Chennai, India / Hybrid",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=90000,
        salary_max=135000,
        salary_display="₹40L - ₹60L / $90k - $135k",
        logo_color="from-orange-500 to-amber-600",
        required_skills=["Ruby on Rails", "React", "TypeScript", "AWS", "MySQL", "Docker", "REST APIs"],
        description="Develop AI-augmented customer support tools and automated agent co-pilots for 65,000+ businesses globally on Nasdaq-listed Freshworks.",
        apply_url="https://www.freshworks.com/company/careers",
        apply_sources=make_sources("Freshworks", "Senior Full Stack Engineer CRM", "https://www.freshworks.com/company/careers"),
        posted_days_ago=5,
        is_featured=False
    ),
    # 32. BrowserStack
    JobListing(
        id="job-32",
        title="Senior Infrastructure & Cloud Reliability Engineer",
        company="BrowserStack",
        location="Mumbai / Bengaluru / Remote",
        work_mode="Remote",
        role_category="DevOps",
        experience_level="Senior",
        salary_min=105000,
        salary_max=150000,
        salary_display="₹45L - ₹65L / $105k - $150k",
        logo_color="from-blue-600 to-emerald-600",
        required_skills=["Kubernetes", "Linux", "Docker", "AWS", "Python", "Terraform", "Prometheus"],
        description="Maintain a real-device mobile and desktop browser cloud infrastructure executing over 2 million automated tests daily for global developers.",
        apply_url="https://www.browserstack.com/careers",
        apply_sources=make_sources("BrowserStack", "Senior Cloud Infrastructure Engineer", "https://www.browserstack.com/careers", is_remote=True),
        posted_days_ago=4,
        is_featured=False
    ),
    # 33. Hasura
    JobListing(
        id="job-33",
        title="Senior Systems & GraphQL Core Engineer",
        company="Hasura",
        location="Remote (Global)",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Senior",
        salary_min=150000,
        salary_max=200000,
        salary_display="$150k - $200k",
        logo_color="from-blue-500 to-teal-500",
        required_skills=["Haskell", "Go", "GraphQL", "PostgreSQL", "Docker", "REST APIs"],
        description="Optimize the open-source Hasura GraphQL Data API engine translating GraphQL queries directly into high-speed optimized SQL statements.",
        apply_url="https://hasura.io/careers",
        apply_sources=make_sources("Hasura", "Senior Systems Engineer", "https://hasura.io/careers", is_remote=True),
        posted_days_ago=3,
        is_featured=False
    ),
    # 34. Atlassian
    JobListing(
        id="job-34",
        title="Principal Cloud Architect (Jira & Confluence Core)",
        company="Atlassian",
        location="Remote / San Francisco / Sydney",
        work_mode="Remote",
        role_category="Backend",
        experience_level="Staff",
        salary_min=195000,
        salary_max=275000,
        salary_display="$195k - $275k",
        logo_color="from-blue-600 to-indigo-600",
        required_skills=["Java", "Kotlin", "AWS", "PostgreSQL", "Distributed Systems", "Microservices"],
        description="Architect multi-tenant cloud tenancy and instant disaster recovery for Jira and Confluence cloud services supporting Fortune 500 enterprises.",
        apply_url="https://www.atlassian.com/company/careers",
        apply_sources=make_sources("Atlassian", "Principal Cloud Architect", "https://www.atlassian.com/company/careers", is_remote=True),
        posted_days_ago=2,
        is_featured=False
    ),
    # 35. Adobe
    JobListing(
        id="job-35",
        title="Senior Full Stack Engineer (Adobe Creative Cloud AI)",
        company="Adobe",
        location="San Jose, CA / Remote",
        work_mode="Hybrid",
        role_category="Full Stack",
        experience_level="Senior",
        salary_min=170000,
        salary_max=230000,
        salary_display="$170k - $230k",
        logo_color="from-red-600 to-rose-700",
        required_skills=["React", "TypeScript", "Node.js", "C++", "WebAssembly", "Docker"],
        description="Integrate generative Firefly AI models and asset pipelines directly into web-first editions of Photoshop, Illustrator, and Premiere Pro.",
        apply_url="https://www.adobe.com/careers.html",
        apply_sources=make_sources("Adobe", "Senior Full Stack Engineer Creative Cloud", "https://www.adobe.com/careers.html"),
        posted_days_ago=3,
        is_featured=False
    ),
    # 36. Salesforce
    JobListing(
        id="job-36",
        title="Lead Platform Infrastructure Engineer (Einstein AI)",
        company="Salesforce",
        location="San Francisco, CA",
        work_mode="Hybrid",
        role_category="DevOps",
        experience_level="Lead",
        salary_min=185000,
        salary_max=250000,
        salary_display="$185k - $250k",
        logo_color="from-sky-500 to-blue-600",
        required_skills=["Kubernetes", "AWS", "Docker", "Java", "Python", "Terraform", "CI/CD"],
        description="Operate resilient multi-cloud container runtimes executing autonomous Einstein 1 AI agents and automated enterprise sales workflows.",
        apply_url="https://www.salesforce.com/company/careers",
        apply_sources=make_sources("Salesforce", "Lead Platform Infrastructure Engineer", "https://www.salesforce.com/company/careers"),
        posted_days_ago=4,
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
