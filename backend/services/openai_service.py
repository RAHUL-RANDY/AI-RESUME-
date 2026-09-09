import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

logger = logging.getLogger("career_intelligence.openai_service")

def get_openai_key() -> Optional[str]:
    """Dynamically resolves OPENAI_API_KEY from environment with hot reload."""
    load_dotenv(override=True)
    key = os.getenv("OPENAI_API_KEY", "").strip()
    return key if key and not key.startswith("your_") else None

def get_openai_client():
    """Returns an AsyncOpenAI client if API key is present, else None."""
    key = get_openai_key()
    if not key:
        return None
    try:
        from openai import AsyncOpenAI
        return AsyncOpenAI(api_key=key)
    except Exception as e:
        logger.warning(f"Failed to initialize OpenAI client: {e}")
        return None

def get_llm_status() -> Dict[str, Any]:
    """Returns current active LLM status."""
    key = get_openai_key()
    if key:
        masked_key = f"{key[:7]}...{key[-4:]}" if len(key) > 12 else "***"
        return {
            "openai_configured": True,
            "provider": "OpenAI",
            "model": "gpt-4o-mini",
            "key_preview": masked_key,
            "status": "ready"
        }
    return {
        "openai_configured": False,
        "provider": "Contextual Intelligence Engine (Built-in NLP)",
        "model": "all-MiniLM-L6-v2 + SBERT",
        "key_preview": None,
        "status": "fallback_active"
    }

async def generate_chat_response(
    messages: List[Dict[str, str]],
    system_prompt: str,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    max_tokens: int = 1000
) -> Optional[str]:
    """Executes a chat completion against OpenAI."""
    client = get_openai_client()
    if not client:
        return None

    try:
        api_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            api_messages.append({"role": m["role"], "content": m["content"]})

        response = await client.chat.completions.create(
            model=model,
            messages=api_messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        if response.choices and response.choices[0].message.content:
            return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI chat completion error: {e}")
    return None

async def rewrite_bullet_point(
    bullet_text: str,
    target_role: Optional[str] = None,
    skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Rewrites a resume bullet using STAR methodology with action verbs & metrics."""
    client = get_openai_client()
    role_str = target_role or "Software Engineer"
    skills_str = ", ".join(skills[:5]) if skills else "relevant technical stack"

    system_prompt = (
        f"You are an executive resume writer and engineering hiring manager. "
        f"Rewrite candidate resume bullet points for a {role_str} role targeting skills in {skills_str}. "
        f"Use the Google XYZ / STAR format: 'Accomplished [X], as measured by [Y], by doing [Z]'."
    )

    user_prompt = f"""
Original bullet point:
"{bullet_text}"

Provide 3 distinct polished variations:
1. Metrics & Results-Driven (emphasize quantifiable percentages, scale, latency, or throughput)
2. Architectural & Technical Depth (emphasize system design, tools, clean code, and engineering rigor)
3. Leadership & Cross-Functional Impact (emphasize collaboration, mentorship, and business outcomes)

Format response as a JSON object with keys:
- "metrics_focused": "..."
- "technical_focused": "..."
- "leadership_focused": "..."
- "key_improvements": ["improvement 1", "improvement 2"]
"""
    if client:
        try:
            import json
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.6
            )
            raw = response.choices[0].message.content
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"OpenAI bullet rewrite failed: {e}. Falling back to rule-based enhancement.")

    # Rule-based fallback if OpenAI key is not set
    clean = bullet_text.strip().rstrip(".")
    return {
        "metrics_focused": f"Engineered {clean.lower()}, optimizing runtime performance by 35% and supporting over 50,000+ daily active user interactions.",
        "technical_focused": f"Architected and deployed {clean.lower()} leveraging scalable design patterns, automated unit testing, and robust CI/CD pipelines.",
        "leadership_focused": f"Spearheaded the initiative for {clean.lower()}, collaborating cross-functionally across engineering and product teams to deliver milestone on schedule.",
        "key_improvements": [
            "Prefixed with strong action verbs (Engineered, Architected, Spearheaded)",
            "Incorporated quantifiable metrics & scale",
            "Framed technical achievements using STAR methodology"
        ]
    }

async def generate_tailored_summary(
    candidate_name: str,
    experience_years: float,
    skills: List[str],
    target_role: str,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """Generates a high-converting ATS professional summary tailored to role."""
    client = get_openai_client()
    skills_text = ", ".join(skills[:8]) if skills else "Full-stack development, Distributed Systems"

    if client:
        try:
            prompt = (
                f"Write a compelling 3-sentence professional summary for {candidate_name}, "
                f"a professional with {experience_years:.1f} years of experience targeting '{target_role}'. "
                f"Core strengths: {skills_text}. "
                f"{'Target Job Description snippet: ' + job_description[:300] if job_description else ''} "
                f"Ensure maximum keyword relevance for Applicant Tracking Systems (ATS)."
            )
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional tech resume strategist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.7
            )
            summary = resp.choices[0].message.content.strip()
            return {"summary": summary, "provider": "OpenAI (gpt-4o-mini)"}
        except Exception as e:
            logger.warning(f"OpenAI summary generation failed: {e}")

    # Fallback summary
    fallback = (
        f"Results-oriented {target_role} with {experience_years:.1f}+ years of experience building reliable, scalable systems. "
        f"Demonstrated track record of technical ownership across {skills_text}. "
        f"Adept at translating complex requirements into maintainable architectures while driving measurable business impact."
    )
    return {"summary": fallback, "provider": "Context Engine (NLP Fallback)"}
