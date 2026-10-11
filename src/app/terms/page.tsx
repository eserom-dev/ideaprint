'use client';

import React from 'react';
import Link from 'next/link';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { Footer } from '@/components/landing/Footer';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5 text-ember" />
            <span>LEGAL SPECIFICATION · TERMS OF SERVICE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-white mb-4">
            Terms of Service
          </h1>

          <p className="text-sm font-mono text-zinc-400">
            Last updated: October 11, 2026 · Effective Immediately
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-zinc-300 font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing or using IDEAPRINT (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or legal entity, you represent that you have authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">02.</span> Intellectual Property & Ownership
            </h2>
            <p>
              You retain 100% full ownership, copyright, and commercial rights to all ideas, prompts, requirements, architecture models, database schemas, and code specifications generated within your IDEAPRINT workspaces. IDEAPRINT claims zero ownership over your outputs or intellectual property.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">03.</span> Generation & Disclaimers
            </h2>
            <p>
              IDEAPRINT provides AI-assisted product engineering recommendations. While schemas and OpenAPI contracts follow strict validation rules, generated outputs are engineering proposals. You are responsible for reviewing, testing, and confirming security configurations (e.g. database RLS, API authentication) before deploying production code.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">04.</span> Usage Tiers & Quotas
            </h2>
            <p>
              The Free plan includes full access to core blueprint creation, architecture studios, and export capabilities under standard rate limits. Pro and Team tiers introduce elevated concurrency and team collaboration upon public availability. Reverse engineering, scraping, or abusing gateway endpoints is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">05.</span> Account Termination
            </h2>
            <p>
              You may terminate your account at any time via the Settings console. We reserve the right to suspend accounts that violate security rules, attempt denial-of-service against the API gateway, or breach these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="text-ember font-mono text-xs">06.</span> Contact
            </h2>
            <p>
              For legal questions regarding these Terms, contact our legal team at{' '}
              <span className="font-mono text-ember">legal@ideaprint.dev</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
