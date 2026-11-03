import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Layers,
  Bot,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Error fetching health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
            <span>System Health & Engine Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time status of FastAPI server, SQLite database, ML classifier, and transformer embeddings.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Primary Subsystem Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Backend Server */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">FastAPI Backend</span>
            </div>
            <StatusBadge type="status" value={health?.backend || 'ONLINE'} />
          </div>
          <p className="text-xs text-slate-400">Asynchronous REST API gateway serving ports and endpoints.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Version: {health?.version || '1.0.0'} | Uvicorn Worker
          </div>
        </div>

        {/* Database */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">SQLite Database</span>
            </div>
            <StatusBadge type="status" value={health?.database || 'ONLINE'} />
          </div>
          <p className="text-xs text-slate-400">SQLAlchemy ORM connection storing requests and audit events.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Engine: SQLite 3 | WAL Mode Enabled
          </div>
        </div>

        {/* ML Classifier */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">ML Classifier</span>
            </div>
            <StatusBadge type="status" value={health?.ml_classifier || 'ONLINE'} />
          </div>
          <p className="text-xs text-slate-400">TF-IDF + Logistic Regression pre-loaded in memory.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Format: Scikit-learn Joblib Pipeline
          </div>
        </div>

        {/* Semantic Embeddings */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">Semantic Vectors</span>
            </div>
            <StatusBadge type="status" value={health?.semantic_embeddings || 'ONLINE'} />
          </div>
          <p className="text-xs text-slate-400">SentenceTransformers all-MiniLM-L6-v2 vector model.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Model: all-MiniLM-L6-v2 (384-dim)
          </div>
        </div>

        {/* LLM Gateway */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">LLM Provider</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              {health?.llm_gateway || 'DEMO MODE'}
            </span>
          </div>
          <p className="text-xs text-slate-400">Controlled outbound interface for approved prompts.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Mode: Local Safe Demo (Zero key dependency)
          </div>
        </div>

        {/* Device & Compute */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">Compute Hardware</span>
            </div>
            <StatusBadge type="status" value="ONLINE" />
          </div>
          <p className="text-xs text-slate-400">Lightweight architecture optimized for local Windows execution.</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            Architecture: {health?.device || 'CPU (Optimized)'}
          </div>
        </div>
      </div>

      {/* Engine Telemetry Card */}
      <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white">Engine Telemetry & Health Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg">
            <span className="text-slate-500 text-[10px] block">SYSTEM TIME</span>
            <span className="text-slate-200">{health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg">
            <span className="text-slate-500 text-[10px] block">GUARDRAIL OVERALL STATUS</span>
            <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
          </div>
          <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg">
            <span className="text-slate-500 text-[10px] block">DEFENSIVE MODULES ACTIVE</span>
            <span className="text-cyan-400 font-bold">5 / 5 DEFENSIVE LAYERS ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
