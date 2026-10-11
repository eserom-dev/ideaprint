'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  Database,
  Kanban,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function HowItWorksPage() {
  const stages = [
    {
      stage: 'Stage 1',
      name: 'Capture',
      tagline: 'Understand the idea without interrogation',
      desc: 'You describe your software idea on the Idea Canvas. The Interviewer pass finds blocking architectural gaps, offering quick-select answers and "Skip and assume". Every skipped question becomes a visible assumption (ASM-001).',
      outputs: ['Problem Statement', 'Target Personas', 'Measurable Goals', 'Assumption Register'],
      exitGate: 'Problem statement accepted; blocking questions answered or converted to assumptions.',
      icon: Layers,
    },
    {
      stage: 'Stage 2',
      name: 'Define',
      tagline: 'Decide what the product is and cut the MVP',
      desc: 'The Requirements Engineer produces atomic Functional and Non-Functional Requirements with display IDs (FR-014, NFR-002) and Given/When/Then acceptance criteria. The Scoper produces an explicit exclusions list.',
      outputs: ['Atomic FR & NFR', 'User Stories', 'MVP Scope Phasing', 'Exclusions List'],
      exitGate: 'MVP scope accepted; every must-have requirement has testable acceptance criteria.',
      icon: Sparkles,
    },
    {
      stage: 'Stage 3',
      name: 'Design',
      tagline: 'Decide how it works under real-world constraints',
      desc: 'The Architect proposes component structures, normalized database entities, and API contracts that fit your self-rated skills, budget ceiling, and timeline. Technologies you select are never overridden.',
      outputs: ['Component Architecture', 'PostgreSQL Schema + RLS', 'OpenAPI 3.1 Contracts', 'Decision Records (ADRs)'],
      exitGate: 'Every must-have requirement is satisfied by a component; schema and API reviewed.',
      icon: Cpu,
    },
    {
      stage: 'Stage 4',
      name: 'Plan',
      tagline: 'Decide how to build it with honest estimates',
      desc: 'The Planner builds milestones and a task dependency graph. Blocked tasks cannot advance to Done without prerequisite completion. Effort estimates are realistic ranges with stated confidence.',
      outputs: ['Task Dependency Graph', 'Milestone Schedule', 'Effort-Day Ranges', 'Testing Lab Plan (Not Run)'],
      exitGate: 'Every must-have requirement has at least one linked task and one test case.',
      icon: Kanban,
    },
    {
      stage: 'Stage 5',
      name: 'Deliver',
      tagline: 'Prepare to ship and export portable Build Packs',
      desc: 'Review the honest Blueprint Health report, verify security checks, and export Markdown, JSON, SQL DDL, or a complete AI Coding Assistant Build Pack bundle for Claude, Cursor, or Copilot.',
      outputs: ['Portable Build Pack', 'Launch Readiness Checklist', 'Export Packages', 'Audit History'],
      exitGate: 'Checklist items verified; high-severity risks mitigated or formally acknowledged.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
            <span>THE 5-STAGE LIFECYCLE · ADVISORY EXIT GATES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white mb-6">
            From the first spark <br />
            <span className="metal">to an actionable build.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            Five disciplined stages with advisory exit gates. The AI proposes, the human decides, 
            and nothing becomes permanent until you accept it.
          </p>
        </div>

        {/* 5 Stages Vertical Timeline */}
        <div className="space-y-12 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.stage}
                className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ember-soft text-ember flex items-center justify-center font-mono font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-ember uppercase font-bold">{stage.stage}</span>
                      <h2 className="text-2xl font-display font-bold text-white">{stage.name}</h2>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{stage.tagline}</span>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
                  {stage.desc}
                </p>

                {/* Main Outputs */}
                <div>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2 font-bold">
                    Primary Artifact Outputs:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {stage.outputs.map((out) => (
                      <div key={out} className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-300">
                        {out}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advisory Exit Gate */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 flex items-start gap-3 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-emerald-400 font-bold uppercase block mb-0.5">Advisory Exit Gate:</span>
                    <span className="text-zinc-300 font-sans">{stage.exitGate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold font-mono text-sm shadow-glow transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Experience Stage 1 (Capture) Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
