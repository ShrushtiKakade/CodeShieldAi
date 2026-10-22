import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  colorScheme = "blue",
  subtitle,
  onClick
}) {
  const schemeStyles = {
    red: {
      border: "border-red-500/30 hover:border-red-500/50",
      bg: "bg-red-500/10",
      text: "text-red-400",
      badge: "bg-red-500/20 text-red-300 border-red-500/30",
      glow: "hover:shadow-red-500/10"
    },
    amber: {
      border: "border-amber-500/30 hover:border-amber-500/50",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      glow: "hover:shadow-amber-500/10"
    },
    cyan: {
      border: "border-cyan-500/30 hover:border-cyan-500/50",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      glow: "hover:shadow-cyan-500/10"
    },
    purple: {
      border: "border-purple-500/30 hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      glow: "hover:shadow-purple-500/10"
    },
    emerald: {
      border: "border-emerald-500/30 hover:border-emerald-500/50",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      glow: "hover:shadow-emerald-500/10"
    },
    blue: {
      border: "border-slate-800 hover:border-slate-700",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      glow: "hover:shadow-slate-800/20"
    }
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.blue;

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-xl bg-slate-900 border ${currentScheme.border} shadow-lg transition-all duration-200 ${currentScheme.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${currentScheme.bg} ${currentScheme.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {value}
        </div>
        {change && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${currentScheme.badge} font-medium`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

