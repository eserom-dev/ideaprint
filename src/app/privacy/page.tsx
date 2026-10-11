'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-ember" />
            <span>LEGAL SPECIFICATION · PRIVACY POLICY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-white mb-4">
            Privacy Policy
          </h1>

          <p className="text-sm font-mono text-zinc-400">
            Last updated: October 11, 2026 · Effective Immediately
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-zinc-300 font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">01.</span> Commitment to Builder Privacy
            </h2>
            <p>
              At IDEAPRINT, your software architecture, proprietary business logic, and generated blueprints belong entirely to you. We do not sell your personal data, nor do we use your private project ideas or generated specifications to train third-party foundation models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">02.</span> Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Account Credentials:</strong> Email address, hashed authentication credentials, and Supabase OAuth identity metadata required to verify access to your projects.
              </li>
              <li>
                <strong className="text-zinc-200">Project Inputs:</strong> Idea descriptions, target constraints (stack, timeline, budget), entity definitions, and task records stored securely under PostgreSQL Row Level Security (RLS).
              </li>
              <li>
                <strong className="text-zinc-200">Operational Telemetry:</strong> Anonymized error traces and generation latency used strictly to detect pipeline failures and enforce rate limits.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">03.</span> AI Gateway Processing
            </h2>
            <p>
              When you trigger an engineering generation pipeline, your structured prompt is transmitted over TLS 1.3 to our server-side gateway (connecting to providers such as Google Gemini or Groq Cloud). Data passed through these enterprise inference APIs is processed transiently for blueprint creation and is not retained for model training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">04.</span> Data Security & RLS
            </h2>
            <p>
              Every database record in IDEAPRINT is protected by PostgreSQL Row Level Security (RLS) bound directly to your authenticated Supabase user ID. No tenant can view, query, or mutate blueprints belonging to another user.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">05.</span> Your Data Rights & Deletion
            </h2>
            <p>
              You maintain total sovereignty over your data. You may export your entire blueprint graph as JSON, SQL, or Markdown at any time, or permanently delete your account and all associated projects directly in <Link href="/settings" className="text-ember hover:underline">Account Settings</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">06.</span> Contact
            </h2>
            <p>
              For privacy inquiries, compliance verification, or data subject access requests, reach our security team at{' '}
              <span className="font-mono text-ember">security@ideaprint.dev</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
