import os
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("career_intelligence.subscription")

router = APIRouter(prefix="/api/subscription", tags=["Subscription & Payments (Razorpay, Stripe)"])

def get_razorpay_keys():
    """Retrieve Razorpay API key from environment or secrets manager."""
    return os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")

def get_razorpay_client():
    """Initialize Razorpay client with proper authentication."""
    key_id, key_secret = get_razorpay_keys()
    if not key_id or not key_secret:
        logger.warning("Razorpay keys not configured. Payment processing will fail.")
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(key_id, key_secret))
    except ImportError:
        logger.error("Razorpay SDK not installed. Install with: pip install razorpay")
        return None

class SubscriptionPlanRequest(BaseModel):
    plan_type: str = Field(..., description="Plan type: free, pro, enterprise")
    billing_cycle: str = Field(default="monthly", description="Billing cycle: monthly, annual")
    currency: str = Field(default="INR", description="Currency: INR (Razorpay) or USD (Stripe)")

class PaymentInitiationResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    customer_email: Optional[str]

@router.post("/create-order", response_model=PaymentInitiationResponse)
async def create_payment_order(req: SubscriptionPlanRequest):
    """Initiates a Razorpay payment order for subscription upgrade."""
    pricing = {
        "free": {"monthly": 0, "annual": 0},
        "pro": {"monthly": 49900, "annual": 499000},
        "enterprise": {"monthly": 199900, "annual": 1999000},
    }
    
    if req.plan_type not in pricing:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    amount = pricing[req.plan_type].get(req.billing_cycle, 0)
    
    client = get_razorpay_client()
    if not client:
        raise HTTPException(status_code=503, detail="Payment service unavailable")
    
    try:
        order_data = {
            "amount": amount,
            "currency": req.currency,
            "receipt": f"sub_{req.plan_type}_{req.billing_cycle}",
            "notes": {"plan": req.plan_type, "billing": req.billing_cycle}
        }
        order = client.order.create(data=order_data)
        
        return PaymentInitiationResponse(
            order_id=order["id"],
            amount=amount,
            currency=req.currency,
            key_id=os.getenv("RAZORPAY_KEY_ID", ""),
            customer_email=None
        )
    except Exception as e:
        logger.error(f"Failed to create Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Payment order creation failed")

class PaymentVerificationRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    user_id: str
    plan_type: str

@router.post("/verify-payment")
async def verify_payment(req: PaymentVerificationRequest):
    """Verifies Razorpay payment signature and activates subscription."""
    try:
        import razorpay
        key_id, key_secret = get_razorpay_keys()
        
        attributes = {
            "razorpay_order_id": req.order_id,
            "razorpay_payment_id": req.payment_id,
            "razorpay_signature": req.signature
        }
        
        is_valid = razorpay.Utils.verify_payment_signature(attributes, key_secret)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update user subscription in database
        from backend.database.mongo import DatabaseManager
        await DatabaseManager.update_user_subscription(
            user_id=req.user_id,
            plan_type=req.plan_type,
            payment_id=req.payment_id
        )
        
        return {
            "status": "success",
            "message": f"Subscription upgraded to {req.plan_type}",
            "plan": req.plan_type
        }
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

@router.get("/plans")
async def get_subscription_plans():
    """Returns available subscription plans with pricing."""
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price_monthly": 0,
                "price_annual": 0,
                "currency": "INR",
                "features": [
                    "Resume ATS scoring",
                    "1 job profile analysis/month",
                    "Basic skill gap radar",
                    "Interview prep basics"
                ]
            },
            {
                "id": "pro",
                "name": "Pro",
                "price_monthly": 499,
                "price_annual": 4990,
                "currency": "INR",
                "features": [
                    "Unlimited ATS scoring",
                    "10 job profile analyses/month",
                    "Advanced SHAP explainability",
                    "Salary prediction with ROI models",
                    "Full interview prep library",
                    "1:1 AI mentor coaching"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price_monthly": 1999,
                "price_annual": 19990,
                "currency": "INR",
                "features": [
                    "Everything in Pro",
                    "Unlimited job analyses",
                    "Batch recruiter dashboard",
                    "Custom company integrations",
                    "White-label platform access",
                    "Priority support & training"
                ]
            }
        ]
    }
