'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/10 relative overflow-hidden">
      {/* Radiant Ember Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ember/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Giant Final CTA Banner */}
        <div className="glass-card rounded-3xl p-8 sm:p-14 border border-white/15 text-center mb-20 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
            <span>START BUILDING YOUR BLUEPRINT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold uppercase tracking-tight text-white mb-6 leading-tight">
            Ready to make your <br />
            <span className="metal">idea buildable?</span>
          </h2>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-zinc-300 font-sans mb-10 leading-relaxed font-normal">
            Turn that note on your phone into a structured requirement graph, 
            PostgreSQL schema, and task board in under 15 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects/new"
              className="px-7 py-3.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-sm sm:text-base font-mono flex items-center gap-2 shadow-glow transition-all duration-150 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your Blueprint Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono text-sm border border-white/10 transition-colors flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-ember" />
              <span>Explore Console</span>
            </Link>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-16 border-b border-white/10 text-xs font-mono">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-zinc-300 font-sans text-xs leading-relaxed max-w-sm">
              IDEAPRINT is the AI-powered product engineering workspace that converts 
              software ideas into implementation-ready, traceable blueprints.
            </p>
            <div className="text-zinc-400 text-xs">
              Make Ideas Buildable · Production Ready
            </div>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <span className="text-white uppercase font-bold tracking-wider">Product</span>
            <ul className="space-y-2 text-zinc-300">
              <li><Link href="/product" className="hover:text-white transition-colors">Capabilities</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">5-Stage Journey</Link></li>
              <li><Link href="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Release Notes</Link></li>
            </ul>
          </div>

          {/* Column: Workspace */}
          <div className="space-y-3">
            <span className="text-white uppercase font-bold tracking-wider">Workspace</span>
            <ul className="space-y-2 text-zinc-300">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Console Dashboard</Link></li>
              <li><Link href="/projects/new" className="hover:text-white transition-colors">New Blueprint</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          {/* Column: Resources & Legal */}
          <div className="space-y-3">
            <span className="text-white uppercase font-bold tracking-wider">Trust & Docs</span>
            <ul className="space-y-2 text-zinc-300">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/docs#build-pack" className="hover:text-white transition-colors">Build Pack Spec</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div>
            © 2026 IDEAPRINT Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-300">Operational</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PostgreSQL RLS Protected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
