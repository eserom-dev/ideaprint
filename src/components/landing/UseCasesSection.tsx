'use client';

import React, { useState } from 'react';
import { Code, Briefcase, Users, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  tagline: string;
  jobToBeDone: string;
  pains: string[];
  keyFeatures: string[];
  outcome: string;
}

export const UseCasesSection: React.FC = () => {
  const [activePersonaId, setActivePersonaId] = useState<string>('solo');

  const personas: Persona[] = [
    {
      id: 'solo',
      name: 'Solo Developer',
      role: 'Indie Hacker / Solo Engineer',
      icon: Code,
      tagline: 'Ship side projects and full-stack MVPs without architectural regret.',
      jobToBeDone: 'When I have an idea, I want an architectural plan I can trust so I start coding immediately without second-guessing my stack or forgetting auth edge cases.',
      pains: [
        'Over-scoping features before validating core user value',
        'Picking tech stacks by trend instead of project constraints',
        'Forgetting multi-tenancy and permission edge cases',
      ],
      keyFeatures: [
        'Constraint-aware stack recommendation',
        'Strict MVP feature cut (Must vs. Could)',
        'PostgreSQL schema and RLS generation',
        'Exportable AI Coding Assistant Build Pack',
      ],
      outcome: 'A focused MVP, verified database schema, and an organized task board ready for coding on day one.',
    },
    {
      id: 'founder',
      name: 'Technical Founder',
      role: 'Founders & Product Leads',
      icon: Briefcase,
      tagline: 'Bridge business vision into technical specifications developers can act on.',
      jobToBeDone: 'When I brief development teams or contractors, I want an engineering specification that eliminates ambiguity so timelines stay predictable.',
      pains: [
        'Vague, hand-wavy briefs that balloon into budget overruns',
        'Unchecked scope creep during development sprints',
        'No technical clarity to evaluate architectural trade-offs',
      ],
      keyFeatures: [
        'Plain-language explanation mode',
        'Stage-by-stage MVP scope phasing',
        'Read-only interactive share link',
        'Client-safe Markdown and PDF export',
      ],
      outcome: 'Clear, plain-language requirements and an explicit exclusions list to keep engineering on budget.',
    },
    {
      id: 'agency',
      name: 'Agency Lead',
      role: 'Agencies & Freelancers',
      icon: Users,
      tagline: 'Turn rough client emails into scoped, quotable, profitable proposals.',
      jobToBeDone: 'When a prospective client sends a brief, I want a credible, professional scope fast so I can quote accurately without days of unpaid discovery.',
      pains: [
        'Unpaid, exhausting discovery cycles',
        'Post-handover scope disputes ("I thought this was included")',
        'Inaccurate timeline and milestone forecasts',
      ],
      keyFeatures: [
        'Explicit exclusions and out-of-scope list',
        'Effort range estimations with stated confidence',
        'Reusable client blueprint templates',
        'Instant statement of work export',
      ],
      outcome: 'A client-ready scope with milestones and an explicit exclusions list in under 15 minutes.',
    },
    {
      id: 'student',
      name: 'Engineering Student',
      role: 'Emerging Software Engineers',
      icon: GraduationCap,
      tagline: 'Learn real-world software architecture and production engineering patterns.',
      jobToBeDone: 'When I build a portfolio project, I want to learn how senior engineers design databases, APIs, and test plans.',
      pains: [
        'Tutorial hell: knowing syntax but not how to architect systems',
        'Blank canvas paralysis when starting complex full-stack apps',
        'Overlooking testing and non-functional requirements',
      ],
      keyFeatures: [
        'Architectural decision rationales (ADRs)',
        'Educational explanations of security and RLS',
        'Free tier with complete blueprint workflow',
        'Interactive architecture studio',
      ],
      outcome: 'A portfolio project planned with industry-grade engineering rigor and clean documentation.',
    },
  ];

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];
  const IconComponent = activePersona.icon;

  return (
    <section id="use-cases" className="pt-32 pb-24 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/5 relative scroll-mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">USE CASES</span>
            <span>·</span>
            <span>ENGINEERED FOR YOUR ROLE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-zinc-100 max-w-3xl leading-tight">
            Tailored workflows for <span className="metal">every builder</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-200 max-w-2xl font-normal leading-relaxed">
            Whether you are coding solo on weekends or quoting six-figure client proposals, 
            IDEAPRINT keeps planning rigorous and fast.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {personas.map((persona) => {
            const isActive = activePersonaId === persona.id;
            const TabIcon = persona.icon;
            return (
              <button
                key={persona.id}
                onClick={() => setActivePersonaId(persona.id)}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ember text-zinc-950 font-bold shadow-glow scale-105'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{persona.role.split(' / ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Persona Showcase Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/15 max-w-4xl mx-auto shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-ember/20 text-ember border border-ember/30 flex items-center justify-center shadow-glow-sm flex-shrink-0">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                  {activePersona.name} <span className="text-zinc-400 font-normal text-base">· {activePersona.role}</span>
                </h3>
                <p className="text-sm text-zinc-300 mt-0.5">{activePersona.tagline}</p>
              </div>
            </div>

            <Link
              href="/projects/new"
              className="whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-850 hover:bg-zinc-750 text-xs font-mono font-medium text-white border border-white/15 transition-all hover:border-white/30 hover:scale-[1.02] shadow-sm"
            >
              <span>Create Blueprint</span>
              <ArrowRight className="w-3.5 h-3.5 text-ember" />
            </Link>
          </div>

          {/* Job to be done quote — bright white visible text */}
          <div className="my-6 p-5 rounded-2xl bg-zinc-900/90 border border-white/15 font-sans text-sm sm:text-base border-l-4 border-l-ember shadow-inner">
            <p className="text-zinc-100 font-medium italic leading-relaxed">
              "{activePersona.jobToBeDone}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Pains */}
            <div>
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold block mb-3">
                Persistent Frustrations:
              </span>
              <ul className="space-y-2.5">
                {activePersona.pains.map((pain, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="text-rose-400 mt-1">✕</span>
                    <span>{pain}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Features & Outcome */}
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold block mb-3">
                Key Workflow Features:
              </span>
              <ul className="space-y-2.5 mb-6">
                {activePersona.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
                <span className="text-ember font-bold">Target Outcome: </span>
                {activePersona.outcome}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
