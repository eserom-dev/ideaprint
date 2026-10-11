'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import {
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Database,
  Globe2,
  Kanban,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

export default function ProductPage() {
  const pillars = [
    {
      id: '01',
      title: 'The Blueprint Graph',
      tagline: 'Typed, linked engineering items instead of unstructured chat prose',
      desc: 'Most AI tools return text documents. A document cannot answer: Which tasks implement this requirement? Which tests verify it? What breaks if I cut this feature? IDEAPRINT stores requirements, components, database tables, tasks, and tests as a relational graph with stable human-readable IDs (FR-014, TSK-021).',
      icon: Layers,
    },
    {
      id: '02',
      title: 'Provenance & Trust Labels',
      tagline: 'Honest provenance on every single requirement and decision',
      desc: 'Every item states who or what created it (User, AI Proposed, AI Assumed, Imported) and its review state (Accepted, Proposed, Locked). User constraints always outrank AI proposals. AI recommendations name alternatives and trade-offs.',
      icon: ShieldCheck,
    },
    {
      id: '03',
      title: 'The 8-Pass AI Pipeline',
      tagline: 'Specialized passes with narrow inputs replace one monolithic prompt',
      desc: 'Instead of one fragile prompt, generation runs as a staged pipeline: Interviewer → Analyst → Requirements Engineer → Scoper → Architect → Planner → QA Strategist → Critic Pass. The Critic is independent and audits for gaps, contradictions, and over-scope.',
      icon: Cpu,
    },
    {
      id: '04',
      title: 'Evidence-Based Blueprint Health',
      tagline: 'Computed completeness metrics instead of arbitrary progress scores',
      desc: 'Health is a transparent checklist computed directly from saved records: requirement-to-task coverage, test coverage, acceptance criteria completeness, orphan tasks, and unmitigated risks. It never labels code secure without recorded test runs.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
            <span>PRODUCT CAPABILITIES · BLUEPRINT FIRST</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white mb-6">
            The intelligent layer <br />
            <span className="metal">before the first commit.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            IDEAPRINT bridges the planning gap between an idea and implementation. 
            Here is the core technical architecture that makes blueprints buildable.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="glass-card rounded-3xl p-8 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-ember/20 text-ember border border-ember/30 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-mono font-bold metal">{pillar.id}</span>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-white mb-2">{pillar.title}</h3>
                  <div className="text-xs font-mono text-ember mb-4">{pillar.tagline}</div>
                  <p className="text-sm text-zinc-300 font-sans leading-relaxed">{pillar.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="text-emerald-400">✓</span>
                  <span>Enforced at the data layer</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 8-Pass Generation Pipeline Detailed Walkthrough */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/15 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-ember uppercase tracking-wider font-bold">
              THE AI PRODUCT ARCHITECT
            </span>
            <h2 className="text-3xl font-display font-bold text-white mt-1">
              The 8-Pass Generation Pipeline
            </h2>
            <p className="text-sm text-zinc-400 font-sans mt-2">
              Each specialized pass receives a compact slice of the accepted graph instead of a cluttered chat transcript.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">01. Interviewer</span>
              <p className="text-zinc-400 font-sans text-xs">Finds blocking architectural gaps and generates assumptions.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">02. Analyst</span>
              <p className="text-zinc-400 font-sans text-xs">Frames the problem, user personas, and measurable goals.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">03. Requirements</span>
              <p className="text-zinc-400 font-sans text-xs">Specifies FR & NFR with display IDs and Given/When/Then criteria.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">04. Scoper</span>
              <p className="text-zinc-400 font-sans text-xs">Cuts MVP vs. post-MVP scope with explicit exclusions.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">05. Architect</span>
              <p className="text-zinc-400 font-sans text-xs">Designs Postgres schema, RLS policies, and OpenAPI contracts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">06. Planner</span>
              <p className="text-zinc-400 font-sans text-xs">Builds task dependencies and realistic effort ranges.</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <span className="text-ember font-bold">07. QA Strategist</span>
              <p className="text-zinc-400 font-sans text-xs">Assembles verification test cases (all honest Not Run).</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-ember/30 bg-ember-soft/20 space-y-2">
              <span className="text-ember font-bold">08. Critic Review</span>
              <p className="text-zinc-300 font-sans text-xs">Independent audit for gaps, contradictions, and over-scope.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold font-mono text-sm shadow-glow transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build Your Blueprint Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
