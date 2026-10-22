import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Zap,
  Info
} from 'lucide-react';
import FindingsTable from '../components/FindingsTable';
import FindingDetails from '../components/FindingDetails';

export default function Findings({ 
  findings, 
  selectedFinding, 
  onSelectFinding, 
  onCloseDetails, 
  onRequestAiExplanation,
  isRequestingAi,
  creditsBudget
}) {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span>Security Findings & Remediation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore identified security vulnerabilities, review exact source lines, and request evidence-grounded AI fixes.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Total Findings:</span>
          <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {findings.length}
          </span>
        </div>
      </div>

      {/* Main Content Area: Responsive Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Table column */}
        <div className={`${selectedFinding ? 'lg:col-span-7' : 'lg:col-span-12'} overflow-y-auto transition-all`}>
          <FindingsTable
            findings={findings}
            onSelectFinding={onSelectFinding}
            selectedFindingId={selectedFinding?.id}
          />
        </div>

        {/* Finding Detail Column / Drawer */}
        {selectedFinding ? (
          <div className="lg:col-span-5 h-full overflow-hidden">
            <FindingDetails
              finding={selectedFinding}
              onClose={onCloseDetails}
              onRequestAiExplanation={onRequestAiExplanation}
              isRequestingAi={isRequestingAi}
              creditsBudget={creditsBudget}
            />
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-5 border border-dashed border-slate-800 rounded-xl p-8 items-center justify-center text-center text-slate-500 flex-col gap-3">
            <Info className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-400">No Finding Selected</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Select any row from the findings table to inspect code context, request DigitalOcean AI explanation, and view remediation diffs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

