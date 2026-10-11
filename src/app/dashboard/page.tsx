'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import {
  Plus,
  Terminal,
  Layers,
  ArrowRight,
  Kanban,
  Database,
  Cpu,
  Search,
  LogOut,
  User,
  Sparkles,
  Inbox,
  Clock,
  CheckCircle2,
  Calendar,
  Activity,
  Filter,
  ArrowUpDown,
  Command,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface ProjectRecord {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  type?: string;
  stage: 'capture' | 'define' | 'design' | 'plan' | 'deliver';
  status: 'active' | 'archived';
  constraints?: any;
  created_at: string;
  updated_at: string;
}

interface TaskRecord {
  id: string;
  project_id: string;
  status: 'todo' | 'in_progress' | 'done';
}

interface ActivityRecord {
  id: string;
  event_type: string;
  summary: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut, isConfigured } = useAuth();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [fetching, setFetching] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'progress'>('updated');

  // Enforce authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/dashboard');
    }
  }, [user, loading, router]);

  // Load real data from Supabase
  useEffect(() => {
    async function loadDashboardData() {
      if (user && isConfigured) {
        setFetching(true);
        try {
          // 1. Projects
          const { data: projData, error: projErr } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

          if (!projErr && projData) {
            setProjects(projData);
          }

          // 2. Tasks across user's projects
          const { data: taskData } = await supabase
            .from('tasks')
            .select('id, project_id, status');

          if (taskData) {
            setTasks(taskData);
          }

          // 3. Activity events
          const { data: actData } = await supabase
            .from('activity_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);

          if (actData) {
            setActivities(actData);
          }
        } catch (e) {
          console.warn('Dashboard fetch error:', e);
        } finally {
          setFetching(false);
        }
      } else if (!loading) {
        setFetching(false);
      }
    }

    loadDashboardData();
  }, [user, loading, isConfigured]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-400">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Compute greeting based on local time
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Engineer';

  // Compute Stats
  const totalProjects = projects.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const openTasks = tasks.filter((t) => t.status !== 'done').length;
  const planLimit = 5; // Free plan quota
  const continueProject = projects[0]; // Most recently updated project

  // Calculate project task progress helper
  const getProjectProgress = (projId: string, projConstraints?: any) => {
    const projTasks = tasks.filter((t) => t.project_id === projId);
    if (projTasks.length > 0) {
      const completed = projTasks.filter((t) => t.status === 'done').length;
      return Math.round((completed / projTasks.length) * 100);
    }
    // Fallback if stored in constraints
    if (projConstraints?.tasks && Array.isArray(projConstraints.tasks)) {
      const stored = projConstraints.tasks;
      if (stored.length === 0) return 0;
      const completed = stored.filter((t: any) => t.status === 'done').length;
      return Math.round((completed / stored.length) * 100);
    }
    return 15; // Initial capture stage
  };

  // Filtered & Sorted Projects
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tagline || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === 'all' || p.stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') {
        return getProjectProgress(b.id, b.constraints) - getProjectProgress(a.id, a.constraints);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col pb-16">
      {/* Command Palette Listener (Ctrl+K) */}
      <CommandPalette projects={projects} />

      {/* Top Application Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="group">
              <Logo size="sm" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10 text-xs font-mono text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-ember" />
              <span>Workspace Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Pill */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search or jump to...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-white/5">
                Ctrl K
              </kbd>
            </button>

            {/* User Profile Menu */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white">
                <User className="w-3.5 h-3.5 text-ember" />
                <span className="max-w-[130px] truncate">{displayName}</span>
              </div>
              <Link
                href="/settings"
                title="Account Settings"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  signOut();
                  router.push('/');
                }}
                title="Sign out"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Create Project Action */}
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Project</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Header Greeting & Continue Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {timeGreeting}, <span className="text-ember">{displayName}</span>
            </h1>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              Manage your architectural blueprints, real database entities, task dependency graphs, and codebases.
            </p>
          </div>

          {/* Continue Where I Left Off Card */}
          {continueProject && (
            <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span className="flex items-center gap-1.5 text-ember font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Continue where you left off</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-300">
                    Stage: {continueProject.stage}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-ember transition-colors truncate">
                  {continueProject.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {continueProject.tagline || continueProject.description || 'Active engineering project'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-ember rounded-full"
                      style={{ width: `${getProjectProgress(continueProject.id, continueProject.constraints)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {getProjectProgress(continueProject.id, continueProject.constraints)}%
                  </span>
                </div>

                <Link
                  href={`/projects/${continueProject.id}`}
                  className="inline-flex items-center gap-1 text-xs font-mono text-white hover:text-ember transition-colors"
                >
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 2. Real Stats KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Active Projects</span>
              <Layers className="w-4 h-4 text-ember" />
            </div>
            <div className="text-3xl font-bold text-white">{totalProjects}</div>
            <p className="text-xs text-zinc-400 font-sans">Scoped to your account with PostgreSQL RLS</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>Tasks Progress</span>
              <Kanban className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-2">
              <span>{doneTasks}</span>
              <span className="text-sm font-normal text-zinc-500 font-mono">/ {doneTasks + openTasks} done</span>
            </div>
            <p className="text-xs text-emerald-400 font-mono">● {openTasks} active in backlog/DAG</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span>AI Blueprint Quota</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-2">
              <span>{totalProjects}</span>
              <span className="text-sm font-normal text-zinc-500 font-mono">/ {planLimit} free tier</span>
            </div>
            <p className="text-xs text-cyan-400 font-mono">Dual AI Engine Gateway Active</p>
          </div>
        </div>

        {/* 3. Main Projects Section & Recent Activity Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Projects List & Filter Toolbar */}
          <div className="lg:col-span-8 space-y-5">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter blueprints by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-ember"
                />
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="capture">Stage 1: Capture</option>
                  <option value="define">Stage 2: Define</option>
                  <option value="design">Stage 3: Design</option>
                  <option value="plan">Stage 4: Plan</option>
                  <option value="deliver">Stage 5: Deliver</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 focus:outline-none"
                >
                  <option value="updated">Latest Updated</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="progress">Highest Progress</option>
                </select>
              </div>
            </div>

            {/* Projects Cards List */}
            {fetching ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-400">
                <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin mx-auto mb-3" />
                <span>Fetching blueprints from PostgreSQL...</span>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((p) => {
                  const progress = getProjectProgress(p.id, p.constraints);
                  const c = p.constraints || {};
                  const reqCount = c.requirements?.length || 0;
                  const entCount = c.entities?.length || 0;
                  const epCount = (c.endpoints || c.apiEndpoints)?.length || 0;

                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-ember/40 transition-all flex flex-col justify-between group space-y-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-zinc-300">
                            Stage: {p.stage}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(p.updated_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-ember transition-colors">
                          {p.name}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                          {p.tagline || p.description || 'Production engineering blueprint'}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/5">
                        {/* Blueprint Meta Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-400">
                          {reqCount > 0 && <span>{reqCount} Req</span>}
                          {entCount > 0 && <span>· {entCount} Entities</span>}
                          {epCount > 0 && <span>· {epCount} Endpoints</span>}
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-ember rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-zinc-300">{progress}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Real Empty State */
              <div className="p-12 rounded-2xl bg-zinc-900/30 border border-dashed border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-ember/10 border border-ember/20 text-ember flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-display">No blueprints found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    {searchTerm
                      ? `No projects matching "${searchTerm}". Try another search term.`
                      : 'You have not created any software projects yet. Start with Stage 1 · Capture.'}
                  </p>
                </div>
                <div>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono shadow-glow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Project</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="lg:col-span-4 rounded-2xl bg-zinc-900/60 border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-white">
                <Activity className="w-4 h-4 text-ember" />
                <span>Activity Feed</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Live Audit</span>
            </div>

            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="text-xs space-y-1 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span className="text-ember uppercase">{act.event_type}</span>
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-zinc-200 text-xs font-sans">{act.summary}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-mono text-zinc-500">
                  No activity events recorded yet. Actions you take across blueprints will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
