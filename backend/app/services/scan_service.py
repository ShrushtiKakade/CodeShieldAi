from pathlib import Path
from typing import Dict, Any

from app.utils.paths import WORKSPACE_DIR
from app.security.file_safety import (
    validate_source_code,
    create_safe_workspace,
    cleanup_safe_workspace
)
from app.services.scanner_service import scan_source
from app.services.graphify_service import analyze_repository
from app.services.impact_service import map_findings_to_graph
from app.services.ai_service import explain_finding
from app.config import settings


async def run_scan(
    source_code: str,
    language: str = "python",
    include_impact: bool = True,
    include_ai_explanation: bool = False,
    model: str = "kimi-k3"
) -> Dict[str, Any]:
    """
    Coordinates the complete CodeShield AI workflow:
    1. Safe input validation & workspace isolation
    2. Static security vulnerability scanning (AST / Semgrep)
    3. Structural relationship mapping (Graphify)
    4. Blast radius impact analysis
    5. On-demand DigitalOcean AI explanation
    """
    # 1. Validation
    validate_source_code(source_code)

    # 2. Workspace creation
    workspace_path, scan_id = create_safe_workspace(WORKSPACE_DIR)

    try:
        # 3. Static vulnerability detection
        raw_findings = scan_source(source_code, workspace_path)

        # 4. Graphify structural mapping
        graph_data = {"nodes": [], "edges": []}
        if include_impact:
            raw_graph = analyze_repository(workspace_path)
            # 5. Connect findings to graph nodes and trace impact
            graph_data = map_findings_to_graph(raw_findings, raw_graph)

        # 6. AI Explanations (Strictly budgeted)
        ai_calls_made = 0
        final_findings = []
        for finding in raw_findings:
            f_copy = dict(finding)
            if include_ai_explanation and ai_calls_made < settings.max_per_scan_ai_calls:
                ai_res = await explain_finding(f_copy, source_code, model)
                f_copy["aiExplanation"] = ai_res.get("explanation")
                f_copy["aiFix"] = ai_res.get("suggested_fix")
                f_copy["cached"] = ai_res.get("cached", False)
                ai_calls_made += 1
            final_findings.append(f_copy)

        # 7. Calculate summary
        critical_count = sum(1 for f in final_findings if f.get("severity") == "Critical")
        high_count = sum(1 for f in final_findings if f.get("severity") == "High")
        medium_count = sum(1 for f in final_findings if f.get("severity") == "Medium")
        low_count = sum(1 for f in final_findings if f.get("severity") == "Low")

        return {
            "scan_id": scan_id,
            "status": "completed",
            "summary": {
                "total_findings": len(final_findings),
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count
            },
            "findings": final_findings,
            "impact": graph_data,
            "isDemo": False
        }

    finally:
        # Always clean up temporary workspace
        cleanup_safe_workspace(workspace_path)
