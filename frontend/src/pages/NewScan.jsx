import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanSearch, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  GitFork, 
  Sparkles,
  ShieldCheck,
  FileCode2
} from 'lucide-react';
import ScanForm from '../components/ScanForm';

export default function NewScan({ onRunScan, isScanning, lastScanResult, onSelectFinding }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ScanSearch className="w-6 h-6 text-cyan-400" />
          <span>New Security & Impact Scan</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit Python code or select a vulnerability preset. Our static engine discovers flaws and Graphify maps the downstream blast radius.
        </p>
      </div>

      {/* Main Scan Form */}
      <ScanForm onStartScan={onRunScan} isScanning={isScanning} />

      {/* Post Scan Summary Banner if results exist */}
      {lastScanResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Scan Completed Successfully</h3>
                <p className="text-xs text-slate-400 font-mono">Scan ID: {lastScanResult.scan_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/findings')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <span>Review Findings ({lastScanResult.findings?.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/impact')}
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>View Impact Graph</span>
              </button>
            </div>
          </div>

          {/* Quick results preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Critical</span>
              <span className="font-mono text-red-400 font-bold text-base">{lastScanResult.summary?.critical || 0}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">High</span>
              <span className="font-mono text-amber-400 font-bold text-base">{lastScanResult.summary?.high || 0}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Medium / Low</span>
              <span className="font-mono text-yellow-300 font-bold text-base">
                {(lastScanResult.summary?.medium || 0) + (lastScanResult.summary?.low || 0)}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Graph Nodes</span>
              <span className="font-mono text-purple-300 font-bold text-base">
                {lastScanResult.impact?.nodes?.length || 8} mapped
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

