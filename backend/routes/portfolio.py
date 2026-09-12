from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/api/portfolio", tags=["1-Click AI Developer Portfolio Generator"])

class PortfolioProject(BaseModel):
    name: str
    description: str
    tech_stack: List[str]
    live_url: Optional[str] = None
    github_url: Optional[str] = None

class PortfolioExperience(BaseModel):
    company: str
    role: str
    duration: str
    highlights: List[str]

class PortfolioGenerateRequest(BaseModel):
    name: str
    title: str
    summary: str
    email: Optional[str] = "contact@example.com"
    location: Optional[str] = "San Francisco, CA"
    github_url: Optional[str] = "https://github.com"
    linkedin_url: Optional[str] = "https://linkedin.com"
    skills: List[str]
    projects: Optional[List[PortfolioProject]] = None
    experience: Optional[List[PortfolioExperience]] = None
    theme: str = "obsidian_dark"  # obsidian_dark, cyber_matrix, solar_minimal, executive_navy

class PortfolioGenerateResponse(BaseModel):
    portfolio_slug: str
    theme: str
    html_bundle: str
    stats: Dict[str, Any]

THEME_STYLES = {
    "obsidian_dark": {
        "bg": "#090d16",
        "card_bg": "#111827",
        "border": "#1f2937",
        "text": "#f3f4f6",
        "accent": "#38bdf8",
        "accent_grad": "linear-gradient(135deg, #38bdf8, #818cf8)",
    },
    "cyber_matrix": {
        "bg": "#050d0a",
        "card_bg": "#0c1f17",
        "border": "#134e38",
        "text": "#ecfdf5",
        "accent": "#10b981",
        "accent_grad": "linear-gradient(135deg, #10b981, #06b6d4)",
    },
    "solar_minimal": {
        "bg": "#fafafa",
        "card_bg": "#ffffff",
        "border": "#e5e7eb",
        "text": "#111827",
        "accent": "#2563eb",
        "accent_grad": "linear-gradient(135deg, #2563eb, #4f46e5)",
    },
    "executive_navy": {
        "bg": "#070c1b",
        "card_bg": "#0e1730",
        "border": "#1e2954",
        "text": "#f8fafc",
        "accent": "#6366f1",
        "accent_grad": "linear-gradient(135deg, #6366f1, #a855f7)",
    }
}

def generate_html_portfolio(data: PortfolioGenerateRequest) -> str:
    th = THEME_STYLES.get(data.theme, THEME_STYLES["obsidian_dark"])
    
    # Skills pills
    skills_html = "".join([
        f'<span class="skill-tag">{s}</span>' for s in data.skills[:16]
    ])

    # Projects cards
    projects_list = data.projects or [
        PortfolioProject(
            name="AI Career Intelligence Suite",
            description="Distributed full-stack ATS and resume analytics engine with SBERT embeddings, sentence transformers, and automated interview coaching.",
            tech_stack=["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
            live_url="https://github.com",
            github_url="https://github.com"
        ),
        PortfolioProject(
            name="Real-Time Algorithmic Order Matching Engine",
            description="Sub-millisecond L3 order book simulator built with lock-free ring buffers and streaming WebSockets.",
            tech_stack=["Go", "Redis", "WebSockets", "Prometheus"],
            live_url="https://github.com",
            github_url="https://github.com"
        )
    ]
    projects_html = ""
    for p in projects_list:
        tags = "".join([f'<span class="tech-tag">{t}</span>' for t in p.tech_stack])
        links = ""
        if p.github_url:
            links += f'<a href="{p.github_url}" target="_blank" class="btn-sm">GitHub &rarr;</a>'
        if p.live_url:
            links += f'<a href="{p.live_url}" target="_blank" class="btn-sm btn-accent">Live Demo &rarr;</a>'
        projects_html += f"""
        <div class="project-card">
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div class="tags-container">{tags}</div>
            <div class="card-links">{links}</div>
        </div>
        """

    # Experience timeline
    exp_list = data.experience or [
        PortfolioExperience(
            company="Tier-1 Tech Enterprise",
            role=data.title,
            duration="2022 — Present",
            highlights=[
                "Architected high-throughput microservices handling 45M+ daily requests with 99.99% uptime.",
                "Mentored 6 junior/mid engineers and established standardized CI/CD pipelines cut release cycles by 40%."
            ]
        )
    ]
    exp_html = ""
    for e in exp_list:
        bullets = "".join([f'<li>{h}</li>' for h in e.highlights])
        exp_html += f"""
        <div class="exp-card">
            <div class="exp-header">
                <div>
                    <h3 class="role-title">{e.role}</h3>
                    <span class="company-name">{e.company}</span>
                </div>
                <span class="duration-badge">{e.duration}</span>
            </div>
            <ul class="exp-bullets">{bullets}</ul>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{data.name} — {data.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }}
        body {{ background-color: {th['bg']}; color: {th['text']}; line-height: 1.6; }}
        a {{ color: {th['accent']}; text-decoration: none; }}
        
        .container {{ max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }}
        
        /* Hero Section */
        .hero {{ padding: 4rem 0 3rem; text-align: left; }}
        .badge {{ display: inline-block; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(56, 189, 248, 0.1); color: {th['accent']}; border: 1px solid rgba(56, 189, 248, 0.2); margin-bottom: 1.25rem; }}
        h1 {{ font-size: 3rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; background: {th['accent_grad']}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .headline {{ font-size: 1.25rem; font-weight: 600; opacity: 0.9; margin-bottom: 1rem; }}
        .summary {{ font-size: 1rem; opacity: 0.75; max-width: 720px; line-height: 1.7; margin-bottom: 2rem; }}
        
        .cta-group {{ display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3.5rem; }}
        .btn {{ padding: 0.8rem 1.6rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; transition: transform 0.2s, opacity 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }}
        .btn-primary {{ background: {th['accent_grad']}; color: #ffffff; box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.3); }}
        .btn-secondary {{ background: {th['card_bg']}; border: 1px solid {th['border']}; color: {th['text']}; }}
        .btn:hover {{ opacity: 0.9; transform: translateY(-2px); }}
        
        /* Section Header */
        .section-title {{ font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid {th['border']}; padding-bottom: 0.75rem; }}
        
        /* Skills Tags */
        .skills-grid {{ display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 3.5rem; }}
        .skill-tag {{ padding: 0.45rem 0.9rem; background: {th['card_bg']}; border: 1px solid {th['border']}; border-radius: 0.6rem; font-size: 0.85rem; font-weight: 600; transition: border-color 0.2s; }}
        .skill-tag:hover {{ border-color: {th['accent']}; }}
        
        /* Projects Grid */
        .projects-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 3.5rem; }}
        .project-card {{ background: {th['card_bg']}; border: 1px solid {th['border']}; border-radius: 1rem; padding: 1.75rem; transition: transform 0.2s, border-color 0.2s; }}
        .project-card:hover {{ transform: translateY(-4px); border-color: {th['accent']}; }}
        .project-card h3 {{ font-size: 1.15rem; font-weight: 700; margin-bottom: 0.6rem; }}
        .project-card p {{ font-size: 0.88rem; opacity: 0.75; line-height: 1.6; margin-bottom: 1.25rem; }}
        .tags-container {{ display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }}
        .tech-tag {{ font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.55rem; background: rgba(255,255,255,0.05); border-radius: 0.35rem; opacity: 0.85; }}
        .card-links {{ display: flex; gap: 0.75rem; }}
        .btn-sm {{ font-size: 0.8rem; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 0.5rem; background: rgba(255,255,255,0.08); color: {th['text']}; }}
        .btn-accent {{ background: {th['accent']}; color: #ffffff; }}
        
        /* Experience */
        .exp-card {{ background: {th['card_bg']}; border: 1px solid {th['border']}; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.25rem; }}
        .exp-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }}
        .role-title {{ font-size: 1.1rem; font-weight: 700; }}
        .company-name {{ font-size: 0.85rem; color: {th['accent']}; font-weight: 600; }}
        .duration-badge {{ font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 0.4rem; background: rgba(255,255,255,0.06); }}
        .exp-bullets {{ padding-left: 1.25rem; font-size: 0.88rem; opacity: 0.8; line-height: 1.6; }}
        .exp-bullets li {{ margin-bottom: 0.4rem; }}
        
        /* Footer */
        footer {{ border-top: 1px solid {th['border']}; padding-top: 2rem; text-align: center; font-size: 0.85rem; opacity: 0.6; }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Hero -->
        <div class="hero">
            <span class="badge">Available for New Opportunities</span>
            <h1>{data.name}</h1>
            <p class="headline">{data.title} &bull; {data.location}</p>
            <p class="summary">{data.summary}</p>
            <div class="cta-group">
                <a href="mailto:{data.email}" class="btn btn-primary">Get In Touch &rarr;</a>
                <a href="{data.github_url}" target="_blank" class="btn btn-secondary">GitHub</a>
                <a href="{data.linkedin_url}" target="_blank" class="btn btn-secondary">LinkedIn</a>
            </div>
        </div>
        
        <!-- Technical Competencies -->
        <h2 class="section-title">Technical Expertise</h2>
        <div class="skills-grid">
            {skills_html}
        </div>
        
        <!-- Featured Projects -->
        <h2 class="section-title">Featured Projects</h2>
        <div class="projects-grid">
            {projects_html}
        </div>
        
        <!-- Experience -->
        <h2 class="section-title">Experience</h2>
        <div>
            {exp_html}
        </div>
        
        <!-- Footer -->
        <footer>
            <p>Designed & generated with AI Career Intelligence Suite &bull; {data.name} &copy; 2026</p>
        </footer>
    </div>
</body>
</html>"""

@router.post("/generate", response_model=PortfolioGenerateResponse)
async def generate_portfolio(req: PortfolioGenerateRequest):
    """
    Generates a production-ready, standalone, mobile-responsive HTML5/CSS3 portfolio site.
    """
    slug = req.name.lower().replace(" ", "-").replace(".", "") + "-portfolio"
    html_code = generate_html_portfolio(req)
    
    return PortfolioGenerateResponse(
        portfolio_slug=slug,
        theme=req.theme,
        html_bundle=html_code,
        stats={
            "skills_count": len(req.skills),
            "projects_count": len(req.projects or [1, 2]),
            "theme": req.theme,
            "ready_for_download": True
        }
    )
