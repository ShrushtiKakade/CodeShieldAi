import React from 'react';
import { 
  FolderGit2, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Sliders, 
  Terminal
} from 'lucide-react';

export default function Topbar({ 
  currentProject = "ecommerce-backend", 
  branch = "main", 
  isScanning = false,
  onOpenOptimizer,
  creditsBudget
}) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Current Project / Repo Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{currentProject}</span>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-1 text-slate-400">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-[11px]">{branch}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Graphify Ready</span>
        </div>
      </div>

      {/* Right controls: AI Budget Pill, Status, GitHub Link */}
      <div className="flex items-center gap-3">
        {/* DO Inference status pill */}
        <button
          onClick={onOpenOptimizer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition"
          title="DigitalOcean Credit Optimizer & Model Settings"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">DO AI:</span>
          <span className="font-mono text-cyan-400 text-[11px] font-semibold">{creditsBudget?.model || 'kimi-k3'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-500/30">
            {creditsBudget?.callsMade || 0} calls
          </span>
        </button>

        {/* Scan Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
          {isScanning ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">Analyzing AST & Graph...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 text-[11px]">Idle / Ready</span>
            </>
          )}
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/ShrushtiKakade/CodeShieldAi"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition"
          title="View GitHub Repository"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
