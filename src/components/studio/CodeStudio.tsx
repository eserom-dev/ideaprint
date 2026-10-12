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
  Edit3,
  Save,
  AlertCircle,
  HelpCircle,
  Kanban,
  Columns,
  Cpu,
  Wrench,
} from 'lucide-react';
import { LiveAppPreview } from './LiveAppPreview';
import { useAuth } from '@/context/AuthContext';

export interface GeneratedFile {
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
  const { user } = useAuth();
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('src/app/page.tsx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('preview');
  const [searchFile, setSearchFile] = useState('');

  // Programming Tool / Stack selection
  const rawStack =
    (Array.isArray(project.constraints?.constraints?.stack) && project.constraints.constraints.stack.join(', ')) ||
    (Array.isArray(project.constraints?.stack) && project.constraints.stack.join(', ')) ||
    'Next.js 14 App Router + Tailwind CSS';
  const [selectedStack, setSelectedStack] = useState<string>(rawStack);
  const [customAiPrompt, setCustomAiPrompt] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [syntaxWarning, setSyntaxWarning] = useState<string | null>(null);

  // Task-specific generation target
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');

  // Load codebase from project or trigger generation
  useEffect(() => {
    const storedCodebase = project.constraints?.codebase;
    if (Array.isArray(storedCodebase) && storedCodebase.length > 0) {
      setFiles(storedCodebase);
      const initialFile =
        storedCodebase.find((f: any) => f.path.includes('page.tsx') || f.path.includes('index.html')) ||
        storedCodebase[0];
      setActiveFilePath(initialFile.path);
    } else {
      triggerCodeGeneration();
    }
  }, [project.id]);

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  useEffect(() => {
    if (activeFile) {
      setEditContent(activeFile.content);
      setIsEditing(false);
      setSaveStatus(null);
      setSyntaxWarning(null);
    }
  }, [activeFilePath, activeFile]);

  const triggerCodeGeneration = async (promptOverride?: string) => {
    setIsGenerating(true);
    setGenerationError(null);

    const targetTask =
      selectedTaskId !== 'all'
        ? (project.tasks || []).find((t: any) => t.displayId === selectedTaskId)
        : undefined;

    try {
      const res = await fetch('/api/code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          blueprint: project,
          targetTask,
          targetStack: selectedStack,
          customPrompt: promptOverride || customAiPrompt || undefined,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize codebase');
      }

      if (Array.isArray(data.files) && data.files.length > 0) {
        setFiles(data.files);
        const nextActive =
          data.files.find((f: any) => f.path.includes('page.tsx') || f.path.includes('index.html')) ||
          data.files[0];
        setActiveFilePath(nextActive.path);
        setCustomAiPrompt('');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Error communicating with AI Code Generator.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeFile) return;

    // Local syntax validation
    if (activeFile.path.endsWith('.json')) {
      try {
        JSON.parse(editContent);
      } catch (e: any) {
        setSyntaxWarning(`Invalid JSON Syntax: ${e.message}`);
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus(null);
    setSyntaxWarning(null);

    const updatedFiles = files.map((f) =>
      f.path === activeFile.path ? { ...f, content: editContent } : f
    );

    try {
      const res = await fetch('/api/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          files: updatedFiles,
          userId: user?.id,
          commitMessage: `Edited ${activeFile.path}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save file');
      }

      setFiles(updatedFiles);
      setIsEditing(false);
      setSaveStatus(`Saved (v${data.version})`);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSyntaxWarning(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyFile = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(isEditing ? editContent : activeFile.content);
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
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">Full-Stack Code Studio</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              100% Real · Live Sandbox
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans">
            AI-generated runnable codebase tailored for <strong className="text-white font-medium">{project.name}</strong>. Real interactive preview with live state.
          </p>
        </div>

        {/* View Mode Switcher & Download Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-amber-400" />
              <span>Split Screen</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'code'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-ember" />
              <span>Source Files ({files.length})</span>
            </button>
          </div>

          <button
            onClick={handleDownloadZip}
            className="px-4 py-2 rounded-xl bg-ember hover:bg-ember-hover text-xs font-mono font-bold text-zinc-950 flex items-center gap-2 shadow-glow transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded ZIP!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Programming Tool / Stack & AI Development Control Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Programming Tool / Stack Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Wrench className="w-3.5 h-3.5 text-ember" />
              <span className="font-bold uppercase text-[10px] tracking-wider text-zinc-400">Programming Stack:</span>
            </div>
            <select
              value={selectedStack}
              onChange={(e) => setSelectedStack(e.target.value)}
              className="bg-zinc-900 border border-white/15 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-ember cursor-pointer"
            >
              <option value="Next.js 14 App Router + TypeScript + Tailwind CSS">Next.js 14 (App Router) + TypeScript + Tailwind</option>
              <option value="HTML5 + Modern JavaScript (ES6) + Tailwind CSS">HTML5 + Modern JavaScript + Tailwind CSS</option>
              <option value="React 18 + Vite + Tailwind CSS">React 18 + Vite + Tailwind CSS</option>
              <option value="Full-Stack Next.js 14 + Supabase PostgreSQL">Full-Stack Next.js 14 + Supabase PostgreSQL</option>
            </select>
          </div>

          {/* Target Task Scope Selector */}
          <div className="flex items-center gap-2">
            <Kanban className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[10px] uppercase">Scope:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-ember cursor-pointer"
            >
              <option value="all">Entire Application Codebase</option>
              {(project.tasks || []).map((t: any) => (
                <option key={t.displayId} value={t.displayId}>
                  {t.displayId}: {t.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Feature Prompt & Generate Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-white/5">
          <div className="flex-1 relative">
            <Sparkles className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ember" />
            <input
              type="text"
              placeholder="Instruct AI to code or modify features: e.g. 'Build dark mode', 'Add coupon discount', 'Add product reviews'..."
              value={customAiPrompt}
              onChange={(e) => setCustomAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerCodeGeneration()}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-ember"
            />
          </div>

          <button
            onClick={() => triggerCodeGeneration()}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-glow whitespace-nowrap"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Developing Code...' : 'Develop Application with AI'}</span>
          </button>
        </div>
      </div>

      {generationError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{generationError}</span>
          </div>
          <button
            onClick={() => triggerCodeGeneration()}
            className="px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* VIEW MODE 1: Standalone Live App Preview */}
      {viewMode === 'preview' && (
        <div className="w-full">
          <LiveAppPreview
            projectName={project.name}
            projectDescription={project.description}
            entities={project.entities || []}
            endpoints={project.endpoints || []}
            requirements={project.requirements || []}
            files={files}
            selectedStack={selectedStack}
            onCodeRegenerate={(prompt) => triggerCodeGeneration(prompt)}
            isGenerating={isGenerating}
          />
        </div>
      )}

      {/* VIEW MODE 2: Split Screen (Preview Left, Code Right) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 h-[720px]">
            <LiveAppPreview
              projectName={project.name}
              projectDescription={project.description}
              entities={project.entities || []}
              endpoints={project.endpoints || []}
              requirements={project.requirements || []}
              files={files}
              selectedStack={selectedStack}
              onCodeRegenerate={(prompt) => triggerCodeGeneration(prompt)}
              isGenerating={isGenerating}
            />
          </div>

          <div className="lg:col-span-6 h-[720px] rounded-2xl bg-zinc-950 border border-white/10 flex flex-col overflow-hidden">
            {/* Split Code Header */}
            <div className="px-4 py-2.5 border-b border-white/10 bg-zinc-900 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-white truncate">
                {activeFile && getFileIcon(activeFile.path)}
                <span className="font-bold truncate">{activeFile?.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={activeFilePath}
                  onChange={(e) => setActiveFilePath(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
                >
                  {files.map((f) => (
                    <option key={f.path} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCopyFile}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  title="Copy file code"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Split Code Body */}
            <div className="flex-1 p-4 overflow-auto bg-zinc-950 font-mono text-[11px] leading-relaxed text-zinc-200">
              <pre className="whitespace-pre overflow-x-auto">
                <code>{activeFile?.content || '// Loading code...'}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: Full Source Code Viewer & Editor */}
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

              <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1 custom-scroll">
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

          {/* Right Code Viewer & Editor */}
          <div className="lg:col-span-8 rounded-2xl bg-zinc-950/90 border border-white/10 flex flex-col overflow-hidden">
            {/* File Tab Header */}
            <div className="px-5 py-3 border-b border-white/10 bg-zinc-900/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-white truncate max-w-md">
                {activeFile && getFileIcon(activeFile.path)}
                <span className="font-bold truncate">{activeFile?.path}</span>
                {saveStatus && (
                  <span className="text-emerald-400 font-bold text-[10px]">{saveStatus}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ember hover:bg-ember-hover text-zinc-950 font-bold transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={handleCopyFile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedFile ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {syntaxWarning && (
              <div className="p-2.5 bg-rose-950/80 border-b border-rose-500/30 text-rose-300 text-[11px] font-mono flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>{syntaxWarning}</span>
              </div>
            )}

            {/* Code Body */}
            {isEditing ? (
              <div className="flex-1 p-4 bg-zinc-950">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[520px] bg-zinc-900 border border-white/10 rounded-xl p-4 font-mono text-xs text-white leading-relaxed outline-none focus:border-ember"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex-1 p-5 overflow-auto max-h-[580px] bg-zinc-950 font-mono text-xs leading-relaxed text-zinc-200 selection:bg-ember selection:text-zinc-950">
                <pre className="whitespace-pre overflow-x-auto">
                  <code>{activeFile?.content || '// Loading generated code...'}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
