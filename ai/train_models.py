import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

def train_employability_model():
    print("--- Training Employability Model (RandomForestClassifier) ---")
    df = pd.read_csv("datasets/employability_dataset.csv")
    
    feature_cols = [
        "programming_skills_count", "ml_skills_count", "sql_proficiency",
        "cloud_skills_count", "projects_count", "certifications_count",
        "experience_years", "education_tier", "ats_score", "resume_match_score"
    ]
    target_col = "is_employable"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print(f"Confusion Matrix: {cm}")

    os.makedirs("models", exist_ok=True)
    model_bundle = {
        "model": clf,
        "features": feature_cols,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "test_samples": len(y_test)
        }
    }
    joblib.dump(model_bundle, "models/employability_model.pkl")
    print("Saved -> models/employability_model.pkl")
    return model_bundle["metrics"]

def train_salary_model():
    print("\n--- Training Salary Model (RandomForestRegressor) ---")
    df = pd.read_csv("datasets/salary_dataset.csv")

    feature_cols = [
        "experience_years", "education_tier", "skills_count",
        "job_role", "location_tier", "certifications_count",
        "projects_count", "technical_expertise_score"
    ]
    target_col = "salary"

    # Preprocessing: One-hot encode job_role
    df_encoded = pd.get_dummies(df, columns=["job_role"], drop_first=False)
    encoded_feature_cols = [c for c in df_encoded.columns if c != "salary"]

    X = df_encoded[encoded_feature_cols]
    y = df_encoded[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    reg = RandomForestRegressor(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    reg.fit(X_train, y_train)

    y_pred = reg.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    print(f"MAE:  ${mae:,.2f}")
    print(f"RMSE: ${rmse:,.2f}")
    print(f"R²:   {r2:.4f}")

    model_bundle = {
        "model": reg,
        "features": encoded_feature_cols,
        "base_features": feature_cols,
        "metrics": {
            "mae": round(mae, 2),
            "mse": round(mse, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 4),
            "test_samples": len(y_test)
        }
    }
    joblib.dump(model_bundle, "models/salary_model.pkl")
    print("Saved -> models/salary_model.pkl")
    return model_bundle["metrics"]

if __name__ == "__main__":
    emp_metrics = train_employability_model()
    sal_metrics = train_salary_model()

    metadata = {
        "employability_model": emp_metrics,
        "salary_model": sal_metrics
    }
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print("\nMetadata saved -> models/model_metadata.json")
