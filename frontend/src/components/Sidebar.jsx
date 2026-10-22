import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock3,
  GitFork,
  LayoutDashboard,
  ListChecks,
  ScanLine,
  Settings2,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan project', icon: ScanLine },
  { to: '/findings', label: 'Findings', icon: ListChecks },
  { to: '/impact', label: 'Code relationships', icon: GitFork },
  { to: '/history', label: 'Scan history', icon: Clock3 }
];

export default function Sidebar({ backendStatus, onOpenOptimizer }) {
  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-slate-200 bg-white md:w-56">
      <div className="flex h-16 items-center justify-center gap-3 border-b border-slate-200 px-3 md:justify-start md:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-sm font-semibold text-slate-900">CodeShield</span>
          <span className="block text-xs text-slate-500">Project security</span>
        </span>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-2 py-5 md:px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:justify-start ${
                isActive
                  ? 'bg-cyan-50 text-cyan-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-200 p-3">
        <button
          onClick={onOpenOptimizer}
          title="AI settings"
          aria-label="AI settings"
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:justify-start"
        >
          <Settings2 className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden md:block">AI settings</span>
        </button>
        <div
          className="flex items-center justify-center gap-2 text-xs text-slate-500 md:justify-start md:px-3"
          aria-live="polite"
        >
          <span className={`h-2 w-2 rounded-full ${
            backendStatus?.status === 'ok' ? 'bg-emerald-600' : 'bg-slate-400'
          }`} />
          <span className="hidden md:block">
            {backendStatus?.status === 'ok' ? 'Backend connected' : 'Demo mode'}
          </span>
        </div>
      </div>
    </aside>
  );
}
