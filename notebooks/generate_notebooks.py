import os
import json

def create_notebook(cells, filepath):
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.14.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Created notebook -> {filepath}")

def make_code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": 1,
        "metadata": {},
        "outputs": [],
        "source": [s + "\n" for s in source.split("\n")]
    }

def make_md_cell(source):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [s + "\n" for s in source.split("\n")]
    }

if __name__ == "__main__":
    os.makedirs("notebooks", exist_ok=True)

    # 1. Preprocessing Notebook
    create_notebook([
        make_md_cell("# Data Preprocessing & Exploratory Data Analysis (EDA)\nAI Career Intelligence Platform"),
        make_code_cell("import pandas as pd\nimport numpy as np\n\n# Load datasets\nemp_df = pd.read_csv('../datasets/employability_dataset.csv')\nsal_df = pd.read_csv('../datasets/salary_dataset.csv')\n\nprint('Employability shape:', emp_df.shape)\nprint('Salary shape:', sal_df.shape)"),
        make_md_cell("## Missing Value & Duplicate Check"),
        make_code_cell("print('Employability missing values:\\n', emp_df.isnull().sum())\nprint('Duplicates:', emp_df.duplicated().sum())"),
        make_md_cell("## Summary Statistics"),
        make_code_cell("emp_df.describe()")
    ], "notebooks/preprocessing.ipynb")

    # 2. Employability Model Notebook
    create_notebook([
        make_md_cell("# Employability Prediction Model\nRandomForestClassifier with 10 features, trained on tech hiring rubrics."),
        make_code_cell("import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report, roc_auc_score, confusion_matrix\n\ndf = pd.read_csv('../datasets/employability_dataset.csv')\nfeatures = [c for c in df.columns if c != 'is_employable']\nX = df[features]\ny = df['is_employable']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)\nclf = RandomForestClassifier(n_estimators=120, max_depth=9, random_state=42)\nclf.fit(X_train, y_train)\n\ny_pred = clf.predict(X_test)\nprint(classification_report(y_test, y_pred))\nprint('ROC-AUC:', roc_auc_score(y_test, clf.predict_proba(X_test)[:, 1]))")
    ], "notebooks/employability_model.ipynb")

    # 3. Salary Model Notebook
    create_notebook([
        make_md_cell("# Salary Prediction Model\nRandomForestRegressor predicting tech total compensation."),
        make_code_cell("import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestRegressor\nfrom sklearn.metrics import mean_absolute_error, r2_score\n\ndf = pd.read_csv('../datasets/salary_dataset.csv')\ndf_encoded = pd.get_dummies(df, columns=['job_role'], drop_first=False)\nX = df_encoded.drop(columns=['salary'])\ny = df_encoded['salary']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)\nreg = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42)\nreg.fit(X_train, y_train)\n\ny_pred = reg.predict(X_test)\nprint('MAE: $', round(mean_absolute_error(y_test, y_pred), 2))\nprint('R² Score:', round(r2_score(y_test, y_pred), 4))")
    ], "notebooks/salary_model.ipynb")

    # 4. Model Evaluation Notebook
    create_notebook([
        make_md_cell("# Model Evaluation & SHAP Explainability Verification"),
        make_code_cell("import joblib\nimport json\n\nwith open('../models/model_metadata.json') as f:\n    meta = json.load(f)\n\nprint('Model Metadata & Benchmark Metrics:\\n', json.dumps(meta, indent=2))")
    ], "notebooks/model_evaluation.ipynb")
