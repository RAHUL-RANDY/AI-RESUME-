from typing import List, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter(prefix="/api/smart-answers", tags=["AI Smart Job Application Answers Generator"])

class ApplicationQuestion(BaseModel):
    id: str
    category: str
    question_text: str
    intent: str
    key_evaluation_factors: List[str]

class AnswerGenerateRequest(BaseModel):
    question_id: str
    company_name: str
    target_role: str
    candidate_name: str = "Candidate"
    skills: List[str]
    years_experience: int = 4
    tone: str = "confident_professional"  # confident_professional, executive_leader, innovative_visionary
    custom_notes: Optional[str] = None

class AnswerGenerateResponse(BaseModel):
    question_id: str
    company_name: str
    tailored_answer: str
    bullet_talking_points: List[str]
    recruiter_green_flags: List[str]
    red_flags_to_avoid: List[str]

APPLICATION_QUESTIONS: List[ApplicationQuestion] = [
    ApplicationQuestion(
        id="why-company",
        category="Motivation & Culture",
        question_text="Why do you want to work at our company?",
        intent="Tests genuine product understanding, company mission alignment, and self-directed interest.",
        key_evaluation_factors=["Specific product or engineering challenge mentioned", "Mission alignment", "Personal career trajectory"]
    ),
    ApplicationQuestion(
        id="technical-challenge",
        category="Technical Depth",
        question_text="Describe the most challenging technical project or architecture you have built.",
        intent="Evaluates engineering problem solving, trade-off analysis, scalability constraints, and ownership.",
        key_evaluation_factors=["STAR format (Situation, Task, Action, Result)", "Quantitative metrics (latency, scale, cost)", "Architectural trade-offs"]
    ),
    ApplicationQuestion(
        id="conflict-resolution",
        category="Behavioral & Teamwork",
        question_text="Tell me about a time you had a significant technical disagreement with a colleague or manager.",
        intent="Evaluates emotional intelligence, data-driven reasoning, ego management, and commitment to team success.",
        key_evaluation_factors=["Objectivity and reliance on telemetry/data", "Empathy towards other viewpoints", "Disagree and commit capability"]
    ),
    ApplicationQuestion(
        id="salary-notice",
        category="Logistics & Compensation",
        question_text="What are your salary expectations and notice period / availability to start?",
        intent="Anchors compensation expectations without pricing yourself out or undervaluing market leverage.",
        key_evaluation_factors=["Anchoring to market benchmarks", "Flexibility based on Total Compensation", "Professional notice period etiquette"]
    ),
    ApplicationQuestion(
        id="failure-resilience",
        category="Resilience & Growth",
        question_text="Describe a time when a production incident occurred or a project missed its deadline. How did you handle it?",
        intent="Tests blameless post-mortem culture, operational responsibility, and long-term preventive mechanisms.",
        key_evaluation_factors=["Immediate containment vs root cause elimination", "Blameless post-mortem ownership", "Automated regression prevention"]
    )
]

@router.get("/questions", response_model=List[ApplicationQuestion])
async def get_application_questions():
    """
    Returns curated high-frequency job application questions from Greenhouse, Lever, and Workday.
    """
    return APPLICATION_QUESTIONS

@router.post("/generate", response_model=AnswerGenerateResponse)
async def generate_smart_answer(req: AnswerGenerateRequest):
    """
    Generates tailored, high-converting answers tailored to company and candidate resume strengths.
    """
    comp = req.company_name or "your team"
    role = req.target_role or "Software Engineer"
    skills_preview = ", ".join(req.skills[:4]) if req.skills else "modern distributed systems and cloud architecture"

    if req.question_id == "why-company":
        tailored = (
            f"What excites me most about {comp} is the deliberate commitment to solving complex, high-scale challenges "
            f"while maintaining extraordinary product velocity. Having specialized in {skills_preview} over my "
            f"{req.years_experience} years of engineering experience, I am drawn to how {comp} tackles system reliability "
            f"and user-centric design. \n\n"
            f"Specifically, as a {role}, I want to operate at the intersection of technical excellence and measurable product impact. "
            f"{comp}'s engineering culture clearly empowers developers to take end-to-end ownership, which aligns perfectly "
            f"with my working philosophy. I am eager to bring my background in high-throughput architecture to help {comp} scale "
            f"its next generation of products."
        )
        points = [
            f"Cite {comp}'s mission, technical velocity, and product standard.",
            f"Connect {req.years_experience}+ years of hands-on {skills_preview} experience to immediate role requirements.",
            "Emphasize eagerness for end-to-end ownership and long-term organizational value."
        ]
        greens = ["Shows explicit knowledge of company values", "Highlights relevant technical skills proactively"]
        reds = ["Avoid generic boilerplate like 'I need a job' or 'I like your perks'", "Don't sound like you copied an answer from Google"]

    elif req.question_id == "technical-challenge":
        tailored = (
            f"During my work architecting scalable services, one of our critical microservices experienced latency degradation "
            f"under peak load, with P99 response times spiking beyond 1.8 seconds. As the technical lead on the initiative, "
            f"I led an in-depth telemetry analysis across our database queries, network ingress, and thread pools.\n\n"
            f"Using {skills_preview}, I re-architected our data ingestion layer with asynchronous caching, connection pooling, "
            f"and optimized database indexing. Furthermore, I implemented automated backpressure mechanisms to prevent cascading failures.\n\n"
            f"As a result, we reduced our P99 response latency by 68% down to sub-150ms, decreased database CPU utilization by 42%, "
            f"and maintained 99.99% availability during subsequent traffic surges of 35,000+ requests per second."
        )
        points = [
            "Use STAR method: Spike to 1.8s P99 -> Identified bottlenecks -> Re-architected with caching & backpressure.",
            "Highlight quantitative impact: 68% latency reduction, 42% CPU drop, 99.99% uptime.",
            "Demonstrates production maturity and root-cause analytical thinking."
        ]
        greens = ["Strong quantifiable metrics (% and ms)", "Addresses system stability and scalability"]
        reds = ["Never blame team members for bugs", "Avoid using vague statements like 'we fixed the issue' without technical specifics"]

    elif req.question_id == "salary-notice":
        tailored = (
            f"Regarding compensation, my target for a {role} position is in the competitive market range of "
            f"the 75th percentile for companies of {comp}'s caliber, taking into account Total Compensation (Base Salary, "
            f"Equity, and Performance incentives). That said, I am flexible and prioritize finding the right engineering team, "
            f"high-leverage technical challenges, and long-term equity growth potential over any single fixed number.\n\n"
            f"Regarding availability, I have a standard 2-week notice period with my current employer and am excited to ensure "
            f"a seamless handoff before dedicating 100% of my energy to {comp}."
        )
        points = [
            "Anchor on Total Compensation (TC) rather than just base salary.",
            "Reiterate that technical impact and mission fit take precedence.",
            "State clear 2-week professional notice etiquette."
        ]
        greens = ["Maintains leverage without being rigid", "Shows professional commitment to transition ethics"]
        reds = ["Don't state an excessively narrow fixed dollar amount early on", "Avoid appearing indecisive"]

    else:
        # Conflict / Failure general response
        tailored = (
            f"In a previous sprint, our team had conflicting perspectives regarding the database schema design for a high-traffic "
            f"microservice. Rather than debating theoretical preferences, I proposed building a quick benchmarking harness "
            f"using our actual query workloads.\n\n"
            f"We ran realistic load tests simulating 10,000 concurrent writes across both approaches. The telemetry conclusively "
            f"demonstrated that the normalized approach with denormalized read replicas eliminated write contention while keeping "
            f"read latency minimal. We adopted this unified solution, delivered the sprint on schedule, and documented the decision "
            f"in an Architecture Decision Record (ADR) for future engineers."
        )
        points = [
            "Ground disagreements in telemetry and empirical benchmarks rather than subjective opinions.",
            "Establish collaborative tone focused on customer and system uptime.",
            "Record architectural lessons in an Architecture Decision Record (ADR)."
        ]
        greens = ["Data-driven decision making", "Blameless collaboration and ADR documentation"]
        reds = ["Never talk negatively about former colleagues or managers", "Avoid appearing stubborn"]

    return AnswerGenerateResponse(
        question_id=req.question_id,
        company_name=comp,
        tailored_answer=tailored,
        bullet_talking_points=points,
        recruiter_green_flags=greens,
        red_flags_to_avoid=reds
    )
