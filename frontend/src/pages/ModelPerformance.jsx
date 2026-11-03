import React, { useState, useEffect } from 'react';
import {
  LineChart as ChartIcon,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Database,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export const ModelPerformance = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching model metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainSuccess(null);
      const res = await api.retrainModel();
      setMetrics(res.metrics);
      setRetrainSuccess('Model successfully retrained and reloaded into active memory!');
    } catch (err) {
      console.error('Retrain error:', err);
      setRetrainSuccess('Model retraining failed. Check server logs.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
        <span>Loading offline model validation metrics...</span>
      </div>
    );
  }

  const m = metrics?.metrics || {};
  const cm = m.confusion_matrix || {};

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <span>Machine Learning Model Evaluation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real test-set evaluation metrics from hold-out validation. Distinct from live detection logs.
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Training Pipeline...' : 'Retrain ML Model'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{retrainSuccess}</span>
        </div>
      )}

      {/* Model Spec Card */}
      <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">{metrics?.model_name || 'TF-IDF + LogisticRegression'}</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Trained: {metrics?.trained_at ? new Date(metrics.trained_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Algorithm</span>
            <span className="font-semibold text-slate-100">{metrics?.algorithm}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Feature Vectorizer</span>
            <span className="font-semibold text-slate-100">{metrics?.feature_extraction}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Total Samples</span>
            <span className="font-semibold text-cyan-400">{metrics?.total_samples} prompts</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Split Ratio</span>
            <span className="font-semibold text-slate-100">
              Train: {metrics?.train_samples} | Test: {metrics?.test_samples} (80/20)
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Accuracy */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 my-1">
            {m.accuracy ? `${(m.accuracy * 100).toFixed(2)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Overall classification rate</span>
        </div>

        {/* Precision */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Precision</span>
          <div className="text-2xl font-bold text-cyan-400 my-1">
            {m.precision ? `${(m.precision * 100).toFixed(2)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Minimizes false positives</span>
        </div>

        {/* Recall */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Recall</span>
          <div className="text-2xl font-bold text-blue-400 my-1">
            {m.recall ? `${(m.recall * 100).toFixed(2)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Catches true attacks</span>
        </div>

        {/* F1 Score */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">F1 Score</span>
          <div className="text-2xl font-bold text-purple-400 my-1">
            {m.f1_score ? `${(m.f1_score * 100).toFixed(2)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Harmonic precision/recall</span>
        </div>

        {/* ROC-AUC */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">ROC-AUC</span>
          <div className="text-2xl font-bold text-amber-400 my-1">
            {m.roc_auc ? (m.roc_auc).toFixed(4) : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Discriminative power</span>
        </div>
      </div>

      {/* Confusion Matrix & Classification Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Confusion Matrix Table */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-white">Confusion Matrix (Hold-out Test Set)</h3>
          <p className="text-xs text-slate-400">
            Real test breakdown verifying model sensitivity and specificity on {metrics?.test_samples} unseen prompts.
          </p>

          <div className="max-w-md mx-auto p-4 bg-[#0a0f1d] border border-slate-800 rounded-xl font-mono text-xs">
            <div className="grid grid-cols-3 gap-2 text-center items-center">
              <div className="text-slate-500 text-[10px]">Actual \ Predicted</div>
              <div className="text-emerald-400 font-bold text-[11px]">PRED: BENIGN</div>
              <div className="text-rose-400 font-bold text-[11px]">PRED: INJECTION</div>

              <div className="text-emerald-400 font-bold text-[11px] text-right pr-2">ACTUAL BENIGN</div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
                <span className="text-lg font-bold text-emerald-400 block">{cm.true_negative ?? 0}</span>
                <span className="text-[10px] text-slate-400">True Negative</span>
              </div>
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                <span className="text-lg font-bold text-rose-300 block">{cm.false_positive ?? 0}</span>
                <span className="text-[10px] text-slate-400">False Positive</span>
              </div>

              <div className="text-rose-400 font-bold text-[11px] text-right pr-2">ACTUAL INJECTION</div>
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                <span className="text-lg font-bold text-rose-300 block">{cm.false_negative ?? 0}</span>
                <span className="text-[10px] text-slate-400">False Negative</span>
              </div>
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg">
                <span className="text-lg font-bold text-rose-400 block">{cm.true_positive ?? 0}</span>
                <span className="text-[10px] text-slate-400">True Positive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Learned Features */}
        <div className="bg-[#10182b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-white">Top Discriminative N-Gram Tokens</h3>
          <p className="text-xs text-slate-400">
            Highest learned regression coefficients (weights) driving threat identification vs benign validation.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-rose-400 block mb-1.5 uppercase tracking-wider">
                Top Malicious Feature Weights (+Positive log-odds):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {metrics?.top_features?.malicious?.slice(0, 10).map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30 text-[11px] font-mono"
                  >
                    "{f.feature}" (+{f.weight})
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 block mb-1.5 uppercase tracking-wider">
                Top Benign Feature Weights (-Negative log-odds):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {metrics?.top_features?.benign?.slice(0, 10).map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono"
                  >
                    "{f.feature}" (-{f.weight})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
