import { mockFindings, mockImpactGraph, mockStats, mockScanHistory } from '../data/mockFindings';

const API_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
    const data = await res.json();
    return { isOnline: true, ...data };
  } catch (err) {
    return { 
      isOnline: false, 
      status: 'offline', 
      service: 'CodeShield AI (Local Demo Mode)',
      ai_provider: 'mock',
      is_simulated_ai: true,
      persistence: 'Local Storage (Backend Offline)'
    };
  }
}

export async function fetchScanHistory() {
  try {
    const res = await fetch(`${API_BASE}/scans`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch scan history');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, history: data, isLive: true };
    }
    return { success: true, history: mockScanHistory, isLive: false };
  } catch (err) {
    return { success: true, history: mockScanHistory, isLive: false };
  }
}

export async function fetchGithubRepos(token = '') {
  try {
    const url = token ? `${API_BASE}/github/repos?token=${encodeURIComponent(token)}` : `${API_BASE}/github/repos`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('Failed to fetch repositories');
    const data = await res.json();
    return data.repositories || [];
  } catch (err) {
    return [
      {
        id: "cs-repo-1",
        name: "CodeShieldAi",
        full_name: "ShrushtiKakade/CodeShieldAi",
        html_url: "https://github.com/ShrushtiKakade/CodeShieldAi",
        description: "CodeShield AI - Source code security and change-impact analysis platform",
        default_branch: "main",
        private: false,
        stars: 1,
        language: "Python"
      }
    ];
  }
}

export async function submitGithubScan({
  repoUrl,
  branch = 'main',
  githubToken = '',
  includeImpact = true,
  includeAiExplanation = false,
  model = 'kimi-k3',
  abortSignal
}) {
  try {
    const res = await fetch(`${API_BASE}/scans/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_url: repoUrl,
        branch,
        github_token: githubToken || undefined,
        include_impact: includeImpact,
        include_ai_explanation: includeAiExplanation,
        model
      }),
      signal: abortSignal || AbortSignal.timeout(30000)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: true };
  } catch (err) {
    throw err;
  }
}

export async function submitScan({ 
  sourceCode, 
  targetName = 'target_source.py',
  language = 'python', 
  includeImpact = true, 
  includeAiExplanation = false, 
  model = 'kimi-k3' 
}) {
  try {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: sourceCode,
        target_name: targetName,
        language,
        include_impact: includeImpact,
        include_ai_explanation: includeAiExplanation,
        model
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: true };
  } catch (err) {
    console.warn('Backend unavailable, using simulated local scan engine:', err);
    return simulateLocalScan(sourceCode, language, includeImpact, targetName);
  }
}

export async function uploadAndScan({
  file,
  language = 'python',
  includeImpact = true,
  includeAiExplanation = false,
  model = 'kimi-k3',
  abortSignal
}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('include_impact', includeImpact);
    formData.append('include_ai_explanation', includeAiExplanation);
    formData.append('model', model);

    const res = await fetch(`${API_BASE}/scans/upload`, {
      method: 'POST',
      body: formData,
      signal: abortSignal || AbortSignal.timeout(25000)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: true };
  } catch (err) {
    throw err;
  }
}

export async function fetchScanById(scanId) {
  try {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Scan not found');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function deleteScanById(scanId) {
  try {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function requestAiExplanation(finding, sourceCode = '', connected = [], model = 'kimi-k3') {
  try {
    const findingId = finding.id || 'F-001';
    const res = await fetch(`${API_BASE}/findings/${findingId}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finding,
        source_code: sourceCode,
        connected_components: connected,
        model
      }),
      signal: AbortSignal.timeout(18000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: !data.is_simulated };
  } catch (err) {
    console.warn('Live Kimi AI call unavailable, falling back to simulated engine:', err);
    return {
      success: true,
      finding_id: finding.id,
      risk: finding.aiExplanation || `[SIMULATED - DEV MODE] Static rule ${finding.ruleId} flagged at ${finding.file}:${finding.line}. Input reaches sensitive sink without sanitization.`,
      evidence_summary: finding.evidence,
      suggested_fix: finding.aiFix || finding.recommendation,
      affected_components: ["Calling Controller", "Database Query Function"],
      recommended_tests: ["Write regression test verifying parameter escaping", "Check input bounds validation"],
      uncertainty_notes: "Simulated development mode (Backend offline or key not supplied).",
      provider: "Simulated Development Engine (Offline)",
      model_used: "Local Heuristic",
      tokens_used: 0,
      cached: true,
      is_simulated: true
    };
  }
}

export async function requestFixImpactAssessment(finding, suggestedFix, connectedComponents = []) {
  try {
    const findingId = finding.id || 'F-001';
    const res = await fetch(`${API_BASE}/findings/${findingId}/impact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finding,
        suggested_fix: suggestedFix,
        connected_components: connectedComponents
      }),
      signal: AbortSignal.timeout(18000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    return {
      finding_id: finding.id,
      impact_severity: "Low",
      review_components: [
        { component: "Upstream Caller", reason: "Direct invoker of the modified component" },
        { component: "Unit Test Suite", reason: "Existing tests may need assertions for the secure signature" }
      ],
      recommended_tests: [
        "Verify input validation status code on malformed payloads",
        "Run regression test suite against API endpoint"
      ],
      safeguards_notice: "[SIMULATED - DEV MODE] Fix-impact assessment suggestion. Run automated tests before deploying.",
      provider: "Simulated Development Engine",
      is_simulated: true,
      cached: true
    };
  }
}

function simulateLocalScan(sourceCode, language, includeImpact, targetName) {
  const detectedFindings = [];
  const lines = sourceCode.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (line.includes('SELECT') && (line.includes('f"') || line.includes('f\'') || line.includes(' + '))) {
      detectedFindings.push({
        id: `F-${String(detectedFindings.length + 1).padStart(3, '0')}`,
        title: "SQL Injection in User Query",
        severity: "Critical",
        category: "A03:2021-Injection",
        ruleId: "python.security.sqli.raw-string-interpolation",
        file: targetName,
        line: lineNum,
        startLine: lineNum,
        endLine: lineNum,
        evidence: line.trim(),
        reason: "Direct string interpolation into SQL query allows query modification.",
        recommendation: "cursor.execute('SELECT * FROM users WHERE username = %s', (username,))",
        status: "Open",
        confidence: "High",
        component: "DatabaseQuerySink",
        codeSnippet: line.trim()
      });
    }
    if (line.includes('subprocess.') && line.includes('shell=True')) {
      detectedFindings.push({
        id: `F-${String(detectedFindings.length + 1).padStart(3, '0')}`,
        title: "Command Injection via shell=True",
        severity: "High",
        category: "A03:2021-Injection",
        ruleId: "python.security.rce.subprocess-shell-true",
        file: targetName,
        line: lineNum,
        startLine: lineNum,
        endLine: lineNum,
        evidence: line.trim(),
        reason: "Invoking system shell with untrusted arguments enables arbitrary shell command execution.",
        recommendation: "subprocess.run(['command', arg], shell=False, check=True)",
        status: "Open",
        confidence: "High",
        component: "SubprocessCall",
        codeSnippet: line.trim()
      });
    }
    if (line.includes('JWT_SECRET') || line.includes('SECRET_KEY = "')) {
      detectedFindings.push({
        id: `F-${String(detectedFindings.length + 1).padStart(3, '0')}`,
        title: "Hardcoded Secret Token in Source Code",
        severity: "Critical",
        category: "A07:2021-Identification and Authentication Failures",
        ruleId: "generic.secrets.hardcoded-credentials",
        file: targetName,
        line: lineNum,
        startLine: lineNum,
        endLine: lineNum,
        evidence: line.trim().replace(/"[^"]{4}([^"]+)"/, '"****[REDACTED]"'),
        reason: "Committed secrets expose tokens to unauthorized access.",
        recommendation: "SECRET_KEY = os.environ.get('SECRET_KEY')",
        status: "Open",
        confidence: "High",
        component: "ConfigConstant",
        codeSnippet: line.trim().replace(/"[^"]{4}([^"]+)"/, '"****[REDACTED]"')
      });
    }
  });

  const finalFindings = detectedFindings.length > 0 ? detectedFindings : mockFindings.slice(0, 3);

  return {
    success: true,
    scan_id: `scan-sim-${Date.now().toString().slice(-6)}`,
    status: 'completed',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    target_name: targetName,
    language,
    durationMs: 420,
    files_scanned: 1,
    summary: {
      total_findings: finalFindings.length,
      critical: finalFindings.filter(f => f.severity === 'Critical').length,
      high: finalFindings.filter(f => f.severity === 'High').length,
      medium: finalFindings.filter(f => f.severity === 'Medium').length,
      low: finalFindings.filter(f => f.severity === 'Low').length,
    },
    findings: finalFindings,
    impact: includeImpact ? mockImpactGraph : { nodes: [], edges: [] },
    isDemo: true
  };
}
