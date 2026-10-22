import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CircleCheck,
  CircleDot,
  FileWarning,
  GitFork,
  ScanLine,
  Shield,
  ShieldAlert
} from 'lucide-react';

const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const severityStyles = {
  Critical: 'bg-rose-50 text-rose-700 ring-rose-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-blue-50 text-blue-700 ring-blue-200'
};

export default function Dashboard({
  findings = [],
  onSelectFinding,
  isLiveScan = false,
  targetProject = 'Project'
}) {
  const navigate = useNavigate();
  const counts = findings.reduce((result, finding) => {
    const severity = finding.severity in severityOrder ? finding.severity : 'Low';
    result[severity] += 1;
    return result;
  }, { Critical: 0, High: 0, Medium: 0, Low: 0 });
  const total = findings.length;
  const reviewCount = counts.Critical + counts.High;
  const orderedFindings = [...findings].sort(
    (first, second) => (severityOrder[first.severity] ?? 4) - (severityOrder[second.severity] ?? 4)
  );
  const chartSegments = [
    { name: 'Critical', color: '#dc2626', count: counts.Critical },
    { name: 'High', color: '#ea580c', count: counts.High },
    { name: 'Medium', color: '#d97706', count: counts.Medium },
    { name: 'Low', color: '#2563eb', count: counts.Low }
  ];
  const chartStyle = {
    background: total
      ? `conic-gradient(${chartSegments.map((segment, index) => {
          const previous = chartSegments
            .slice(0, index)
            .reduce((sum, item) => sum + item.count, 0);
          const start = (previous / total) * 100;
          const end = ((previous + segment.count) / total) * 100;
          return `${segment.color} ${start}% ${end}%`;
        }).join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)'
  };

  const openFinding = (finding) => {
    onSelectFinding?.(finding);
    navigate('/findings');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Security overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {targetProject}
          </h1>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          <ScanLine className="h-4 w-4" />
          Scan a project
        </button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className={`rounded-2xl border p-6 md:p-8 ${
          reviewCount
            ? 'border-orange-200 bg-gradient-to-br from-white to-orange-50'
            : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`rounded-2xl p-3 ${
              reviewCount ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {reviewCount
                ? <ShieldAlert className="h-7 w-7" />
                : <Shield className="h-7 w-7" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {reviewCount ? 'Review needed' : total ? 'No high-risk issues found' : 'No scan yet'}
                </h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isLiveScan ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isLiveScan ? 'Latest scan' : 'Sample data'}
                </span>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {reviewCount
                  ? `${reviewCount} critical or high-severity ${reviewCount === 1 ? 'finding needs' : 'findings need'} attention. Review the affected code before release.`
                  : total
                    ? 'No critical or high-severity findings in this scan. Review remaining items as part of your normal workflow.'
                    : 'Start a scan to see security findings and code relationships for your project.'}
              </p>
              {reviewCount > 0 && (
                <button
                  onClick={() => navigate('/findings')}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800 hover:text-cyan-950"
                >
                  Review findings <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Finding severity</h2>
              <p className="mt-1 text-xs text-slate-500">Distribution from this scan</p>
            </div>
            <span className="text-sm font-medium text-slate-600">{total} total</span>
          </div>
          <div className="mt-5 flex items-center gap-6">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full"
              style={chartStyle}
              role="img"
              aria-label={`Finding severity distribution: ${counts.Critical} critical, ${counts.High} high, ${counts.Medium} medium, ${counts.Low} low`}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-semibold text-slate-900">{total}</span>
                <span className="text-[11px] text-slate-500">findings</span>
              </div>
            </div>
            <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
              {chartSegments.map(({ name, color, count }) => (
                <li key={name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-slate-600">{name}</span>
                  <span className="ml-auto font-semibold tabular-nums text-slate-900">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Finding counts">
        {[
          { label: 'Critical', count: counts.Critical, icon: ShieldAlert, tone: 'text-rose-700 bg-rose-50' },
          { label: 'High', count: counts.High, icon: FileWarning, tone: 'text-orange-700 bg-orange-50' },
          { label: 'Other', count: counts.Medium + counts.Low, icon: CircleDot, tone: 'text-slate-700 bg-slate-100' }
        ].map(({ label, count, icon: Icon, tone }) => (
          <button
            key={label}
            onClick={() => navigate('/findings')}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <span className={`rounded-xl p-3 ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-sm text-slate-500">{label}</span>
              <span className="mt-1 block text-2xl font-semibold tabular-nums text-slate-900">{count}</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
          </button>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Issues to review</h2>
              <p className="mt-1 text-xs text-slate-500">Highest severity first</p>
            </div>
            <button
              onClick={() => navigate('/findings')}
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-800 hover:text-cyan-950"
            >
              All findings <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {orderedFindings.length ? (
            <ul className="divide-y divide-slate-100">
              {orderedFindings.slice(0, 4).map((finding) => (
                <li key={finding.id}>
                  <button
                    onClick={() => openFinding(finding)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                      severityStyles[finding.severity] || severityStyles.Low
                    }`}>
                      {finding.severity}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {finding.title}
                      </span>
                      <span className="mt-1 block truncate font-mono text-xs text-slate-500">
                        {finding.file}{finding.line ? `:${finding.line}` : ''}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <CircleCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-3 text-sm font-medium text-slate-800">No findings yet</p>
              <p className="mt-1 text-sm text-slate-500">Run a scan to populate this overview.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/impact')}
          className="group flex min-h-52 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-cyan-50 p-3 text-cyan-800">
              <GitFork className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-800" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Explore code relationships</h2>
            <p className="mt-1 text-sm text-slate-500">
              See how flagged code connects to the rest of your project.
            </p>
          </div>
        </button>
      </section>
    </div>
  );
}
