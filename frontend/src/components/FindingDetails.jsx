import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Copy, 
  GitFork, 
  FileCode, 
  Layers, 
  Lock, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FindingDetails({ 
  finding, 
  onClose, 
  onRequestAiExplanation, 
  isRequestingAi,
  creditsBudget
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const navigate = useNavigate();

  if (!finding) return null;

  const handleCopyFix = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getSeverityBadge(finding.severity)}`}>
              {finding.severity}
            </span>
            <span className="font-mono text-xs text-slate-400">{finding.id}</span>
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

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* File and Rule info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Location</span>
            <div className="flex items-center gap-1.5 font-mono text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{finding.file}</span>
              <span className="text-cyan-400 font-bold">:{finding.line}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Static Rule ID</span>
            <span className="font-mono text-slate-300 break-all">{finding.ruleId}</span>
          </div>
        </div>

        {/* Evidence banner */}
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1.5">Scanner Evidence</span>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 font-mono text-[11px] leading-relaxed">
            {finding.evidence}
          </div>
        </div>

        {/* Source Code Snippet */}
        {finding.codeSnippet && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Vulnerable Code Context</span>
              <span className="text-[10px] font-mono text-slate-400">Around line {finding.line}</span>
            </div>
            <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed border-l-4 border-l-red-500">
              {finding.codeSnippet}
            </pre>
          </div>
        )}

        {/* Impact graph quick link */}
        <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-purple-200 font-medium">Graphify Impact Path</div>
              <div className="text-[11px] text-purple-400/80">Traced through calling controllers and storage layers</div>
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

        {/* DigitalOcean AI Section - Strictly on-demand to optimize credits! */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">DigitalOcean AI Explanation</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {creditsBudget?.model || 'kimi-k3'}
              </span>
            </div>

            {finding.cached && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> 0 Credits (Cached)
              </span>
            )}
          </div>

          {finding.aiExplanation ? (
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1">Risk Explanation</span>
                <p className="text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  {finding.aiExplanation}
                </p>
              </div>

              {finding.aiFix && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 uppercase text-[10px] font-semibold flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Recommended Remediation Code
                    </span>
                    <button
                      onClick={() => handleCopyFix(finding.aiFix)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-emerald-500/30 p-3 rounded-lg font-mono text-[11px] text-emerald-200 overflow-x-auto leading-relaxed border-l-4 border-l-emerald-500">
                    {finding.aiFix}
                  </pre>
                </div>
              )}

              {/* Refresh / Regenerate button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onRequestAiExplanation(finding)}
                  disabled={isRequestingAi}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{isRequestingAi ? 'Querying DO...' : 'Re-analyze with DO AI'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Save your DigitalOcean credits by generating AI reasoning on-demand for this specific finding.
              </p>
              <button
                onClick={() => onRequestAiExplanation(finding)}
                disabled={isRequestingAi}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {isRequestingAi ? (
                  <>
                    <div className="w-3 h-3 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                    <span>Contacting DO Serverless Inference...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain with DigitalOcean AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Standard Recommendation */}
        <div>
          <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-1">Standard Scanner Guidance</span>
          <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
            {finding.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
