import pytest
from pathlib import Path
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
