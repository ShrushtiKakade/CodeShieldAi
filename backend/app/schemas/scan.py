from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    language: Literal["python"] = "python"
    source_code: str = Field(min_length=1, max_length=500000)
    include_impact: bool = True
    include_ai_explanation: bool = False
    model: Optional[str] = None


class Finding(BaseModel):
    id: str
    title: str
    severity: Literal["Critical", "High", "Medium", "Low"]
    ruleId: str
    file: str
    line: int
    evidence: str
    recommendation: str
    status: str = "Open"
    confidence: Optional[str] = "High"
    component: Optional[str] = None
    codeSnippet: Optional[str] = None
    aiExplanation: Optional[str] = None
    aiFix: Optional[str] = None
    cached: Optional[bool] = False


class GraphNodeData(BaseModel):
    label: str
    type: str
    file: str
    risk: Literal["vulnerable", "affected", "dependency", "safe"]
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
    status: str
    summary: ScanSummary
    findings: List[Finding]
    impact: Optional[ImpactGraphResponse] = None
    isDemo: bool = False


class AiExplainRequest(BaseModel):
    finding: Dict[str, Any]
    source_code: Optional[str] = ""
    model: Optional[str] = None


class AiExplainResponse(BaseModel):
    finding_id: str
    explanation: str
    suggested_fix: str
    model_used: str
    tokens_used: int = 0
    cached: bool = False
    source: str = "AI inference"
