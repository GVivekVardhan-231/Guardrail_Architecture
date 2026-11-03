import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  Filter,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const ACTION_COLORS = {
  ALLOW: '#10b981',
  SANITIZE: '#06b6d4',
  REWRITE: '#3b82f6',
  BLOCK: '#ef4444',
};

export const Dashboard = ({ setActiveTab, setSelectedPromptForAnalysis }) => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, trendsData, logsData] = await Promise.all([
        api.getDashboardStats(),
        api.getTrends(),
        api.getLogs({ limit: 8 }),
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setRecentLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load dashboard data from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      await api.seedDemo();
      fetchDashboardData();
    } catch (err) {
      console.error('Seed demo error:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
        <span>Loading real-time security dashboard...</span>
      </div>
    );
  }

  // Prepare chart formats
  const riskChartData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({
        name,
        value,
        fill: RISK_COLORS[name] || '#64748b',
      }))
    : [];

  const actionChartData = stats?.action_distribution
    ? Object.entries(stats.action_distribution).map(([name, value]) => ({
        name,
        value,
        fill: ACTION_COLORS[name] || '#64748b',
      }))
    : [];

  const categoryChartData = stats?.attack_categories
    ? Object.entries(stats.attack_categories)
        .filter(([cat]) => cat !== 'BENIGN')
        .map(([name, count]) => ({
          category: name.replace('_', ' '),
          count,
        }))
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Threat Telemetry & Real-Time Monitoring</h2>
          <p className="text-xs text-slate-400">Live inspection statistics directly synchronized with SQLite database.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSeedDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Populate test traffic samples"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Seed Test Events</span>
          </button>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-md shadow-cyan-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Prompts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_analyzed || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed by guardrail layer</div>
        </div>

        {/* Injections Detected */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Threats Detected</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats?.injection_count || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats?.total_analyzed ? ((stats.injection_count / stats.total_analyzed) * 100).toFixed(1) : 0}% threat ratio
          </div>
        </div>

        {/* Requests Blocked */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Interception Actions</span>
            <Ban className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats?.blocked_count || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Blocked: {stats?.blocked_count || 0} | San/Rew: {(stats?.sanitized_count || 0) + (stats?.rewritten_count || 0)}
          </div>
        </div>

        {/* Latency & Average Risk */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Latency & Risk</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">{stats?.avg_latency_ms || 0}</span>
            <span className="text-xs text-slate-400">ms</span>
            <span className="text-xs text-slate-400 font-bold ml-2">| Risk: {stats?.avg_risk_score || 0}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Real-time pipeline latency</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend Area Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Prompt Volume & Attack Trends</h3>
              <p className="text-xs text-slate-400">Total prompts inspected vs malicious attempts detected</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Live Timeline</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time_label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" name="Total Prompts" stroke="#06b6d4" fillOpacity={1} fill="url(#totalGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="attacks" name="Attacks Detected" stroke="#f43f5e" fillOpacity={1} fill="url(#attackGrad)" strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policy Action Donut Chart (1 Column) */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-white">Policy Enforcement Actions</h3>
            <p className="text-xs text-slate-400">Distribution of ALLOW, SANITIZE, REWRITE, BLOCK</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {actionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {actionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No action records available</div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Level Distribution Bar Chart */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Risk Severity Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Requests categorized by LOW, MEDIUM, HIGH, and CRITICAL thresholds</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Prompts" radius={[4, 4, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Category Breakdown Bar Chart */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Attack Vector Classification</h3>
          <p className="text-xs text-slate-400 mb-4">Direct injection, jailbreaks, extraction, and role hijacking</p>
          <div className="h-56 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={10} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Threats" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No injection categories logged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Inspection Events</h3>
            <p className="text-xs text-slate-400">Real-time decisions across recent user interactions</p>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
          >
            View Full Audit Log &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Prompt Excerpt</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans max-w-xs truncate" title={log.original_prompt}>
                    {log.original_prompt}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">
                    {log.risk_score}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge type="level" value={log.risk_level} />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge type="action" value={log.action} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {log.total_latency_ms} ms
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        if (setSelectedPromptForAnalysis) {
                          setSelectedPromptForAnalysis(log.original_prompt);
                        }
                        setActiveTab('analyzer');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-sans text-xs underline"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500 font-sans text-xs">
                    No requests recorded in database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
