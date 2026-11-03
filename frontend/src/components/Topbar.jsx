import React from 'react';
import { Shield, RefreshCw, Zap } from 'lucide-react';

export const Topbar = ({ onRefresh, isRefreshing, activeTab }) => {
  const titles = {
    analyzer: 'GuardWall Visual Pipeline Inspector (Result Checker)',
    playground: 'Inline LLM Gateway Wall Tester',
    framework: 'GuardWall Python Framework & SDK Guide',
    dashboard: 'Security Operations Center (SOC) Telemetry',
    events: 'Security Event Audit Logs',
    simulator: 'Interactive Attack Vector Simulator',
    performance: 'ML Evaluation Metrics & Validation',
    architecture: 'GuardWall Pipeline Architecture Specs',
    health: 'System Health & Engine Telemetry',
    settings: 'Threshold & Detection Configuration',
  };

  return (
    <header className="h-16 bg-[#0d1322] border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-semibold text-slate-100 m-0">
          {titles[activeTab] || 'GuardWall Framework'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Guardrail Operational Banner */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>● Guardrail Operational</span>
        </div>

        {/* Latency Mode Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time CPU</span>
        </div>

        {/* Global Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium border border-slate-700 transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
