from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.schemas.scan import (
    ScanRequest, 
    ScanResponse, 
    AiExplainRequest, 
    AiExplainResponse
)
from app.services.scan_service import run_scan
from app.services.ai_service import explain_finding
from app.security.file_safety import SecurityViolation
from app.config import settings

router = APIRouter()

# In-memory store for recent scans
_SCANS_STORE: Dict[str, Dict[str, Any]] = {}


@router.get("/health")
def health_check():
    """Confirms that the FastAPI backend and modules are running"""
    if settings.moonshot_configured:
        ai_provider = "moonshot"
        model = settings.moonshot_model
    elif settings.digitalocean_configured:
        ai_provider = "digitalocean"
        model = settings.digitalocean_model
    else:
        ai_provider = "local"
        model = settings.moonshot_model
    return {
        "status": "ok",
        "service": "CodeShield AI backend",
        "model": model,
        "ai_provider": ai_provider,
        "moonshot_configured": settings.moonshot_configured,
        "do_inference_configured": settings.digitalocean_configured
    }


@router.post("/scans", response_model=ScanResponse)
async def create_scan(request: ScanRequest):
    """
    Submit Python code or file content for security scanning and impact analysis.
    """
    try:
        scan_result = await run_scan(
            source_code=request.source_code,
            language=request.language,
            include_impact=request.include_impact,
            include_ai_explanation=request.include_ai_explanation,
            model=request.model
        )
        
        # Cache in recent scans
        _SCANS_STORE[scan_result["scan_id"]] = scan_result
        return scan_result

    except SecurityViolation as sv:
        raise HTTPException(status_code=400, detail=str(sv))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal scan error: {str(e)}")


@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str):
    """Retrieve an existing scan report by its ID"""
    if scan_id not in _SCANS_STORE:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return _SCANS_STORE[scan_id]


@router.get("/scans/{scan_id}/findings")
def get_scan_findings(scan_id: str):
    """Retrieve findings list for a given scan"""
    if scan_id not in _SCANS_STORE:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return _SCANS_STORE[scan_id].get("findings", [])


@router.get("/scans/{scan_id}/graph")
def get_scan_graph(scan_id: str):
    """Retrieve Graphify impact-graph data for a given scan"""
    if scan_id not in _SCANS_STORE:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found")
    return _SCANS_STORE[scan_id].get("impact", {"nodes": [], "edges": []})


@router.post("/ai/explain", response_model=AiExplainResponse)
async def explain_single_finding(request: AiExplainRequest):
    """
    On-demand AI inference trigger for a specific finding.
    Strictly avoids automated credit draining.
    """
    try:
        ai_res = await explain_finding(
            finding=request.finding,
            code=request.source_code or "",
            model=request.model
        )
        return ai_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")
