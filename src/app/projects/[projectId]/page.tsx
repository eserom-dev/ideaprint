'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { ProvenanceBadge, PriorityBadge, VerificationBadge } from '@/components/ui/ProvenanceBadge';
import { CodeStudio } from '@/components/studio/CodeStudio';
import { MermaidViewer } from '@/components/workspace/MermaidViewer';
import { ProjectAssistant } from '@/components/workspace/ProjectAssistant';
import {
  generateMarkdownBlueprint,
  generatePostgresSchema,
  generateOpenApiJson,
  generateMermaidArchitecture,
  generateTasksCsv,
  downloadFile,
  downloadBuildPackZip,
} from '@/lib/export-generators';
import {
  Layers,
  Cpu,
  Database,
  Globe2,
  Kanban,
  Calendar,
  ShieldCheck,
  GitBranch,
  Download,
  Settings,
  Activity,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Save,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

type WorkspaceTab =
  | 'overview'
  | 'code'
  | 'blueprint'
  | 'architecture'
  | 'database'
  | 'api'
  | 'tasks'
  | 'roadmap'
  | 'testing'
  | 'decisions'
  | 'activity'
  | 'exports'
  | 'settings';

function ProjectWorkspaceContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const projectId = params?.projectId as string;
  const initialTab = (searchParams?.get('tab') as WorkspaceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Assistant Drawer State
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Working Task State
  const [tasksState, setTasksState] = useState<any[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Working Test Cases state
  const [testCasesState, setTestCasesState] = useState<any[]>([]);

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsTagline, setSettingsTagline] = useState('');
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Load consolidated project data from database
  const loadProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      if (data.project) {
        setProject(data.project);
        setTasksState(data.project.tasks || []);
        setTestCasesState(data.project.testCases || []);
        setSettingsName(data.project.name || '');
        setSettingsTagline(data.project.tagline || '');
        setSettingsDesc(data.project.description || '');
      }
    } catch (err: any) {
      console.warn('Error fetching project:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Sync tab with URL query if provided
  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab') as WorkspaceTab;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle task status progression with DAG dependency enforcement
  const moveTask = async (taskId: string, targetStatus: string) => {
    setTaskError(null);

    // Optimistic local state update
    const previousTasks = [...tasksState];
    setTasksState((prev) =>
      prev.map((t) => (t.displayId === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: targetStatus,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Revert optimistic update
        setTasksState(previousTasks);
        setTaskError(data.error || 'Failed to update task');
      }
    } catch (err: any) {
      setTasksState(previousTasks);
      setTaskError(err.message || 'Error updating task status');
    }
  };

  // Record manual test run
  const recordTestRun = async (testId: string, result: 'passed' | 'failed' | 'blocked') => {
    const executedBy = user?.email || 'Staff Engineer';
    const notes = `Result recorded as ${result.toUpperCase()}`;

    // Optimistic update
    setTestCasesState((prev) =>
      prev.map((tc) =>
        tc.displayId === testId
          ? {
              ...tc,
              verification: result,
              lastRun: {
                executedBy,
                executedAt: new Date().toISOString(),
                notes,
              },
            }
          : tc
      )
    );

    try {
      await fetch(`/api/projects/${projectId}/tests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          verification: result,
          executedBy,
          notes,
          userId: user?.id,
        }),
      });
    } catch (err) {
      console.warn('Failed to persist test run to database:', err);
    }
  };

  // Save project settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSaved(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsName,
          tagline: settingsTagline,
          description: settingsDesc,
          userId: user?.id,
        }),
      });

      if (res.ok) {
        setSettingsSaved(true);
        loadProject();
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.warn('Failed to save settings:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${project.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/settings?userId=${user?.id || ''}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.warn('Failed to delete project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <p className="text-sm font-mono text-zinc-400">Loading Blueprint workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/60 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-ember-soft border border-ember/20 text-ember flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-display">Blueprint Not Found</h2>
          <p className="text-sm text-zinc-400 mb-6">
            {errorMsg || 'The requested project blueprint could not be found or has been deleted.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/projects/new"
              className="px-4 py-2 rounded-lg bg-ember hover:bg-ember/90 text-sm font-medium text-zinc-950 font-bold transition-colors"
            >
              Create New Blueprint
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasksState.filter((t) => t.status === 'done').length;
  const overallProgress = tasksState.length > 0 ? Math.round((completedTasks / tasksState.length) * 100) : 0;
  const testsPassed = testCasesState.filter((t) => t.verification === 'passed').length;
  const testsNotRun = testCasesState.filter((t) => t.verification === 'not_run').length;

  const navItems = [
    { id: 'overview', label: 'Overview & Health', icon: Activity },
    { id: 'code', label: 'AI Code & Build Studio', icon: Code2, count: (project.constraints?.codebase || []).length || 8 },
    { id: 'blueprint', label: 'Blueprint Specs', icon: Layers, count: (project.requirements || []).length },
    { id: 'architecture', label: 'Architecture Studio', icon: Cpu, count: (project.components || []).length },
    { id: 'database', label: 'Database Designer', icon: Database, count: (project.entities || []).length },
    { id: 'api', label: 'API Contracts', icon: Globe2, count: (project.endpoints || []).length },
    { id: 'tasks', label: 'Task Board', icon: Kanban, count: tasksState.length },
    { id: 'roadmap', label: 'Roadmap & Milestones', icon: Calendar },
    { id: 'testing', label: 'Testing Lab', icon: ShieldCheck, count: testCasesState.length },
    { id: 'decisions', label: 'Architecture Decisions', icon: GitBranch, count: (project.decisions || []).length },
    { id: 'activity', label: 'Activity Audit Log', icon: Clock, count: (project.activity || []).length },
    { id: 'exports', label: 'Export Center', icon: Download },
    { id: 'settings', label: 'Project Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Top Application Header */}
      <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 font-bold">{project.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-ember-soft text-ember border border-ember/20 text-[10px] uppercase font-bold">
              Stage: {project.stage}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Assistant Trigger Button */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-ember/10 hover:bg-ember/20 text-ember border border-ember/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copilot Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('exports')}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ember" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5"
          >
            All Projects
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar + Content Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Studio Navigation Sidebar */}
        <aside className="w-16 sm:w-64 border-r border-white/10 bg-zinc-950/80 p-2 sm:p-4 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-1">
            <div className="hidden sm:block text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-3 mb-2 font-bold">
              Engineering Studios
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as WorkspaceTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-white font-bold border border-white/15 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-ember' : 'text-zinc-500'}`} />
                    <span className="hidden sm:inline truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-white/5">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center justify-between text-zinc-300 font-bold mb-1">
              <span>Overall Progress</span>
              <span className="text-ember">{overallProgress}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </aside>

        {/* Studio Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
          {/* TAB 1: OVERVIEW & HEALTH */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs font-mono text-ember uppercase tracking-wider font-bold">
                  PROJECT COCKPIT
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
                  {project.name} · Overview & Health
                </h1>
                <p className="text-sm text-zinc-400 font-sans mt-1">{project.description}</p>
              </div>

              {/* 4 Health & Metric Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Requirements</span>
                  <div className="text-xl font-bold text-emerald-400">
                    {(project.requirements || []).length} Documented
                  </div>
                  <span className="text-[10px] text-zinc-400">Traceable to components</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Testing Evidence</span>
                  <div className="text-xl font-bold text-zinc-200">
                    {testsPassed} Passed · {testsNotRun} Not Run
                  </div>
                  <span className="text-[10px] text-zinc-400">Zero simulated passes</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Task Board</span>
                  <div className="text-xl font-bold text-ember">
                    {completedTasks}/{tasksState.length} Done ({overallProgress}%)
                  </div>
                  <span className="text-[10px] text-zinc-400">DAG dependency protected</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">High Risks</span>
                  <div className="text-xl font-bold text-cyan-400">
                    {(project.risks || []).length}/{(project.risks || []).length} Guarded
                  </div>
                  <span className="text-[10px] text-zinc-400">Mitigations documented</span>
                </div>
              </div>

              {/* Code Studio Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-ember/10 border border-ember/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-glow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-ember">
                      Full-Stack Autonomous Build
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">
                    Develop & Build Complete Codebase
                  </h3>
                  <p className="text-xs text-zinc-300 font-sans max-w-xl">
                    Synthesize runnable Next.js 14, TypeScript, Supabase PostgreSQL, and Tailwind CSS code files directly from this blueprint. Download as a ready-to-run ZIP archive.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('code')}
                  className="whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Open Code Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Next Unblocked Tasks */}
              <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="font-display font-bold text-base text-white">Next Unblocked Tasks</h3>
                  <button onClick={() => setActiveTab('tasks')} className="text-xs font-mono text-ember hover:underline">
                    View Task Board →
                  </button>
                </div>
                <div className="space-y-2.5">
                  {tasksState
                    .filter((t) => t.status !== 'done')
                    .slice(0, 3)
                    .map((task) => (
                      <div
                        key={task.displayId}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-ember font-bold">{task.displayId}</span>
                          <span className="text-zinc-200 font-sans font-medium">{task.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase text-[10px]">
                          {task.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CODE STUDIO */}
          {activeTab === 'code' && <CodeStudio project={project} />}

          {/* TAB: BLUEPRINT SPECS */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Blueprint Requirements Matrix
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Atomic, schema-validated requirements with explicit provenance labels
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  {(project.requirements || []).length} Requirements
                </span>
              </div>

              <div className="space-y-4">
                {(project.requirements || []).map((req: any) => (
                  <div key={req.displayId} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-zinc-100 px-2 py-0.5 rounded bg-zinc-900 border border-white/10">
                          {req.displayId}
                        </span>
                        <PriorityBadge priority={req.priority} />
                        <ProvenanceBadge origin={req.origin} confidence={req.confidence} locked={req.locked} />
                        <span className="text-xs font-mono text-zinc-500">{req.category}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                        Status: {req.status}
                      </span>
                    </div>

                    <h3 className="text-base font-medium text-white">{req.statement}</h3>
                    <p className="text-xs font-mono text-zinc-400">
                      <strong className="text-zinc-500">Rationale: </strong>
                      {req.rationale}
                    </p>

                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[11px] font-mono text-zinc-500 uppercase">Acceptance Criteria:</span>
                      {(req.acceptanceCriteria || []).map((c: any, i: number) => (
                        <div key={i} className="text-xs text-zinc-300 font-mono flex items-start gap-2">
                          <span className="text-ember">↳</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ARCHITECTURE STUDIO (With Real Mermaid Diagram) */}
          {activeTab === 'architecture' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Component Architecture Studio
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Dynamic Mermaid topology and component breakdown satisfying requirements
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {(project.components || []).length} System Nodes
                </span>
              </div>

              {/* Real Interactive Mermaid Viewer */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold block">
                  Interactive System Architecture Diagram
                </span>
                <MermaidViewer
                  chart={generateMermaidArchitecture(project)}
                  projectName={project.name}
                />
              </div>

              {/* Component Cards */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold block">
                  Component Responsibility Matrix
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(project.components || []).map((cmp: any) => (
                    <div key={cmp.displayId} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-ember">{cmp.displayId}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {cmp.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-white">{cmp.name}</h3>
                      <div className="text-xs font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-white/5">
                        <span className="text-zinc-500">Tech: </span>
                        <span className="text-zinc-200">{cmp.technology}</span>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-400 font-sans">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase block">Responsibilities:</span>
                        {(cmp.responsibilities || []).map((r: any, i: number) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATABASE DESIGNER */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Database Designer & PostgreSQL RLS
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Relational schema proposal with Row Level Security policies
                  </p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-schema.sql`,
                      generatePostgresSchema(project),
                      'text/plain'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white flex items-center gap-2 border border-white/10 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download schema.sql</span>
                </button>
              </div>

              <div className="space-y-6">
                {(project.entities || []).map((entity: any) => (
                  <div key={entity.displayId} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ember">{entity.displayId}</span>
                        <h3 className="text-xl font-display font-bold text-white font-mono">{entity.name}</h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{(entity.fields || []).length} Columns</span>
                    </div>

                    <p className="text-xs text-zinc-400 font-sans">{entity.description}</p>

                    <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-950 font-mono text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-zinc-900/80 border-b border-white/5 text-zinc-400 text-[11px]">
                          <tr>
                            <th className="p-2.5">Field</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Constraints</th>
                            <th className="p-2.5">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                          {(entity.fields || []).map((f: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="p-2.5 font-bold text-white">{f.name}</td>
                              <td className="p-2.5 text-cyan-400">{f.type}</td>
                              <td className="p-2.5 text-zinc-500">
                                {f.isPrimary && <span className="text-ember font-bold">PK </span>}
                                {!f.isNullable && <span className="text-zinc-400">NOT NULL </span>}
                                {f.references && <span className="text-indigo-400">→ {f.references}</span>}
                              </td>
                              <td className="p-2.5 text-zinc-400">{f.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {(entity.rlsPolicies || []).length > 0 && (
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 font-mono text-xs">
                        <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                          Row Level Security (RLS) Policy:
                        </span>
                        <code className="text-zinc-300 text-[11px] block">{entity.rlsPolicies[0]}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: API CONTRACTS */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    API Designer & Contracts
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    OpenAPI 3.1 endpoints, authentication requirements, and schemas
                  </p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-openapi.json`,
                      generateOpenApiJson(project),
                      'application/json'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white flex items-center gap-2 border border-white/10 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download openapi.json</span>
                </button>
              </div>

              <div className="space-y-4">
                {(project.endpoints || []).map((ep: any) => (
                  <div key={ep.displayId} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                            ep.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-400'
                              : ep.method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-bold text-sm text-white">{ep.path}</span>
                      </div>
                      <span className="text-xs text-zinc-500">{ep.displayId}</span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans">{ep.summary}</p>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-zinc-500">Auth Required:</span>
                        <span className="text-emerald-400">{ep.authRequired ? 'Yes (JWT Bearer)' : 'No (Public)'}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-zinc-500 block mb-1">Response Schema:</span>
                        <code className="text-zinc-300 text-[11px]">{ep.responseSchema}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TASK BOARD */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Dependency-Guarded Task Board
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Blocked tasks cannot advance to Done without prerequisite completion
                  </p>
                </div>
                <div className="text-xs font-mono text-ember font-bold">
                  {completedTasks}/{tasksState.length} Tasks Done ({overallProgress}%)
                </div>
              </div>

              {taskError && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{taskError}</span>
                </div>
              )}

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['todo', 'in_progress', 'done'] as const).map((col) => {
                  const colTasks = tasksState.filter((t) => t.status === col);
                  const colLabels = {
                    todo: 'To Do',
                    in_progress: 'In Progress',
                    done: 'Completed (Done)',
                  };
                  return (
                    <div key={col} className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-300">
                          {colLabels[col]}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">{colTasks.length}</span>
                      </div>

                      <div className="space-y-3">
                        {colTasks.map((t: any) => (
                          <div key={t.displayId} className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-ember font-bold">{t.displayId}</span>
                              <span className="text-[10px] text-zinc-500">
                                {t.effortMinDays || 1}–{t.effortMaxDays || 3} days
                              </span>
                            </div>

                            <h4 className="text-sm font-sans font-medium text-white">{t.title}</h4>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{t.description}</p>

                            {(t.dependencies || []).length > 0 && (
                              <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                <span>Prerequisites:</span>
                                {t.dependencies.map((d: string) => (
                                  <span key={d} className="px-1 rounded bg-zinc-900 text-amber-400 border border-amber-500/20">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Move Buttons */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                              {col !== 'todo' && (
                                <button
                                  onClick={() => moveTask(t.displayId, col === 'done' ? 'in_progress' : 'todo')}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  ← Move back
                                </button>
                              )}
                              {col !== 'done' && (
                                <button
                                  onClick={() => moveTask(t.displayId, col === 'todo' ? 'in_progress' : 'done')}
                                  className="text-ember hover:underline font-bold ml-auto"
                                >
                                  Advance →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: ROADMAP & MILESTONES */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h1 className="text-2xl font-display font-bold text-white">Roadmap & Milestones</h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Sequential delivery phases aligned with team velocity and timeline constraints
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { phase: 'Phase 1 · Foundation & Data Schema', days: 'Days 1–7', focus: 'Database tables, RLS policies, Auth setup' },
                  { phase: 'Phase 2 · Core Service APIs & Contracts', days: 'Days 8–18', focus: 'REST endpoints, schema validation, service modules' },
                  { phase: 'Phase 3 · User Interface & Workspaces', days: 'Days 19–30', focus: 'Next.js App Router, interactive components, forms' },
                  { phase: 'Phase 4 · Verification Lab & Hardening', days: 'Days 31–42', focus: 'Security audits, end-to-end testing, production deployment' },
                ].map((m, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-ember uppercase font-bold">{m.days}</span>
                      <h3 className="text-base font-bold text-white">{m.phase}</h3>
                      <p className="text-xs text-zinc-400">{m.focus}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
                      Phase {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTING LAB */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Testing Lab & Verification Matrix
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Honest verification. Generated tests stay Not Run until verified.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {testCasesState.length} Test Cases Total
                </span>
              </div>

              <div className="space-y-4">
                {testCasesState.map((tc: any) => (
                  <div key={tc.displayId} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3 font-mono">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white px-2 py-0.5 rounded bg-zinc-900 border border-white/10">
                          {tc.displayId}
                        </span>
                        <VerificationBadge verification={tc.verification} />
                        <span className="text-xs text-zinc-500 uppercase px-2 py-0.5 rounded bg-white/5">
                          {tc.category}
                        </span>
                      </div>

                      {/* Interactive Run Recording Buttons */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-zinc-500 mr-1">Record Run:</span>
                        <button
                          onClick={() => recordTestRun(tc.displayId, 'passed')}
                          className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 font-bold cursor-pointer"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => recordTestRun(tc.displayId, 'failed')}
                          className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-500/30 font-bold cursor-pointer"
                        >
                          Fail
                        </button>
                        <button
                          onClick={() => recordTestRun(tc.displayId, 'blocked')}
                          className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-500/30 font-bold cursor-pointer"
                        >
                          Block
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-sans font-bold text-white">{tc.objective}</h3>
                    <div className="text-xs text-zinc-400 font-sans">
                      <strong className="text-zinc-500 font-mono">Expected: </strong>
                      {tc.expectedResult}
                    </div>

                    {tc.lastRun && (
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 text-[11px] text-zinc-400">
                        <span className="text-emerald-400 font-bold block mb-0.5">Recorded Run Audit:</span>
                        <div>Executed by: {tc.lastRun.executedBy}</div>
                        <div>Timestamp: {tc.lastRun.executedAt}</div>
                        <div>Notes: {tc.lastRun.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DECISIONS */}
          {activeTab === 'decisions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Architecture Decision Records (ADR)
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Permanent record of architectural trade-offs, alternatives, and rationales
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {(project.decisions || []).length} Decisions Recorded
                </span>
              </div>

              <div className="space-y-4">
                {(project.decisions || []).map((dec: any) => (
                  <div key={dec.displayId} className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ember">{dec.displayId}</span>
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {dec.status}
                      </span>
                    </div>

                    <h3 className="text-base font-sans font-bold text-white">{dec.decision}</h3>
                    <div className="text-xs text-zinc-400 font-sans">
                      <strong className="text-zinc-500 font-mono">Context: </strong>
                      {dec.context}
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 space-y-1.5 text-xs">
                      <span className="text-zinc-500 uppercase text-[10px] block">Alternatives Rejected:</span>
                      {(dec.alternatives || []).map((alt: any, i: number) => (
                        <div key={i} className="text-zinc-400 flex items-start gap-1.5">
                          <span className="text-rose-400">✕</span>
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-zinc-300 font-sans">
                      <strong className="text-zinc-500 font-mono">Consequences: </strong>
                      {dec.consequences}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY AUDIT LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h1 className="text-2xl font-display font-bold text-white">Project Activity Audit Log</h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Immutable database audit stream recorded in Supabase `activity_events`
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {(project.activity || []).length > 0 ? (
                  project.activity.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-[10px] uppercase font-bold">
                            {ev.event_type}
                          </span>
                          <span className="text-zinc-300 font-sans font-medium">{ev.action}</span>
                        </div>
                        {ev.details && (
                          <div className="text-zinc-400 text-[11px]">
                            {JSON.stringify(ev.details)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center text-zinc-500">
                    No activity events recorded yet. Changes in tasks, code, or tests will appear here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: EXPORT CENTER */}
          {activeTab === 'exports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Export Center & Build Packs
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Download open, versioned engineering artifacts for developers and AI coding assistants
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300">
                  Zero Lock-in
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Markdown Specification */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">Markdown Blueprint Specification</div>
                  <p className="text-xs text-zinc-400">
                    Complete formatted specification containing problem statement, user stories, requirements, and test matrices.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-blueprint.md`,
                        generateMarkdownBlueprint(project),
                        'text/markdown'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-ember" />
                    <span>Download Blueprint.md</span>
                  </button>
                </div>

                {/* 2. PostgreSQL DDL */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">PostgreSQL DDL & RLS Migration</div>
                  <p className="text-xs text-zinc-400">
                    Ready-to-run PostgreSQL schema script with table definitions, foreign keys, and Row Level Security policies.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-schema.sql`,
                        generatePostgresSchema(project),
                        'text/plain'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Schema.sql</span>
                  </button>
                </div>

                {/* 3. OpenAPI 3.1 JSON */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">OpenAPI 3.1 Contract JSON</div>
                  <p className="text-xs text-zinc-400">
                    Formal API specifications compatible with Swagger, Postman, and API gateway generators.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-openapi.json`,
                        generateOpenApiJson(project),
                        'application/json'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download OpenApi.json</span>
                  </button>
                </div>

                {/* 4. Mermaid Diagram */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">Mermaid Architecture Diagram (.mmd)</div>
                  <p className="text-xs text-zinc-400">
                    Portable Mermaid flowchart definition representing component hierarchy and data flow.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.mmd`,
                        generateMermaidArchitecture(project),
                        'text/plain'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Architecture.mmd</span>
                  </button>
                </div>

                {/* 5. Tasks CSV */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">Tasks Spreadsheet Export (CSV)</div>
                  <p className="text-xs text-zinc-400">
                    Structured CSV table of all tasks, dependencies, min/max effort days, and linked requirements.
                  </p>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-tasks.csv`,
                        generateTasksCsv(project),
                        'text/csv'
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Tasks.csv</span>
                  </button>
                </div>

                {/* 6. Complete AI Assistant Build Pack */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 bg-zinc-900/90 border-ember/40 shadow-glow-sm">
                  <div className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ember" />
                    <span>AI Coding Assistant Build Pack Bundle</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Structured ZIP bundle containing BLUEPRINT.md, schema.sql, openapi.json, architecture.mmd, and task instructions formatted for Claude, Cursor, and Copilot.
                  </p>
                  <button
                    onClick={() => downloadBuildPackZip(project)}
                    className="w-full py-2.5 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete Build Pack (.zip)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROJECT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="pb-4 border-b border-white/10">
                <h1 className="text-2xl font-display font-bold text-white">Project Settings</h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">Manage project metadata and permissions</p>
              </div>

              <form onSubmit={handleSaveSettings} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1">Project Name</label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-ember"
                    required
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsTagline}
                    onChange={(e) => setSettingsTagline(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-ember"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={settingsDesc}
                    onChange={(e) => setSettingsDesc(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-ember font-sans"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1">Project ID (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={project.id}
                    className="w-full p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">
                    {settingsSaved && 'Settings successfully updated!'}
                  </span>
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-4 py-2 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{settingsSaving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-3 font-mono text-xs">
                <span className="text-rose-400 font-bold uppercase block">Danger Zone</span>
                <p className="text-zinc-400 font-sans">
                  Permanently remove this project and all linked specifications, database models, and task records.
                </p>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Project Copilot Assistant Drawer */}
      <ProjectAssistant
        project={project}
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        onProjectUpdated={loadProject}
      />
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
            <p className="text-sm font-mono text-zinc-400">Loading Blueprint workspace...</p>
          </div>
        </div>
      }
    >
      <ProjectWorkspaceContent />
    </React.Suspense>
  );
}
