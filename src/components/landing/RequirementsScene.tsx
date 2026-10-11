'use client';

import React, { useState } from 'react';
import { ProvenanceBadge, PriorityBadge } from '@/components/ui/ProvenanceBadge';
import { RequirementItem } from '@/types/blueprint';
import { Sparkles, Check, Lock, Unlock, CornerDownRight } from 'lucide-react';

interface RequirementsSceneProps {
  initialPrompt?: string;
}

export const RequirementsScene: React.FC<RequirementsSceneProps> = ({ initialPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'functional' | 'non_functional'>('all');
  const [items, setItems] = useState<RequirementItem[]>([
    {
      displayId: 'FR-001',
      kind: 'functional',
      statement: 'Teachers can record period attendance rosters with immediate optimistic state persistence.',
      priority: 'must',
      category: 'Attendance Core',
      rationale: 'Core operational duty; eliminates lost attendance records from paper rosters.',
      acceptanceCriteria: [
        'Roster loads 30 students in < 350ms on mobile connection',
        'Marking status (Present, Absent, Tardy) updates database with optimistic local fallback',
        'Editing records past 24 hours requires administrative unlock',
      ],
      derivesFrom: ['PRB-001', 'US-001'],
      origin: 'user',
      status: 'accepted',
      confidence: 'high',
      locked: true,
    },
    {
      displayId: 'FR-002',
      kind: 'functional',
      statement: 'Gradebook auto-calculates weighted categories (Exams 50%, Homework 30%, Labs 20%) with live GPA recalculation.',
      priority: 'must',
      category: 'Gradebook',
      rationale: 'Essential for semester evaluations and guardian progress reporting.',
      acceptanceCriteria: [
        'Supports precision up to 2 decimal places with standard academic rounding',
        'Highlights students dipping below state academic passing thresholds in red',
      ],
      derivesFrom: ['US-002'],
      origin: 'ai_proposed',
      status: 'accepted',
      confidence: 'high',
      confidenceReason: 'Inferred from academic administrative standards',
      locked: false,
    },
    {
      displayId: 'NFR-001',
      kind: 'non_functional',
      statement: 'All student and grade records are isolated by tenant_id using PostgreSQL Row Level Security (RLS).',
      priority: 'must',
      category: 'Security & RLS',
      rationale: 'Mandatory FERPA and student data privacy compliance.',
      acceptanceCriteria: [
        'RLS policies deny cross-school queries at the database engine layer',
        'Query from School A teacher returns 404 for School B student ID without data leakage',
      ],
      derivesFrom: ['GOL-001'],
      origin: 'user',
      status: 'accepted',
      confidence: 'high',
      locked: true,
    },
    {
      displayId: 'FR-003',
      kind: 'functional',
      statement: 'System generates cryptographically verifiable digital report cards exportable as PDF.',
      priority: 'should',
      category: 'Reporting',
      rationale: 'Enables end-of-term student distribution without proprietary third-party document software.',
      acceptanceCriteria: [
        'Renders report card layout with school seal, course breakdown, and attendance %',
        'Outputs PDF under 400KB per student with SHA-256 integrity hash',
      ],
      derivesFrom: ['US-003'],
      origin: 'ai_proposed',
      status: 'proposed',
      confidence: 'medium',
      confidenceReason: 'Requires PDF generation engine on serverless runtime',
      locked: false,
    },
  ]);

  const toggleStatus = (displayId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.displayId === displayId) {
          const nextStatus = item.status === 'accepted' ? 'proposed' : 'accepted';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const toggleLock = (displayId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.displayId === displayId) {
          return { ...item, locked: !item.locked };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.kind === selectedCategory;
  });

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header - Clean, professional, no raw scene codes */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">ATOMIC REQUIREMENTS</span>
            <span>·</span>
            <span>PROVENANCE & ACCEPTANCE CRITERIA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            Every requirement gets an <span className="metal">ID, origin,</span> and <span className="text-ember">criteria</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl font-normal">
            No vague bullet points. Output is schema-validated, tagged with who created it (user vs. AI proposed), 
            and locked against unintended changes.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedCategory === 'all'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Requirements ({items.length})
            </button>
            <button
              onClick={() => setSelectedCategory('functional')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedCategory === 'functional'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Functional (FR)
            </button>
            <button
              onClick={() => setSelectedCategory('non_functional')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedCategory === 'non_functional'
                  ? 'bg-zinc-800 text-white font-bold border border-white/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Non-Functional (NFR)
            </button>
          </div>

          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive: Click to Accept or Lock</span>
          </div>
        </div>

        {/* Requirements Stack */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isAccepted = item.status === 'accepted';
            return (
              <div
                key={item.displayId}
                className={`glass-card p-6 rounded-2xl border transition-all duration-200 ${
                  isAccepted
                    ? 'border-white/15 bg-zinc-950/90'
                    : 'border-ember/40 bg-zinc-900/80 shadow-[0_0_20px_rgba(255,107,44,0.08)]'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-white px-2.5 py-1 rounded bg-zinc-900 border border-white/10">
                      {item.displayId}
                    </span>
                    <PriorityBadge priority={item.priority} />
                    <ProvenanceBadge
                      origin={item.origin}
                      confidence={item.confidence}
                      confidenceReason={item.confidenceReason}
                      locked={item.locked}
                    />
                    <span className="text-xs font-mono text-zinc-400 uppercase px-2 py-0.5 rounded bg-white/5 hidden sm:inline">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLock(item.displayId)}
                      className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        item.locked
                          ? 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700'
                          : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title={item.locked ? 'Locked: Immune to regeneration' : 'Unlocked: Click to lock'}
                    >
                      {item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => toggleStatus(item.displayId)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isAccepted
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/70'
                          : 'bg-ember text-zinc-950 hover:bg-ember-hover shadow-glow'
                      }`}
                    >
                      {isAccepted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accepted</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Review & Accept</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Requirement Statement */}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                  {item.statement}
                </h3>

                {/* Rationale & Derives From */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-300 mb-4 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-zinc-400">Rationale: </span>
                    <span className="text-zinc-200">{item.rationale}</span>
                  </div>
                  {item.derivesFrom.length > 0 && (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <span>Derives from:</span>
                      {item.derivesFrom.map((src) => (
                        <span key={src} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-white/10">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acceptance Criteria Checklist */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                    Acceptance Criteria Checklist:
                  </span>
                  {item.acceptanceCriteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200 font-mono">
                      <CornerDownRight className="w-3.5 h-3.5 text-ember mt-0.5 flex-shrink-0" />
                      <span className="font-sans leading-relaxed text-zinc-200">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
