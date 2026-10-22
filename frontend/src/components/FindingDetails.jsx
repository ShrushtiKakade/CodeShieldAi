import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  GitFork, 
  FileCode, 
  Download, 
  Layers, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Zap,
  ShieldAlert,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  RefreshCw,
  Info,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestFixImpactAssessment } from '../services/api';
import VisualSecurityExplainer from './VisualSecurityExplainer';

export default function FindingDetails({ 
  finding, 
  onClose, 
  onRequestAiExplanation, 
  isRequestingAi,
  creditsBudget
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'remediation' | 'impactAdvisor' | 'diff'
  const [impactAssessment, setImpactAssessment] = useState(null);
  const [isAssessingImpact, setIsAssessingImpact] = useState(false);
  const navigate = useNavigate();

  if (!finding) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPatch = () => {
    const patchContent = `# CodeShield AI Remediation Patch\n# Target: ${finding.file} (Line ${finding.line})\n# Rule: ${finding.ruleId}\n\n# --- Proposed Fix ---\n${finding.aiFix || finding.recommendation}\n`;
    const blob = new Blob([patchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeshield_fix_${finding.id || 'patch'}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunImpactAdvisor = async () => {
    setIsAssessingImpact(true);
    try {
      const result = await requestFixImpactAssessment(
        finding,
        finding.aiFix || finding.recommendation,
        finding.impactNodes || []
      );
      setImpactAssessment(result);
    } catch (err) {
      console.error('Impact assessment failed:', err);
    } finally {
      setIsAssessingImpact(false);
    }
  };

  const goToImpactGraph = () => {
    navigate('/impact', { state: { targetFindingId: finding.id, targetComponent: finding.component } });
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const lineDisplay = finding.startLine 
    ? (finding.startLine === finding.endLine ? finding.startLine : `${finding.startLine}-${finding.endLine}`)
    : finding.line;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getSeverityBadge(finding.severity)}`}>
              {finding.severity}
            </span>
            <span className="font-mono text-xs text-slate-400">{finding.id}</span>
            {finding.category && (
              <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                {finding.category}
              </span>
            )}
            {finding.confidence && (
              <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                Confidence: {finding.confidence}
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-base leading-snug">{finding.title}</h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 text-xs px-4">
        <button
          onClick={() => setActiveTab('visual')}
          className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
            activeTab === 'visual'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Visual Explainer</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-normal">Interactive</span>
        </button>
        <button
          onClick={() => setActiveTab('remediation')}
          className={`py-2.5 px-3 border-b-2 font-medium transition ${
            activeTab === 'remediation'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Remediation & Evidence
        </button>
        <button
          onClick={() => setActiveTab('impactAdvisor')}
          className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
            activeTab === 'impactAdvisor'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Fix Impact Advisor</span>
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`py-2.5 px-3 border-b-2 font-medium transition ${
            activeTab === 'diff'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Before / After Diff
        </button>
      </div>

      {/* Tab 0: Visual Security Explainer */}
      {activeTab === 'visual' && (
        <div className="flex-1 overflow-y-auto p-4">
          <VisualSecurityExplainer finding={finding} />
        </div>
      )}

      {/* Tab 1: Remediation & Evidence */}
      {activeTab === 'remediation' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Location & Rule Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Location</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-200">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{finding.file}</span>
                <span className="text-cyan-400 font-bold">:{lineDisplay}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Static Rule ID</span>
              <span className="font-mono text-slate-300 break-all">{finding.ruleId}</span>
            </div>
          </div>

          {/* Scanner Evidence Banner */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Scanner Evidence (Static Proof)</span>
              <span className="text-[10px] text-slate-400">Lines {lineDisplay}</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 font-mono text-[11px] leading-relaxed break-all">
              {finding.evidence}
            </div>
          </div>

          {/* Code snippet context */}
          {finding.codeSnippet && (
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1.5">Vulnerable Code Context</span>
              <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed border-l-4 border-l-red-500">
                {finding.codeSnippet}
              </pre>
            </div>
          )}

          {/* Detection Reason */}
          {finding.reason && (
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1">Detection Reason</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {finding.reason}
              </p>
            </div>
          )}

          {/* Graphify quick link */}
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-purple-200 font-medium">Graphify Code Impact Path</div>
                <div className="text-[11px] text-purple-400/80">Traced caller functions and downstream dependencies</div>
              </div>
            </div>
            <button
              onClick={goToImpactGraph}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition flex items-center gap-1"
            >
              <span>View Graph</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Kimi AI Section */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Explain with Kimi AI</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {creditsBudget?.model || 'kimi-k3'}
                </span>
              </div>

              {finding.cached && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Cached (0 Tokens)
                </span>
              )}
            </div>

            {finding.aiExplanation || finding.risk ? (
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1">Risk Explanation (AI Reasoning)</span>
                  <p className="text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                    {finding.aiExplanation || finding.risk}
                  </p>
                </div>

                {finding.aiFix && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-emerald-400 uppercase text-[10px] font-semibold flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" /> Proposed Remediation Code
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(finding.aiFix)}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                        <button
                          onClick={handleDownloadPatch}
                          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Patch</span>
                        </button>
                      </div>
                    </div>
                    <pre className="bg-slate-950 border border-emerald-500/30 p-3 rounded-lg font-mono text-[11px] text-emerald-200 overflow-x-auto leading-relaxed border-l-4 border-l-emerald-500">
                      {finding.aiFix}
                    </pre>
                  </div>
                )}

                {/* AI Uncertainty & Safeguards Notice */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Safeguards Notice</span>
                  </div>
                  <p>
                    {finding.uncertainty_notes || 'This remediation is an AI-generated suggestion grounded in scanner evidence. Always review and run unit tests prior to deployment.'}
                  </p>
                </div>

                {/* Re-explain button */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onRequestAiExplanation(finding)}
                    disabled={isRequestingAi}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>{isRequestingAi ? 'Querying Kimi...' : 'Re-explain with Kimi'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Protect your API credits by generating evidence-grounded Kimi AI reasoning on-demand for this specific finding.
                </p>
                <button
                  onClick={() => onRequestAiExplanation(finding)}
                  disabled={isRequestingAi}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isRequestingAi ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      <span>Contacting Kimi AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explain with Kimi</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Security Fix Impact Advisor */}
      {activeTab === 'impactAdvisor' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-purple-200 text-sm flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-purple-400" />
              <span>Security Fix Impact Advisor</span>
            </h4>
            <p className="text-purple-300/80 leading-relaxed text-[11px]">
              Assesses the possible downstream consequences of applying the suggested remediation. Reviews connected Graphify callers, database drivers, and recommends verification tests.
            </p>
          </div>

          {impactAssessment ? (
            <div className="space-y-4">
              {/* Impact Severity Pill */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Breaking Change Risk</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  impactAssessment.impact_severity === 'High' ? 'bg-red-500/20 text-red-300' :
                  impactAssessment.impact_severity === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {impactAssessment.impact_severity} Risk
                </span>
              </div>

              {/* Components to review */}
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-2">Connected Components Requiring Review</span>
                <div className="space-y-2">
                  {impactAssessment.review_components?.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-mono text-cyan-300 font-semibold text-xs flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.component || item}</span>
                      </div>
                      {item.reason && (
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended tests */}
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-2">Recommended Verification Tests</span>
                <ul className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-slate-300 text-[11px]">
                  {impactAssessment.recommended_tests?.map((test, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 italic">
                {impactAssessment.safeguards_notice || 'Recommendations are advisory suggestions. Do not merge without running automated unit tests.'}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRunImpactAdvisor}
                  disabled={isAssessingImpact}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                >
                  {isAssessingImpact ? 'Re-assessing...' : 'Re-assess Fix Impact'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4 bg-slate-950 rounded-xl border border-slate-800 p-6">
              <GitPullRequest className="w-10 h-10 text-purple-400/50 mx-auto" />
              <div>
                <h5 className="font-semibold text-slate-200 text-sm">Analyze Fix Blast Radius</h5>
                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                  Let Kimi inspect the proposed code patch against Graphify's caller and dependency map to recommend which tests and components need review.
                </p>
              </div>
              <button
                onClick={handleRunImpactAdvisor}
                disabled={isAssessingImpact}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-500/25 flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {isAssessingImpact ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Graph Connections...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Security Fix Impact Advisor</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Before / After Diff */}
      {activeTab === 'diff' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1">Original Vulnerable Code (Red)</span>
            <pre className="bg-red-950/20 border border-red-500/30 p-3 rounded-lg font-mono text-[11px] text-red-200 overflow-x-auto leading-relaxed border-l-4 border-l-red-500">
              {finding.codeSnippet || finding.evidence}
            </pre>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-400 uppercase text-[10px] font-semibold">Proposed Secure Code (Green)</span>
              <button
                onClick={() => handleCopy(finding.aiFix || finding.recommendation)}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Fix'}</span>
              </button>
            </div>
            <pre className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg font-mono text-[11px] text-emerald-200 overflow-x-auto leading-relaxed border-l-4 border-l-emerald-500">
              {finding.aiFix || finding.recommendation}
            </pre>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDownloadPatch}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Patch File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
