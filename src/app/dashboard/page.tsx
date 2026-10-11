'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Terminal,
  Layers,
  ArrowRight,
  Kanban,
  Database,
  Cpu,
  ShieldCheck,
  Search,
  LogOut,
  User,
  Sparkles,
  Inbox,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut, isConfigured } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  // Enforce authentication: protect dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/dashboard');
    }
  }, [user, loading, router]);

  // Fetch real user projects from Supabase
  useEffect(() => {
    async function loadProjects() {
      if (user && isConfigured) {
        setFetchingProjects(true);
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            setProjects(data);
          }
        } catch (e) {
          console.warn('Projects fetch error:', e);
        } finally {
          setFetchingProjects(false);
        }
      } else if (!loading) {
        setFetchingProjects(false);
      }
    }
    loadProjects();
  }, [user, loading, isConfigured]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-ember border-t-transparent animate-spin shadow-glow-sm" />
          <span className="text-xs text-zinc-300 uppercase tracking-wider">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Top Application Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10 text-xs font-mono text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-ember" />
              <span>Engineering Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white">
                <User className="w-3.5 h-3.5 text-ember" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  signOut();
                  router.push('/');
                }}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-white/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Blueprint</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Active Engineering Projects
            </h1>
            <p className="text-sm text-zinc-200 font-normal mt-1">
              Logged in as <strong className="text-white">{user.email}</strong>. Real architectural blueprints and task graphs.
            </p>
          </div>

          {projects.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your blueprints..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-zinc-400 focus:outline-none focus:border-ember"
              />
            </div>
          )}
        </div>

        {fetchingProjects ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-ember border-t-transparent rounded-full animate-spin" />
            <span>Loading database records...</span>
          </div>
        ) : projects.length === 0 ? (
          /* REAL EMPTY STATE AS REQUIRED BY RULE 1 */
          <div className="glass-card rounded-3xl p-12 sm:p-16 text-center border border-white/10 max-w-xl mx-auto my-12 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-ember/15 border border-ember/30 text-ember flex items-center justify-center mx-auto shadow-glow-sm">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white">No blueprints yet</h3>
            <p className="text-sm text-zinc-300 font-sans max-w-md mx-auto leading-relaxed">
              You haven't generated any architecture specifications yet. Turn your software concept into a structured engineering blueprint with requirements, database schemas, and tasks.
            </p>
            <div className="pt-3">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Your First Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* REAL USER PROJECTS LIST */
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-ember/40 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl font-display font-bold text-white hover:text-ember transition-colors">
                        <Link href={`/projects/${project.id}`}>{project.name}</Link>
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-ember-soft text-ember border border-ember/20">
                        Stage: {project.stage}
                      </span>
                      <span className="text-xs font-mono text-zinc-300">{project.type}</span>
                    </div>
                    <p className="text-sm text-white font-normal max-w-2xl">{project.description}</p>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono shadow-glow transition-all self-start lg:self-center"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-4 flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span>Created: {new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-ember hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Launch Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
