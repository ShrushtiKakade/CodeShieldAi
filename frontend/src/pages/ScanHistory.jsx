import React, { useState, useEffect } from 'react';
import { 
  History, 
  FolderGit2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Trash2,
  ExternalLink,
  Database,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { fetchScanHistory, deleteScanById } from '../services/api';

export default function ScanHistory({ onOpenScan }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveStorage, setIsLiveStorage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetchScanHistory();
      setHistoryList(res.history || []);
      setIsLiveStorage(res.isLive || false);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (scanId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete scan ${scanId} and its stored findings from database?`)) return;

    setDeletingId(scanId);
    try {
      await deleteScanById(scanId);
      setHistoryList(prev => prev.filter(s => (s.scan_id || s.id) !== scanId));
    } catch (err) {
      console.error('Failed to delete scan:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Scan History & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Previous security scans, blast radius graphs, and remediation records stored in persistent storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            isLiveStorage 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>{isLiveStorage ? 'Persistent SQLite Storage' : 'Local Demo Data'}</span>
          </span>

          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Loading scan records from database...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl p-8">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No Historical Scans Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first scan on the 'New Scan' page. Results will automatically persist in the SQLite database.
            </p>
          </div>
        ) : (
          historyList.map((scan) => {
            const scanKey = scan.scan_id || scan.id;
            const isDeleting = deletingId === scanKey;

            return (
              <div
                key={scanKey}
                onClick={() => onOpenScan && onOpenScan(scanKey)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:border-cyan-500/40 transition">
                      {scan.target?.endsWith('.zip') ? <FolderArchive className="w-5 h-5" /> : <FolderGit2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition">
                          {scan.target || scan.target_name || 'scanned_project'}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {scan.status || 'Completed'}
                        </span>
                        {scan.isDemo && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Demo Fixture
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {scan.timestamp}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3" />
                          {scan.durationMs || scan.duration_ms || 450}ms
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{scan.filesScanned || scan.files_scanned || 1} files</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(scanKey, e)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-red-500/20 hover:text-red-400 text-slate-500 border border-slate-800 transition"
                      title="Delete scan from database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenScan && onOpenScan(scanKey)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <span>Open Report</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Total Issues</span>
                    <span className="font-mono text-slate-200 font-bold text-sm">{scan.totalFindings || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Critical</span>
                    <span className="font-mono text-red-400 font-bold text-sm">{scan.critical || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">High Severity</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">{scan.high || 0}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">Medium / Low</span>
                    <span className="font-mono text-yellow-300 font-bold text-sm">{(scan.medium || 0) + (scan.low || 0)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
