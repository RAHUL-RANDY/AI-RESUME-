import pytest
from httpx import AsyncClient, ASGITransport
from backend.api.main import app
from backend.database.mongo import DatabaseManager

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "version" in data

@pytest.mark.asyncio
async def test_register_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register Candidate
        candidate_payload = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "password": "StrongPassword123!",
            "role": "candidate"
        }
        reg_resp = await ac.post("/api/auth/register", json=candidate_payload)
        assert reg_resp.status_code == 201
        reg_data = reg_resp.json()
        assert reg_data["email"] == "jane.doe@example.com"
        assert reg_data["role"] == "candidate"

        # Duplicate register should fail with 400
        dup_resp = await ac.post("/api/auth/register", json=candidate_payload)
        assert dup_resp.status_code == 400

        # Login
        login_payload = {
            "email": "jane.doe@example.com",
            "password": "StrongPassword123!"
        }
        login_resp = await ac.post("/api/auth/login", json=login_payload)
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert "access_token" in login_data
        token = login_data["access_token"]

        # Get Me
        me_resp = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "jane.doe@example.com"
        assert me_data["name"] == "Jane Doe"
