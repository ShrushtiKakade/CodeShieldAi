import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CreditOptimizerModal from './components/CreditOptimizerModal';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import Findings from './pages/Findings';
import ImpactAnalysis from './pages/ImpactAnalysis';
import ScanHistory from './pages/ScanHistory';
import { mockFindings, mockImpactGraph } from './data/mockFindings';
import { checkBackendHealth, submitScan, requestAiExplanation } from './services/api';

export default function App() {
  const [findings, setFindings] = useState(mockFindings);
  const [selectedFinding, setSelectedFinding] = useState(mockFindings[0]);
  const [graphData, setGraphData] = useState(mockImpactGraph);
  const [isScanning, setIsScanning] = useState(false);
  const [isRequestingAi, setIsRequestingAi] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);

  // DigitalOcean Credit & Token Budget Tracker
  const [creditsBudget, setCreditsBudget] = useState({
    model: 'kimi-k3',
    usedTokens: 1640,
    callsMade: 6,
    maxTokens: 5000,
    autoAiEnabled: false,
    cacheEnabled: true
  });

  // Check backend health on initial load
  useEffect(() => {
    async function verifyHealth() {
      const res = await checkBackendHealth();
      setBackendStatus(res);
    }
    verifyHealth();
  }, []);

  const handleRunScan = async ({ sourceCode, language, includeImpact, includeAiExplanation }) => {
    setIsScanning(true);
    try {
      const result = await submitScan({
        sourceCode,
        language,
        includeImpact,
        includeAiExplanation,
        model: creditsBudget.model
      });

      if (result.findings && result.findings.length > 0) {
        setFindings(result.findings);
        setSelectedFinding(result.findings[0]);
      }

      if (result.impact && result.impact.nodes) {
        setGraphData(result.impact);
      }

      setLastScanResult(result);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRequestAiExplanation = async (finding) => {
    // Check token budget limit first to protect DO credits
    if (creditsBudget.usedTokens >= creditsBudget.maxTokens) {
      alert(`DigitalOcean Credit Budget Reached (${creditsBudget.maxTokens} tokens). Please increase your session budget in Settings to continue making live inference calls.`);
      return;
    }

    setIsRequestingAi(true);
    try {
      const response = await requestAiExplanation(finding, finding.codeSnippet || '', creditsBudget.model);
      
      // Update finding with returned explanation & suggested fix
      const updatedFindings = findings.map(f => {
        if (f.id === finding.id) {
          return {
            ...f,
            aiExplanation: response.explanation,
            aiFix: response.suggested_fix,
            cached: response.cached || false
          };
        }
        return f;
      });

      setFindings(updatedFindings);
      setSelectedFinding(prev => ({
        ...prev,
        aiExplanation: response.explanation,
        aiFix: response.suggested_fix,
        cached: response.cached || false
      }));

      // Increment token tracking
      if (!response.cached) {
        setCreditsBudget(prev => ({
          ...prev,
          usedTokens: prev.usedTokens + (response.tokens_used || 240),
          callsMade: prev.callsMade + 1
        }));
      }
    } catch (err) {
      console.error('AI Request failed:', err);
    } finally {
      setIsRequestingAi(false);
    }
  };

  const handleUpdateBudget = (newConfig) => {
    setCreditsBudget(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Sidebar */}
        <Sidebar
          backendStatus={backendStatus}
          onOpenOptimizer={() => setIsOptimizerOpen(true)}
          creditsBudget={creditsBudget}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            isScanning={isScanning}
            onOpenOptimizer={() => setIsOptimizerOpen(true)}
            creditsBudget={creditsBudget}
          />

          <main className="flex-1 overflow-y-auto bg-slate-950">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    findings={findings}
                    onSelectFinding={setSelectedFinding}
                    creditsBudget={creditsBudget}
                    onOpenOptimizer={() => setIsOptimizerOpen(true)}
                  />
                }
              />
              <Route
                path="/scan"
                element={
                  <NewScan
                    onRunScan={handleRunScan}
                    isScanning={isScanning}
                    lastScanResult={lastScanResult}
                    onSelectFinding={setSelectedFinding}
                  />
                }
              />
              <Route
                path="/findings"
                element={
                  <Findings
                    findings={findings}
                    selectedFinding={selectedFinding}
                    onSelectFinding={setSelectedFinding}
                    onCloseDetails={() => setSelectedFinding(null)}
                    onRequestAiExplanation={handleRequestAiExplanation}
                    isRequestingAi={isRequestingAi}
                    creditsBudget={creditsBudget}
                  />
                }
              />
              <Route
                path="/impact"
                element={
                  <ImpactAnalysis
                    graphData={graphData}
                    onSelectFinding={setSelectedFinding}
                  />
                }
              />
              <Route
                path="/history"
                element={<ScanHistory />}
              />
            </Routes>
          </main>
        </div>

        {/* Credit Optimizer & DO Inference Modal */}
        <CreditOptimizerModal
          isOpen={isOptimizerOpen}
          onClose={() => setIsOptimizerOpen(false)}
          creditsBudget={creditsBudget}
          onUpdateBudget={handleUpdateBudget}
        />
      </div>
    </BrowserRouter>
  );
}
