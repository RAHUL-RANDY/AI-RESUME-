from fastapi import APIRouter
from backend.models.schemas import (
    EmployabilityPredictionRequest,
    EmployabilityPredictionResponse,
    SalaryPredictionRequest,
    SalaryPredictionResponse,
)
from ai.employability import predict_employability
from ai.salary_prediction import predict_salary

router = APIRouter(prefix="/api/prediction", tags=["ML Predictions & Explainability"])

@router.post("/employability", response_model=EmployabilityPredictionResponse)
async def predict_candidate_employability(req: EmployabilityPredictionRequest):
    """
    Random Forest Classifier predicting employability probability with local SHAP attribution.
    """
    return predict_employability(req)

@router.post("/salary", response_model=SalaryPredictionResponse)
async def predict_candidate_salary(req: SalaryPredictionRequest):
    """
    Random Forest Regressor predicting expected market compensation with 95% confidence intervals and SHAP impact.
    """
    return predict_salary(req)
