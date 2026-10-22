import React, { useState } from 'react';
import { 
  X, 
  CloudLightning, 
  Zap, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Database, 
  Sliders, 
  DollarSign, 
  Lock, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function CreditOptimizerModal({ 
  isOpen, 
  onClose, 
  creditsBudget, 
  onUpdateBudget 
}) {
  const [model, setModel] = useState(creditsBudget?.model || 'kimi-k3');
  const [maxTokens, setMaxTokens] = useState(creditsBudget?.maxTokens || 5000);
  const [autoAiEnabled, setAutoAiEnabled] = useState(creditsBudget?.autoAiEnabled || false);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateBudget({
      model,
      maxTokens: Number(maxTokens),
      autoAiEnabled,
      cacheEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <CloudLightning className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">DigitalOcean Credit Optimizer</h3>
            <p className="text-xs text-slate-400">Strict quota enforcement & token budgeting</p>
          </div>
        </div>

        {/* Real-time Usage Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">Tokens Used</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">{creditsBudget?.usedTokens || 0}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">Calls Made</span>
            <span className="font-mono text-emerald-400 font-bold text-sm">{creditsBudget?.callsMade || 0}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">Savings Ratio</span>
            <span className="font-mono text-purple-400 font-bold text-sm">~85%</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Model selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
              <span>Serverless Inference Model</span>
              <span className="text-[10px] text-cyan-400 font-mono">DO Serverless URL: https://inference.do-ai.run</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="kimi-k3">Kimi K3 (kimi-k3) - Recommended for Code Reasoning & Economy</option>
              <option value="llama-4-maverick">Llama 4 Maverick (llama-4-maverick) - Deep Multi-Turn Context</option>
            </select>
          </div>

          {/* Max Token Quota */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
              <span>Max Session Token Budget</span>
              <span className="font-mono text-slate-400">{maxTokens} tokens max</span>
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1k tokens (Frugal)</span>
              <span>10k tokens</span>
              <span>20k tokens</span>
            </div>
          </div>

          {/* Strict Credit Optimization Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 mt-0.5"
              />
              <div>
                <span className="font-medium text-slate-200 block">Deduplicate & Cache Queries (Zero Token Re-runs)</span>
                <span className="text-slate-400 text-[11px]">Uses SHA-256 fingerprint of finding, rule, and code slice to reuse responses.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!autoAiEnabled}
                onChange={(e) => setAutoAiEnabled(!e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 mt-0.5"
              />
              <div>
                <span className="font-medium text-slate-200 block">Strict On-Demand Only (Recommended)</span>
                <span className="text-slate-400 text-[11px]">Only trigger DO AI when you click 'Explain with AI' on a specific finding.</span>
              </div>
            </label>
          </div>

          {/* Save & Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Keys stored in backend .env only
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

