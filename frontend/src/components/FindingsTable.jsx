import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileCode2, 
  ExternalLink, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function FindingsTable({ findings = [], onSelectFinding, selectedFindingId }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const filteredFindings = findings
    .filter(f => {
      if (filterSeverity !== 'ALL' && f.severity.toUpperCase() !== filterSeverity) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          f.title?.toLowerCase().includes(query) ||
          f.ruleId?.toLowerCase().includes(query) ||
          f.file?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  const getSeverityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white text-sm">Security Findings</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {filteredFindings.length} issues
          </span>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by rule, file or query..."
              className="bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 w-44 md:w-56"
            />
          </div>

          {/* Severity tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  filterSeverity === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Vulnerability & Rule</th>
              <th className="py-3 px-4">File & Line</th>
              <th className="py-3 px-4">DO AI Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFindings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p>No findings matching the selected filters.</p>
                </td>
              </tr>
            ) : (
              filteredFindings.map((finding) => {
                const isSelected = selectedFindingId === finding.id;
                return (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </td>

                    {/* Title & Rule */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <div className="font-medium text-slate-200 truncate">{finding.title}</div>
                      <div className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
                        {finding.ruleId}
                      </div>
                    </td>

                    {/* File & Line */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{finding.file}</span>
                        <span className="text-cyan-400">:{finding.line}</span>
                      </div>
                    </td>

                    {/* AI Explanation Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {finding.aiExplanation ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>{finding.cached ? 'Cached' : 'Ready'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          On-Demand
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFinding(finding);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-semibold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
