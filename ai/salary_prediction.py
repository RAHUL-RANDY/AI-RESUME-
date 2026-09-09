import os
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Optional

from backend.models.schemas import (
    SalaryPredictionRequest,
    SalaryPredictionResponse,
)
from ai.explainability import ModelExplainer

logger = logging.getLogger("career_intelligence.salary")

class SalaryModel:
    _instance: Optional["SalaryModel"] = None
    _bundle = None
    _explainer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SalaryModel, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._bundle is None:
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "salary_model.pkl")
            try:
                self._bundle = joblib.load(model_path)
                self.model = self._bundle["model"]
                self.features = self._bundle["features"]
                self.metrics = self._bundle["metrics"]
                self._explainer = ModelExplainer(self.model, self.features)
                logger.info(f"Loaded Salary Model. R² Score: {self.metrics.get('r2_score')}")
            except Exception as e:
                logger.error(f"Failed to load salary model from {model_path}: {e}")
                self.model = None

    def predict(self, req: SalaryPredictionRequest) -> SalaryPredictionResponse:
        input_dict = {
            "experience_years": req.experience_years,
            "education_tier": req.education_tier,
            "skills_count": req.skills_count,
            "location_tier": req.location_tier,
            "certifications_count": req.certifications_count,
            "projects_count": req.projects_count,
            "technical_expertise_score": req.technical_expertise_score,
        }

        if self.model is not None:
            # Construct row with one-hot encoded job_role columns
            row = {}
            for col in self.features:
                if col.startswith("job_role_"):
                    role_suffix = col.replace("job_role_", "").lower()
                    target_suffix = req.job_role.lower()
                    row[col] = 1 if role_suffix in target_suffix or target_suffix in role_suffix else 0
                else:
                    row[col] = input_dict.get(col, 0)

            df_input = pd.DataFrame([row])[self.features]
            pred = float(self.model.predict(df_input)[0])
            pred_salary = round(pred, -2)

            top_features = self._explainer.explain_instance(df_input.values, input_dict, top_k=4)
        else:
            # Fallback heuristic
            base = 80000.0 + (req.experience_years * 9000.0) + (req.technical_expertise_score * 3500.0)
            pred_salary = round(base, -2)
            top_features = []

        salary_min = round(pred_salary * 0.92, -2)
        salary_max = round(pred_salary * 1.08, -2)

        return SalaryPredictionResponse(
            predicted_salary=pred_salary,
            salary_min=salary_min,
            salary_max=salary_max,
            currency="USD",
            confidence_interval="95%",
            top_contributing_features=top_features
        )

_salary_engine = SalaryModel()

def predict_salary(req: SalaryPredictionRequest) -> SalaryPredictionResponse:
    return _salary_engine.predict(req)
