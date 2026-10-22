import React, { useState, useEffect } from 'react';
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
  Activity,
  Database,
  Layers,
  FolderGit2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FindingsTable from '../components/FindingsTable';
import { fetchScanHistory } from '../services/api';

export default function Dashboard({ 
  findings, 
  onSelectFinding, 
  creditsBudget, 
  onOpenOptimizer, 
  isLiveScan = false,
  targetProject = "user_service.py"
}) {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [isLiveDB, setIsLiveDB] = useState(false);

  useEffect(() => {
    async function loadScans() {
      const res = await fetchScanHistory();
      setRecentScans(res.history?.slice(0, 3) || []);
      setIsLiveDB(res.isLive || false);
    }
    loadScans();
  }, []);

  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const mediumCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Developer Security & Blast Radius Console</span>
            </div>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
              isLiveScan 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {isLiveScan ? 'Live AST Analysis' : 'Sample Security Dataset'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Target: <span className="font-mono text-cyan-300">{targetProject}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Identified <span className="text-red-400 font-semibold">{criticalCount} critical</span> and <span className="text-amber-400 font-semibold">{highCount} high</span> severity risks across AST security patterns. Graphify caller and dependency impact chains mapped.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Scan Project</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Findings"
          value={findings.length}
          change={isLiveScan ? "Live AST" : "Sample Data"}
          icon={ShieldAlert}
          colorScheme="blue"
          subtitle="Identified against OWASP Top 10 rules"
          onClick={() => navigate('/findings')}
        />
        <StatCard
          title="Critical / High Risk"
          value={`${criticalCount + highCount}`}
          change={`${criticalCount} Critical`}
          icon={AlertTriangle}
          colorScheme="red"
          subtitle="Direct injection sinks or exposed secrets"
          onClick={() => navigate('/findings')}
        />
        <StatCard
          title="Total Scans Logged"
          value={recentScans.length}
          change={isLiveDB ? "SQLite DB" : "Demo Data"}
          icon={History}
          colorScheme="purple"
          subtitle="Stored in persistent scan history"
          onClick={() => navigate('/history')}
        />
        <StatCard
          title="Kimi AI Advice"
          value={creditsBudget?.model || 'kimi-k3'}
          change={`${creditsBudget?.callsMade || 0} calls`}
          icon={Zap}
          colorScheme="emerald"
          subtitle="On-demand evidence grounded reasoning"
          onClick={onOpenOptimizer}
        />
      </div>

      {/* Two Column Section */}
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
              <span>View all findings ({findings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <FindingsTable
            findings={findings.slice(0, 4)}
            onSelectFinding={onSelectFinding}
            isDemoMode={!isLiveScan}
          />
        </div>

        {/* Right 1 Col: Recent Scans & Architecture Widget */}
        <div className="space-y-6">
          {/* Recent Scans Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-white text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Recent Audit Trail</span>
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {recentScans.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No scans recorded yet.</p>
              ) : (
                recentScans.map((s, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate('/history')}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[170px]">
                      <div className="font-medium text-slate-200 truncate">{s.target || s.target_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.timestamp?.split(' ')[0]}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-red-400 font-bold">{s.critical || 0} crit</span>
                      <div className="text-[10px] text-slate-400 font-mono">{s.totalFindings || 0} total</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Three-Tier Analysis Architecture */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200">Three-Stage Analysis Engine</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. Static Scanner (AST / Semgrep)</span>
                </div>
                <p className="text-slate-400 mt-1">Discovers dangerous code sinks with start/end lines.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/30">
                <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-purple-400" />
                  <span>2. Graphify Knowledge Graph</span>
                </div>
                <p className="text-purple-300/80 mt-1">Traces caller and dependency blast radius across modules.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Kimi AI Reasoning</span>
                </div>
                <p className="text-cyan-300/80 mt-1">Explains risks, proposes fixes, and reviews impact.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
