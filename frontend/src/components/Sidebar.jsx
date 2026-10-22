import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanSearch, 
  AlertTriangle, 
  GitFork, 
  History, 
  CloudLightning, 
  Zap,
  Sliders,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ backendStatus, onOpenOptimizer, creditsBudget }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scan', label: 'New Scan', icon: ScanSearch },
    { to: '/findings', label: 'Findings', icon: AlertTriangle, badge: '7' },
    { to: '/impact', label: 'Impact Graph', icon: GitFork, isHighlight: true },
    { to: '/history', label: 'Scan History', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Logo & Name */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight">CodeShield</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">AI</span>
          </div>
          <p className="text-xs text-slate-400">Security & Impact Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
              {item.isHighlight && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Graphify
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* DO Inference & Credit Optimization Widget */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
            <span>DigitalOcean AI</span>
          </div>
          <button
            onClick={onOpenOptimizer}
            title="Configure model and credit optimization"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Model:</span>
            <span className="font-mono text-cyan-300 font-semibold">{creditsBudget?.model || 'kimi-k3'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Credit Mode:</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Zap className="w-3 h-3 fill-emerald-400/20" /> Strict Budget
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (creditsBudget?.usedTokens / (creditsBudget?.maxTokens || 5000)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
            <span>{creditsBudget?.usedTokens || 0} tok</span>
            <span>Limit: {creditsBudget?.maxTokens || 5000}</span>
          </div>
        </div>
      </div>

      {/* Backend Health Status Footer */}
      <div className="px-4 py-3 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendStatus?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-mono text-[11px]">
            {backendStatus?.status === 'ok' ? 'FastAPI Connected' : 'Demo / Standalone'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">v0.1</span>
      </div>
    </aside>
  );
}

