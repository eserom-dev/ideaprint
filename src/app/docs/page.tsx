'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import {
  FileCode2,
  PackageCheck,
  Database,
  Globe2,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function DocsPage() {
  const itemTypes = [
    { prefix: 'PRB', type: 'Problem', desc: 'The core pain point being solved' },
    { prefix: 'PER', type: 'Persona', desc: 'A user archetype or role' },
    { prefix: 'GOL', type: 'Goal', desc: 'A measurable business or engineering outcome' },
    { prefix: 'FR', type: 'Functional Req', desc: 'What the system must do with acceptance criteria' },
    { prefix: 'NFR', type: 'Non-Functional Req', desc: 'Quality attributes: security, RLS, latency' },
    { prefix: 'US', type: 'User Story', desc: 'A user outcome in standard Given/When/Then' },
    { prefix: 'CMP', type: 'Component', desc: 'An architecture element: UI, gateway, worker' },
    { prefix: 'ENT', type: 'Entity', desc: 'A database table, primary key, or relation' },
    { prefix: 'API', type: 'Endpoint', desc: 'An OpenAPI operation contract' },
    { prefix: 'TSK', type: 'Task', desc: 'A unit of implementation work with prerequisites' },
    { prefix: 'MS', type: 'Milestone', desc: 'A delivery checkpoint' },
    { prefix: 'TC', type: 'Test Case', desc: 'A verification procedure (defaults to Not Run)' },
    { prefix: 'DEC', type: 'Decision', desc: 'An Architecture Decision Record (ADR)' },
    { prefix: 'RSK', type: 'Risk', desc: 'A potential problem with explicit mitigation' },
    { prefix: 'ASM', type: 'Assumption', desc: 'A belief used where facts are missing' },
  ];

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
            <span>DOCUMENTATION & SCHEMA SPECIFICATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white mb-6">
            Blueprint <span className="metal">Documentation</span>.
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            Technical reference for the Blueprint Graph schema, provenance metadata, 
            and AI Coding Assistant Build Pack bundle format.
          </p>
        </div>

        {/* Section 1: Item Types & Display IDs */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 mb-12 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Terminal className="w-5 h-5 text-ember" />
            <h2 className="text-2xl font-display font-bold text-white">Item Types & Stable Display IDs</h2>
          </div>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            Every item in the Blueprint Graph carries a stable, human-readable display ID that never changes, 
            even if the item is edited, reorganized, or moved across milestones.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
            {itemTypes.map((item) => (
              <div key={item.prefix} className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-ember">{item.prefix}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{item.type}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Coding Assistant Build Pack Spec */}
        <div id="build-pack" className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 mb-12 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <PackageCheck className="w-5 h-5 text-ember" />
            <h2 className="text-2xl font-display font-bold text-white">The Build Pack Specification</h2>
          </div>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            The Build Pack is an export bundle designed for AI coding assistants (Claude, Cursor, Copilot, Antigravity) 
            to start implementation immediately with zero context decay.
          </p>

          <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 font-mono text-xs text-zinc-300 overflow-x-auto">
            <pre className="text-[11px] leading-relaxed">
              {"build-pack/\n"}
              {"├── docs/\n"}
              {"│   ├── BLUEPRINT.md      # Full accepted specification with display IDs\n"}
              {"│   └── DESIGN.md         # Design tokens, hairlines, and glassmorphism rules\n"}
              {"├── schema/\n"}
              {"│   ├── schema.sql        # PostgreSQL DDL with Row Level Security (RLS)\n"}
              {"│   └── openapi.json      # OpenAPI 3.1 endpoint contracts\n"}
              {"├── AGENTS.md             # Strict prompt guardrails for AI coding assistants\n"}
              {"└── tasks.json            # Task dependency DAG with effort-day estimates\n"}
            </pre>
          </div>
        </div>

        {/* Section 3: Provenance & Honesty Rules */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-display font-bold text-white">Trust & Honesty Rules</h2>
          </div>

          <ul className="space-y-3 text-sm text-zinc-300 font-sans leading-relaxed">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>
                <strong>User constraints outrank AI proposals:</strong> Stated skills, budget ceilings, and framework preferences are stored as user-provided and never overwritten.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>
                <strong>Generated tests default to "Not Run":</strong> IDEAPRINT will never state that an app is secure without evidence recorded from a verified run.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>
                <strong>Locked items are permanent:</strong> Any item you lock with the lock toggle is immune to AI regeneration.
              </span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
