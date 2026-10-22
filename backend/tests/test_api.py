from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data


def test_scan_endpoint():
    payload = {
        "language": "python",
        "source_code": "query = f\"SELECT * FROM users WHERE name = '{name}'\"",
        "include_impact": True,
        "include_ai_explanation": False
    }
    response = client.post("/api/scans", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert len(data["findings"]) > 0
    assert data["summary"]["critical"] >= 1

