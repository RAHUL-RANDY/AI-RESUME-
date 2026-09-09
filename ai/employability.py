import os
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Optional

from backend.models.schemas import (
    EmployabilityPredictionRequest,
    EmployabilityPredictionResponse,
)
from ai.explainability import ModelExplainer

logger = logging.getLogger("career_intelligence.employability")

class EmployabilityModel:
    _instance: Optional["EmployabilityModel"] = None
    _bundle = None
    _explainer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmployabilityModel, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._bundle is None:
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "employability_model.pkl")
            try:
                self._bundle = joblib.load(model_path)
                self.model = self._bundle["model"]
                self.features = self._bundle["features"]
                self.metrics = self._bundle["metrics"]
                self._explainer = ModelExplainer(self.model, self.features)
                logger.info(f"Loaded Employability Model. Accuracy: {self.metrics.get('accuracy')}")
            except Exception as e:
                logger.error(f"Failed to load employability model from {model_path}: {e}")
                self.model = None

    def predict(self, req: EmployabilityPredictionRequest) -> EmployabilityPredictionResponse:
        input_data = {
            "programming_skills_count": req.programming_skills_count,
            "ml_skills_count": req.ml_skills_count,
            "sql_proficiency": req.sql_proficiency,
            "cloud_skills_count": req.cloud_skills_count,
            "projects_count": req.projects_count,
            "certifications_count": req.certifications_count,
            "experience_years": req.experience_years,
            "education_tier": req.education_tier,
            "ats_score": req.ats_score,
            "resume_match_score": req.resume_match_score,
        }

        if self.model is not None:
            df_input = pd.DataFrame([input_data])[self.features]
            prob = float(self.model.predict_proba(df_input)[0, 1])
            is_employable = bool(prob >= 0.50)
            
            # SHAP explanations
            top_features = self._explainer.explain_instance(df_input.values, input_data, top_k=4)
        else:
            # Heuristic fallback if model is missing
            score = (
                (req.ats_score * 0.3) +
                (req.resume_match_score * 0.3) +
                (min(10.0, req.experience_years) * 3.0) +
                (min(10, req.programming_skills_count) * 1.5)
            )
            prob = min(0.98, max(0.15, score / 100.0))
            is_employable = prob >= 0.60
            top_features = []

        percentage = round(prob * 100.0, 1)

        if percentage >= 80.0:
            confidence = "High"
            risk = "Low Risk: Candidate profile demonstrates strong technical foundation and hiring alignment."
        elif percentage >= 60.0:
            confidence = "Moderate"
            risk = "Medium Risk: Candidate has solid fundamentals; targeted upskilling will maximize placement odds."
        else:
            confidence = "Elevated Caution"
            risk = "High Risk: Further project work, certifications, and technical depth recommended before top-tier applications."

        return EmployabilityPredictionResponse(
            employability_probability=percentage,
            is_employable=is_employable,
            confidence_level=confidence,
            risk_assessment=risk,
            top_contributing_features=top_features
        )

_employability_engine = EmployabilityModel()

def predict_employability(req: EmployabilityPredictionRequest) -> EmployabilityPredictionResponse:
    return _employability_engine.predict(req)
