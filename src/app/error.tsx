'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-white/15 text-center relative z-10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20 text-xs font-mono text-red-300 mb-4">
          <span>PIPELINE INTERRUPTED</span>
        </div>

        <h1 className="text-2xl font-display font-bold uppercase tracking-tight text-white mb-3">
          Runtime Exception
        </h1>

        <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-6">
          An unexpected condition occurred during rendering. Details have been logged to the engineering telemetry stream.
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 rounded-lg bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-400">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-ember hover:bg-ember/90 text-xs font-mono text-zinc-950 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
