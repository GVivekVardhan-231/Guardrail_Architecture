import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  MessageSquare,
  FileText,
  Flame,
  LineChart,
  Cpu,
  HeartPulse,
  Settings as SettingsIcon,
  Layers,
  Code2
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'analyzer', label: 'Wall Inspector', icon: ShieldAlert },
    { id: 'playground', label: 'Gateway Tester', icon: MessageSquare },
    { id: 'framework', label: 'Framework & SDK', icon: Code2 },
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'simulator', label: 'Attack Simulator', icon: Flame },
    { id: 'events', label: 'Security Events', icon: FileText },
    { id: 'performance', label: 'Model Performance', icon: LineChart },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'health', label: 'System Health', icon: HeartPulse },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>GuardWall</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">FRAMEWORK</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Inline LLM Defensive Barrier</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0a0f1d]">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine Status</span>
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
            Active
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">B.Tech Major Project 4-1</p>
      </div>
    </aside>
  );
};

export default Sidebar;
