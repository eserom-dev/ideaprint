'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Database, Terminal, Layers } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const plans = [
    {
      id: 'community',
      name: 'Solo Builder',
      tagline: '100% Free forever. For indie hackers, solo developers, and weekend makers.',
      price: '$0',
      period: 'forever · 100% free',
      limits: 'Unlimited Blueprints · Full AI Engine · All Exports Included',
      features: [
        'Unlimited Active Blueprint Projects',
        'Multi-Pass AI Generation (Google Gemini & Groq)',
        'Full 5-Stage Engineering Lifecycle (Define → Deliver)',
        'PostgreSQL 15+ Schema & Row Level Security (RLS)',
        'OpenAPI 3.1 REST Contracts & Client Schemas',
        'Interactive Task DAG with Dependency Gates',
        'Testing Lab with Honest Verification Matrices',
        'Markdown, JSON & SQL DDL Full Exporters',
      ],
      cta: 'Start Building Free',
      ctaLink: '/projects/new',
      ctaClass: 'bg-zinc-850 hover:bg-zinc-750 text-white border border-white/15',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional Architect',
      tagline: '100% Free for all. For technical founders, staff engineers, and freelancers.',
      price: '$0',
      period: 'forever · 100% free',
      limits: 'All Pro Features Unlocked · Priority Model Routing · Diff Engine',
      features: [
        'Everything in Solo Builder',
        'Priority Multi-Model AI Routing (Instant Generation)',
        'Mermaid Architecture & Relational ERD Exporter',
        'AI Coding Assistant Build Pack Bundle (.cursorrules, CLAUDE.md)',
        'Targeted Section-by-Section Regeneration Engine',
        'Architectural Decision Records (ADRs) Generator',
        'Full System Risk Register & Mitigation Strategy',
        'Zero Rate Limits on Generation',
      ],
      cta: 'Build With Pro Tools',
      ctaLink: '/projects/new',
      ctaClass: 'bg-ember hover:bg-ember-hover text-zinc-950 font-bold shadow-glow',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team & Agency',
      tagline: '100% Free for teams. For development agencies, squads, and open source orgs.',
      price: '$0',
      period: 'forever · 100% free',
      limits: 'Full Organization Workspace · Multi-Seat · Statement of Work',
      features: [
        'Everything in Professional Architect',
        'Shared Organization Projects & Blueprints',
        'Client-Ready Statement of Work (SOW) Exporter',
        'Interactive Read-Only Shareable Blueprint Links',
        'Database Entity Migration Scripts',
        'Community & Enterprise Architecture Templates',
        'Full Codebase Integration Guides',
        '100% Free for Your Entire Development Team',
      ],
      cta: 'Launch Team Workspace',
      ctaLink: '/projects/new',
      ctaClass: 'bg-zinc-850 hover:bg-zinc-750 text-white border border-white/15',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 bg-base relative overflow-hidden border-t border-white/5 scroll-mt-28">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">100% FREE FOR ALL BUILDERS</span>
            <span className="text-zinc-500">·</span>
            <span>NO CREDIT CARD REQUIRED</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-[1.05]">
            Professional Engineering. <br />
            <span className="metal">100% Free for Everyone.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-200 max-w-2xl font-normal leading-relaxed">
            No paywalls. No subscription traps. Every single architecture feature, AI generation pass, 
            PostgreSQL schema, and export format is 100% free and open for all developers worldwide.
          </p>
        </div>

        {/* 3 Pricing Cards (All $0 Free) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                plan.popular
                  ? 'bg-zinc-900/90 border-2 border-ember shadow-glow'
                  : 'bg-zinc-950/80 border border-white/15 hover:border-white/25'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-ember text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider shadow-glow-sm">
                  Recommended for All Builders
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-white mb-1.5">{plan.name}</h3>
                  <p className="text-xs text-zinc-300 min-h-[36px] leading-relaxed">{plan.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wide">
                      {plan.period}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-zinc-300">
                    {plan.limits}
                  </div>
                </div>

                {/* Feature List */}
                <ul className="space-y-3 mb-8 text-xs sm:text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-zinc-100">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <Link
                href={plan.ctaLink}
                className={`w-full py-3.5 px-6 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${plan.ctaClass}`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Open Architecture Promise Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display">The Open Architecture Commitment</h4>
              <p className="text-xs text-zinc-300 mt-1">
                You own 100% of generated blueprints, code, schemas, and specifications. No vendor lock-in. 
                Export anytime to Markdown, JSON, SQL, or Mermaid.
              </p>
            </div>
          </div>

          <Link
            href="/projects/new"
            className="whitespace-nowrap flex-shrink-0 px-6 py-3 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow transition-all"
          >
            <span>Create Free Blueprint</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
