import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import api from '../services/api';

export const Settings = () => {
  const [config, setConfig] = useState({
    RISK_THRESHOLD_LOW: 10.0,
    RISK_THRESHOLD_MEDIUM: 50.0,
    RISK_THRESHOLD_HIGH: 75.0,
    WEIGHT_RULES: 0.25,
    WEIGHT_ML: 0.25,
    WEIGHT_SEMANTIC: 0.25,
    WEIGHT_CONTEXT: 0.15,
    WEIGHT_OBFUSCATION: 0.10,
    LLM_PROVIDER: 'demo',
    LLM_MODEL: 'gpt-4o-mini',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await api.updateConfig(config);
      setMessage({ type: 'success', text: 'Guardrail thresholds and weights updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig({
      RISK_THRESHOLD_LOW: 10.0,
      RISK_THRESHOLD_MEDIUM: 50.0,
      RISK_THRESHOLD_HIGH: 75.0,
      WEIGHT_RULES: 0.25,
      WEIGHT_ML: 0.25,
      WEIGHT_SEMANTIC: 0.25,
      WEIGHT_CONTEXT: 0.15,
      WEIGHT_OBFUSCATION: 0.10,
      LLM_PROVIDER: 'demo',
      LLM_MODEL: 'gpt-4o-mini',
    });
  };

  const totalWeight = (
    Number(config.WEIGHT_RULES) +
    Number(config.WEIGHT_ML) +
    Number(config.WEIGHT_SEMANTIC) +
    Number(config.WEIGHT_CONTEXT) +
    Number(config.WEIGHT_OBFUSCATION)
  ).toFixed(2);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>Guardrail Threshold & Weight Configuration</span>
        </h2>
        <p className="text-xs text-slate-400">
          Fine-tune dynamic threat scoring weights and policy escalation thresholds in real time.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/60 border-red-500/50 text-red-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-white text-sm font-semibold border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>1. Policy Risk Thresholds (0 - 100)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* LOW Threshold */}
            <div className="space-y-2 p-3 bg-[#0a0f1d] rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-400">LOW Risk Ceiling:</span>
                <span className="font-mono text-white font-bold">{config.RISK_THRESHOLD_LOW}</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={config.RISK_THRESHOLD_LOW}
                onChange={(e) => setConfig({ ...config, RISK_THRESHOLD_LOW: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Below this score: ALLOW</span>
            </div>

            {/* MEDIUM Threshold */}
            <div className="space-y-2 p-3 bg-[#0a0f1d] rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-amber-400">MEDIUM Risk Ceiling:</span>
                <span className="font-mono text-white font-bold">{config.RISK_THRESHOLD_MEDIUM}</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                step="1"
                value={config.RISK_THRESHOLD_MEDIUM}
                onChange={(e) => setConfig({ ...config, RISK_THRESHOLD_MEDIUM: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Between Low & Med: SANITIZE</span>
            </div>

            {/* HIGH Threshold */}
            <div className="space-y-2 p-3 bg-[#0a0f1d] rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-400">CRITICAL Risk Floor:</span>
                <span className="font-mono text-white font-bold">{config.RISK_THRESHOLD_HIGH}</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="1"
                value={config.RISK_THRESHOLD_HIGH}
                onChange={(e) => setConfig({ ...config, RISK_THRESHOLD_HIGH: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Above this score: BLOCK</span>
            </div>
          </div>
        </div>

        {/* Dynamic Scoring Weights Card */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-white text-sm font-semibold">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>2. Multi-Engine Threat Weights (Normalized to 1.00)</span>
            </div>
            <span className={`text-xs font-mono font-bold ${totalWeight === '1.00' ? 'text-emerald-400' : 'text-amber-400'}`}>
              Sum: {totalWeight} / 1.00
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Rule Engine</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.WEIGHT_RULES}
                onChange={(e) => setConfig({ ...config, WEIGHT_RULES: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">Regex / Signatures</span>
            </div>

            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">ML Classifier</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.WEIGHT_ML}
                onChange={(e) => setConfig({ ...config, WEIGHT_ML: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">TF-IDF + LogReg</span>
            </div>

            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Semantic Embed</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.WEIGHT_SEMANTIC}
                onChange={(e) => setConfig({ ...config, WEIGHT_SEMANTIC: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">MiniLM Vectors</span>
            </div>

            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Context Intent</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.WEIGHT_CONTEXT}
                onChange={(e) => setConfig({ ...config, WEIGHT_CONTEXT: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">Multi-turn History</span>
            </div>

            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Obfuscation</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.WEIGHT_OBFUSCATION}
                onChange={(e) => setConfig({ ...config, WEIGHT_OBFUSCATION: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">Base64 / Delimiters</span>
            </div>
          </div>
        </div>

        {/* LLM Gateway Setting */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-white text-sm font-semibold border-b border-slate-800 pb-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>3. LLM Gateway & Provider Selection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block">Active LLM Provider:</label>
              <select
                value={config.LLM_PROVIDER}
                onChange={(e) => setConfig({ ...config, LLM_PROVIDER: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded px-3 py-2 text-slate-200"
              >
                <option value="demo">Local Safe Demo Provider (Recommended for Offline Viva)</option>
                <option value="openai">OpenAI-Compatible External API (Requires .env API Key)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Model Identifier:</label>
              <input
                type="text"
                value={config.LLM_MODEL}
                onChange={(e) => setConfig({ ...config, LLM_MODEL: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Applying...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
