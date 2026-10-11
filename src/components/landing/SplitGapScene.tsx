'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

export const SplitGapScene: React.FC = () => {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header - Clean and beautiful without raw scene codes */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">THE PLANNING GAP</span>
            <span>·</span>
            <span>STRUCTURE OVER VAGUE PROMPTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            An idea is <span className="text-zinc-400 italic">smoke</span>. <br className="hidden sm:inline" />
            A blueprint is <span className="metal">structure</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl font-normal">
            The difference between shipping a product and abandoning it in week four is knowing 
            exactly what to build, how the data links together, and what to verify.
          </p>
        </div>

        {/* Split Screen Contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/15 shadow-2xl mb-16">
          {/* LEFT: Unstructured Chat */}
          <div className="p-8 sm:p-10 bg-zinc-900/90 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-wider text-rose-300 flex items-center gap-1.5 font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Unstructured AI Chat Transcripts
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Planning Decay
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                "Build me an app with users and fast logins..."
              </h3>

              <div className="space-y-3 font-mono text-xs bg-zinc-950 p-4 rounded-xl border border-white/10 mb-6 text-zinc-300">
                <p className="text-zinc-200">
                  <span className="text-rose-400 font-bold">Chatbot:</span> "Here is a 1,200 word summary of technologies you could try. Have fun coding!"
                </p>
                <div className="pt-2 border-t border-white/10 space-y-2 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Zero testable acceptance criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>No database schema or row-level security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Context disappears when the browser closes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>Outcome: Weeks lost rewriting stack</span>
              <span className="text-rose-400 font-bold">High Drift Risk</span>
            </div>
          </div>

          {/* RIGHT: IDEAPRINT Way */}
          <div className="p-8 sm:p-10 bg-zinc-950 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-wider text-ember flex items-center gap-1.5 font-bold font-mono">
                  <Sparkles className="w-4 h-4" />
                  IDEAPRINT Engineering Workspace
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-ember-soft text-ember border border-ember/30">
                  100% Traceable
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Connected, Typed & Validated Systems
              </h3>

              <div className="space-y-3 font-mono text-xs bg-zinc-900/90 p-4 rounded-xl border border-white/15 mb-6 text-zinc-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-ember font-bold">FR-001</span>
                    <span className="text-white font-semibold">Attendance Roster Persistence</span>
                  </div>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    MUST HAVE
                  </span>
                </div>

                <div className="space-y-1 text-zinc-200 pl-2 border-l border-ember/40">
                  <p className="text-zinc-400">Given authenticated teacher:</p>
                  <p className="text-zinc-100 font-sans">
                    "When attendance is submitted, update PostgreSQL with optimistic local fallback within 350ms."
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>Linked to Sprint Task</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400">✓</span>
                    <span>PostgreSQL RLS Guarded</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span>
                    <span>Test Suite Linked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-400">✓</span>
                    <span>Architecture Decision Logged</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-200 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Computed Blueprint Health
              </span>
              <span className="text-emerald-400 font-bold">Implementation Ready</span>
            </div>
          </div>
        </div>

        {/* 3 Planning Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold metal mb-2">01. Scope Creep</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                Without explicit MVP exclusions, every imagined feature gets pushed into version one, delaying release for months.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-zinc-300">
              <strong className="text-ember">Solution: </strong> Strict Must / Should / Won't gating.
            </div>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold metal mb-2">02. Architecture Debt</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                Choosing stacks by trend rather than project constraints causes messy rewrites and broken permissions.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-zinc-300">
              <strong className="text-ember">Solution: </strong> Skill, budget, and hosting aware design.
            </div>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-2xl font-bold metal mb-2">03. Unverified Claims</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                Generic chatbots claim "your code is secure" without running a single check or database validation.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-zinc-300">
              <strong className="text-ember">Solution: </strong> Generated tests remain 'Not Run' until verified.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
