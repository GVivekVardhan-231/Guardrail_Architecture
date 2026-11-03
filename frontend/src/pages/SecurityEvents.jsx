import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  FileText,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export const SecurityEvents = ({ setActiveTab, setSelectedPromptForAnalysis }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs({
        limit: 100,
        level: filterLevel !== 'ALL' ? filterLevel : undefined,
        action: filterAction !== 'ALL' ? filterAction : undefined,
        search: search.trim() || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterLevel, filterAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security Event Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Immutable log of all prompts inspected by the defensive guardrail architecture.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt text, keywords, or patterns..."
            className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <div className="flex items-center space-x-1 text-xs text-slate-400 ml-2">
            <span>Action:</span>
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#0a0f1d] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Actions</option>
            <option value="ALLOW">ALLOW</option>
            <option value="SANITIZE">SANITIZE</option>
            <option value="REWRITE">REWRITE</option>
            <option value="BLOCK">BLOCK</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#10182b] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Prompt Excerpt</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Attack Type</th>
                <th className="py-3 px-4">Policy Action</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.id.substring(0, 10)}...
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-200 max-w-xs truncate" title={log.original_prompt}>
                    {log.original_prompt}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {log.risk_score}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <StatusBadge type="level" value={log.risk_level} />
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.attack_type}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <StatusBadge type="action" value={log.action} />
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.total_latency_ms} ms
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setSelectedPromptForAnalysis) {
                          setSelectedPromptForAnalysis(log.original_prompt);
                        }
                        setActiveTab('analyzer');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium text-xs inline-flex items-center gap-1"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-sans text-xs">
                    No security events found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Event Details Modal / Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#10182b] border border-slate-700 max-w-2xl w-full rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Event Audit Detail: {selectedLog.id}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Recorded: {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-1">
                  Original User Prompt:
                </span>
                <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg text-slate-200 font-mono whitespace-pre-wrap">
                  {selectedLog.original_prompt}
                </div>
              </div>

              {selectedLog.sanitized_prompt && (
                <div>
                  <span className="text-cyan-400 uppercase font-semibold text-[10px] block mb-1">
                    Sanitized Prompt:
                  </span>
                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-cyan-200 font-mono">
                    {selectedLog.sanitized_prompt}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono pt-2">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Risk Score</span>
                  <span className="font-bold text-white text-sm">{selectedLog.risk_score} / 100</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Risk Level</span>
                  <StatusBadge type="level" value={selectedLog.risk_level} />
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Action</span>
                  <StatusBadge type="action" value={selectedLog.action} />
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Latency</span>
                  <span className="font-bold text-emerald-400 text-sm">{selectedLog.total_latency_ms} ms</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (setSelectedPromptForAnalysis) {
                    setSelectedPromptForAnalysis(selectedLog.original_prompt);
                  }
                  setSelectedLog(null);
                  setActiveTab('analyzer');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
              >
                Inspect in Live Analyzer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityEvents;
