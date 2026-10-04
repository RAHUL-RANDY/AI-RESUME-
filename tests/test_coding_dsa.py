import pytest
from httpx import AsyncClient, ASGITransport
from backend.api.main import app

@pytest.mark.asyncio
async def test_coding_challenges_count_and_uniqueness():
    """Verify that the coding arena offers at least 400 unique DSA challenges."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/coding/challenges")
        assert response.status_code == 200
        challenges = response.json()
        assert len(challenges) >= 400, f"Expected at least 400 challenges, got {len(challenges)}"
        
        ids = [c["id"] for c in challenges]
        assert len(ids) == len(set(ids)), "Duplicate challenge IDs found in problem set"

@pytest.mark.asyncio
async def test_coding_categories_endpoint():
    """Verify category counts and difficulty distribution."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/coding/categories")
        assert response.status_code == 200
        data = response.json()
        assert data["total_problems"] >= 400
        assert len(data["categories"]) >= 15
        assert "Easy" in data["difficulties"]
        assert "Medium" in data["difficulties"]
        assert "Hard" in data["difficulties"]

@pytest.mark.asyncio
async def test_coding_filter_by_category():
    """Verify category filtering works."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/coding/challenges?category=Trees")
        assert response.status_code == 200
        challenges = response.json()
        assert len(challenges) > 0
        for ch in challenges:
            assert ch["category"] == "Trees"

@pytest.mark.asyncio
async def test_coding_evaluation():
    """Test Python code evaluation on Two Sum (p1-two-sum)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        sol = """class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
"""
        response = await ac.post("/api/coding/evaluate", json={
            "challenge_id": "p1-two-sum",
            "language": "python",
            "code": sol
        })
        assert response.status_code == 200
        res = response.json()
        assert res["all_passed"] is True
        assert res["passed_count"] == res["total_count"]
        assert res["code_quality_score"] > 80
