'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Database,
  Cpu,
  Kanban,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const SceneStages: React.FC = () => {
  return (
    <div className="space-y-32 py-16 relative z-20">
      {/* SCENE 002: THE PLANNING GAP */}
      <section id="scene-002" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">SCENE 002</span>
            <span>·</span>
            <span>THE PLANNING GAP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white max-w-3xl mx-auto leading-tight">
            An idea is <span className="text-zinc-400 italic">smoke</span>. <br />
            A blueprint is <span className="metal">structure</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white max-w-2xl mx-auto font-normal">
            The difference between shipping a product and abandoning it in week four is knowing 
            exactly what to build, how data models connect, and what to verify before writing code.
          </p>
        </div>

        {/* Contrast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
          {/* Unstructured Chat */}
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
                "Build me an app with logins and fast dashboards..."
              </h3>
              <div className="space-y-3 font-mono text-xs bg-zinc-950 p-4 rounded-xl border border-white/10 mb-6 text-zinc-300">
                <p className="text-white">
                  Conversational chatbots generate thousands of words of unstructured text that vanish across browser tabs.
                </p>
                <div className="pt-2 border-t border-white/10 space-y-2 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Zero testable acceptance criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>No relational schema or row-level security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Context disappears when the session closes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>Outcome: Weeks lost rewriting stack</span>
              <span className="text-rose-400 font-bold">High Drift Risk</span>
            </div>
          </div>

          {/* IDEAPRINT Blueprint */}
          <div className="p-8 sm:p-10 bg-zinc-950 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-wider text-ember flex items-center gap-1.5 font-bold font-mono">
                  <Sparkles className="w-4 h-4" />
                  IDEAPRINT Engineering Blueprint
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
                    <span className="text-white font-semibold">Atomic Functional Requirement</span>
                  </div>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    MUST HAVE
                  </span>
                </div>
                <div className="text-zinc-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Links to Component CMP-001 & Task TSK-001</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>PostgreSQL DDL with RLS tenant policies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified Test Matrix with acceptance gates</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>Outcome: Immediate implementation clarity</span>
              <span className="text-emerald-400 font-bold">Zero Ambiguity</span>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 003: ATOMIC REQUIREMENTS (DEFINE) */}
      <section id="scene-003" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">SCENE 003</span>
            <span>·</span>
            <span>STAGE 2 · DEFINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Every requirement gets an <span className="metal">ID, origin</span> and <span className="text-ember">criteria</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white max-w-2xl mx-auto font-normal">
            No vague bullet points. Requirements are typed as Functional or Non-Functional, 
            categorized by Must/Should/Could priorities, and locked to prevent accidental overwrite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="glass-card p-6 rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-ember-soft text-ember font-bold">FR-001</span>
              <span className="text-[10px] text-emerald-400 uppercase font-bold">MUST</span>
            </div>
            <h4 className="text-sm font-sans font-bold text-white">Atomic Functional Specification</h4>
            <p className="text-zinc-300 text-xs font-sans">
              Specifies the exact capability, rationale, and provenance. Traceable back to the original problem statement.
            </p>
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-zinc-300">
              <div className="text-[11px] text-zinc-400 font-bold uppercase">Acceptance Gates:</div>
              <div>• Sub-400ms latency execution</div>
              <div>• Optimistic UI state persistence</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 font-bold">NFR-001</span>
              <span className="text-[10px] text-emerald-400 uppercase font-bold">MUST</span>
            </div>
            <h4 className="text-sm font-sans font-bold text-white">Security & Isolation Gate</h4>
            <p className="text-zinc-300 text-xs font-sans">
              Declares architectural constraints including tenant isolation, auth scopes, and cryptographic rules.
            </p>
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-zinc-300">
              <div className="text-[11px] text-zinc-400 font-bold uppercase">Acceptance Gates:</div>
              <div>• 100% database RLS filtering</div>
              <div>• Automated test validation</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20 font-bold">LOCK / AUDIT</span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h4 className="text-sm font-sans font-bold text-white">Provenance & Locks</h4>
            <p className="text-zinc-300 text-xs font-sans">
              Human engineers have final say. Lock any item to guarantee it is permanently protected during regenerations.
            </p>
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-zinc-300">
              <div className="text-[11px] text-zinc-400 font-bold uppercase">Engine Guardrails:</div>
              <div>• Origin: user vs. ai_proposed</div>
              <div>• Immutable lock protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 004: ARCHITECTURE GRAPH (DESIGN) */}
      <section id="scene-004" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">SCENE 004</span>
            <span>·</span>
            <span>STAGE 3 · DESIGN</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Connected <span className="metal">architecture studio</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white max-w-2xl mx-auto font-normal">
            Every component connects to its database entities, API endpoints, and implementation tasks. 
            When scope shifts, the dependency graph illuminates downstream impacts.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-white/15 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-zinc-400 uppercase text-[11px] block mb-1">Service Component Layer</span>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Next.js API Gateway</span>
              </div>
              <p className="text-zinc-300 text-xs font-sans mt-2">
                Validates incoming JSON payloads and orchestrates business logic.
              </p>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[11px] block mb-1">Contract Layer</span>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-ember" />
                <span>OpenAPI 3.1 Spec</span>
              </div>
              <p className="text-zinc-300 text-xs font-sans mt-2">
                Strict request/response schemas with automated client SDK generation.
              </p>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[11px] block mb-1">Persistence Engine</span>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL 15+ & RLS</span>
              </div>
              <p className="text-zinc-300 text-xs font-sans mt-2">
                ACID relational storage with Row Level Security enforcement.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-zinc-300">
            <span className="text-xs">Architecture components link directly to sprint tasks and test suites.</span>
            <Link
              href="/sign-up"
              className="text-ember hover:underline font-bold text-xs flex items-center gap-1"
            >
              <span>Explore in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SCENE 005 & 006: PLAN & DELIVER */}
      <section id="scene-005" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">SCENE 005 & 006</span>
            <span>·</span>
            <span>STAGES 4 & 5 · PLAN & DELIVER</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white max-w-3xl mx-auto leading-tight">
            From architecture to <span className="metal">execution</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white max-w-2xl mx-auto font-normal">
            Tasks cannot be marked Done if dependencies are unmet. Tests remain strictly Not Run until verified by your pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
          <div className="glass-card p-8 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Kanban className="w-4 h-4" />
                Dependency-Guarded Sprint Board
              </span>
              <span className="text-[10px] text-zinc-400">Strict Rules</span>
            </div>
            <h3 className="text-xl font-sans font-bold text-white">Execution Without Broken Assumptions</h3>
            <p className="text-zinc-300 text-xs font-sans">
              Tasks declare explicit dependencies. An engineer cannot accidentally build an un-authenticated UI before authentication and schema policies exist.
            </p>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 space-y-2 text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">TSK-003 Attendance API</span>
                <span className="text-rose-400 text-[10px]">BLOCKED BY TSK-002</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Blocked until PostgreSQL Row Level Security policy is applied.
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Evidence-Based Testing Lab
              </span>
              <span className="text-[10px] text-zinc-400">Honest Verification</span>
            </div>
            <h3 className="text-xl font-sans font-bold text-white">Zero Fake Security Claims</h3>
            <p className="text-zinc-300 text-xs font-sans">
              Generated test cases stay strictly labeled "Not Run" until a verified execution is recorded by your testing suite.
            </p>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 space-y-2 text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">TC-001 Cross-Tenant Isolation</span>
                <span className="text-zinc-400 text-[10px] bg-white/5 px-2 py-0.5 rounded">NOT RUN</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Awaiting Vitest or local RLS test run before claiming compliance.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
