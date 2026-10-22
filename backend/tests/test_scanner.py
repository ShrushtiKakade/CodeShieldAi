import asyncio
import pytest
from pydantic import SecretStr
from pathlib import Path
from app.config import settings
from app.services import ai_service
from app.services.scanner_service import scan_source
from app.services.graphify_service import build_ast_relationship_graph
from app.services.impact_service import map_findings_to_graph
from app.services.ai_service import get_heuristic_explanation


def test_scanner_detects_sqli():
    code = "query = f\"SELECT * FROM users WHERE id = '{user_id}'\""
    workspace = Path(".")
    findings = scan_source(code, workspace)
    assert any("SQL" in f["title"] for f in findings)
    assert any(f["severity"] == "Critical" for f in findings)


def test_scanner_detects_subprocess_shell_true():
    code = "subprocess.Popen(f'rm {filename}', shell=True)"
    workspace = Path(".")
    findings = scan_source(code, workspace)
    assert any("Command Injection" in f["title"] for f in findings)
    assert any(f["severity"] == "High" for f in findings)


def test_ai_heuristic_offline_fallback():
    finding = {
        "id": "F-001",
        "ruleId": "python.lang.security.audit.sqli.raw-string-format",
        "file": "test.py",
        "line": 10,
        "evidence": "f'SELECT * FROM users WHERE name={name}'",
        "recommendation": "Use parameterized query"
    }
    res = get_heuristic_explanation(finding, "", "kimi-k3")
    assert res["finding_id"] == "F-001"
    assert "query" in res["explanation"].lower() or "sql" in res["explanation"].lower()
    assert res["tokens_used"] == 0
    assert res["cached"] is True


def test_ai_explanation_uses_moonshot_key_on_server(monkeypatch):
    calls = {}

    class MockResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "choices": [{
                    "message": {
                        "content": '{"explanation":"Use a safe query.","suggested_fix":"parameterized"}'
                    }
                }],
                "usage": {"total_tokens": 12}
            }

    class MockClient:
        def __init__(self, timeout):
            assert timeout == 15.0

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            return False

        async def post(self, url, json, headers):
            calls.update(url=url, payload=json, headers=headers)
            return MockResponse()

    monkeypatch.setattr(settings, "moonshot_api_key", SecretStr("unit-test-secret"))
    monkeypatch.setattr(settings, "moonshot_api_base_url", "https://api.moonshot.ai/v1")
    monkeypatch.setattr(settings, "moonshot_model", "kimi-k3")
    monkeypatch.setattr(settings, "digitalocean_inference_key", None)
    monkeypatch.setattr(ai_service.httpx, "AsyncClient", MockClient)
    ai_service._AI_RESPONSE_CACHE.clear()

    result = asyncio.run(
        ai_service.explain_finding(
            {"id": "F-002", "ruleId": "test.rule", "recommendation": "safe fix"},
            code="example",
        )
    )

    assert calls["url"] == "https://api.moonshot.ai/v1/chat/completions"
    assert calls["headers"]["Authorization"] == "Bearer unit-test-secret"
    assert calls["payload"]["model"] == "kimi-k3"
    assert result["source"] == "Kimi API (Moonshot AI)"
    assert result["explanation"] == "Use a safe query."
    assert result["tokens_used"] == 12


def test_digitalocean_provider_remains_available(monkeypatch):
    monkeypatch.setattr(settings, "moonshot_api_key", None)
    monkeypatch.setattr(settings, "digitalocean_inference_key", SecretStr("do-test-secret"))

    provider_config = ai_service._get_provider_config()

    assert provider_config is not None
    assert provider_config[1] == settings.digitalocean_inference_url
    assert provider_config[2] == "DigitalOcean Inference"
    assert provider_config[3] == settings.digitalocean_model
