import React, { useState, useEffect, useRef } from 'react';
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
import { 
  checkBackendHealth, 
  submitScan, 
  uploadAndScan, 
  fetchScanById, 
  requestAiExplanation 
} from './services/api';

export default function App() {
  const [findings, setFindings] = useState(mockFindings);
  const [selectedFinding, setSelectedFinding] = useState(mockFindings[0]);
  const [graphData, setGraphData] = useState(mockImpactGraph);
  const [isScanning, setIsScanning] = useState(false);
  const [isRequestingAi, setIsRequestingAi] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isLiveScan, setIsLiveScan] = useState(false);
  const [targetProject, setTargetProject] = useState('user_service.py');
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const abortControllerRef = useRef(null);

  // Kimi AI & Token Budget Tracker
  const [creditsBudget, setCreditsBudget] = useState({
    model: 'kimi-k3',
    usedTokens: 1420,
    callsMade: 5,
    maxTokens: 5000,
    autoAiEnabled: false,
    cacheEnabled: true
  });

  // Verify backend health on initial load
  useEffect(() => {
    async function verifyHealth() {
      const res = await checkBackendHealth();
      setBackendStatus(res);
      if (res.models?.digitalocean) {
        setCreditsBudget(prev => ({
          ...prev,
          model: res.ai_provider === 'kimi_direct' ? res.models.kimi_direct : res.models.digitalocean
        }));
      }
    }
    verifyHealth();
  }, []);

  const handleRunScan = async ({ sourceCode, targetName, language, includeImpact, includeAiExplanation }) => {
    setIsScanning(true);
    abortControllerRef.current = new AbortController();

    try {
      const result = await submitScan({
        sourceCode,
        targetName: targetName || 'target_source.py',
        language,
        includeImpact,
        includeAiExplanation,
        model: creditsBudget.model
      });

      applyScanResult(result, targetName || 'target_source.py');
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUploadScan = async ({ file, language, includeImpact, includeAiExplanation }) => {
    setIsScanning(true);
    abortControllerRef.current = new AbortController();

    try {
      const result = await uploadAndScan({
        file,
        language,
        includeImpact,
        includeAiExplanation,
        model: creditsBudget.model,
        abortSignal: abortControllerRef.current.signal
      });

      applyScanResult(result, file.name);
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert(`Upload scan failed: ${err.message}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
  };

  const applyScanResult = (result, name) => {
    if (result.findings && result.findings.length > 0) {
      setFindings(result.findings);
      setSelectedFinding(result.findings[0]);
    } else {
      setFindings([]);
      setSelectedFinding(null);
    }

    if (result.impact && result.impact.nodes) {
      setGraphData(result.impact);
    }

    setLastScanResult(result);
    setIsLiveScan(!result.isDemo);
    setTargetProject(name);
  };

  const handleOpenScan = async (scanId) => {
    try {
      const scan = await fetchScanById(scanId);
      if (scan) {
        applyScanResult(scan, scan.target_name || scan.target || scanId);
      }
    } catch (err) {
      console.error('Failed to reopen scan:', err);
    }
  };

  const handleRequestAiExplanation = async (finding) => {
    if (creditsBudget.usedTokens >= creditsBudget.maxTokens) {
      alert(`Token budget reached (${creditsBudget.maxTokens} tokens). Please increase your session budget in Settings.`);
      return;
    }

    setIsRequestingAi(true);
    try {
      const response = await requestAiExplanation(
        finding, 
        finding.codeSnippet || '', 
        finding.impactNodes || [], 
        creditsBudget.model
      );
      
      const updatedFindings = findings.map(f => {
        if (f.id === finding.id) {
          return {
            ...f,
            aiExplanation: response.risk,
            risk: response.risk,
            aiFix: response.suggested_fix,
            recommendedTests: response.recommended_tests,
            uncertainty_notes: response.uncertainty_notes,
            cached: response.cached || false,
            aiProvider: response.provider
          };
        }
        return f;
      });

      setFindings(updatedFindings);
      setSelectedFinding(prev => ({
        ...prev,
        aiExplanation: response.risk,
        risk: response.risk,
        aiFix: response.suggested_fix,
        recommendedTests: response.recommended_tests,
        uncertainty_notes: response.uncertainty_notes,
        cached: response.cached || false,
        aiProvider: response.provider
      }));

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
            currentProject={targetProject}
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
                    isLiveScan={isLiveScan}
                    targetProject={targetProject}
                  />
                }
              />
              <Route
                path="/scan"
                element={
                  <NewScan
                    onRunScan={handleRunScan}
                    onUploadScan={handleUploadScan}
                    isScanning={isScanning}
                    lastScanResult={lastScanResult}
                    onSelectFinding={setSelectedFinding}
                    onCancelScan={handleCancelScan}
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
                element={<ScanHistory onOpenScan={handleOpenScan} />}
              />
            </Routes>
          </main>
        </div>

        {/* Credit Optimizer & Model Settings Modal */}
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
