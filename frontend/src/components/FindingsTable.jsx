import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileCode2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Lock,
  Tag
} from 'lucide-react';

export default function FindingsTable({ findings = [], onSelectFinding, selectedFindingId, isDemoMode = false }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('severity'); // 'severity', 'line', 'file'
  const [sortDirection, setSortDirection] = useState('asc');

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  // Categories present in findings
  const availableCategories = useMemo(() => {
    const set = new Set();
    findings.forEach(f => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [findings]);

  const filteredAndSortedFindings = useMemo(() => {
    return findings
      .filter(f => {
        if (filterSeverity !== 'ALL' && f.severity.toUpperCase() !== filterSeverity) {
          return false;
        }
        if (filterCategory !== 'ALL' && f.category !== filterCategory) {
          return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            f.title?.toLowerCase().includes(q) ||
            f.ruleId?.toLowerCase().includes(q) ||
            f.file?.toLowerCase().includes(q) ||
            f.evidence?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'severity') {
          cmp = (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
        } else if (sortBy === 'line') {
          cmp = (a.line || a.startLine || 0) - (b.line || b.startLine || 0);
        } else if (sortBy === 'file') {
          cmp = (a.file || '').localeCompare(b.file || '');
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [findings, filterSeverity, filterCategory, searchQuery, sortBy, sortDirection]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header & Search Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Security Findings</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredAndSortedFindings.length} of {findings.length}
            </span>
            {isDemoMode && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Demo Fixture
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rule, file, evidence..."
              className="bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Filter Badges & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          {/* Severity tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded transition text-[11px] ${
                  filterSeverity === sev
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none"
            >
              <option value="ALL">All OWASP Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px]">Sort:</span>
            <button
              onClick={() => toggleSort('severity')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${sortBy === 'severity' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}
            >
              <span>Severity</span>
              <ArrowUpDown className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => toggleSort('line')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${sortBy === 'line' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}
            >
              <span>Line</span>
              <ArrowUpDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Vulnerability & OWASP Category</th>
              <th className="py-3 px-4">File & Line Location</th>
              <th className="py-3 px-4">Kimi AI Advice</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAndSortedFindings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">No vulnerabilities matching current filters.</p>
                  <p className="text-slate-500 text-[11px] mt-1">Try resetting the severity or search query.</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedFindings.map((finding) => {
                const isSelected = selectedFindingId === finding.id;
                const lineDisplay = finding.startLine 
                  ? (finding.startLine === finding.endLine ? finding.startLine : `${finding.startLine}-${finding.endLine}`)
                  : finding.line;

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

                    {/* Title & Category */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <div className="font-medium text-slate-200 truncate">{finding.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400 truncate">
                          {finding.ruleId}
                        </span>
                        {finding.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 truncate">
                            {finding.category.split('-')[1] || finding.category}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* File & Line */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{finding.file}</span>
                        <span className="text-cyan-400 font-bold">:{lineDisplay}</span>
                      </div>
                    </td>

                    {/* AI Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {finding.aiExplanation || finding.risk ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>{finding.cached ? 'Cached' : 'Generated'}</span>
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
