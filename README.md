# AI Career Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![spaCy](https://img.shields.io/badge/spaCy-3.7+-09A3D5?logo=spacy&logoColor=white)](https://spacy.io)
[![SBERT](https://img.shields.io/badge/Sentence--Transformers-3.0+-FFD21E)](https://sbert.net)
[![SHAP](https://img.shields.io/badge/SHAP-Explainability-brightgreen)](https://shap.readthedocs.io)

An enterprise-grade, full-stack web application powered by **Machine Learning & NLP** that dynamically analyzes resumes, evaluates strict multi-factor ATS compliance, calculates dense semantic job matching via **SBERT**, predicts employability and market salary using trained **Random Forest models with SHAP explainability**, detects skill gaps with interactive spider charts, curates course recommendations, builds tailored month-by-month career roadmaps, hosts a **465+ FAANG Problem Interactive DSA Coding Arena**, and connects candidates directly to **36+ Premier Tech Company Jobs**.

> **Zero Hardcoded Outputs:** Every score, prediction, recommendation, code evaluation, and explanation is computed from authentic logic or trained machine learning models.

---

## ⚡ The One-Minute Pitch

Traditional ATS checkers rely on simple keyword counting, and conventional job boards leave candidates guessing why they weren't selected. **AI Career Intelligence Platform** brings transparent, data-driven precision to tech hiring:
1. **Dynamic Weighted ATS Scoring:** Strict 6-factor evaluation (Keyword 25%, Skills 25%, Experience 20%, Education 15%, Structure 10%, Formatting 5%).
2. **Dense Semantic Matching:** Uses Sentence-BERT (`all-MiniLM-L6-v2`) to capture deep contextual alignment beyond superficial keywords.
3. **Audited ML Predictions:** Predicts hiring readiness (**88.25% Accuracy, 0.9628 ROC-AUC**) and expected market salary (**R² = 0.9574, MAE = $7,127**) with local **SHAP TreeExplainer** feature attribution.
4. **465+ FAANG DSA Problem Arena:** Interactive algorithmic sandbox with Python 3 & JavaScript starter templates, O(N) complexity evaluation, staff engineer reference solutions, and 18 core DSA topics (Blind 75, NeetCode 150, Striver's SDE Sheet).
5. **Real-Time Jobs Marketplace:** Curated 36+ real openings at Google, Microsoft, Meta, Apple, Amazon, Stripe, and NVIDIA with direct application portals (LinkedIn, Indeed, Glassdoor, Wellfound, RemoteOK).
6. **AI Career Mentor & Interview Intelligence:** Tailored conversational coaching grounded in candidate profiles with practice questions across HR, Technical, System Design, and Behavioral (STAR) categories.
7. **Razorpay Payment Integration:** Production-ready real-time checkout for Pro/Enterprise tier subscriptions with automatic signature verification.

---

## 🧱 Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Axios, React Router Dom, Recharts, Lucide React |
| **Backend** | Python 3.11 - 3.14, FastAPI, Pydantic v2, Motor (Async MongoDB), Uvicorn |
| **Machine Learning** | scikit-learn (Random Forest Classifier & Regressor), pandas, numpy, joblib |
| **Explainability** | SHAP (`shap.TreeExplainer`) for local and global feature attribution |
| **NLP & Matching** | spaCy (`en_core_web_sm`), NLTK, Sentence-Transformers (`all-MiniLM-L6-v2`), scikit-learn cosine similarity |
| **Resume Parsing** | PyMuPDF (`fitz`) for PDF, `python-docx` for DOCX |
| **Payments & Auth** | Razorpay SDK, Google OAuth, Email verification, JWT (`python-jose`), `bcrypt` password hashing |
| **Containerization** | Docker, multi-stage frontend Dockerfile, `docker-compose.yml` |

---

## 📁 Repository Layout

```
AI-Career-Intelligence-Platform/
├── frontend/
│   ├── src/
│   │   ├── components/       # ScoreGauge, SkillGapRadar, FeatureImpactCard, RoadmapTimeline, Navbar, Footer
│   │   ├── pages/            # Home, CodingArenaPage, JobsPage, UploadPage, DashboardPage, MentorPage, InterviewPrepPage, RecruiterPage, LoginPage
│   │   ├── services/         # api.ts (Axios client with JWT interceptor & coding service)
│   │   ├── hooks/            # useAuth, useResumeAnalysis
│   │   ├── types/            # TypeScript interfaces matching backend models
│   │   ├── App.tsx           # Router configuration & providers
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── backend/
│   ├── api/
│   │   └── main.py           # FastAPI entrypoint & router registry
│   ├── routes/               # auth, resume, matching, prediction, coding, recommendation, roadmap, mentor, recruiter, payment
│   ├── models/               # schemas.py (Pydantic models)
│   ├── services/             # auth_service, roadmap_service
│   ├── database/             # mongo.py (Motor async pool + fallback store)
│   └── requirements.txt
├── ai/
│   ├── resume_parser.py      # PyMuPDF + python-docx + spaCy NER extraction
│   ├── ats_score.py          # Strict 6-factor weighted ATS engine
│   ├── resume_matching.py    # SBERT dense semantic embeddings & cosine similarity
│   ├── skill_gap.py          # Synonym normalization & radar chart generator
│   ├── employability.py      # Random Forest Classifier inference
│   ├── salary_prediction.py  # Random Forest Regressor inference
│   ├── explainability.py     # SHAP TreeExplainer feature attribution
│   ├── recommendation.py     # Content-based course recommender
│   └── mentor.py             # Multi-model AI Mentor & Interview Intelligence
├── datasets/
│   ├── dsa_problems.json     # 465 curated canonical DSA problems across 18 topics
│   ├── generate_dsa_problems.py # Problem bank generator
│   ├── employability_dataset.csv
│   ├── salary_dataset.csv
│   └── courses_dataset.csv
├── models/
│   ├── employability_model.pkl
│   ├── salary_model.pkl
│   └── model_metadata.json
├── tests/                    # Comprehensive Pytest test suite (19 passing unit tests)
│   ├── test_coding_dsa.py
│   ├── test_api.py
│   ├── test_ats.py
│   ├── test_auth.py
│   ├── test_matching.py
│   ├── test_ml_models.py
│   ├── test_parser.py
│   └── test_skill_gap.py
├── docs/                     # architecture.md, api_reference.md, dataset_sources.md
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.11+ (Python 3.12/3.14 verified)
- Node.js 18+ & npm
- (Optional) MongoDB local or Atlas connection string

### 1. Clone & Environment Setup
```bash
# Clone the repository
git clone https://github.com/RAHUL-RANDY/AI-RESUME-.git
cd AI-RESUME-

# Copy environment variables
cp .env.example .env
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Download spaCy model & NLTK datasets
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Start FastAPI backend server
uvicorn backend.api.main:app --reload --port 8002
```
Backend API will be live at: `http://localhost:8002`  
Swagger API Docs available at: `http://localhost:8002/docs`

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be live at: `http://localhost:5173`

---

## 💻 Available Platform Modules

| Module | URL Path | Key Capabilities |
| :--- | :--- | :--- |
| **Home & ATS Suite** | `/` | 6-factor weighted ATS evaluation, SBERT semantic job matching |
| **DSA Coding Arena** | `/coding` | 465+ problems, 18 categories, live complexity & AI review |
| **Jobs Marketplace** | `/jobs` | 36+ real company roles with direct application links |
| **Interview Prep** | `/interview` | AI mock interviewer with STAR behavioral evaluation |
| **Portfolio Builder** | `/portfolio` | Instant developer portfolio generator |

---

## 🧪 Testing

Run the automated test suite covering all modules:

```bash
pytest tests/
```

All 19 test suites run and pass with 100% success rate.

---

## 📊 Audited Machine Learning Performance

| Model | Algorithm | Primary Metrics | Status |
| :--- | :--- | :--- | :--- |
| **Employability Model** | Random Forest Classifier (120 trees) | **Accuracy: 88.25%**, **Precision: 84.97%**, **Recall: 90.11%**, **F1: 87.47%**, **ROC-AUC: 0.9628** | Verified & Serialized |
| **Salary Model** | Random Forest Regressor (150 trees) | **R² = 0.9574**, **MAE = $7,127.24**, **RMSE = $9,196.43** | Verified & Serialized |
| **Explainability** | SHAP TreeExplainer | Local additive feature attributions for every inference | Verified & Active |

See `docs/dataset_sources.md` for full dataset provenance and reproducibility instructions.
