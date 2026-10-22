import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.schemas.scan import (
    ScanRequest, 
    ScanResponse, 
    ScanHistoryItem,
    AiExplainRequest, 
    AiExplainResponse,
    FixImpactRequest,
    FixImpactResponse
)
from app.services.scan_service import run_scan
from app.services.ai_service import explain_finding, assess_fix_impact
from app.storage.db import get_all_scans, get_scan, delete_scan
from app.security.file_safety import SecurityViolation
from app.utils.paths import UPLOADS_DIR
from app.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    """Confirms that the FastAPI backend, persistence, and AI providers are operational"""
    provider = settings.get_resolved_provider()
    return {
        "status": "ok",
        "service": "CodeShield AI backend",
        "version": "0.1.0",
        "ai_provider": provider,
        "is_simulated_ai": provider == "mock",
        "persistence": "SQLite (data/codeshield.db)",
        "models": {
            "digitalocean": settings.digitalocean_model,
            "kimi_direct": settings.kimi_model
        }
    }


@router.get("/scans", response_model=List[ScanHistoryItem])
def list_scan_history():
    """Retrieve historical scans stored persistently in SQLite database"""
    return get_all_scans()


@router.post("/scans", response_model=ScanResponse)
async def create_scan(request: ScanRequest):
    """
    Submit source code (JSON payload) for security scanning and impact analysis.
    """
    try:
        scan_result = await run_scan(
            source_code=request.source_code,
            target_name=request.target_name or "target_source.py",
            language=request.language,
            include_impact=request.include_impact,
            include_ai_explanation=request.include_ai_explanation,
            preferred_model=request.model or settings.digitalocean_model
        )
        return scan_result

    except SecurityViolation as sv:
        raise HTTPException(status_code=400, detail=str(sv))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal scan error: {str(e)}")


@router.post("/scans/upload", response_model=ScanResponse)
async def upload_and_scan(
    file: UploadFile = File(...),
    language: str = Form("python"),
    include_impact: bool = Form(True),
    include_ai_explanation: bool = Form(False),
    model: str = Form("kimi-k3")
):
    """
    Upload a single source file (.py) or project archive (.zip) for scanning.
    """
    archive_path = None
    source_code = None
    filename = file.filename or "uploaded_file.py"

    try:
        content = await file.read()
        if filename.lower().endswith(".zip"):
            temp_zip = UPLOADS_DIR / f"upload_{filename}"
            temp_zip.write_bytes(content)
            archive_path = temp_zip
        else:
            source_code = content.decode("utf-8", errors="replace")

        scan_result = await run_scan(
            source_code=source_code,
            archive_path=archive_path,
            target_name=filename,
            language=language,
            include_impact=include_impact,
            include_ai_explanation=include_ai_explanation,
            preferred_model=model
        )
        return scan_result

    except SecurityViolation as sv:
        raise HTTPException(status_code=400, detail=str(sv))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload scan error: {str(e)}")
    finally:
        if archive_path and archive_path.exists():
            try:
                os.remove(archive_path)
            except Exception:
                pass


@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str):
    """Retrieve full scan report by ID from SQLite persistent storage"""
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return scan


@router.delete("/scans/{scan_id}")
def delete_scan_by_id(scan_id: str):
    """Delete a scan from persistent storage"""
    success = delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return {"status": "deleted", "scan_id": scan_id}


@router.get("/scans/{scan_id}/findings")
def get_scan_findings(scan_id: str):
    """Retrieve findings for a specific scan"""
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return scan.get("findings", [])


@router.get("/scans/{scan_id}/graph")
def get_scan_graph(scan_id: str):
    """Retrieve Graphify impact-graph data for a specific scan"""
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return scan.get("impact", {"nodes": [], "edges": []})


@router.post("/findings/{finding_id}/explain", response_model=AiExplainResponse)
async def explain_finding_endpoint(finding_id: str, request: AiExplainRequest):
    """
    On-demand Kimi AI explanation for a specific finding ID.
    """
    try:
        finding = dict(request.finding)
        finding["id"] = finding_id
        res = await explain_finding(
            finding=finding,
            code=request.source_code or "",
            connected_components=request.connected_components or [],
            preferred_model=request.model
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")


@router.post("/ai/explain", response_model=AiExplainResponse)
async def explain_single_finding_legacy(request: AiExplainRequest):
    """Backwards-compatible endpoint for existing UI callers"""
    finding_id = request.finding.get("id", "F-001")
    return await explain_finding_endpoint(finding_id, request)


@router.post("/findings/{finding_id}/impact", response_model=FixImpactResponse)
async def assess_impact_endpoint(finding_id: str, request: FixImpactRequest):
    """
    Security Fix Impact Advisor:
    Evaluates downstream callers and dependencies that may require review or regression testing.
    """
    try:
        finding = dict(request.finding)
        finding["id"] = finding_id
        res = await assess_fix_impact(
            finding=finding,
            suggested_fix=request.suggested_fix,
            connected_components=request.connected_components or []
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fix-impact assessment failed: {str(e)}")
