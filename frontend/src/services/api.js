import axios from 'axios';

// Vite reverse proxy routes /api to http://127.0.0.1:8000/api
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Real-time analysis
  analyzePrompt: async (prompt, sessionId = 'default') => {
    const response = await apiClient.post('/analyze', {
      prompt,
      session_id: sessionId,
    });
    return response.data;
  },

  // Secure LLM Chat
  sendChatMessage: async (prompt, sessionId = 'default') => {
    const response = await apiClient.post('/chat', {
      prompt,
      session_id: sessionId,
    });
    return response.data;
  },

  // Security Logs & Events
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/logs', { params });
    return response.data;
  },

  // Dashboard Aggregates
  getDashboardStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  // Historical Trends
  getTrends: async () => {
    const response = await apiClient.get('/stats/trends');
    return response.data;
  },

  // System Health
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // ML Evaluation Metrics
  getModelMetrics: async () => {
    const response = await apiClient.get('/model/metrics');
    return response.data;
  },

  // Retrain Classifier
  retrainModel: async () => {
    const response = await apiClient.post('/train');
    return response.data;
  },

  // Configuration
  getConfig: async () => {
    const response = await apiClient.get('/config');
    return response.data;
  },

  updateConfig: async (config) => {
    const response = await apiClient.post('/config', config);
    return response.data;
  },

  // Seed demo data
  seedDemo: async () => {
    const response = await apiClient.post('/seed-demo');
    return response.data;
  }
};

export default api;
