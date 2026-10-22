import React, { useState, useRef } from 'react';
import { 
  Play, 
  Code2, 
  UploadCloud, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Terminal, 
  FolderArchive,
  X,
  FileCheck2,
  StopCircle
} from 'lucide-react';
import { sampleCodeSnippets } from '../data/mockFindings';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_EXTENSIONS = ['.py', '.txt', '.zip'];

export default function ScanForm({ onStartScan, onUploadScan, isScanning, onCancelScan }) {
  const [sourceCode, setSourceCode] = useState(sampleCodeSnippets.sqlInjection);
  const [targetName, setTargetName] = useState('user_service.py');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [language, setLanguage] = useState('python');
  const [includeImpact, setIncludeImpact] = useState(true);
  const [includeAi, setIncludeAi] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('sqlInjection');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanProgress, setScanProgress] = useState('');
  const fileInputRef = useRef(null);

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    setUploadedFile(null);
    if (sampleCodeSnippets[presetKey]) {
      setSourceCode(sampleCodeSnippets[presetKey]);
      setTargetName(`${presetKey}_example.py`);
      setErrorMessage('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB maximum limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate extension
    const nameLower = file.name.toLowerCase();
    const isSupported = SUPPORTED_EXTENSIONS.some(ext => nameLower.endsWith(ext));
    if (!isSupported) {
      setErrorMessage(`Unsupported file format. Please upload Python (.py), text (.txt), or project archive (.zip).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFile(file);
    setTargetName(file.name);
    setSelectedPreset('custom');
    setErrorMessage('');

    // If it's a python or text file, also preview it in textarea
    if (nameLower.endsWith('.py') || nameLower.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setSourceCode(text);
        }
      };
      reader.readAsText(file);
    } else {
      setSourceCode(`# Archive selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n# Contains full repository files to extract and scan in isolated sandbox.`);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFile(null);
    setTargetName('user_service.py');
    handlePresetChange('sqlInjection');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return; // Prevent duplicate clicks

    setErrorMessage('');

    if (uploadedFile) {
      setScanProgress('Uploading project and extracting sandbox...');
      onUploadScan({
        file: uploadedFile,
        language,
        includeImpact,
        includeAiExplanation: includeAi
      });
    } else {
      if (!sourceCode.trim()) {
        setErrorMessage('Please provide source code or upload a file to begin scanning.');
        return;
      }
      setScanProgress('Analyzing AST syntax rules and Graphify call-tree...');
      onStartScan({
        sourceCode,
        targetName,
        language,
        includeImpact,
        includeAiExplanation: includeAi
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative">
      {/* Header and Preset Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span>Target Code & Archive Scanner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Static AST security analysis with Graphify relationship mapping. Code is analyzed statically and never executed.
          </p>
        </div>

        {/* Vulnerable presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Vulnerability Presets:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handlePresetChange('sqlInjection')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'sqlInjection' && !uploadedFile ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              SQL Injection
            </button>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handlePresetChange('commandInjection')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'commandInjection' && !uploadedFile ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Command Exec
            </button>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handlePresetChange('hardcodedSecret')}
              className={`px-2.5 py-1 rounded transition ${selectedPreset === 'hardcodedSecret' && !uploadedFile ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hardcoded Secret
            </button>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isScanning}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="python">Python (AST & Semgrep)</option>
            <option value="javascript" disabled>JavaScript (Roadmap)</option>
          </select>
        </div>
      </div>

      {/* Uploaded File Banner if active */}
      {uploadedFile && (
        <div className="mb-4 p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            {uploadedFile.name.endsWith('.zip') ? <FolderArchive className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
            <div>
              <span className="font-semibold">{uploadedFile.name}</span>
              <span className="text-slate-400 text-[11px] ml-2">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearUploadedFile}
            disabled={isScanning}
            className="text-slate-400 hover:text-white p-1 rounded"
            title="Remove uploaded file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor & Drop Area */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-l border-r border-slate-800 rounded-t-lg text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-slate-300">{targetName}</span>
            <span className="text-slate-600">|</span>
            <span>{sourceCode.split('\n').length} lines</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-slate-400">Max: 10 MB (.py, .txt, .zip)</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400 hover:text-cyan-300 transition text-xs">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload File or .zip</span>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".py,.txt,.zip" 
                onChange={handleFileChange} 
                disabled={isScanning}
                className="hidden" 
              />
            </label>
          </div>
        </div>

        <textarea
          value={sourceCode}
          onChange={(e) => {
            setSourceCode(e.target.value);
            setSelectedPreset('custom');
          }}
          disabled={isScanning || Boolean(uploadedFile?.name?.endsWith('.zip'))}
          placeholder="# Paste your Python code here or upload a file/archive..."
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

      {/* Progress Message */}
      {isScanning && (
        <div className="mb-4 flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>{scanProgress || 'Processing files and mapping AST connections...'}</span>
          </div>
          {onCancelScan && (
            <button
              type="button"
              onClick={onCancelScan}
              className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-[11px] transition"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel Scan</span>
            </button>
          )}
        </div>
      )}

      {/* Options and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={includeImpact}
              onChange={(e) => setIncludeImpact(e.target.checked)}
              disabled={isScanning}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Map Graphify Impact Graph
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300" title="Optional: On-demand AI triggering is also available inside each finding">
            <input
              type="checkbox"
              checked={includeAi}
              onChange={(e) => setIncludeAi(e.target.checked)}
              disabled={isScanning}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Auto-generate AI Explanations
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Scan Target</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
