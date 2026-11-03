import React from 'react';

export const StatusBadge = ({ type, value }) => {
  const v = String(value || '').toUpperCase();

  // Colors tailored to cybersecurity risk and policy themes
  const colorMap = {
    // Risk Levels
    LOW: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    MEDIUM: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
    HIGH: 'bg-orange-950/80 text-orange-400 border-orange-500/40',
    CRITICAL: 'bg-rose-950/80 text-rose-400 border-rose-500/40 animate-pulse',

    // Policy Actions
    ALLOW: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50',
    SANITIZE: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/50',
    REWRITE: 'bg-blue-900/60 text-blue-300 border-blue-500/50',
    BLOCK: 'bg-red-950/80 text-red-300 border-red-500/50',

    // Classifications
    BENIGN: 'bg-slate-800/80 text-slate-300 border-slate-600/40',
    PROMPT_INJECTION: 'bg-purple-950/80 text-purple-300 border-purple-500/40',

    // Statuses
    ONLINE: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    OFFLINE: 'bg-red-950/80 text-red-400 border-red-500/30',
  };

  const style = colorMap[v] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${style}`}
    >
      {value}
    </span>
  );
};

export default StatusBadge;
