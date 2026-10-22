import asyncio
import pytest
import zipfile
import io
from app.config import Settings, settings
from app.services import ai_service
from pathlib import Path
from app.services.scanner_service import scan_single_file, scan_source
from app.services.graphify_service import build_ast_relationship_graph
from app.services.impact_service import map_findings_to_graph
from app.services.ai_service import get_simulated_explanation, get_simulated_impact_advice
from app.security.file_safety import extract_safe_archive, SecurityViolation, redact_sensitive_evidence


def test_scanner_detects_sqli_positive():
    """Positive test: String interpolation in SQL must trigger SQL injection"""
    code = "query = f\"SELECT * FROM users WHERE id = '{user_id}'\""
    findings = scan_single_file(code, "test.py")
    assert any("SQL" in f["title"] for f in findings)
    assert any(f["severity"] == "Critical" for f in findings)
    assert findings[0]["category"] == "A03:2021-Injection"
    assert findings[0]["startLine"] == 1


def test_scanner_ignores_parameterized_query_negative():
    """Negative test: Properly parameterized query should NOT trigger SQL injection"""
    safe_code = 'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))'
    findings = scan_single_file(safe_code, "safe_test.py")
    assert len(findings) == 0


def test_scanner_detects_subprocess_shell_true_positive():
    """Positive test: subprocess with shell=True and dynamic arguments must trigger"""
    code = "subprocess.Popen(f'rm -rf {path}', shell=True)"
    findings = scan_single_file(code, "rce_test.py")
    assert any("Command Injection" in f["title"] for f in findings)
    assert any(f["severity"] == "High" for f in findings)


def test_scanner_ignores_safe_subprocess_negative():
    """Negative test: subprocess without shell=True should not be flagged as shell injection"""
    safe_code = "subprocess.run(['ls', '-la'], shell=False, check=True)"
    findings = scan_single_file(safe_code, "safe_rce.py")
    assert len(findings) == 0


def test_scanner_detects_hardcoded_secret_and_redacts():
    """Positive test: Hardcoded secret must be detected and evidence redacted"""
    code = 'JWT_SECRET_KEY = "live_production_token_secret_abcdef123456"'
    findings = scan_single_file(code, "config.py")
    assert any("Secret" in f["title"] for f in findings)
    secret_finding = findings[0]
    assert "[REDACTED]" in secret_finding["evidence"]


def test_scanner_detects_insecure_deserialization():
    """Positive test: pickle.loads must be flagged as High severity"""
    code = "user_obj = pickle.loads(untrusted_payload)"
    findings = scan_single_file(code, "session.py")
    assert any("pickle" in f["title"].lower() for f in findings)
    assert findings[0]["category"] == "A08:2021-Software and Data Integrity Failures"


def test_ai_simulated_dev_mode():
    """Verify simulated AI returns structured, honest output when offline"""
    finding = {
        "id": "F-001",
        "ruleId": "python.security.sqli.raw-string-interpolation",
        "file": "test.py",
        "line": 10,
        "evidence": "f'SELECT * FROM users WHERE name={name}'",
        "recommendation": "Use parameterized query"
    }
    res = get_simulated_explanation(finding, "", ["UserController"])
    assert res["finding_id"] == "F-001"
    assert "query" in res["risk"].lower() or "sql" in res["risk"].lower()
    assert res["is_simulated"] is True
    assert res["tokens_used"] == 0
    assert "[SIMULATED - DEV MODE]" in res["risk"]


def test_moonshot_environment_names_are_supported(monkeypatch):
    monkeypatch.setenv("MOONSHOT_API_KEY", "unit-test-key")
    monkeypatch.setenv("MOONSHOT_API_BASE_URL", "https://api.moonshot.ai/v1")
    monkeypatch.setenv("MOONSHOT_MODEL", "kimi-k3")
    monkeypatch.setenv("DIGITALOCEAN_INFERENCE_KEY", "unit-test-do-key")

    config = Settings(_env_file=None)

    assert config.kimi_api_key == "unit-test-key"
    assert config.kimi_base_url == "https://api.moonshot.ai/v1"
    assert config.kimi_model == "kimi-k3"
    assert config.get_resolved_provider() == "kimi_direct"


def test_ai_cache_key_changes_with_model():
    finding = {"ruleId": "test.rule", "file": "test.py", "line": 1}

    kimi_key = ai_service.generate_finding_hash(finding, "source", "kimi_direct", "kimi-k3")
    other_model_key = ai_service.generate_finding_hash(
        finding, "source", "kimi_direct", "moonshot-v1-8k"
    )

    assert kimi_key != other_model_key


def test_kimi_request_uses_configured_key_endpoint_and_model(monkeypatch):
    calls = {}

    class MockResponse:
        status_code = 200

        def json(self):
            return {
                "choices": [{
                    "message": {
                        "content": (
                            '{"risk":"Safe query required.",'
                            '"evidence_summary":"Dynamic SQL",'
                            '"suggested_fix":"Use parameters"}'
                        )
                    }
                }],
                "usage": {"total_tokens": 18}
            }

    class MockClient:
        def __init__(self, timeout):
            assert timeout == settings.request_timeout_seconds

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            return False

        async def post(self, url, json, headers):
            calls.update(url=url, payload=json, headers=headers)
            return MockResponse()

    monkeypatch.setattr(settings, "ai_provider", "kimi_direct")
    monkeypatch.setattr(settings, "kimi_api_key", "unit-test-secret")
    monkeypatch.setattr(settings, "kimi_base_url", "https://api.moonshot.ai/v1")
    monkeypatch.setattr(settings, "kimi_model", "kimi-k3")
    monkeypatch.setattr(ai_service.httpx, "AsyncClient", MockClient)
    ai_service._AI_EXPLAIN_CACHE.clear()

    result = asyncio.run(
        ai_service.explain_finding(
            {"id": "F-TEST", "ruleId": "test.rule", "evidence": "Dynamic SQL"},
            preferred_model="kimi-k3",
        )
    )

    assert calls["url"] == "https://api.moonshot.ai/v1/chat/completions"
    assert calls["headers"]["Authorization"] == "Bearer unit-test-secret"
    assert calls["payload"]["model"] == "kimi-k3"
    assert result["provider"] == "Direct Kimi / Moonshot API (kimi-k3)"
    assert result["tokens_used"] == 18


def test_security_fix_impact_advisor_simulated():
    """Verify Security Fix Impact Advisor generates review components and tests"""
    finding = {
        "id": "F-001",
        "title": "SQL Injection",
        "ruleId": "python.security.sqli.raw-string-interpolation",
        "file": "db.py",
        "line": 20
    }
    advice = get_simulated_impact_advice(finding, "cursor.execute(query, params)", ["UserService.get_user"])
    assert advice["finding_id"] == "F-001"
    assert len(advice["review_components"]) > 0
    assert len(advice["recommended_tests"]) > 0
    assert advice["is_simulated"] is True


def test_clean_app_produces_zero_findings():
    """Verify clean_app.py produces 0 false positive security findings"""
    clean_code = Path(__file__).resolve().parent.parent.parent / "sample-projects" / "clean_app.py"
    if clean_code.exists():
        findings = scan_single_file(clean_code.read_text(encoding="utf-8"), "clean_app.py")
        assert len(findings) == 0, f"Expected 0 findings in clean_app.py, got {len(findings)}: {findings}"


def test_edge_cases_produces_zero_findings():
    """Verify edge_cases.py produces 0 false positive security findings"""
    edge_code = Path(__file__).resolve().parent.parent.parent / "sample-projects" / "edge_cases.py"
    if edge_code.exists():
        findings = scan_single_file(edge_code.read_text(encoding="utf-8"), "edge_cases.py")
        assert len(findings) == 0, f"Expected 0 findings in edge_cases.py, got {len(findings)}: {findings}"


def test_zip_slip_protection(tmp_path):
    """Verify safe archive extractor rejects dangerous path traversal in zip entries"""
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zf:
        zf.writestr("../../etc/passwd", "root:x:0:0:")
    
    zip_file = tmp_path / "malicious.zip"
    zip_file.write_bytes(zip_buffer.getvalue())

    dest_dir = tmp_path / "extracted"
    dest_dir.mkdir()

    with pytest.raises(SecurityViolation) as excinfo:
        extract_safe_archive(zip_file, dest_dir)
    assert "Path Traversal" in str(excinfo.value)
