'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  FileJson,
  FileText,
  Database,
  Terminal,
  FolderTree,
  RotateCcw,
  Eye,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { LiveAppPreview } from './LiveAppPreview';

interface GeneratedFile {
  path: string;
  description: string;
  language: string;
  content: string;
}

interface CodeStudioProps {
  project: {
    id: string;
    name: string;
    description: string;
    constraints?: any;
    requirements?: any[];
    entities?: any[];
    endpoints?: any[];
    tasks?: any[];
  };
}

export const CodeStudio: React.FC<CodeStudioProps> = ({ project }) => {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('src/app/page.tsx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [searchFile, setSearchFile] = useState('');

  // Initial code generation from project blueprint
  useEffect(() => {
    // If project already has stored codebase in constraints, load it
    const storedCodebase = project.constraints?.codebase;
    if (Array.isArray(storedCodebase) && storedCodebase.length > 0) {
      setFiles(storedCodebase);
      setActiveFilePath(storedCodebase[0].path);
    } else {
      // Auto-trigger initial generation
      triggerCodeGeneration();
    }
  }, [project.id]);

  const triggerCodeGeneration = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing blueprint requirements & schemas...');

    try {
      setTimeout(() => setGenerationStep('Synthesizing Next.js 14 App Router layout & pages...'), 600);
      setTimeout(() => setGenerationStep('Generating PostgreSQL tables & Row Level Security DDL...'), 1200);
      setTimeout(() => setGenerationStep('Packaging package.json & environment configs...'), 1800);

      const res = await fetch('/api/code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          blueprint: project,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.files) && data.files.length > 0) {
        setFiles(data.files);
        // Persist to localStorage cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ideaprint_code_${project.id}`, JSON.stringify(data.files));
        }
      }
    } catch (err) {
      console.warn('Code generation notice:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  const handleCopyFile = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.path, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    const safeName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${safeName}-full-stack-project.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    if (path.endsWith('.sql')) return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    if (path.endsWith('.md')) return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
    return <FileCode className="w-3.5 h-3.5 text-ember" />;
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchFile.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Studio Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-sans font-bold text-white">Full-Stack Code Studio</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
              100% Turnkey Codebase
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Production-grade codebase with complete App Router pages, PostgreSQL schemas, and real interactive UI.
          </p>
        </div>

        {/* View Mode Toggle & Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle between Live Preview & Code View */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live App Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'code'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source Files ({files.length})</span>
            </button>
          </div>

          <button
            onClick={triggerCodeGeneration}
            disabled={isGenerating}
            title="Re-synthesize all files"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-white/10 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-ember ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Re-generate'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="px-4 py-2 rounded-xl bg-ember hover:bg-ember-hover text-xs font-mono font-bold text-zinc-950 flex items-center gap-2 shadow-glow transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded ZIP!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="p-4 rounded-xl bg-ember/10 border border-ember/20 flex items-center gap-3 font-mono text-xs text-ember animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <span>{generationStep || 'Building full-stack codebase files...'}</span>
        </div>
      )}

      {/* VIEW MODE 1: Interactive Live App Preview */}
      {viewMode === 'preview' && (
        <div className="min-h-[640px]">
          <LiveAppPreview
            projectName={project.name}
            projectDescription={project.description}
            entities={project.entities || []}
            endpoints={project.endpoints || []}
            requirements={project.requirements || []}
          />
        </div>
      )}

      {/* VIEW MODE 2: Full Source Code Viewer & File Tree */}
      {viewMode === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          {/* Left File Tree Explorer */}
          <div className="lg:col-span-4 rounded-2xl bg-zinc-950/80 border border-white/10 p-4 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-zinc-400">
                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                  <FolderTree className="w-4 h-4 text-ember" />
                  <span>Project File Tree</span>
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/5">
                  {files.length} files
                </span>
              </div>

              {/* Search File Filter */}
              <div className="relative mb-3">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchFile}
                  onChange={(e) => setSearchFile(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1">
                {filteredFiles.map((file) => {
                  const isSelected = file.path === activeFile?.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setActiveFilePath(file.path)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-white font-bold border border-white/15 shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getFileIcon(file.path)}
                        <span className="truncate text-[11px]">{file.path}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 uppercase ml-2 flex-shrink-0">
                        {file.language}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quickstart Instructions */}
            <div className="mt-4 pt-4 border-t border-white/10 p-3 rounded-xl bg-zinc-900/60 text-zinc-300 text-[11px] space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Terminal className="w-3.5 h-3.5 text-ember" />
                <span>Instant Run Instructions</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg font-mono text-[10px] text-emerald-400 border border-white/5 space-y-1">
                <div>$ unzip {project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip</div>
                <div>$ npm install</div>
                <div>$ npm run dev</div>
              </div>
            </div>
          </div>

          {/* Right Code Viewer & Syntax Display */}
          <div className="lg:col-span-8 rounded-2xl bg-zinc-950/90 border border-white/10 flex flex-col overflow-hidden">
            {/* File Tab Header */}
            <div className="px-5 py-3 border-b border-white/10 bg-zinc-900/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-white truncate max-w-md">
                {activeFile && getFileIcon(activeFile.path)}
                <span className="font-bold truncate">{activeFile?.path}</span>
                <span className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-zinc-400 text-[11px] hidden sm:inline truncate">
                  {activeFile?.description}
                </span>
              </div>

              <button
                onClick={handleCopyFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              >
                {copiedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body with line numbers */}
            <div className="flex-1 p-5 overflow-auto max-h-[580px] bg-zinc-950 font-mono text-xs leading-relaxed text-zinc-200 selection:bg-ember selection:text-zinc-950">
              <pre className="whitespace-pre overflow-x-auto">
                <code>{activeFile?.content || '// Loading generated code...'}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
