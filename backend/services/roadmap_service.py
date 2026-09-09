import math
from typing import List, Optional
from backend.models.schemas import RoadmapResponse, RoadmapMilestone

def generate_career_roadmap(
    target_role: str,
    missing_skills: List[str],
    experience_years: float = 2.0,
    user_id: Optional[str] = None
) -> RoadmapResponse:
    """
    Generates a personalized month-by-month learning and career milestone roadmap
    dynamically tailored to the candidate's actual missing skill inventory and target role.
    """
    skills_to_learn = [s.strip() for s in missing_skills if s.strip()]
    if not skills_to_learn:
        skills_to_learn = ["Advanced System Design", "Distributed Systems", "Cloud Security", "Team Leadership"]

    # Determine timeline length based on number of missing skills (3 to 6 months)
    total_skills = len(skills_to_learn)
    duration_months = min(6, max(3, math.ceil(total_skills / 2) + 1))

    # Chunk missing skills across early/mid months
    chunk_size = max(1, math.ceil(total_skills / (duration_months - 1)))
    skill_chunks = [skills_to_learn[i:i + chunk_size] for i in range(0, total_skills, chunk_size)]

    milestones: List[RoadmapMilestone] = []

    for month_idx in range(1, duration_months + 1):
        if month_idx <= len(skill_chunks):
            current_skills = skill_chunks[month_idx - 1]
            skills_display = ", ".join(current_skills)
            
            if month_idx == 1:
                title = f"Phase 1: Core Competency Acquisition ({skills_display})"
                goal = f"Master fundamental syntax, patterns, and foundational concepts of {skills_display}."
                actions = [
                    f"Complete foundational modules and code walkthroughs for {skills_display}.",
                    f"Implement 10 hands-on algorithmic and data manipulation exercises.",
                    "Set up automated local testing and linting environment."
                ]
                projects = [
                    f"CLI Tool or Mini-Service utilizing {current_skills[0]}"
                ]
                certs = [f"Foundational {current_skills[0]} Course Certificate"]
            elif month_idx == 2:
                title = f"Phase 2: Architectural Integration & Frameworks ({skills_display})"
                goal = f"Integrate {skills_display} into scalable backend services and responsive applications."
                actions = [
                    f"Design modular components and API contracts using {skills_display}.",
                    "Implement relational or NoSQL database storage with connection pooling.",
                    "Write integration tests with code coverage exceeding 80%."
                ]
                projects = [
                    f"Full-Stack Web App or Microservice featuring {skills_display}"
                ]
                certs = ["AWS Cloud Practitioner or Equivalent Associate Certification"]
            else:
                title = f"Phase {month_idx}: Production Hardening & Cloud Systems ({skills_display})"
                goal = f"Deploy and orchestrate production-ready services implementing {skills_display}."
                actions = [
                    f"Containerize application services with Docker and setup CI/CD pipelines.",
                    f"Instrument health checks, structured logging, and metrics telemetry.",
                    "Conduct performance profiling and query optimization."
                ]
                projects = [
                    f"Distributed Resilient Cloud Application using {skills_display}"
                ]
                certs = ["Docker & Kubernetes Certified Practitioner or Cloud Architect"]
        else:
            # Final Month: Portfolio & Interview Readiness
            title = f"Phase {month_idx}: Capstone Portfolio Launch & Interview Mastery"
            goal = f"Solidify placement readiness for {target_role} through end-to-end portfolio proof and behavioral mastery."
            actions = [
                f"Publish production capstone repo with comprehensive README and live demo URL.",
                f"Practice 25+ system design, technical coding, and behavioral STAR interview questions.",
                f"Network with engineers and recruiters hiring for {target_role}."
            ]
            projects = [
                f"Flagship End-to-End {target_role} Capstone System"
            ]
            certs = [f"{target_role} Professional Portfolio Verification"]
            current_skills = ["System Design", "Behavioral Interviews", "Production Deployment"]

        milestones.append(
            RoadmapMilestone(
                month=month_idx,
                title=title,
                focus_skills=current_skills,
                goal=goal,
                action_items=actions,
                projects_to_build=projects,
                recommended_certifications=certs
            )
        )

    return RoadmapResponse(
        user_id=user_id,
        target_role=target_role,
        estimated_duration_months=duration_months,
        milestones=milestones
    )
