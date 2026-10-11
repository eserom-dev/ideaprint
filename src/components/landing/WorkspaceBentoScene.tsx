'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  ShieldCheck,
  Database,
  Download,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { VerificationBadge } from '@/components/ui/ProvenanceBadge';

export const WorkspaceBentoScene: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 'TSK-001', title: 'Scaffold App Shell & Tokens', status: 'done', dep: null },
    { id: 'TSK-002', title: 'Postgres RLS Multi-Tenant Policies', status: 'done', dep: 'TSK-001' },
    { id: 'TSK-003', title: 'Attendance Matrix Optimistic Grid', status: 'in_progress', dep: 'TSK-002' },
    { id: 'TSK-004', title: 'Gradebook Running GPA Calculator', status: 'todo', dep: 'TSK-002' },
  ]);

  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);

  const moveTask = (taskId: string) => {
    setBlockedAlert(null);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status === 'todo') return { ...t, status: 'in_progress' };
          if (t.status === 'in_progress') return { ...t, status: 'done' };
          if (t.status === 'done') return { ...t, status: 'todo' };
        }
        return t;
      })
    );
  };

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progressPercent = Math.round((doneCount / tasks.length) * 100);

  return (
    <section id="database" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">ENGINEERING WORKSPACE</span>
            <span>·</span>
            <span>INTERACTIVE TOOLING</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            Built for <span className="metal">builders</span>, not chat transcripts.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl font-normal">
            A fast, dense workspace with working task dependencies, real schema designers, 
            and honest test recording.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CARD 1 (7 COLS): Task Board */}
          <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-ember-soft text-ember">
                    <Kanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Dependency-Guarded Task Board</h3>
                    <span className="text-xs font-mono text-zinc-400">Interactive live demo</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-ember">{progressPercent}% Done</div>
                  <span className="text-xs font-mono text-zinc-400">{doneCount}/{tasks.length} Tasks</span>
                </div>
              </div>

              {blockedAlert && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{blockedAlert}</span>
                </div>
              )}

              <div className="space-y-2.5 mb-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between gap-3 text-xs font-mono hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-ember font-bold">{task.id}</span>
                      <span className="text-white truncate font-sans text-xs">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          task.status === 'done'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : task.status === 'in_progress'
                            ? 'bg-ember-soft text-ember border border-ember/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => moveTask(task.id)}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs transition-colors"
                      >
                        Move →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>Rule: Prerequisites must complete before Done</span>
              <Link href="/dashboard" className="text-ember hover:underline flex items-center gap-1 font-bold">
                <span>Open Full Board</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* CARD 2 (5 COLS): Honest Testing Lab */}
          <div className="md:col-span-5 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Honest Testing Lab</h3>
                    <span className="text-xs font-mono text-zinc-400">Zero unverified security claims</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-400">Audit Trail</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">TC-001 · Cross-Tenant RLS</span>
                    <VerificationBadge verification="passed" />
                  </div>
                  <p className="text-xs text-zinc-300 font-mono">
                    Verified: 14/14 automated RLS tests passed
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">TC-002 · Attendance Persistence</span>
                    <VerificationBadge verification="passed" />
                  </div>
                  <p className="text-xs text-zinc-300 font-mono">
                    Verified: Playwright E2E browser suite
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">TC-003 · Security Endpoint Guard</span>
                    <VerificationBadge verification="not_run" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    Status: Generated by AI; awaits verification run
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-zinc-300 font-mono">
              <strong className="text-ember">Rule: </strong> Tests stay "Not Run" until executed.
            </div>
          </div>

          {/* CARD 3 (5 COLS): Database Designer */}
          <div className="md:col-span-5 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Database Designer</h3>
                    <span className="text-xs font-mono text-zinc-400">PostgreSQL Schema & RLS</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">DDL Ready</span>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4 border border-white/10 font-mono text-xs text-zinc-200 mb-6 overflow-x-auto">
                <pre className="text-xs leading-relaxed">
                  <span className="text-ember font-bold">CREATE TABLE</span> attendance ({"\n"}
                  {"  "}id <span className="text-cyan-300">uuid</span> PRIMARY KEY,{"\n"}
                  {"  "}school_id <span className="text-cyan-300">uuid</span> NOT NULL,{"\n"}
                  {"  "}status <span className="text-cyan-300">text</span> CHECK (...) {"\n"}
                  );{"\n"}
                  <span className="text-ember font-bold">ALTER TABLE</span> attendance ENABLE RLS;
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-zinc-300 font-mono">
              Exports clean migration scripts without touching your database.
            </div>
          </div>

          {/* CARD 4 (7 COLS): Portable 1-Click Exports */}
          <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Portable Build Pack Exports</h3>
                    <span className="text-xs font-mono text-zinc-400">Open formats for developers and AI assistants</span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">
                  Zero Lock-in
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-center">
                  <div className="text-sm font-mono font-bold text-white">Markdown</div>
                  <span className="text-xs text-zinc-400">Spec & Docs</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-center">
                  <div className="text-sm font-mono font-bold text-white">OpenAPI 3.1</div>
                  <span className="text-xs text-zinc-400">API Contract</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-center">
                  <div className="text-sm font-mono font-bold text-white">SQL DDL</div>
                  <span className="text-xs text-zinc-400">Schema + RLS</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-center">
                  <div className="text-sm font-mono font-bold text-ember">Build Pack</div>
                  <span className="text-xs text-zinc-400">Ready bundle</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>Feed directly into Claude, Cursor, Antigravity, or Copilot</span>
              <Link href="/projects/new" className="text-ember hover:underline flex items-center gap-1 font-bold">
                <span>Start Project</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
