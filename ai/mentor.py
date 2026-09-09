import os
import logging
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

from backend.models.schemas import (
    ChatMessage,
    MentorChatResponse,
    InterviewQuestion,
    InterviewQuestionsResponse,
)

load_dotenv()
logger = logging.getLogger("career_intelligence.mentor")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def chat_with_mentor(
    messages: List[ChatMessage],
    candidate_profile: Optional[Dict[str, Any]] = None,
    target_role: Optional[str] = None,
    missing_skills: Optional[List[str]] = None
) -> MentorChatResponse:
    """
    Context-aware AI Career Mentor powered by LLM (Claude/GPT/Gemini) with rich contextual fallback.
    """
    candidate_profile = candidate_profile or {}
    cand_name = candidate_profile.get("name", "Candidate")
    cand_exp = candidate_profile.get("total_experience_years", 2.0)
    cand_skills = candidate_profile.get("skills", [])
    cand_role = target_role or "Software Engineer"
    missing = missing_skills or []

    system_prompt = f"""You are the AI Career Intelligence Co-Pilot & Mentor, a world-class engineering leader, principal architect, and career strategist for the AI Career Intelligence Platform.
User Context:
- Name: {cand_name}
- Current/Target Role: '{cand_role}'
- Experience: {cand_exp} years
- Verified Skills: {', '.join(cand_skills[:15]) if cand_skills else 'General Software & ML Engineering'}
- Target Role Skill Gaps: {', '.join(missing[:8]) if missing else 'None detected; high domain alignment'}

Capabilities & Scope:
1. Answer ALL types of user questions:
   - Technical & Engineering: System design, ML/AI architectures, Python/TypeScript/Go code, cloud & DevOps, data engineering, APIs, algorithms.
   - Resume & Career Strategy: ATS score optimization, STAR bullet crafting with metrics, portfolio ideas, career pathing.
   - Platform Features & Navigation: Guide users on uploading resumes (/upload), viewing match radar & salary predictions (/dashboard), browsing accredited free & paid courses (/courses), mock interview prep (/interview), candidate ranking (/recruiter), and pricing tiers (/pricing).
   - Interview Mastery: Behavioral STAR coaching, technical deep-dive questions, and salary negotiation tactics.
2. Formatting:
   - Use clean Markdown with bolding, concise bullet points, and code blocks where helpful.
   - Keep answers practical, empowering, and directly applicable.
"""

    last_user_msg = messages[-1].content if messages else "Hello! How can I prepare for my target role?"

    # 1. Try Anthropic Claude if key is provided
    if ANTHROPIC_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
                api_messages = [{"role": m.role, "content": m.content} for m in messages if m.role in ["user", "assistant"]]
                payload = {
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 1024,
                    "system": system_prompt,
                    "messages": api_messages
                }
                resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    reply_text = data["content"][0]["text"]
                    return MentorChatResponse(
                        reply=reply_text,
                        suggested_followups=[
                            "How do I highlight my recent projects in system design rounds?",
                            f"What specific capstone project would best demonstrate {missing[0] if missing else 'distributed systems'}?",
                            "Can you give me a mock behavioral interview question for this role?"
                        ]
                    )
        except Exception as e:
            logger.warning(f"Anthropic API call failed: {e}. Falling back to context engine.")

    # 2. Try OpenAI (GPT-4o-mini) with hot-reload key detection
    from backend.services.openai_service import generate_chat_response, get_openai_key
    if get_openai_key():
        try:
            chat_history = [{"role": m.role, "content": m.content} for m in messages if m.role in ["user", "assistant"]]
            reply_text = await generate_chat_response(
                messages=chat_history,
                system_prompt=system_prompt,
                model="gpt-4o-mini",
                max_tokens=950
            )
            if reply_text:
                return MentorChatResponse(
                    reply=reply_text,
                    suggested_followups=[
                        "How can I optimize my resume bullet points for ATS?",
                        f"What are the best accredited courses to bridge my gaps in {cand_role}?",
                        "Can you generate a mock technical interview question?"
                    ]
                )
        except Exception as e:
            logger.warning(f"OpenAI service call failed: {e}. Falling back to context engine.")

    # 3. High-Quality Contextual Intelligence Engine (Fallback when API key not yet set or offline)
    query_lower = last_user_msg.lower()
    
    if any(k in query_lower for k in ["ats", "score", "resume", "format", "bullet", "parse"]):
        reply = (
            f"Here is how to maximize your ATS score and resume impact for **{cand_role}**:\n\n"
            "1. **Exact Taxonomy Matching (25% Weight):** ATS scanners match exact terms. Ensure core technologies "
            f"({', '.join(cand_skills[:5]) if cand_skills else 'Python, SQL, Cloud'}) appear verbatim in both your Skills section and Work Experience.\n"
            "2. **Google XYZ / STAR Format:** Structure every bullet point as: *'Accomplished [X], as measured by [Y], by doing [Z]'*.\n"
            "   • *Example:* 'Reduced p99 API latency by 42% across 8 microservices by deploying Redis caching and optimizing async database connection pools.'\n"
            "3. **Clean Architecture:** Use standard headers (`Experience`, `Skills`, `Education`, `Projects`) with zero graphics, columns, or tables that confuse OCR parsers.\n"
            "4. **Action:** Visit the **Analyze Resume** tab (`/upload`) to run our multi-factor ATS and semantic scoring engine!"
        )
    elif any(k in query_lower for k in ["salary", "negotiate", "compensation", "money", "offer", "pay"]):
        reply = (
            f"Regarding compensation strategy for a **{cand_role}** with **{cand_exp} years of experience**:\n\n"
            "1. **Anchor on Market Value:** Based on our trained Random Forest salary regression model and real market data, top talent commands strong compensation bands.\n"
            "2. **Quantify Business Impact:** Never ask for more money based on personal needs. Anchor your request on measurable technical outcomes (throughput, latency reduction, cost optimization).\n"
            "3. **Negotiate the Whole Package:** If base salary bands are rigid, negotiate sign-on bonuses, equity refreshers, annual bonus guarantees, remote flexibility, or accelerated 6-month performance reviews."
        )
    elif any(k in query_lower for k in ["gap", "skill", "missing", "learn", "study", "course"]):
        gap_text = f"focusing on **{', '.join(missing[:4])}**" if missing else "refining distributed systems, MLOps, and cloud scalability"
        reply = (
            f"Based on your profile analysis for **{cand_role}**, I recommend {gap_text}.\n\n"
            "• **Targeted Upskilling:** Visit our dedicated **Courses** tab (`/courses`) to filter 55+ accredited free & paid courses tailored directly to your missing competencies.\n"
            "• **Hands-on Microservices:** Build an end-to-end repository implementing these missing tools with Docker, automated CI/CD, and benchmark tests.\n"
            "• **Interview Defense:** Be prepared to articulate trade-offs (e.g. latency vs consistency, SQL vs NoSQL, synchronous vs event-driven)."
        )
    elif any(k in query_lower for k in ["interview", "prep", "question", "behavioral", "technical"]):
        reply = (
            f"Preparing for **{cand_role}** interviews requires mastering three core rounds:\n\n"
            "1. **Technical Deep Dive:** Be ready to walk through your deepest technical challenge. Explain the bottleneck, options evaluated, and quantifiable metrics.\n"
            "2. **System Design:** Practice sketching distributed architectures: load balancers, caching layers, database sharding, and messaging queues (Kafka/RabbitMQ).\n"
            "3. **Behavioral (STAR Method):** Prepare 4 core stories: a technical disagreement with teammates, a production incident you resolved, a deadline trade-off, and mentorship.\n\n"
            "💡 *Tip:* Check out the **Interview Prep** tab (`/interview`) for tailored technical, HR, and project questions generated specifically for your background!"
        )
    elif any(k in query_lower for k in ["system design", "architecture", "distributed", "scale", "microservice"]):
        reply = (
            f"Here is a master blueprint for **System Design & Distributed Scalability**:\n\n"
            "1. **Requirements & Back-of-the-Envelope:** Clarify functional vs non-functional constraints (DAU, read/write ratio, latency SLA, storage growth).\n"
            "2. **API & Data Model:** Define REST/gRPC endpoints and schema (SQL for ACID consistency vs NoSQL for horizontal partitioning).\n"
            "3. **High-Level Design:** Clients -> CDN/DNS -> API Gateway -> Service Mesh -> Distributed Cache (Redis) -> Primary/Replica DB.\n"
            "4. **Bottlenecks & Fault Tolerance:** Add circuit breakers, rate limiting, message queues for async spikes, and dead letter queues."
        )
    elif any(k in query_lower for k in ["platform", "feature", "how to", "help", "where", "website"]):
        reply = (
            "Here is a quick guide to navigating the **AI Career Intelligence Platform**:\n\n"
            "• **Analyze Resume (`/upload`):** Upload your PDF/DOCX to extract skills, compute ATS scores, and parse experience.\n"
            "• **Dashboard (`/dashboard`):** View SBERT semantic matching, skill gap radar spider charts, salary predictions, and SHAP feature attribution.\n"
            "• **Accredited Courses (`/courses`):** Browse 55+ targeted courses with Free/Paid filters to close your specific skill gaps.\n"
            "• **AI Mentor (`/mentor`):** Interactive career coaching, STAR resume bullet rewriter, and tailored summary generator.\n"
            "• **Interview Prep (`/interview`):** Practice customized HR, Technical, and Behavioral questions.\n"
            "• **Recruiter Dashboard (`/recruiter`):** Batch parse and rank multiple candidates with automated composite scoring.\n"
            "• **Pricing (`/pricing`):** Upgrade to Pro or Enterprise with Razorpay (INR) and Stripe (USD)."
        )
    else:
        top_skills_display = ", ".join(cand_skills[:5]) if cand_skills else "Software & Machine Learning Engineering"
        reply = (
            f"Hello {cand_name}! As your **AI Career Co-Pilot**, I am here to assist you across all career, technical, and platform questions.\n\n"
            f"Looking at your background in **{top_skills_display}** targeting **{cand_role}**:\n"
            "• **Skill Gap Closure:** Close key gaps with targeted projects or accredited courses.\n"
            "• **Resume Optimization:** Polish bullet points into quantified STAR achievements.\n"
            "• **Interview Mastery:** Practice system design, coding rounds, and behavioral stories.\n\n"
            "Feel free to ask me anything — from technical coding and system architecture to salary negotiation and platform guidance!"
        )

    followups = [
        f"How do I prepare for technical rounds for {cand_role}?",
        f"What projects should I build to master {missing[0] if missing else 'Distributed Systems'}?",
        "How do I improve my ATS resume score?"
    ]

    return MentorChatResponse(
        reply=reply,
        suggested_followups=followups
    )

def generate_interview_questions(
    target_role: str,
    skills: List[str],
    experience_years: float = 2.0,
    projects: Optional[List[str]] = None
) -> InterviewQuestionsResponse:
    """
    Generates customized interview questions across HR, Technical, Project, and Behavioral categories.
    """
    skills_clean = skills[:6] if skills else ["Python", "FastAPI", "SQL", "Docker"]
    primary_skill = skills_clean[0] if skills_clean else "Backend Systems"
    secondary_skill = skills_clean[1] if len(skills_clean) > 1 else "Databases"

    questions: List[InterviewQuestion] = [
        # 1. HR / Screening
        InterviewQuestion(
            id="q1_hr",
            category="HR",
            question=f"What inspired you to pursue this {target_role} opportunity, and how does your background in {primary_skill} prepare you to make an immediate impact?",
            context="Evaluates role alignment, motivation, self-awareness, and cultural fit.",
            key_evaluation_points=[
                "Clear understanding of company mission and technical challenges",
                "Concise overview of relevant transferable experience",
                "Authentic enthusiasm and clear career direction"
            ],
            suggested_structure="Overview of your passion for the domain -> Concrete tie-in to your recent projects -> Vision for how you will contribute to the team."
        ),
        InterviewQuestion(
            id="q2_hr",
            category="HR",
            question="Describe your ideal engineering team culture and the management style under which you perform your best work.",
            context="Assesses team collaboration preferences, autonomy expectations, and work style compatibility.",
            key_evaluation_points=[
                "Appreciation for peer review, blameless post-mortems, and engineering excellence",
                "Comfort with autonomous execution paired with proactive communication",
                "Adaptability to evolving priorities"
            ],
            suggested_structure="Direct answer detailing core values (e.g. transparency, psychological safety) -> Brief example from a previous positive team experience."
        ),

        # 2. Technical / Deep Dive
        InterviewQuestion(
            id="q3_tech",
            category="Technical",
            question=f"In production systems utilizing {primary_skill} and {secondary_skill}, how do you diagnose and resolve latency bottlenecks and race conditions under heavy concurrent load?",
            context=f"Tests practical deep-dive expertise in concurrency, profiling, and production troubleshooting.",
            key_evaluation_points=[
                "Mention of APM tools, profiling, slow query logs, and thread pool monitoring",
                "Understanding of database lock contention, connection pooling, and caching tiers",
                "Systematic diagnostic methodology (metrics -> hypothesis -> reproduce -> benchmark)"
            ],
            suggested_structure="Diagnostic telemetry approach -> Immediate triage steps -> Architectural mitigation (caching, async workers, database sharding/indexing)."
        ),
        InterviewQuestion(
            id="q4_tech",
            category="Technical",
            question="Explain the trade-offs between synchronous REST/gRPC architectures versus asynchronous event-driven messaging (e.g. Kafka, RabbitMQ). When would you advocate for each?",
            context="Evaluates distributed systems fundamentals, consistency models, and architectural decision-making.",
            key_evaluation_points=[
                "Strong grasp of latency, coupling, backpressure, and data consistency",
                "Awareness of operational overhead associated with event brokers",
                "Nuanced consideration of idempotency and at-least-once delivery"
            ],
            suggested_structure="Define key trade-offs -> Give clear concrete scenarios favoring each pattern -> Address consistency and failure recovery."
        ),

        # 3. Project-Based
        InterviewQuestion(
            id="q5_proj",
            category="Project-based",
            question="Walk me through the most technically complex software system or feature you have engineered. What was the toughest architectural decision, and what would you do differently today in hindsight?",
            context="Tests ownership, technical depth, and capacity for objective critical reflection.",
            key_evaluation_points=[
                "Clear explanation of problem constraints, scale, and chosen solution",
                "Thoughtful articulation of alternatives considered",
                "Honest retrospective maturity regarding tech debt or hindsight trade-offs"
            ],
            suggested_structure="Context & Scale (users, throughput) -> Architectural design & key hurdle -> Results achieved -> Lessons learned."
        ),

        # 4. Behavioral (STAR)
        InterviewQuestion(
            id="q6_behav",
            category="Behavioral",
            question="Tell me about a time you had a strong technical disagreement with a team member or technical lead. How did you navigate the conversation and arrive at an outcome?",
            context="Evaluates conflict resolution, humility, data-driven persuasion, and collaborative mindset.",
            key_evaluation_points=[
                "Focus on team goals and technical evidence rather than personal ego",
                "Willingness to listen actively to opposing perspectives",
                "Ability to disagree and commit once a decision is made"
            ],
            suggested_structure="Situation (the technical dispute) -> Task (your responsibility) -> Action (how you gathered benchmarks/data and engaged constructively) -> Result (the consensus reached and project impact)."
        ),
        InterviewQuestion(
            id="q7_behav",
            category="Behavioral",
            question="Describe a critical production incident or bug that slipped past code review. How did you respond, communicate with stakeholders, and prevent recurrence?",
            context="Assesses crisis composure, accountability, communication under pressure, and blameless post-mortem culture.",
            key_evaluation_points=[
                "Immediate focus on mitigation and rollback over assigning blame",
                "Clear, proactive status updates to affected stakeholders",
                "Implementation of lasting preventative safeguards (automated regression tests, circuit breakers)"
            ],
            suggested_structure="STAR Method: Incident discovery -> Rapid containment -> Root-cause analysis -> Systemic preventative remediation."
        )
    ]

    return InterviewQuestionsResponse(
        target_role=target_role,
        questions=questions
    )
