from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/negotiation", tags=["AI Salary Negotiation & Offer Intelligence"])

class OfferInput(BaseModel):
    company_name: str
    job_role: str
    level: str  # Mid, Senior, Staff, Lead
    base_salary: int
    equity_per_year: int = 0
    sign_on_bonus: int = 0
    annual_bonus_pct: float = 0.0
    location: str = "Remote / US Metro"
    has_competing_offer: bool = False
    competing_offer_amount: Optional[int] = None

class OfferAnalysisResult(BaseModel):
    total_annual_compensation: int
    market_median: int
    market_75th_percentile: int
    market_90th_percentile: int
    money_left_on_table: int
    percentile_rank: float
    leverage_score: int
    health_status: str  # Below Market, At Market, Strong Offer, Top 10%
    breakdown_chart: dict

class CounterOfferRequest(BaseModel):
    company_name: str
    job_role: str
    offered_base: int
    target_base: int
    offered_equity: int = 0
    target_equity: int = 0
    sign_on_bonus: int = 0
    strategy: str  # competing_offer, market_value, equity_signon_pivot, remote_benefits
    candidate_name: str = "Candidate"
    recruiter_name: Optional[str] = "Hiring Team"
    key_achievements: Optional[List[str]] = None

class CounterOfferResponse(BaseModel):
    email_subject: str
    email_body: str
    phone_call_talking_points: List[str]
    recruiter_pushback_rebuttals: List[dict]

# Market median compensation reference matrix by role and level
MARKET_BANDS = {
    "full stack": {"mid": 140000, "senior": 175000, "staff": 220000, "lead": 200000},
    "backend": {"mid": 145000, "senior": 180000, "staff": 230000, "lead": 210000},
    "frontend": {"mid": 135000, "senior": 170000, "staff": 215000, "lead": 195000},
    "machine learning": {"mid": 155000, "senior": 195000, "staff": 255000, "lead": 235000},
    "devops": {"mid": 140000, "senior": 175000, "staff": 220000, "lead": 200000},
}

def resolve_market_median(role: str, level: str) -> int:
    r_key = "full stack"
    role_lower = role.lower()
    if "machine" in role_lower or "ml" in role_lower or "ai" in role_lower:
        r_key = "machine learning"
    elif "backend" in role_lower:
        r_key = "backend"
    elif "frontend" in role_lower or "react" in role_lower or "ui" in role_lower:
        r_key = "frontend"
    elif "devops" in role_lower or "cloud" in role_lower or "sre" in role_lower:
        r_key = "devops"

    lvl_key = level.lower().strip()
    if "staff" in lvl_key:
        lvl_key = "staff"
    elif "lead" in lvl_key or "principal" in lvl_key:
        lvl_key = "lead"
    elif "senior" in lvl_key:
        lvl_key = "senior"
    else:
        lvl_key = "mid"

    return MARKET_BANDS.get(r_key, {}).get(lvl_key, 165000)

@router.post("/analyze", response_model=OfferAnalysisResult)
async def analyze_offer(offer: OfferInput):
    """
    Evaluates total compensation package against market medians, percentiles, and negotiation upside.
    """
    base = offer.base_salary
    equity = offer.equity_per_year
    signon_annualized = offer.sign_on_bonus // 2 if offer.sign_on_bonus else 0  # 2-year retention amortized
    bonus = int(base * (offer.annual_bonus_pct / 100.0))
    total_comp = base + equity + signon_annualized + bonus

    median = resolve_market_median(offer.job_role, offer.level)
    p75 = int(median * 1.18)
    p90 = int(median * 1.35)

    # Calculate money left on table
    target_benchmark = p75 if offer.has_competing_offer else median
    upside = max(0, target_benchmark - total_comp)

    # Leverage score
    leverage = 55
    if offer.has_competing_offer:
        leverage += 25
    if offer.equity_per_year > 0:
        leverage += 10
    if offer.sign_on_bonus > 0:
        leverage += 10
    leverage = min(98, leverage)

    # Percentile
    if total_comp >= p90:
        pct_rank = 92.5
        health = "Top 10% Market Offer"
    elif total_comp >= p75:
        pct_rank = 78.0
        health = "Strong Competitive Offer"
    elif total_comp >= median:
        pct_rank = 56.0
        health = "At Market Median"
    else:
        pct_rank = 38.0
        health = "Below Market Median"

    breakdown = {
        "Base Salary": base,
        "Equity / RSUs (Annual)": equity,
        "Annual Performance Bonus": bonus,
        "Sign-on Bonus (Amortized)": signon_annualized
    }

    return OfferAnalysisResult(
        total_annual_compensation=total_comp,
        market_median=median,
        market_75th_percentile=p75,
        market_90th_percentile=p90,
        money_left_on_table=upside if upside > 0 else 15000,
        percentile_rank=pct_rank,
        leverage_score=leverage,
        health_status=health,
        breakdown_chart=breakdown
    )

@router.post("/generate-counter", response_model=CounterOfferResponse)
async def generate_counter_offer(req: CounterOfferRequest):
    """
    Generates high-converting counter-offer email templates, verbal talking points, and pushback rebuttals.
    """
    cand = req.candidate_name or "Candidate"
    recruiter = req.recruiter_name or "Hiring Team"
    company = req.company_name
    role = req.job_role
    offered_b = f"${req.offered_base:,}"
    target_b = f"${req.target_base:,}"
    delta = f"${(req.target_base - req.offered_base):,}"

    if req.strategy == "competing_offer":
        subject = f"Follow Up on Offer — {role} — {cand}"
        body = f"""Dear {recruiter},

Thank you so much for extending the offer to join {company} as {role}! I genuinely enjoyed getting to know the engineering leadership and am very excited about the team's roadmap.

I am writing to transparently discuss the compensation package. I currently have another active offer at a competing tier-1 engineering organization at a higher compensation level. However, because of {company}'s engineering culture, mission, and the impact of this role, {company} remains my top choice.

If we are able to adjust the base compensation to {target_b} (an adjustment of {delta}), I would be ecstatic to sign the agreement and commit to {company} immediately.

I truly appreciate your flexibility and partnership in making this work, and I look forward to your thoughts.

Warm regards,
{cand}"""
        points = [
            f"State enthusiastic commitment to {company} first: 'You are my top choice.'",
            f"Politely mention the competing process without issuing an ultimatum.",
            f"Anchor on the exact counter number: {target_b}.",
            "Offer immediate commitment if the target number is met: 'I am ready to sign today.'"
        ]

    elif req.strategy == "equity_signon_pivot":
        subject = f"Compensation Structure Discussion — {role} — {cand}"
        target_eq = f"${req.target_equity:,}" if req.target_equity else "$40,000/yr"
        sign_on = f"${req.sign_on_bonus + 15000:,}" if req.sign_on_bonus else "$20,000"
        body = f"""Dear {recruiter},

Thank you again for the formal offer to join {company} as {role}. I am thrilled about the opportunity to partner with the team.

I understand that departmental base salary bands can be rigid. To align our expectations while respecting your base band of {offered_b}, would {company} have flexibility to bridge the gap via equity or a one-time sign-on bonus?

Specifically, an increase in equity allocation to {target_eq} annually or a one-time sign-on bonus of {sign_on} would fully bridge the delta and allow me to accept the offer without hesitation.

Thank you so much for your advocacy, and I look forward to working together.

Best regards,
{cand}"""
        points = [
            "Acknowledge the company's internal base salary structure respectfully.",
            "Offer alternative levers: Sign-on bonus (one-time budget) or Equity (retention incentive).",
            "Remind them that sign-on bonuses come from separate non-base talent acquisition budgets."
        ]

    else:  # market_value default
        subject = f"Offer Review & Discussion — {role} — {cand}"
        body = f"""Dear {recruiter},

Thank you very much for offering me the {role} position at {company}! I am genuinely enthusiastic about the team's vision and the technical initiatives we discussed.

After reviewing the initial compensation details against current market benchmarks for someone with my specialized full-stack architecture background, and considering the scope of impact required for this role, I would like to request an adjustment of base salary to {target_b}.

Given my verified track record of accelerating microservice delivery and architecting reliable distributed web applications, I am confident in delivering outsized value to {company} from day one.

Thank you for your time, consideration, and partnership. I look forward to speaking soon.

Sincerely,
{cand}"""
        points = [
            "Express genuine appreciation and excitement for the role.",
            "Cite verifiable production experience, system ownership, and industry benchmarks.",
            f"State the counter target clearly ({target_b}) with confidence and professionalism.",
            "Reiterate commitment to delivering outsized organizational impact."
        ]

    rebuttals = [
        {
            "recruiter_pushback": "Our base salary band for this level caps strictly at what we offered.",
            "recommended_strategy": "Pivot to one-time sign-on bonus or equity grants.",
            "suggested_verbiage": "I completely understand that base salary bands have fixed guardrails. Could we explore bridging the gap with an additional $15,000 in sign-on bonus or an extra 10% equity grant over our 4-year vesting schedule?"
        },
        {
            "recruiter_pushback": "We believe this offer is already top of market for someone with your background.",
            "recommended_strategy": "Anchor on specific technical competencies and early review cycle.",
            "suggested_verbiage": "I appreciate your perspective. Given my immediate readiness to lead our cloud microservice migration, would {company} be open to writing in an accelerated 6-month compensation performance review?"
        },
        {
            "recruiter_pushback": "We need an answer by tomorrow or we will have to extend the offer to another candidate.",
            "recommended_strategy": "Maintain professional poise and request a 48-hour extension.",
            "suggested_verbiage": "I am very serious about joining {company} and want to make a fully committed decision. Could you grant an extension until Thursday at 5 PM so I can review the complete benefits paperwork?"
        }
    ]

    return CounterOfferResponse(
        email_subject=subject,
        email_body=body,
        phone_call_talking_points=points,
        recruiter_pushback_rebuttals=rebuttals
    )
