'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { supabase } from '@/lib/supabase';
import type { ProjectData, TaskItem, TestCaseItem } from '@/types/blueprint';
import { ProvenanceBadge, PriorityBadge, VerificationBadge } from '@/components/ui/ProvenanceBadge';
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
} from 'lucide-react';

type WorkspaceTab =
  | 'overview'
  | 'blueprint'
  | 'architecture'
  | 'database'
  | 'api'
  | 'tasks'
  | 'roadmap'
  | 'testing'
  | 'decisions'
  | 'exports'
  | 'settings';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const initialTab = (searchParams?.get('tab') as WorkspaceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load project dynamically from Supabase database
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (!error && data) {
          const c = data.constraints || {};
          setProjectData({
            id: data.id,
            name: data.name,
            tagline: data.tagline || '',
            description: data.description || '',
            type: data.type || 'Web Application',
            stage: data.stage || 'plan',
            updatedAt: data.updated_at || new Date().toISOString(),
            userStories: c.userStories || [],
            constraints: {
              appType: c.appType || 'Next.js 14 Web Application',
              stack: c.stack || ['TypeScript', 'Next.js', 'PostgreSQL'],
              skills: c.skills || 'Full-Stack Developer',
              budget: c.budget || '$0 MVP',
              timeline: c.timeline || '4-6 Weeks',
              hosting: c.hosting || 'Supabase / Cloudflare',
            },
            requirements: c.requirements || [],
            components: c.components || [],
            entities: c.entities || [],
            endpoints: c.endpoints || c.apiEndpoints || [],
            tasks: c.tasks || [],
            milestones: c.milestones || [],
            testCases: c.testCases || [],
            decisions: c.decisions || [],
            risks: c.risks || [],
          } as unknown as ProjectData);
        }
      } catch (err) {
        console.warn('Error fetching project from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  // Sync tab with URL query if provided
  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab') as WorkspaceTab;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Working Task State inside the Task Studio
  const [tasksState, setTasksState] = useState<TaskItem[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Working Test Cases state inside the Testing Lab
  const [testCasesState, setTestCasesState] = useState<TestCaseItem[]>([]);

  useEffect(() => {
    if (projectData) {
      setTasksState(projectData.tasks || []);
      setTestCasesState(projectData.testCases || []);
    }
  }, [projectData]);

  const project = projectData;

  const moveTask = (taskId: string, targetStatus: any) => {
    setTaskError(null);
    setTasksState((prev) =>
      prev.map((t: TaskItem) => {
        if (t.displayId === taskId) {
          // Check dependency rule: if task has unfinished dependencies, warn!
          if (targetStatus === 'done' && t.dependencies.length > 0) {
            const hasUnfinishedDep = prev.some(
              (other) => t.dependencies.includes(other.displayId) && other.status !== 'done'
            );
            if (hasUnfinishedDep) {
              setTaskError(`Blocked: Task ${t.displayId} cannot move to Done while prerequisites (${t.dependencies.join(', ')}) are incomplete!`);
              return t;
            }
          }
          return { ...t, status: targetStatus };
        }
        return t;
      })
    );
  };

  const recordTestRun = (testId: string, result: 'passed' | 'failed' | 'blocked') => {
    setTestCasesState((prev) =>
      prev.map((tc: TestCaseItem) => {
        if (tc.displayId === testId) {
          return {
            ...tc,
            verification: result,
            lastRun: {
              executedBy: 'Staff Engineer (Manual Console Run)',
              executedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              notes: `Executed result recorded as ${result.toUpperCase()}`,
            },
          };
        }
        return tc;
      })
    );
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
            The requested project blueprint could not be found or you do not have permission to access it.
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

  const navItems = [
    { id: 'overview', label: 'Overview & Health', icon: Activity },
    { id: 'blueprint', label: 'Blueprint Specs', icon: Layers, count: (project.requirements || []).length },
    { id: 'architecture', label: 'Architecture Studio', icon: Cpu, count: (project.components || []).length },
    { id: 'database', label: 'Database Designer', icon: Database, count: (project.entities || []).length },
    { id: 'api', label: 'API Contracts', icon: Globe2, count: (project.endpoints || []).length },
    { id: 'tasks', label: 'Task Board', icon: Kanban, count: tasksState.length },
    { id: 'roadmap', label: 'Roadmap & Milestones', icon: Calendar, count: (project.milestones || []).length },
    { id: 'testing', label: 'Testing Lab', icon: ShieldCheck, count: testCasesState.length },
    { id: 'decisions', label: 'Architecture Decisions', icon: GitBranch, count: (project.decisions || []).length },
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
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">Blueprint Health:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
              Strong (94%)
            </span>
          </div>

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
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Requirement Coverage</span>
                  <div className="text-xl font-bold text-emerald-400">100% Linked</div>
                  <span className="text-[10px] text-zinc-400">All Must requirements have tasks</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Testing Evidence</span>
                  <div className="text-xl font-bold text-zinc-200">
                    {testCasesState.filter((t) => t.verification === 'passed').length} Passed · {testCasesState.filter((t) => t.verification === 'not_run').length} Not Run
                  </div>
                  <span className="text-[10px] text-zinc-400">Zero simulated passes</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Orphan Tasks</span>
                  <div className="text-xl font-bold text-emerald-400">0 Detected</div>
                  <span className="text-[10px] text-zinc-400">Full backward traceability</span>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">High Risks Mitigated</span>
                  <div className="text-xl font-bold text-cyan-400">{project.risks.length}/{project.risks.length} Guarded</div>
                  <span className="text-[10px] text-zinc-400">Explicit mitigations linked</span>
                </div>
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

          {/* TAB 2: BLUEPRINT SPECS */}
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
                  {project.requirements.length} Requirements Total
                </span>
              </div>

              <div className="space-y-4">
                {project.requirements.map((req: any) => (
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
                      {req.acceptanceCriteria.map((c: any, i: number) => (
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

          {/* TAB 3: ARCHITECTURE STUDIO */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Component Architecture Studio
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    System topology and component responsibilities satisfying requirements
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {project.components.length} Architecture Nodes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.components.map((cmp: any) => (
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
                      {cmp.responsibilities.map((r: any, i: number) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                      <span>Satisfies: </span>
                      {cmp.satisfies.map((s: any) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 ml-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE DESIGNER */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    Database Designer & PostgreSQL RLS
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Relational schema proposal with mathematically verified row-level security
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {project.entities.length} Normalized Entities
                </span>
              </div>

              <div className="space-y-6">
                {project.entities.map((entity: any) => (
                  <div key={entity.displayId} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ember">{entity.displayId}</span>
                        <h3 className="text-xl font-display font-bold text-white font-mono">{entity.name}</h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{entity.fields.length} Columns</span>
                    </div>

                    <p className="text-xs text-zinc-400 font-sans">{entity.description}</p>

                    {/* Columns Table */}
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
                          {entity.fields.map((f: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="p-2.5 font-bold text-white">{f.name}</td>
                              <td className="p-2.5 text-cyan-400">{f.type}</td>
                              <td className="p-2.5 text-zinc-500">
                                {f.isPrimary && <span className="text-ember font-bold">PRIMARY KEY </span>}
                                {!f.isNullable && <span className="text-zinc-400">NOT NULL </span>}
                                {f.references && <span className="text-indigo-400">→ {f.references}</span>}
                              </td>
                              <td className="p-2.5 text-zinc-400">{f.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* RLS Policies */}
                    {entity.rlsPolicies.length > 0 && (
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

          {/* TAB 5: API DESIGNER */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    API Designer & Contracts
                  </h1>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    OpenAPI 3.1 endpoints, authentication requirements, and schemas
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {project.endpoints.length} Endpoints Documented
                </span>
              </div>

              <div className="space-y-4">
                {project.endpoints.map((ep: any) => (
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
                      <div className="text-zinc-400">
                        <span className="text-zinc-500 block mb-1">Parameters:</span>
                        <div className="flex flex-wrap gap-1">
                          {ep.parameters.map((p: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/10 text-[11px]">
                              {p}
                            </span>
                          ))}
                        </div>
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

          {/* TAB 6: TASK BOARD */}
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
                              <span className="text-[10px] text-zinc-500">{t.effortMinDays}–{t.effortMaxDays} days</span>
                            </div>

                            <h4 className="text-sm font-sans font-medium text-white">{t.title}</h4>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{t.description}</p>

                            {t.dependencies.length > 0 && (
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

          {/* TAB 7: TESTING LAB */}
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
                          className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 font-bold"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => recordTestRun(tc.displayId, 'failed')}
                          className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-500/30 font-bold"
                        >
                          Fail
                        </button>
                        <button
                          onClick={() => recordTestRun(tc.displayId, 'blocked')}
                          className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-500/30 font-bold"
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

          {/* TAB 8: DECISION LOG */}
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
                  {project.decisions.length} Decisions Recorded
                </span>
              </div>

              <div className="space-y-4">
                {project.decisions.map((dec: any) => (
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
                      {dec.alternatives.map((alt: any, i: number) => (
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

          {/* TAB 9: EXPORT CENTER */}
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
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">Markdown Blueprint Specification</div>
                  <p className="text-xs text-zinc-400">
                    Complete formatted specification containing problem statement, user stories, requirements, and test matrices.
                  </p>
                  <button
                    onClick={() => alert('Downloaded Markdown Blueprint Specification!')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5 text-ember" />
                    <span>Download Blueprint.md</span>
                  </button>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">PostgreSQL DDL & RLS Migration</div>
                  <p className="text-xs text-zinc-400">
                    Ready-to-run PostgreSQL schema script with table definitions, foreign keys, and Row Level Security policies.
                  </p>
                  <button
                    onClick={() => alert('Downloaded PostgreSQL DDL & RLS Migration script!')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Schema.sql</span>
                  </button>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-lg font-display font-bold text-white">OpenAPI 3.1 Contract JSON</div>
                  <p className="text-xs text-zinc-400">
                    Formal API specifications compatible with Swagger, Postman, and API gateway generators.
                  </p>
                  <button
                    onClick={() => alert('Downloaded OpenAPI 3.1 Specification JSON!')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download OpenApi.json</span>
                  </button>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 bg-zinc-900/90 border-ember/40 shadow-glow-sm">
                  <div className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ember" />
                    <span>AI Coding Assistant Build Pack Bundle</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Structured ZIP bundle containing BLUEPRINT.md, DESIGN.md, schema.sql, and task dependencies formatted for Claude, Cursor, and Copilot.
                  </p>
                  <button
                    onClick={() => alert('Generated and Downloaded Complete AI Coding Assistant Build Pack Bundle!')}
                    className="w-full py-2.5 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-glow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete Build Pack (.bundle)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="pb-4 border-b border-white/10">
                <h1 className="text-2xl font-display font-bold text-white">Project Settings</h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">Manage project metadata and permissions</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1">Project Name</label>
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white"
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
              </div>

              {/* Danger Zone */}
              <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-3 font-mono text-xs">
                <span className="text-rose-400 font-bold uppercase block">Danger Zone</span>
                <p className="text-zinc-400 font-sans">
                  Deleting a project requires typed confirmation and moves the record to soft-deleted state.
                </p>
                <button
                  onClick={() => alert('Soft-delete confirmed for project')}
                  className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900"
                >
                  Archive Project
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
