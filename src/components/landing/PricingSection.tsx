'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [selectedWaitlistPlan, setSelectedWaitlistPlan] = useState<'pro' | 'team'>('pro');
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      tagline: 'Experience real value with your complete first blueprint.',
      price: '$0',
      period: 'forever',
      limits: '1 Active Blueprint Project · 30 Generations/mo · Community Support',
      features: [
        '1 Active Blueprint Project',
        'Complete 5-Stage Engineering Lifecycle',
        'Multi-Pass AI Generation Gateway (Gemini 2.5 Flash / Groq)',
        'Full Interactive Task Board & Dependencies',
        'PostgreSQL Schema & RLS Policy Generation',
        'Markdown & JSON Schema Exports',
      ],
      cta: 'Start Building Free',
      ctaAction: 'signup',
      ctaClass: 'bg-ember hover:bg-ember-hover text-zinc-950 font-bold shadow-glow',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'For serious indie builders, solo architects, and freelancers.',
      price: annualBilling ? '$19' : '$24',
      period: 'per month (Waitlist)',
      limits: 'Unlimited Projects · Priority Model Routing · Diff Engine',
      features: [
        'Unlimited Active Projects',
        'Full Engineering Studio (Database DDL + OpenAPI)',
        'Mermaid Architecture & ERD Exporters',
        'AI Coding Assistant Build Pack Bundle',
        'Targeted Section-by-Section Regeneration',
        'Full Revision Diffs & Version History',
        'Priority AI Generation Gateway',
      ],
      cta: 'Join Pro Waitlist',
      ctaAction: 'waitlist',
      ctaClass: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/15',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      tagline: 'For small development teams, product squads, and agencies.',
      price: annualBilling ? '$49' : '$59',
      period: 'per seat / month (Waitlist)',
      limits: 'Multi-Seat RBAC · Pooled AI Quota · Client Statement of Work',
      features: [
        'Everything in Pro Plan',
        'Shared Organization Workspaces',
        'Multi-User Roles (Admin, Editor, Reviewer)',
        'Real-time Item Comments & Discussions',
        'Custom Agency Client Statement of Work Exporter',
        'Pooled Organization AI Credits',
      ],
      cta: 'Join Team Waitlist',
      ctaAction: 'waitlist',
      ctaClass: 'bg-zinc-850 hover:bg-zinc-750 text-white border border-white/10',
      popular: false,
    },
  ];

  const handleOpenWaitlist = (planId: 'pro' | 'team') => {
    setSelectedWaitlistPlan(planId);
    setSubmitSuccess(null);
    setSubmitError(null);
    setWaitlistModalOpen(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), plan: selectedWaitlistPlan }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to join waitlist.');
      } else {
        setSubmitSuccess(data.message || 'You have been added to the waitlist!');
        setEmailInput('');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">TRANSPARENT PRICING</span>
            <span>·</span>
            <span>REAL LIMITS, NO ARTIFICIAL GATING</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            Plans calibrated for <span className="metal">real engineering</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white max-w-2xl font-normal">
            The Free plan includes the complete 5-stage blueprint workflow. Pro and Team tiers are opening to early waitlist builders.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-full transition-all ${
                !annualBilling ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                annualBilling ? 'bg-ember text-zinc-950 font-bold shadow-glow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-zinc-900 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-3xl p-6 sm:p-8 border flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular ? 'border-ember/60 shadow-[0_20px_50px_rgba(255,107,44,0.1)]' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-ember text-zinc-950 font-mono text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Early Access</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{plan.period}</span>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs font-mono text-zinc-400">/{plan.period.split(' ')[0]}</span>
                </div>

                <div className="mb-4 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {plan.limits}
                </div>

                <p className="text-xs text-zinc-300 mb-6 font-sans leading-relaxed min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Features list */}
                <div className="space-y-3 mb-8 pt-4 border-t border-white/10">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">Included capabilities:</span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white font-sans">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.ctaAction === 'signup' ? (
                <Link
                  href="/sign-up"
                  className={`w-full py-3.5 rounded-2xl text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all duration-200 ${plan.ctaClass}`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  onClick={() => handleOpenWaitlist(plan.id as 'pro' | 'team')}
                  className={`w-full py-3.5 rounded-2xl text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all duration-200 ${plan.ctaClass}`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Honest Guardrail Note */}
        <div className="mt-14 p-5 rounded-2xl bg-zinc-900/60 border border-white/10 max-w-3xl mx-auto flex items-center gap-4 text-xs font-mono text-zinc-300">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <span>
            <strong className="text-white">Honesty Guardrail:</strong> Failed generations are never charged against quotas. 
            All generated test cases remain explicitly "Not Run" until tested by your engineering pipeline.
          </span>
        </div>
      </div>

      {/* Waitlist Modal */}
      {waitlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setWaitlistModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-mono text-ember uppercase tracking-wider font-bold">
                EARLY ACCESS QUEUE
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                Join {selectedWaitlistPlan.toUpperCase()} Waitlist
              </h3>
              <p className="text-xs text-zinc-300 font-sans mt-2">
                We are onboarding builders in cohorts to protect AI generation throughput. Enter your email to reserve your spot.
              </p>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-200 font-sans">{submitSuccess}</p>
                <button
                  onClick={() => setWaitlistModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-zinc-300 uppercase tracking-wider block mb-1">Your Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="architect@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting to database...</span>
                  ) : (
                    <>
                      <span>Join Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
