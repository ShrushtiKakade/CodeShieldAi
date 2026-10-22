import React, { useState } from 'react';
import { 
  Play, 
  Code2, 
  UploadCloud, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Copy,
  Terminal,
  Zap
} from 'lucide-react';
import { sampleCodeSnippets } from '../data/mockFindings';

export default function ScanForm({ onStartScan, isScanning }) {
  const [sourceCode, setSourceCode] = useState(sampleCodeSnippets.sqlInjection);
  const [language, setLanguage] = useState('python');
  const [includeImpact, setIncludeImpact] = useState(true);
  const [includeAi, setIncludeAi] = useState(false); // Default false for DO credit preservation!
  const [selectedPreset, setSelectedPreset] = useState('sqlInjection');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    if (sampleCodeSnippets[presetKey]) {
      setSourceCode(sampleCodeSnippets[presetKey]);
      setErrorMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.py') && !file.name.endsWith('.txt')) {
      setErrorMessage('Currently, only Python (.py) files are supported for AST scanning.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setSourceCode(content);
        setSelectedPreset('custom');
        setErrorMessage('');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      setErrorMessage('Please provide source code or upload a file to begin scanning.');
      return;
    }
    setErrorMessage('');
    onStartScan({
      sourceCode,
      language,
      includeImpact,
      includeAiExplanation: includeAi
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Security & Impact Code Scanner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyze AST patterns for vulnerabilities, trace Graphify call paths, and ground explanations.
          </p>
        </div>

        {/* Presets & Language selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Load Vulnerable Pattern:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handlePresetChange('sqlInjection')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'sqlInjection' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              SQL Injection
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('commandInjection')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'commandInjection' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Command Exec
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('hardcodedSecret')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'hardcodedSecret' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hardcoded Secret
            </button>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="python">Python 3.x</option>
            <option value="javascript" disabled>JavaScript (Upcoming)</option>
            <option value="go" disabled>Go (Upcoming)</option>
          </select>
        </div>
      </div>

      {/* Editor & File Drop Area */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-l border-r border-slate-800 rounded-t-lg text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-slate-300">target_source.py</span>
            <span className="text-slate-600">|</span>
            <span>{sourceCode.split('\n').length} lines</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400 hover:text-cyan-300 transition text-xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File (.py)</span>
            <input 
              type="file" 
              accept=".py,.txt" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>

        <textarea
          value={sourceCode}
          onChange={(e) => {
            setSourceCode(e.target.value);
            setSelectedPreset('custom');
          }}
          placeholder="# Paste your Python code here..."
          rows={12}
          className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-4 rounded-b-lg border border-slate-800 focus:outline-none focus:border-cyan-500/80 resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Analysis Options and Credit Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Graphify toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={includeImpact}
              onChange={(e) => setIncludeImpact(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Build Graphify Impact Graph
            </span>
          </label>

          {/* AI Explanation toggle with credit badge */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300" title="Uses DigitalOcean Inference credits. Recommended: keep off for bulk scan, trigger manually on finding">
            <input
              type="checkbox"
              checked={includeAi}
              onChange={(e) => setIncludeAi(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Auto-generate DO AI Explanations
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Uses DO Credits
            </span>
          </label>
        </div>

        {/* Scan Button */}
        <button
          type="submit"
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning Code...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Scan Code</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

