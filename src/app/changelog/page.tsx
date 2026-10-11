'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v2.0.0',
      date: 'October 10, 2026',
      badge: 'Major Release',
      title: 'Blueprint Noir Design Direction & Multi-Pass AI Pipeline',
      highlights: [
        'Adopted Blueprint Noir design system: obsidian base (#0A0A0B), hairline 12-column grid, and ember radiant accents (#FF6B2C).',
        'Introduced the Blueprint Graph: typed records (FR, CMP, ENT, TSK, TC) replace monolithic text documents.',
        'Added the 8-Pass Generation Pipeline with independent Critic Review pass.',
        'Launched Evidence-Based Blueprint Health indicator computed from saved records.',
        'Portable Build Pack bundle export formatted for Claude, Cursor, and Copilot.',
      ],
    },
    {
      version: 'v1.4.0',
      date: 'September 2026',
      badge: 'Feature Update',
      title: 'PostgreSQL Row Level Security (RLS) Generator',
      highlights: [
        'Automated database entity to PostgreSQL migration DDL export.',
        'Built-in has_project_access security functions for multi-tenant isolation.',
        'Testing Lab with honest "Not Run" status defaults.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
            <span>RELEASE HISTORY & UPDATES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold uppercase tracking-tight text-white mb-6">
            Release <span className="metal">Changelog</span>.
          </h1>

          <p className="text-base text-zinc-400 font-sans leading-relaxed">
            Track new capabilities, architectural enhancements, and schema updates.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((rel) => (
            <div key={rel.version} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold text-white">{rel.version}</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-ember-soft text-ember border border-ember/20 font-bold uppercase">
                    {rel.badge}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500">{rel.date}</span>
              </div>

              <h2 className="text-xl font-display font-bold text-white">{rel.title}</h2>

              <ul className="space-y-2 pt-2 text-sm text-zinc-300 font-sans">
                {rel.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
