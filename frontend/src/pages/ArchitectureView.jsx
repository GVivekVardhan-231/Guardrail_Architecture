import React, { useState } from 'react';
import {
  Layers,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  Terminal,
  FileCheck,
  Lock,
  Bot
} from 'lucide-react';

export const ArchitectureView = () => {
  const [selectedLayer, setSelectedLayer] = useState('preprocessor');

  const layersInfo = {
    user: {
      title: 'User Input Layer',
      subtitle: 'Raw Prompt Ingestion',
      description: 'Accepts raw client prompt. Guarantees the original input is preserved immutably for logging and explainability, never destructively overwritten.',
      details: ['Min/Max length checks', 'Pydantic request schema validation', 'Client session tracking ID binding']
    },
    preprocessor: {
      title: 'Step 1: Input Preprocessor',
      subtitle: 'Normalization & Structural Anomaly Detection',
      description: 'Cleans whitespace and applies Unicode NFKC normalization. Scans for structural delimiters and decodes obfuscated representations without mutating user context.',
      details: [
        'Unicode NFKC normalization & zero-width character detection',
        'Suspicious separator checks (---, ===, [SYSTEM], ### Instruction)',
        'Base64, Hexadecimal, and ROT13 payload decoding',
        'Leetspeak transformation (e.g. 1gn0r3 -> ignore)'
      ]
    },
    detectors: {
      title: 'Step 2: Tri-Engine Detection Layer',
      subtitle: 'Rule-Based, ML Classification, and Semantic Embeddings',
      description: 'Three parallel detection engines independently evaluate the normalized prompt against distinct threat vectors.',
      details: [
        'Rule-Based Engine: Comprehensive regex and token signatures for injection, jailbreaks, system extraction, and exfiltration',
        'Machine Learning: TF-IDF n-gram vectorizer + Logistic Regression with balanced weights, returning calibrated probability P(Attack)',
        'Semantic Embedding: all-MiniLM-L6-v2 vector embeddings computing cosine similarity against curated seed attack archetypes'
      ]
    },
    context: {
      title: 'Step 3: Contextual Intent Analysis',
      subtitle: 'Multi-Turn Session State Evaluation',
      description: 'Evaluates interaction momentum across conversation history. Detects subtle multi-turn reconnaissance, such as benign boundary probing followed by injection override.',
      details: [
        'Two-step reconnaissance escalation detection',
        'Cumulative violation tracking per session',
        'Baseline divergence detection'
      ]
    },
    scoring: {
      title: 'Step 4: Dynamic Risk Scoring Engine',
      subtitle: 'Transparent Weighted Threat Formulation',
      description: 'Combines all component signals into a normalized 0-100 risk score with dynamic multi-detector agreement amplification.',
      details: [
        'Formula: Risk = 0.25*Rules + 0.25*ML + 0.25*Semantic + 0.15*Context + 0.10*Obfuscation',
        'Strong agreement floor: if >=2 detectors exceed 70%, risk is elevated to CRITICAL tier',
        'Deterministic categorization: LOW (0-24), MEDIUM (25-49), HIGH (50-74), CRITICAL (75-100)'
      ]
    },
    policy: {
      title: 'Step 5: Policy Enforcement Engine',
      subtitle: 'Deterministic Action Gate',
      description: 'Maps the calculated threat score and detected features to a strict operational action.',
      details: [
        'LOW -> ALLOW: Pass prompt directly to LLM',
        'MEDIUM -> SANITIZE: Strip malicious instruction prefixes while extracting legitimate task',
        'HIGH -> REWRITE / SANITIZE: Reconstruct intent into safe, neutral phrasing',
        'CRITICAL -> BLOCK: Halt execution immediately. Prompt is strictly discarded'
      ]
    },
    llm: {
      title: 'Step 6: LLM Gateway & Response',
      subtitle: 'Controlled Outbound Proxy',
      description: 'Acts as the final barrier. Blocked requests NEVER reach the LLM under any circumstance.',
      details: [
        'If BLOCK: Return structured security rejection without triggering LLM API calls',
        'If ALLOW/SANITIZE/REWRITE: Forward approved/transformed prompt to selected provider (Local Safe Demo or OpenAI API)',
        'Capture output latency and execution telemetry'
      ]
    },
    audit: {
      title: 'Step 7: Audit Logging & SOC Dashboard',
      subtitle: 'Immutable SQLite Telemetry',
      description: 'Every inspection, token weight, latency measurement, and event is recorded into the SQLite database for real-time monitoring.',
      details: [
        'Full request logs & timing breakdowns',
        'Security events table for audit review',
        'Live Recharts data feeds on SOC Dashboard'
      ]
    }
  };

  const activeInfo = layersInfo[selectedLayer] || layersInfo.preprocessor;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Guardrail Pipeline Architecture</span>
        </h2>
        <p className="text-xs text-slate-400">
          Interactive architectural blueprint showing the end-to-end dataflow from raw user input to secure LLM generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Architecture Flow Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-[#10182b] border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-white mb-2">Architectural Flow Pipeline (Click node to inspect)</h3>

          {/* Node 1: User */}
          <div
            onClick={() => setSelectedLayer('user')}
            className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              selectedLayer === 'user' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-200">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">1. User Prompt Ingestion</span>
                <span className="text-[11px] text-slate-400">Immutable input capture & session binding</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">RAW_INPUT</span>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 2: Preprocessor */}
          <div
            onClick={() => setSelectedLayer('preprocessor')}
            className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              selectedLayer === 'preprocessor' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-200">
                <FileCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">2. Input Preprocessor</span>
                <span className="text-[11px] text-slate-400">Unicode NFKC, Whitespace, & Obfuscation Decoding</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">NORMALIZED</span>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 3: Tri-Detector Layer */}
          <div
            onClick={() => setSelectedLayer('detectors')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
              selectedLayer === 'detectors' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">3. Tri-Engine Detection Subsystem</span>
              <span className="text-[10px] font-mono text-slate-400">PARALLEL ENGINES</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <span className="font-semibold text-cyan-400 block text-[11px]">Rule Engine</span>
                <span className="text-[10px] text-slate-400">Regex & Signatures</span>
              </div>
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <span className="font-semibold text-blue-400 block text-[11px]">ML Classifier</span>
                <span className="text-[10px] text-slate-400">TF-IDF + LogReg</span>
              </div>
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <span className="font-semibold text-purple-400 block text-[11px]">Semantic Vectors</span>
                <span className="text-[10px] text-slate-400">MiniLM Embeddings</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 4: Context */}
          <div
            onClick={() => setSelectedLayer('context')}
            className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              selectedLayer === 'context' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">4. Contextual Intent Analysis</span>
                <span className="text-[11px] text-slate-400">Multi-turn session history & reconnaissance tracking</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">STATEFUL</span>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 5: Dynamic Risk Scoring Engine */}
          <div
            onClick={() => setSelectedLayer('scoring')}
            className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              selectedLayer === 'scoring' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-200">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">5. Dynamic Risk Scoring Engine</span>
                <span className="text-[11px] text-slate-400">Weighted composite aggregation (0 - 100)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400">RISK_SCORE</span>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 6: Policy Engine */}
          <div
            onClick={() => setSelectedLayer('policy')}
            className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              selectedLayer === 'policy' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-200">
                <Lock className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">6. Policy Decision Gate</span>
                <span className="text-[11px] text-slate-400">ALLOW (Low) | SANITIZE (Med) | REWRITE (High) | BLOCK (Crit)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-400">DECISION</span>
          </div>

          <div className="flex justify-center text-cyan-500"><ArrowDown className="w-4 h-4" /></div>

          {/* Node 7 & 8 Row: LLM Gateway + Audit DB */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedLayer('llm')}
              className={`p-3 rounded-lg border cursor-pointer transition flex items-center space-x-3 ${
                selectedLayer === 'llm' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <Bot className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">7. LLM Gateway</span>
                <span className="text-[10px] text-slate-400">Blocked prompts suppressed</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedLayer('audit')}
              className={`p-3 rounded-lg border cursor-pointer transition flex items-center space-x-3 ${
                selectedLayer === 'audit' ? 'bg-cyan-950/40 border-cyan-500 shadow-md' : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
              }`}
            >
              <Database className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">8. SQLite Telemetry</span>
                <span className="text-[10px] text-slate-400">Full audit persistence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Component Detailed Specification (1 Column) */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">
                Component Specification
              </span>
              <h3 className="text-base font-bold text-white mt-1">{activeInfo.title}</h3>
              <p className="text-xs text-slate-400">{activeInfo.subtitle}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeInfo.description}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Key Operations & Characteristics:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {activeInfo.details.map((d, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-lg text-[11px] font-mono text-slate-400">
            Real-time execution target: &lt; 50ms average total pipeline latency.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
