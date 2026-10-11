import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Layers, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ember/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-white/15 text-center relative z-10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-6 text-ember shadow-glow-sm">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
          <span className="text-ember font-bold">ERROR 404</span>
          <span>·</span>
          <span>COORDINATE UNRESOLVED</span>
        </div>

        <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-8">
          The blueprint, documentation, or route you requested does not exist or has been moved to an updated namespace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Page</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-ember hover:bg-ember/90 text-xs font-mono text-zinc-950 font-bold flex items-center justify-center gap-2 transition-colors shadow-glow"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
