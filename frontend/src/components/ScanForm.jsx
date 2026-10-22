import React, { useState, useRef, useEffect } from 'react';
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
  StopCircle,
  GitBranch,
  Search,
  ExternalLink,
  Lock,
  Globe,
  KeyRound
} from 'lucide-react';
import { sampleCodeSnippets } from '../data/mockFindings';
import { fetchGithubRepos } from '../services/api';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_EXTENSIONS = ['.py', '.txt', '.zip'];

export default function ScanForm({ 
  onStartScan, 
  onUploadScan, 
  onGithubScan,
  isScanning, 
  onCancelScan 
}) {
  const [submissionMode, setSubmissionMode] = useState('github'); // 'github' | 'zip' | 'code'
  
  // GitHub Tab State
  const [githubUrl, setGithubUrl] = useState('https://github.com/ShrushtiKakade/CodeShieldAi');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  // Upload ZIP Tab State
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Direct Code Tab State
  const [sourceCode, setSourceCode] = useState(sampleCodeSnippets.sqlInjection);
  const [targetName, setTargetName] = useState('user_service.py');
  const [selectedPreset, setSelectedPreset] = useState('sqlInjection');

  // Shared Options
  const [language, setLanguage] = useState('python');
  const [includeImpact, setIncludeImpact] = useState(true);
  const [includeAi, setIncludeAi] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load GitHub repos on mount
  useEffect(() => {
    async function loadRepos() {
      setIsLoadingRepos(true);
      try {
        const repos = await fetchGithubRepos(githubToken);
        setGithubRepos(repos);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingRepos(false);
      }
    }
    loadRepos();
  }, [githubToken]);

  const handleSelectRepo = (repo) => {
    setGithubUrl(repo.html_url);
    setGithubBranch(repo.default_branch || 'main');
    setErrorMessage('');
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    if (sampleCodeSnippets[presetKey]) {
      setSourceCode(sampleCodeSnippets[presetKey]);
      setTargetName(`${presetKey}_example.py`);
      setErrorMessage('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB maximum limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const nameLower = file.name.toLowerCase();
    const isSupported = SUPPORTED_EXTENSIONS.some(ext => nameLower.endsWith(ext));
    if (!isSupported) {
      setErrorMessage(`Unsupported format. Please upload Python (.py), text (.txt), or project archive (.zip).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFile(file);
    setErrorMessage('');
  };

  const handleClearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return; // Prevent duplicate clicks
    setErrorMessage('');

    if (submissionMode === 'github') {
      const cleanUrl = githubUrl.trim();
      const githubPattern = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git|\/)?$/i;
      if (!githubPattern.test(cleanUrl)) {
        setErrorMessage("Please enter a valid GitHub repository URL, e.g. https://github.com/owner/repository");
        return;
      }
      onGithubScan({
        repoUrl: cleanUrl,
        branch: githubBranch.trim() || 'main',
        githubToken: githubToken.trim(),
        includeImpact,
        includeAiExplanation: includeAi
      });
    } else if (submissionMode === 'zip') {
      if (!uploadedFile) {
        setErrorMessage("Please select a .zip archive or project file to scan.");
        return;
      }
      onUploadScan({
        file: uploadedFile,
        language,
        includeImpact,
        includeAiExplanation: includeAi
      });
    } else {
      if (!sourceCode.trim()) {
        setErrorMessage("Please provide Python source code to scan.");
        return;
      }
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
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 3 Submission Options Navigation */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Submit Project for Security & Impact Scan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your preferred submission method: connect GitHub directly, upload a ZIP, or paste code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Language:</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
              Python 3.x
            </span>
          </div>
        </div>

        {/* Big Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <button
            type="button"
            onClick={() => { setSubmissionMode('github'); setErrorMessage(''); }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
              submissionMode === 'github'
                ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0 mt-0.5">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Connect GitHub</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">Recommended</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Import from GitHub URL or user repository
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setSubmissionMode('zip'); setErrorMessage(''); }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
              submissionMode === 'zip'
                ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 shrink-0 mt-0.5">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">Upload ZIP Archive</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload compressed project archive (max 10 MB)
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setSubmissionMode('code'); setErrorMessage(''); }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
              submissionMode === 'code'
                ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">Paste Code / Presets</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Test vulnerability templates in sandbox
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Mode 1: Connect GitHub Content */}
      {submissionMode === 'github' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5 animate-fade-in text-xs">
          <div>
            <span className="font-semibold text-slate-200 text-xs block mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public or Private GitHub Repository URL</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-3 relative">
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  disabled={isScanning}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="branch (main)"
                    disabled={isScanning}
                    className="w-full bg-transparent focus:outline-none font-mono text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Repository Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-semibold text-slate-400">
                Quick Select Repository:
              </span>
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>{showTokenInput ? 'Hide GitHub Token' : 'Add Token for Private Repos'}</span>
              </button>
            </div>

            {showTokenInput && (
              <div className="mb-3 p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400">GitHub Personal Access Token (Never committed or saved):</span>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  disabled={isScanning}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded text-xs font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {githubRepos.map((repo, idx) => {
                const isSelected = githubUrl.toLowerCase() === repo.html_url?.toLowerCase();
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectRepo(repo)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 font-mono text-xs">{repo.full_name || repo.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">branch: {repo.default_branch}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{repo.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Upload ZIP Content */}
      {submissionMode === 'zip' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 text-center space-y-4 animate-fade-in text-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Upload Project Archive (.zip)</h3>
              <p className="text-slate-400 text-xs mt-1">
                Upload your compressed project repository. CodeShield AI extracts files safely in a sandboxed temporary directory with Zip Slip protection.
              </p>
            </div>

            {uploadedFile ? (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5">
                  <FolderArchive className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">{uploadedFile.name}</div>
                    <div className="text-slate-500 text-[10px]">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearUploadedFile}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-lg shadow-purple-600/25">
                <UploadCloud className="w-4 h-4" />
                <span>Choose .zip or .py File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.py,.txt"
                  onChange={handleFileChange}
                  disabled={isScanning}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-[10px] text-slate-500">Max archive size: 10 MB · Uncompressed limits: 50 files</p>
          </div>
        </div>
      )}

      {/* Mode 3: Direct Code / Presets Content */}
      {submissionMode === 'code' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Vulnerability Presets:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handlePresetChange('sqlInjection')}
                className={`px-2.5 py-1 rounded transition ${selectedPreset === 'sqlInjection' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'}`}
              >
                SQL Injection
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('commandInjection')}
                className={`px-2.5 py-1 rounded transition ${selectedPreset === 'commandInjection' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'}`}
              >
                Command Exec
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('hardcodedSecret')}
                className={`px-2.5 py-1 rounded transition ${selectedPreset === 'hardcodedSecret' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'}`}
              >
                Hardcoded Secret
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value);
                setSelectedPreset('custom');
              }}
              rows={11}
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/80 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Scan Options and Launch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
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
              Build Graphify Impact Graph
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
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

        <div className="flex items-center gap-2">
          {isScanning && onCancelScan && (
            <button
              type="button"
              onClick={onCancelScan}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isScanning}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                  {submissionMode === 'github' ? 'Cloning & Scanning Repo...' :
                   submissionMode === 'zip' ? 'Extracting & Scanning Archive...' :
                   'Scanning Code...'}
                </span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {submissionMode === 'github' ? 'Import & Scan Repository' :
                   submissionMode === 'zip' ? 'Extract & Scan Archive' :
                   'Scan Target Code'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
