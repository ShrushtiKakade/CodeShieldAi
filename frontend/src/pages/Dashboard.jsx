import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileCode2, 
  History, 
  ArrowRight, 
  Play, 
  GitFork, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  TrendingDown,
  Terminal,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FindingsTable from '../components/FindingsTable';
import { mockStats, mockFindings } from '../data/mockFindings';

export default function Dashboard({ findings, onSelectFinding, creditsBudget, onOpenOptimizer }) {
  const navigate = useNavigate();

  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const mediumCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Developer Security & Impact Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Status: Attention Required
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            CodeShield AI has detected <span className="text-red-400 font-semibold">{criticalCount} critical</span> and <span className="text-amber-400 font-semibold">{highCount} high-severity</span> vulnerabilities across scanned source files. Graphify impact analysis is mapped.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start New Scan</span>
          </button>
          <button
            onClick={() => navigate('/impact')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <GitFork className="w-4 h-4 text-purple-400" />
            <span>Explore Graph</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Findings"
          value={findings.length}
          change="+2 new"
          icon={ShieldAlert}
          colorScheme="blue"
          subtitle="Identified across AST security patterns"
          onClick={() => navigate('/findings')}
        />
        <StatCard
          title="Critical / High Risk"
          value={`${criticalCount + highCount}`}
          change={`${criticalCount} Critical`}
          icon={AlertTriangle}
          colorScheme="red"
          subtitle="Direct exploit or injection paths found"
          onClick={() => navigate('/findings')}
        />
        <StatCard
          title="Files & AST Graph"
          value={mockStats.filesScanned}
          change="18 Files"
          icon={FileCode2}
          colorScheme="cyan"
          subtitle="Graphify parsed 14 nodes and 6 callers"
          onClick={() => navigate('/impact')}
        />
        <StatCard
          title="DO Credits Saved"
          value={mockStats.aiCreditsSaved}
          change={`${creditsBudget?.callsMade || 0} calls`}
          icon={Zap}
          colorScheme="emerald"
          subtitle={`Model: ${creditsBudget?.model || 'kimi-k3'} (Strict Budget)`}
          onClick={onOpenOptimizer}
        />
      </div>

      {/* Two Column Section: Findings Overview & Graph Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Findings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Prioritized Security Findings</span>
            </h2>
            <button
              onClick={() => navigate('/findings')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
            >
              <span>View all findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <FindingsTable
            findings={findings.slice(0, 4)}
            onSelectFinding={onSelectFinding}
          />
        </div>

        {/* Right 1 Col: Graphify & DO Architecture Widget */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-400" />
            <span>Architecture & Impact</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Analysis Engine Stack</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Triple-Layer
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Layer 1: Scanner */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">1. Security Scanner</div>
                  <div className="text-slate-400 text-[11px]">Detects dangerous AST sinks and rule violations.</div>
                </div>
              </div>

              {/* Layer 2: Graphify */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-purple-500/30">
                <div className="p-1.5 rounded bg-purple-500/20 text-purple-400">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-purple-200">2. Graphify Knowledge Graph</div>
                  <div className="text-purple-300/80 text-[11px]">Traces callers and dependencies up to entrypoints.</div>
                </div>
              </div>

              {/* Layer 3: DigitalOcean AI */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30">
                <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-cyan-200">3. DigitalOcean Inference</div>
                  <div className="text-cyan-300/80 text-[11px]">Grounds explanations & fixes using Kimi K3 on demand.</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/impact')}
                className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <span>Inspect Impact Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
