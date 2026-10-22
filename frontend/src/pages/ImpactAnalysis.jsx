import React, { useState } from 'react';
import { 
  GitFork, 
  Layers, 
  ShieldAlert, 
  Info, 
  HelpCircle, 
  Terminal, 
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';
import ImpactGraph from '../components/ImpactGraph';

export default function ImpactAnalysis({ graphData, onSelectFinding }) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-1.5">
            <GitFork className="w-3.5 h-3.5" />
            <span>Graphify Knowledge Graph & AST Call-Tree</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Codebase Impact & Blast Radius Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            Graphify maps functions, routes, and database sinks. Red nodes indicate identified vulnerability sinks, amber nodes represent upstream callers, and blue nodes represent dependencies.
          </p>
        </div>

        {/* Engine status */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Engine: Graphify v0.1 + AST Traversal</span>
          </span>
        </div>
      </div>

      {/* Interactive Graph Component */}
      <ImpactGraph
        graphData={graphData}
        onSelectNode={setSelectedNode}
      />

      {/* Explanatory callouts & Graphify details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>1. Vulnerability Sinks</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Where insecure patterns exist (e.g. raw SQL query execution, shell=True command invocations, hardcoded secrets).
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>2. Upstream Callers</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Controllers and middlewares that invoke the vulnerable function, demonstrating how external HTTP input propagates to the sink.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>3. Downstream Dependencies</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Database pools and storage drivers executed by the component. A relationship signifies a potential impact path, not proof of exploitability.
          </p>
        </div>
      </div>
    </div>
  );
}

