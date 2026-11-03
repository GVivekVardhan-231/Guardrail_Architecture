import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileCode,
  Cpu,
  Brain,
  History,
  Scale,
  Lock,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export const PipelineWallFlow = ({ result, loading }) => {
  if (!result && !loading) {
    return (
      <div className="bg-[#0e1628] border border-slate-800/80 rounded-xl p-5 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2 text-cyan-400">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wider text-slate-200">
            Interactive GuardWall Flow Diagram
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Submit or select a prompt below to see the multi-layered defensive wall activate in real time. 
          Every prompt traverses 5 defensive techniques before reaching the policy enforcement gate.
        </p>
      </div>
    );
  }

  const timing = result?.timing || {};
  const breakdown = result?.risk_breakdown || {};
  const action = result?.action;
  const isBlocked = action === 'BLOCK';
  const isSanitized = action === 'SANITIZE' || action === 'REWRITE';
  const isAllowed = action === 'ALLOW';

  // Helper for node status styles
  const getNodeStatus = (score, threshold = 40) => {
    if (!result) return 'border-slate-800 bg-[#0a0f1d] text-slate-400';
    if (score >= 70) return 'border-rose-500/80 bg-rose-950/30 text-rose-300 shadow-rose-950/50 shadow-md';
    if (score >= threshold) return 'border-amber-500/80 bg-amber-950/30 text-amber-300 shadow-amber-950/50 shadow-md';
    return 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 shadow-emerald-950/30 shadow-sm';
  };

  const getStatusIcon = (score, threshold = 40) => {
    if (!result) return null;
    if (score >= 70) return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (score >= threshold) return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  };

  return (
    <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Latency */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                THE INLINE GUARDWALL PIPELINE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Multi-Technique Security Barrier
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inline wall between client prompt and LLM gateway. Enforces deterministic defense in sub-100ms.
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Wall Latency</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">
                {timing.total_latency_ms?.toFixed(1) || '0.0'} ms
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Dynamic Risk</div>
              <div className={`text-xs font-bold font-mono ${
                result.risk_score >= 70 ? 'text-rose-400' : result.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.risk_score?.toFixed(1) || '0.0'} / 100
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Visual Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Node 1: Ingestion */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 text-center">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center mb-1 text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">User Prompt</span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">Untrusted Input</span>
          {result && (
            <span className="text-[10px] text-cyan-400/90 font-mono mt-1 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
              {result.original_prompt?.length || 0} chars
            </span>
          )}
        </div>

        {/* Transition Arrow */}
        <div className="hidden lg:flex lg:col-span-1 justify-center text-cyan-500/70">
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>

        {/* The Wall Enclosure: 5 Techniques */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#0b1222] to-[#080d19] border-2 border-cyan-500/30 rounded-xl p-3 relative shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              Inline Defensive Techniques Wall
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Parallel & Cascaded Defense</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {/* Technique 1: Preprocessor */}
            <div className={`p-2 rounded-lg border text-left transition-all ${getNodeStatus(breakdown.obfuscation_score * 100, 30)}`}>
              <div className="flex items-center justify-between mb-1">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                {getStatusIcon(breakdown.obfuscation_score * 100, 30)}
              </div>
              <div className="text-[10px] font-bold truncate">1. Preprocess</div>
              <div className="text-[9px] opacity-80 truncate">NFKC & Deobfuscate</div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {timing.preprocessing_ms?.toFixed(1) || '0.0'}ms
              </div>
            </div>

            {/* Technique 2: Rules */}
            <div className={`p-2 rounded-lg border text-left transition-all ${getNodeStatus(breakdown.rule_score, 40)}`}>
              <div className="flex items-center justify-between mb-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {getStatusIcon(breakdown.rule_score, 40)}
              </div>
              <div className="text-[10px] font-bold truncate">2. Rules & Regex</div>
              <div className="text-[9px] opacity-80 truncate">
                {result?.detected_rules?.length ? `${result.detected_rules.length} matched` : '0 signatures'}
              </div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {timing.rule_detector_ms?.toFixed(1) || '0.0'}ms
              </div>
            </div>

            {/* Technique 3: ML Classifier */}
            <div className={`p-2 rounded-lg border text-left transition-all ${getNodeStatus(breakdown.ml_probability * 100, 40)}`}>
              <div className="flex items-center justify-between mb-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {getStatusIcon(breakdown.ml_probability * 100, 40)}
              </div>
              <div className="text-[10px] font-bold truncate">3. ML Classifier</div>
              <div className="text-[9px] opacity-80 truncate">
                {breakdown.ml_probability ? `${(breakdown.ml_probability * 100).toFixed(0)}% prob` : 'TF-IDF Model'}
              </div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {timing.ml_inference_ms?.toFixed(1) || '0.0'}ms
              </div>
            </div>

            {/* Technique 4: Semantic Embeddings */}
            <div className={`p-2 rounded-lg border text-left transition-all ${getNodeStatus(breakdown.semantic_score, 40)}`}>
              <div className="flex items-center justify-between mb-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                {getStatusIcon(breakdown.semantic_score, 40)}
              </div>
              <div className="text-[10px] font-bold truncate">4. Embeddings</div>
              <div className="text-[9px] opacity-80 truncate">MiniLM Dense Vector</div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {timing.semantic_embedding_ms?.toFixed(1) || '0.0'}ms
              </div>
            </div>

            {/* Technique 5: Context Intent */}
            <div className={`p-2 rounded-lg border text-left transition-all ${getNodeStatus(breakdown.context_score, 40)}`}>
              <div className="flex items-center justify-between mb-1">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                {getStatusIcon(breakdown.context_score, 40)}
              </div>
              <div className="text-[10px] font-bold truncate">5. Context</div>
              <div className="text-[9px] opacity-80 truncate">Multi-turn Intent</div>
              <div className="text-[9px] font-mono mt-1 opacity-70">
                {timing.context_analysis_ms?.toFixed(1) || '0.0'}ms
              </div>
            </div>
          </div>

          {/* Aggregator & Policy Gate bottom strip inside Wall */}
          <div className="mt-2.5 pt-2 border-t border-cyan-900/30 flex flex-wrap items-center justify-between text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <Scale className="w-3 h-3 text-cyan-400" />
              <span>Weight Formulation: 25% Rules + 25% ML + 25% Semantic + 15% Ctx + 10% Obf</span>
            </div>
            <div className="font-semibold text-cyan-300 flex items-center gap-1">
              <span>Policy Gate:</span>
              <span className={`px-1.5 py-0.2 rounded font-mono ${
                isBlocked ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50' :
                isSanitized ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50' :
                'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
              }`}>
                {action || 'EVALUATING'}
              </span>
            </div>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="hidden lg:flex lg:col-span-1 justify-center text-cyan-500/70">
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>

        {/* Node 3: LLM Target or Wall Drop */}
        <div className={`lg:col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
          isBlocked 
            ? 'bg-rose-950/30 border-rose-500/80 text-rose-200' 
            : isSanitized
            ? 'bg-amber-950/30 border-amber-500/80 text-amber-200'
            : isAllowed
            ? 'bg-emerald-950/30 border-emerald-500/80 text-emerald-200'
            : 'bg-[#0a0f1d] border-slate-800 text-slate-400'
        }`}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1">
            {isBlocked ? (
              <ShieldX className="w-4 h-4 text-rose-400" />
            ) : isSanitized ? (
              <Sparkles className="w-4 h-4 text-amber-400" />
            ) : (
              <Bot className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {isBlocked ? 'Blocked at Wall' : isSanitized ? 'Sanitized for LLM' : 'Target LLM'}
          </span>
          <span className="text-[10px] font-mono mt-0.5">
            {isBlocked ? 'Dropped (Never Sent)' : isSanitized ? 'Neutral Intent Forwarded' : 'Sanctioned & Invoked'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PipelineWallFlow;
