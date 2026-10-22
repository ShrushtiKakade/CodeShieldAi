from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    language: Literal["python"] = "python"
    source_code: Optional[str] = None
    target_name: Optional[str] = "target_source.py"
    include_impact: bool = True
    include_ai_explanation: bool = False
    model: Optional[str] = "kimi-k3"


class GithubScanRequest(BaseModel):
    repo_url: str = Field(min_length=10, max_length=500, description="GitHub repository URL, e.g. https://github.com/owner/repo")
    branch: Optional[str] = "main"
    github_token: Optional[str] = None
    include_impact: bool = True
    include_ai_explanation: bool = False
    model: Optional[str] = "kimi-k3"


class Finding(BaseModel):
    id: str
    title: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    category: Optional[str] = "Security Finding"
    ruleId: str
    file: str
    line: int
    startLine: Optional[int] = None
    endLine: Optional[int] = None
    evidence: str
    reason: Optional[str] = None
    recommendation: str
    status: str = "Open"
    confidence: Optional[str] = "High"
    component: Optional[str] = None
    codeSnippet: Optional[str] = None
    aiExplanation: Optional[str] = None
    aiFix: Optional[str] = None
    recommendedTests: Optional[List[str]] = None
    cached: Optional[bool] = False
    aiProvider: Optional[str] = None


class GraphNodeData(BaseModel):
    label: str
    type: str
    file: str
    line: Optional[int] = None
    risk: Literal["vulnerable", "affected", "dependency", "safe"]
    relationshipType: Optional[str] = "verified"
    findingId: Optional[str] = None
    description: Optional[str] = None


class GraphNode(BaseModel):
    id: str
    type: str = "customNode"
    position: Dict[str, float]
    data: GraphNodeData


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = False
    data: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None


class ImpactGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class ScanSummary(BaseModel):
    total_findings: int
    critical: int
    high: int
    medium: int
    low: int


class ScanResponse(BaseModel):
    scan_id: str
    id: Optional[str] = None
    timestamp: Optional[str] = None
    target_name: Optional[str] = "target_source.py"
    language: Optional[str] = "python"
    status: str
    duration_ms: Optional[int] = 0
    durationMs: Optional[int] = 0
    files_scanned: Optional[int] = 1
    summary: ScanSummary
    findings: List[Finding]
    impact: Optional[ImpactGraphResponse] = None
    isDemo: bool = False


class ScanHistoryItem(BaseModel):
    id: str
    scan_id: str
    timestamp: str
    target: str
    language: str
    status: str
    durationMs: int
    totalFindings: int
    critical: int
    high: int
    medium: int
    low: int
    filesScanned: int
    isDemo: bool


class AiExplainRequest(BaseModel):
    finding: Dict[str, Any]
    source_code: Optional[str] = ""
    connected_components: Optional[List[str]] = None
    model: Optional[str] = None


class AiExplainResponse(BaseModel):
    finding_id: str
    risk: str
    evidence_summary: str
    suggested_fix: str
    affected_components: List[str] = []
    recommended_tests: List[str] = []
    uncertainty_notes: str = ""
    provider: str
    model_used: str
    tokens_used: int = 0
    cached: bool = False
    is_simulated: bool = False


class FixImpactRequest(BaseModel):
    finding: Dict[str, Any]
    suggested_fix: str
    connected_components: Optional[List[Any]] = []


class FixImpactResponse(BaseModel):
    finding_id: str
    impact_severity: str
    review_components: List[Dict[str, str]]
    recommended_tests: List[str]
    safeguards_notice: str
    provider: str
    is_simulated: bool
    cached: bool = False
