import React from 'react';
import { LoaderCircle, ScanLine } from 'lucide-react';

export default function Topbar({ currentProject, isScanning = false }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Project</p>
        <p className="truncate text-sm font-semibold text-slate-800">
          {currentProject || 'Security overview'}
        </p>
      </div>
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
          isScanning ? 'bg-cyan-50 text-cyan-800' : 'bg-slate-100 text-slate-600'
        }`}
        role="status"
        aria-live="polite"
      >
        {isScanning
          ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          : <ScanLine className="h-3.5 w-3.5" />}
        {isScanning ? 'Scanning project' : 'Ready to scan'}
      </div>
    </header>
  );
}
