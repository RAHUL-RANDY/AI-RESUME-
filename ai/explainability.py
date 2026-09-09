import logging
from typing import List, Dict, Any
import numpy as np
import shap

from backend.models.schemas import FeatureContribution

logger = logging.getLogger("career_intelligence.explainability")

class ModelExplainer:
    def __init__(self, model, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        try:
            self.explainer = shap.TreeExplainer(model)
        except Exception as e:
            logger.warning(f"Failed to create shap.TreeExplainer: {e}. Using feature_importances fallback.")
            self.explainer = None

    def explain_instance(self, input_vector: np.ndarray, feature_dict: Dict[str, Any], top_k: int = 4) -> List[FeatureContribution]:
        """
        Computes SHAP values or feature importance attributions for a single instance.
        """
        contributions = []
        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(input_vector)
                # For classification, shap_values might be a list of arrays [class 0, class 1]
                if isinstance(shap_values, list) and len(shap_values) == 2:
                    vals = shap_values[1][0]
                elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
                    vals = shap_values[0, :, 1]
                elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 2:
                    vals = shap_values[0]
                else:
                    vals = np.array(shap_values).flatten()

                indexed = []
                for idx, name in enumerate(self.feature_names):
                    impact = float(vals[idx]) if idx < len(vals) else 0.0
                    val = feature_dict.get(name, input_vector[0][idx] if idx < input_vector.shape[1] else 0)
                    indexed.append((name, val, impact))

                # Sort by absolute impact
                indexed.sort(key=lambda x: abs(x[2]), reverse=True)

                for name, val, impact in indexed[:top_k]:
                    readable_desc = self._format_impact_description(name, val, impact)
                    contributions.append(
                        FeatureContribution(
                            feature=name.replace("_", " ").title(),
                            value=val,
                            impact=round(impact, 4),
                            description=readable_desc
                        )
                    )
                return contributions
            except Exception as e:
                logger.error(f"SHAP explanation computation error: {e}")

        # High quality tree feature importance fallback
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            indexed = []
            for idx, name in enumerate(self.feature_names):
                imp = float(importances[idx]) if idx < len(importances) else 0.0
                val = feature_dict.get(name, 0)
                indexed.append((name, val, imp))
            indexed.sort(key=lambda x: x[2], reverse=True)
            for name, val, imp in indexed[:top_k]:
                contributions.append(
                    FeatureContribution(
                        feature=name.replace("_", " ").title(),
                        value=val,
                        impact=round(imp, 4),
                        description=f"{name.replace('_', ' ').title()} is a dominant positive factor in model scoring."
                    )
                )

        return contributions

    def _format_impact_description(self, feature: str, val: Any, impact: float) -> str:
        direction = "increased" if impact > 0 else "decreased"
        if "experience" in feature:
            return f"Experience level ({val} years) {direction} the prediction outcome."
        elif "ats" in feature:
            return f"ATS compliance score ({val}) {direction} the baseline rating."
        elif "match" in feature:
            return f"Resume job match alignment ({val}%) {direction} candidate readiness."
        elif "skills" in feature:
            return f"Technical skill breadth ({val} skills) {direction} the score."
        elif "cloud" in feature:
            return f"Cloud infrastructure capability ({val} skills) {direction} competitive positioning."
        elif "role" in feature:
            return f"Target role specialization {direction} baseline valuation."
        return f"{feature.replace('_', ' ').title()} value of {val} {direction} overall score."
