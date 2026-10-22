import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

from app.utils.paths import WORKSPACE_DIR
from app.security.file_safety import (
    validate_source_code,
    create_safe_workspace,
    cleanup_safe_workspace,
    extract_safe_archive
)
from app.services.scanner_service import scan_source_workspace
from app.services.graphify_service import analyze_repository
from app.services.impact_service import map_findings_to_graph
from app.services.ai_service import explain_finding
from app.services.github_service import download_github_repository
from app.storage.db import save_scan
from app.config import settings


async def run_scan(
    source_code: Optional[str] = None,
    archive_path: Optional[Path] = None,
    repo_url: Optional[str] = None,
    branch: Optional[str] = None,
    github_token: Optional[str] = None,
    target_name: str = "target_source.py",
    language: str = "python",
    include_impact: bool = True,
    include_ai_explanation: bool = False,
    preferred_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Coordinates the CodeShield AI scanning pipeline:
    1. Isolated workspace creation
    2. Input extraction (GitHub repo clone, archive, or source string)
    3. Static vulnerability analysis
    4. Graphify structural code mapping
    5. Impact propagation
    6. Optional on-demand AI explanations
    7. SQLite persistence
    """
    start_time = time.time()
    workspace_path, scan_id = create_safe_workspace(WORKSPACE_DIR)

    files_scanned = 1
    display_target = target_name

    try:
        # Step 1: Populate isolated workspace
        if repo_url:
            display_target = repo_url
            extracted = await download_github_repository(
                repo_url=repo_url,
                branch=branch,
                token=github_token,
                workspace_path=workspace_path
            )
            files_scanned = max(1, len(extracted))
        elif archive_path and archive_path.exists():
            extracted = extract_safe_archive(archive_path, workspace_path)
            files_scanned = max(1, len(extracted))
        elif source_code:
            validate_source_code(source_code)
            target_file = workspace_path / target_name
            target_file.write_text(source_code, encoding="utf-8")
        else:
            raise ValueError("No source code, archive, or repository provided for scanning.")

        # Step 2: Static security vulnerability detection
        raw_findings = scan_source_workspace(workspace_path)

        # Step 3: Graphify code relationship mapping
        graph_data = {"nodes": [], "edges": []}
        if include_impact:
            raw_graph = analyze_repository(workspace_path)
            # Step 4: Map findings to graph nodes & trace caller impact
            graph_data = map_findings_to_graph(raw_findings, raw_graph)

        # Step 5: On-demand AI explanation if requested (within token budget)
        final_findings = []
        ai_calls_made = 0
        for f in raw_findings:
            f_copy = dict(f)
            if include_ai_explanation and ai_calls_made < settings.max_per_scan_ai_calls:
                ai_res = await explain_finding(f_copy, f_copy.get("codeSnippet", ""), preferred_model=preferred_model)
                f_copy["aiExplanation"] = ai_res.get("risk")
                f_copy["aiFix"] = ai_res.get("suggested_fix")
                f_copy["recommendedTests"] = ai_res.get("recommended_tests", [])
                f_copy["cached"] = ai_res.get("cached", False)
                f_copy["aiProvider"] = ai_res.get("provider")
                ai_calls_made += 1
            final_findings.append(f_copy)

        duration_ms = int((time.time() - start_time) * 1000)

        # Summary counts
        critical_count = sum(1 for f in final_findings if f.get("severity") == "Critical")
        high_count = sum(1 for f in final_findings if f.get("severity") == "High")
        medium_count = sum(1 for f in final_findings if f.get("severity") == "Medium")
        low_count = sum(1 for f in final_findings if f.get("severity") == "Low")

        scan_result = {
            "scan_id": scan_id,
            "id": scan_id,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "target_name": display_target,
            "language": language,
            "status": "completed",
            "duration_ms": duration_ms,
            "durationMs": duration_ms,
            "files_scanned": files_scanned,
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

        # Step 6: Persist scan record into SQLite database
        save_scan(scan_result)

        return scan_result

    finally:
        # Step 7: Clean up temporary workspace safely
        cleanup_safe_workspace(workspace_path)
