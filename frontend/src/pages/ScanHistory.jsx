import React from 'react';
import { 
  History, 
  FolderGit2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { mockScanHistory } from '../data/mockFindings';

export default function ScanHistory({ onOpenScan }) {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Scan History & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical scans, graph relationship stats, and DigitalOcean AI credit usage efficiency logs.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Showing 3 past executions
        </span>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {mockScanHistory.map((scan) => (
          <div
            key={scan.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{scan.target}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {scan.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {scan.timestamp}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {scan.durationMs}ms
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">By {scan.scannedBy}</span>
                  </div>
                </div>
              </div>

              {/* DigitalOcean Optimization Badge */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-medium">DO Inference:</span>
                <span className="font-mono text-cyan-400">{scan.aiInferenceCalls} calls ({scan.aiTokensUsed} tok)</span>
                <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> Budgeted
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Total Findings</span>
                <span className="font-mono text-slate-200 font-bold text-sm">{scan.totalFindings}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Critical</span>
                <span className="font-mono text-red-400 font-bold text-sm">{scan.critical}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">High</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{scan.high}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Medium / Low</span>
                <span className="font-mono text-yellow-300 font-bold text-sm">{scan.medium + scan.low}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-500/30">
                <span className="text-purple-300 uppercase text-[10px] font-semibold block mb-0.5">Graphify Nodes</span>
                <span className="font-mono text-purple-400 font-bold text-sm">{scan.graphNodesCount} mapped</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
