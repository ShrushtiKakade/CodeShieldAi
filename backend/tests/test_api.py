from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ai_provider" in data
    assert "persistence" in data


def test_scan_and_persistence_lifecycle():
    # 1. Create a scan
    payload = {
        "language": "python",
        "source_code": """
def get_user(db, username):
    # Vulnerable
    query = f"SELECT * FROM users WHERE name = '{username}'"
    return db.execute(query)
""",
        "include_impact": True,
        "include_ai_explanation": False
    }
    create_res = client.post("/api/scans", json=payload)
    assert create_res.status_code == 200
    scan_data = create_res.json()
    scan_id = scan_data["scan_id"]
    assert scan_id.startswith("scan-")
    assert len(scan_data["findings"]) > 0
    assert scan_data["summary"]["critical"] >= 1

    # 2. Check that it is stored in persistent scan history
    history_res = client.get("/api/scans")
    assert history_res.status_code == 200
    history_items = history_res.json()
    assert any(h["scan_id"] == scan_id for h in history_items)

    # 3. Retrieve single scan by ID
    get_res = client.get(f"/api/scans/{scan_id}")
    assert get_res.status_code == 200
    assert get_res.json()["scan_id"] == scan_id

    # 4. Retrieve findings
    findings_res = client.get(f"/api/scans/{scan_id}/findings")
    assert findings_res.status_code == 200
    assert len(findings_res.json()) > 0

    # 5. Retrieve graph
    graph_res = client.get(f"/api/scans/{scan_id}/graph")
    assert graph_res.status_code == 200
    assert "nodes" in graph_res.json()

    # 6. Test AI explain endpoint
    first_finding = scan_data["findings"][0]
    explain_res = client.post(f"/api/findings/{first_finding['id']}/explain", json={
        "finding": first_finding,
        "source_code": payload["source_code"]
    })
    assert explain_res.status_code == 200
    explain_data = explain_res.json()
    assert "risk" in explain_data
    assert "suggested_fix" in explain_data

    # 7. Test Security Fix Impact Advisor endpoint
    impact_res = client.post(f"/api/findings/{first_finding['id']}/impact", json={
        "finding": first_finding,
        "suggested_fix": explain_data["suggested_fix"],
        "connected_components": ["POST /api/users"]
    })
    assert impact_res.status_code == 200
    impact_data = impact_res.json()
    assert "review_components" in impact_data
    assert "recommended_tests" in impact_data

    # 8. Test file upload with a zip archive
    import io
    import zipfile
    zip_bytes = io.BytesIO()
    with zipfile.ZipFile(zip_bytes, "w") as zf:
        zf.writestr("app/auth.py", "import subprocess\ndef run_cmd(c):\n    subprocess.Popen(c, shell=True)\n")
        zf.writestr("app/models.py", "SECRET_KEY = 'hardcoded_jwt_secret_value_123456'\n")
    zip_bytes.seek(0)

    upload_res = client.post(
        "/api/scans/upload",
        files={"file": ("project_archive.zip", zip_bytes.getvalue(), "application/zip")},
        data={"language": "python", "include_impact": "true", "include_ai_explanation": "false"}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["status"] == "completed"
    assert upload_data["files_scanned"] >= 2
    assert upload_data["summary"]["total_findings"] >= 2

    # 9. Delete scan
    del_res = client.delete(f"/api/scans/{scan_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Confirm 404 after deletion
    assert client.get(f"/api/scans/{scan_id}").status_code == 404
