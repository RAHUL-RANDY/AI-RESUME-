import os
import pandas as pd
from typing import List, Optional
from backend.models.schemas import CourseItem, RecommendationResponse

class CourseRecommender:
    def __init__(self):
        self._load_data()

    def _load_data(self):
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "courses_dataset.csv")
        try:
            self.df = pd.read_csv(dataset_path)
        except Exception:
            from datasets.generate_datasets import generate_courses_dataset
            self.df = generate_courses_dataset()

    def recommend(
        self,
        missing_skills: List[str],
        career_goal: Optional[str] = None,
        experience_level: Optional[str] = "Intermediate",
        category: Optional[str] = None,
        target_role: Optional[str] = None,
        pricing_type: Optional[str] = "all",
        top_k: int = 12
    ) -> RecommendationResponse:
        """
        Content-based course recommendation driven by missing skills, career objective, level, target role, and pricing.
        Supports category and job role filtering, free/paid classification, and rich catalog browsing.
        """
        # Ensure fresh dataframe if file was updated
        if hasattr(self, "df") and ("is_free" not in self.df.columns or "target_role" not in self.df.columns):
            self._load_data()

        missing_set = {s.lower().strip() for s in missing_skills}
        goal_lower = (career_goal or "").lower()
        level_lower = (experience_level or "Intermediate").lower()
        category_lower = (category or "").lower().strip()
        role_lower = (target_role or "").lower().strip()
        pricing_filter = (pricing_type or "all").lower().strip()

        scored_courses = []
        all_categories = set()
        all_roles = set()
        free_total = 0
        paid_total = 0

        for _, row in self.df.iterrows():
            skills_str = str(row.get("skills", ""))
            course_skills = [s.strip() for s in skills_str.split(",") if s.strip()]
            course_skills_lower = {s.lower() for s in course_skills}

            c_category = str(row.get("category", "General Tech"))
            all_categories.add(c_category)

            c_role = str(row.get("target_role", "All Roles"))
            if c_role and c_role != "nan":
                all_roles.add(c_role)

            # Pricing detection
            raw_free = row.get("is_free", False)
            is_free_val = True if str(raw_free).lower() in ["true", "1", "yes"] else False
            price_disp = str(row.get("price_display", "Free" if is_free_val else "Paid"))

            if is_free_val:
                free_total += 1
            else:
                paid_total += 1

            # Optional free/paid filter
            if pricing_filter == "free" and not is_free_val:
                continue
            elif pricing_filter == "paid" and is_free_val:
                continue

            # Optional category filter
            if category_lower and category_lower not in ["all", "any"] and category_lower != c_category.lower():
                continue

            # Optional target role filter
            if role_lower and role_lower not in ["all", "any"] and role_lower != c_role.lower():
                continue

            # 1. Missing skills intersection
            overlap = missing_set.intersection(course_skills_lower)
            skill_score = len(overlap) * 35.0

            # 2. Career goal / Target role keyword relevance
            title_lower = str(row.get("title", "")).lower()
            goal_score = 0.0
            if goal_lower:
                goal_tokens = [t for t in goal_lower.split() if len(t) > 2]
                if any(term in title_lower or term in c_category.lower() or term in c_role.lower() for term in goal_tokens):
                    goal_score += 25.0

            # 3. Experience level alignment
            c_level = str(row.get("level", "Intermediate")).lower()
            level_score = 15.0 if c_level == level_lower else 8.0

            # 4. Rating factor
            rating_val = float(row.get("rating", 4.7))
            rating_score = rating_val * 4.0

            total_relevance = skill_score + goal_score + level_score + rating_score
            # Bound 0-100
            final_relevance = round(min(100.0, max(25.0, total_relevance)), 1)

            course_item = CourseItem(
                id=str(row["id"]),
                title=str(row["title"]),
                provider=str(row["provider"]),
                url=str(row["url"]),
                rating=rating_val,
                duration_hours=int(row.get("duration_hours", 20)),
                level=str(row.get("level", "Intermediate")),
                category=c_category,
                target_role=c_role,
                is_free=is_free_val,
                price_display=price_disp,
                skills_covered=course_skills,
                relevance_score=final_relevance
            )
            scored_courses.append((final_relevance, course_item))

        # Sort by relevance descending, then rating
        scored_courses.sort(key=lambda x: (x[0], x[1].rating), reverse=True)
        top_items = [item for _, item in scored_courses[:top_k]]

        sorted_categories = sorted(list(all_categories))
        sorted_roles = sorted(list(all_roles))

        return RecommendationResponse(
            recommended_courses=top_items,
            total=len(top_items),
            free_count=free_total,
            paid_count=paid_total,
            categories=sorted_categories,
            roles=sorted_roles
        )

_recommender = CourseRecommender()

def recommend_courses(
    missing_skills: List[str],
    career_goal: Optional[str] = None,
    experience_level: Optional[str] = "Intermediate",
    category: Optional[str] = None,
    target_role: Optional[str] = None,
    pricing_type: Optional[str] = "all",
    top_k: int = 12
) -> RecommendationResponse:
    return _recommender.recommend(
        missing_skills=missing_skills,
        career_goal=career_goal,
        experience_level=experience_level,
        category=category,
        target_role=target_role,
        pricing_type=pricing_type,
        top_k=top_k
    )
