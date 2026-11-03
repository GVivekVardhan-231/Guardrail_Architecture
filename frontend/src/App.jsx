import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import LiveAnalyzer from './pages/LiveAnalyzer';
import Playground from './pages/Playground';
import SecurityEvents from './pages/SecurityEvents';
import AttackSimulator from './pages/AttackSimulator';
import ModelPerformance from './pages/ModelPerformance';
import ArchitectureView from './pages/ArchitectureView';
import SystemHealth from './pages/SystemHealth';
import Settings from './pages/Settings';
import FrameworkSDK from './pages/FrameworkSDK';

export function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [selectedPromptForAnalysis, setSelectedPromptForAnalysis] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    // Simple state trigger
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0d14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Operational Bar */}
        <Topbar
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
          activeTab={activeTab}
        />

        {/* Tab Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'analyzer' && (
            <LiveAnalyzer initialPrompt={selectedPromptForAnalysis} />
          )}

          {activeTab === 'playground' && <Playground />}

          {activeTab === 'framework' && <FrameworkSDK />}

          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              setSelectedPromptForAnalysis={setSelectedPromptForAnalysis}
            />
          )}

          {activeTab === 'events' && (
            <SecurityEvents
              setActiveTab={setActiveTab}
              setSelectedPromptForAnalysis={setSelectedPromptForAnalysis}
            />
          )}

          {activeTab === 'simulator' && (
            <AttackSimulator
              setActiveTab={setActiveTab}
              setSelectedPromptForAnalysis={setSelectedPromptForAnalysis}
            />
          )}

          {activeTab === 'performance' && <ModelPerformance />}

          {activeTab === 'architecture' && <ArchitectureView />}

          {activeTab === 'health' && <SystemHealth />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
