import logging
from typing import Tuple, List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

from backend.models.schemas import MatchResponse

logger = logging.getLogger("career_intelligence.matching")

class SBERTMatcher:
    _instance: Optional["SBERTMatcher"] = None
    _model = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SBERTMatcher, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self._load_model()
            self._initialized = True

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading SBERT model 'all-MiniLM-L6-v2'...")
            # Load sentence transformer model
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SBERT model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ('{e}'). Using TF-IDF fallback matcher.")
            self._model = None

    def compute_similarity(self, resume_text: str, job_text: str) -> Tuple[float, float]:
        """
        Computes cosine similarity between resume and job description.
        Returns: (raw_similarity_float [-1 to 1], percentage_match [0 to 100])
        """
        if not resume_text.strip() or not job_text.strip():
            return 0.0, 0.0

        if self._model is not None:
            try:
                embeddings = self._model.encode([resume_text, job_text])
                emb1 = embeddings[0].reshape(1, -1)
                emb2 = embeddings[1].reshape(1, -1)
                sim = float(cosine_similarity(emb1, emb2)[0][0])
                # Scale semantic cosine similarity (typically 0.2 to 0.85) to standard percentage
                percentage = max(0.0, min(100.0, ((sim + 0.1) / 1.1) * 100.0))
                return round(sim, 4), round(percentage, 1)
            except Exception as e:
                logger.error(f"SBERT inference failed: {e}. Falling back to TF-IDF.")

        # High quality TF-IDF n-gram fallback
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", max_features=1000)
        tfidf_mat = vectorizer.fit_transform([resume_text, job_text])
        sim = float(cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:2])[0][0])
        # Scale TF-IDF similarity to match percentage
        percentage = max(0.0, min(100.0, (sim * 1.3) * 100.0))
        return round(sim, 4), round(percentage, 1)

_matcher = SBERTMatcher()

def analyze_resume_match(resume_text: str, job_description: str, target_role: Optional[str] = None) -> MatchResponse:
    """
    Analyzes semantic alignment between candidate resume and job description.
    """
    sim_score, percentage = _matcher.compute_similarity(resume_text, job_description)

    # Keyword intersection for highlights
    from ai.ats_score import extract_keywords_from_text
    jd_keywords = extract_keywords_from_text(job_description, top_n=25)
    resume_lower = resume_text.lower()
    
    matched = [kw for kw in jd_keywords if kw in resume_lower]
    missing = [kw for kw in jd_keywords if kw not in resume_lower]

    # Dynamic summary narrative
    if percentage >= 80.0:
        analysis = "Exceptional semantic alignment. Candidate profile closely mirrors the core technical domain and responsibilities."
    elif percentage >= 65.0:
        analysis = "Strong match with relevant transferable competencies. Closing a few keyword and tooling gaps will optimize alignment."
    elif percentage >= 50.0:
        analysis = "Moderate match. Candidate exhibits foundational engineering capabilities but needs targeted alignment with specific job domain requirements."
    else:
        analysis = "Low contextual match. Significant domain divergence between resume background and job description requirements."

    return MatchResponse(
        match_score=sim_score,
        similarity_percentage=percentage,
        matched_keywords=matched[:15],
        missing_keywords=missing[:15],
        summary_analysis=analysis
    )
