import { mockFindings, mockImpactGraph, mockStats } from '../data/mockFindings';

const API_BASE = '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Backend not healthy');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function submitScan({ language = 'python', sourceCode, includeImpact = true, includeAiExplanation = false, model = 'kimi-k3' }) {
  try {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        source_code: sourceCode,
        include_impact: includeImpact,
        include_ai_explanation: includeAiExplanation,
        model
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: true };
  } catch (err) {
    console.warn('Backend unavailable, using simulated local scan engine:', err);
    // Simulate real local scan analysis based on content
    return simulateLocalScan(sourceCode, language, includeImpact);
  }
}

export async function requestAiExplanation(finding, sourceCode = '', model = 'kimi-k3') {
  try {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finding,
        source_code: sourceCode,
        model
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ...data, isLive: true };
  } catch (err) {
    console.warn('DigitalOcean API call failed or offline, using cached security heuristic:', err);
    // Grounded deterministic fallback explanation
    return {
      success: true,
      finding_id: finding.id,
      explanation: finding.aiExplanation || `[Fallback Heuristic] The static scanner detected dangerous pattern ${finding.ruleId} at ${finding.file}:${finding.line}. Input from untrusted sources reaches a sensitive sink without sanitization or boundary verification.`,
      suggested_fix: finding.aiFix || finding.recommendation,
      source: 'Local Grounded Engine (Offline Fallback)',
      model_used: 'Local Heuristic (0 DO Credits Consumed)',
      tokens_used: 0,
      cached: true
    };
  }
}

function simulateLocalScan(sourceCode, language, includeImpact) {
  const detectedFindings = [];
  
  if (sourceCode.includes('SELECT') && (sourceCode.includes('f"') || sourceCode.includes('f\'') || sourceCode.includes(' + '))) {
    detectedFindings.push({
      id: `F-LIVE-${Math.floor(Math.random() * 900 + 100)}`,
      title: "SQL Injection in User Query",
      severity: "Critical",
      ruleId: "python.lang.security.audit.sqli.raw-string-format",
      file: "scanned_snippet.py",
      line: sourceCode.split('\n').findIndex(l => l.includes('SELECT')) + 1,
      evidence: "Raw string interpolation inside SQL query detected",
      recommendation: "Use parameterized queries with cursor.execute(query, params)",
      status: "Open",
      confidence: "High",
      component: "DatabaseQuery",
      codeSnippet: sourceCode,
      aiExplanation: "String interpolation into SQL query enables attackers to modify query structure and bypass authorization.",
      aiFix: "cursor.execute('SELECT * FROM users WHERE username = %s', (username,))",
      cached: false
    });
  }

  if (sourceCode.includes('subprocess') && sourceCode.includes('shell=True')) {
    detectedFindings.push({
      id: `F-LIVE-${Math.floor(Math.random() * 900 + 100)}`,
      title: "Arbitrary Command Execution via shell=True",
      severity: "High",
      ruleId: "python.lang.security.audit.subprocess-shell-true",
      file: "scanned_snippet.py",
      line: sourceCode.split('\n').findIndex(l => l.includes('shell=True')) + 1,
      evidence: "subprocess executed with shell=True parameter",
      recommendation: "Pass command and arguments as a sequence without shell=True",
      status: "Open",
      confidence: "High",
      component: "SubprocessCall",
      codeSnippet: sourceCode,
      aiExplanation: "Invoking the system shell with untrusted arguments enables arbitrary shell command injection.",
      aiFix: "subprocess.run(['command', 'arg1', 'arg2'], shell=False, check=True)",
      cached: false
    });
  }

  if (sourceCode.includes('JWT_SECRET') || sourceCode.includes('SECRET_KEY = "')) {
    detectedFindings.push({
      id: `F-LIVE-${Math.floor(Math.random() * 900 + 100)}`,
      title: "Hardcoded Secret Token in Source Code",
      severity: "Critical",
      ruleId: "generic.secrets.security.hardcoded-secret",
      file: "scanned_snippet.py",
      line: sourceCode.split('\n').findIndex(l => l.includes('SECRET')) + 1,
      evidence: "Hardcoded secret string assignment found",
      recommendation: "Store secret in environment variables or a vault",
      status: "Open",
      confidence: "High",
      component: "ConfigConstant",
      codeSnippet: sourceCode,
      aiExplanation: "Hardcoded credentials in code will be committed to version control and exposed to unauthorized parties.",
      aiFix: "SECRET_KEY = os.environ.get('APP_SECRET_KEY')",
      cached: false
    });
  }

  // If no specific patterns detected from standard examples, supply sample findings
  const finalFindings = detectedFindings.length > 0 ? detectedFindings : mockFindings.slice(0, 3);

  return {
    success: true,
    scan_id: `scan-${Date.now().toString().slice(-6)}`,
    status: 'completed',
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

