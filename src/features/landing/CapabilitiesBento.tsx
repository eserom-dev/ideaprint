'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Cpu,
  Database,
  Globe2,
  Kanban,
  ShieldCheck,
  GitBranch,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';

export const CapabilitiesBento: React.FC = () => {
  const capabilities = [
    {
      icon: FileCode2,
      tag: 'SPECS',
      title: 'Atomic Requirements Studio',
      description:
        'Every requirement gets an ID (FR-001, NFR-001), Must/Should/Could priority, origin tag, and unambiguous acceptance criteria. Lock items to prevent modification during pipeline passes.',
      border: 'border-white/10 hover:border-ember/40',
      accent: 'text-ember',
    },
    {
      icon: Cpu,
      tag: 'SYSTEM DESIGN',
      title: 'Component Architecture Studio',
      description:
        'Model application components, service layers, and boundary interfaces visually. Automatically identifies orphan modules and structural circular dependencies.',
      border: 'border-white/10 hover:border-cyan-400/40',
      accent: 'text-cyan-400',
    },
    {
      icon: Database,
      tag: 'DATA PERSISTENCE',
      title: 'PostgreSQL Relational DDL & RLS',
      description:
        'Generates production-grade SQL table definitions with primary keys, foreign constraints, B-tree indexes, and mathematical Row Level Security policies.',
      border: 'border-white/10 hover:border-emerald-400/40',
      accent: 'text-emerald-400',
    },
    {
      icon: Globe2,
      tag: 'API CONTRACTS',
      title: 'OpenAPI 3.1 Definitions',
      description:
        'Every backend interface receives explicit HTTP methods, authenticated scopes, path parameters, and JSON request/response schema specifications.',
      border: 'border-white/10 hover:border-amber-400/40',
      accent: 'text-amber-400',
    },
    {
      icon: Kanban,
      tag: 'EXECUTION',
      title: 'Dependency-Guarded Sprint Board',
      description:
        'Sprint tasks enforce strict prerequisite blocking. Downstream tasks cannot be marked Done until all foundational security and data requirements are met.',
      border: 'border-white/10 hover:border-orange-400/40',
      accent: 'text-orange-400',
    },
    {
      icon: ShieldCheck,
      tag: 'QA MATRIX',
      title: 'Evidence-Based Testing Lab',
      description:
        'Honest testing with zero invented security claims. Generated verification test cases remain strictly labeled Not Run until confirmed by real testing suites.',
      border: 'border-white/10 hover:border-rose-400/40',
      accent: 'text-rose-400',
    },
    {
      icon: GitBranch,
      tag: 'DECISION LOG',
      title: 'Architecture Decision Records (ADR)',
      description:
        'Records key technology choices (DEC-001), evaluated alternatives, and engineering consequences to eliminate forgotten context and team debate.',
      border: 'border-white/10 hover:border-purple-400/40',
      accent: 'text-purple-400',
    },
    {
      icon: PackageCheck,
      tag: 'EXPORT BUNDLE',
      title: 'AI Coding Assistant Build Pack',
      description:
        'Exports complete engineering packages as structured Markdown, JSON, SQL DDL, and prompt bundles optimized for immediate implementation in Cursor, Claude, or Copilot.',
      border: 'border-white/10 hover:border-ember/40',
      accent: 'text-ember',
    },
  ];

  return (
    <section id="capabilities" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
          <span className="text-ember font-bold">CAPABILITIES</span>
          <span>·</span>
          <span>THE BLUEPRINT NOIR TOOLKIT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Tools built for <span className="metal">builders</span>, not chat transcripts.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-white max-w-2xl mx-auto font-normal">
          Every capability is connected in a single graph. Scope adjustments automatically propagate 
          downstream to components, schemas, tasks, and test suites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
        {capabilities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`glass-card p-6 rounded-3xl border ${item.border} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${item.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">{item.tag}</span>
                </div>

                <h3 className="text-base font-sans font-bold text-white mb-2">{item.title}</h3>

                <p className="text-zinc-300 text-xs font-sans leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Stage 1-5 Traceable</span>
                <span className={item.accent}>● Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
