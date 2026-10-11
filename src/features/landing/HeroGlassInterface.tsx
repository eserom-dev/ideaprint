'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Layers, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

export const HeroGlassInterface: React.FC = () => {
  const scrollToNextScene = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('scene-002');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Live System Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-white/15 backdrop-blur-md mb-8 text-xs font-mono text-white shadow-lg">
        <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
        <span className="font-semibold text-zinc-100">ENGINEERING WORKSPACE</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-300">STAGE 1 TO 5 LIFECYCLE</span>
      </div>

      {/* Extended Black Headline */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white max-w-3xl leading-[1.08] mb-6 select-none drop-shadow-xl uppercase">
        Make ideas <br />
        <span className="metal">buildable.</span>
      </h1>

      {/* Supporting Text from Product Blueprint */}
      <p className="max-w-2xl text-base sm:text-lg text-white font-normal leading-relaxed mb-10 drop-shadow-md">
        The product engineering workspace that turns software concepts into structured, 
        traceable blueprints: atomic requirements, architecture models, PostgreSQL schemas, 
        and development task graphs.
      </p>

      {/* Two Canonical Buttons (Build Your Blueprint & Explore Platform) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
        <Link
          href="/sign-up"
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-glow transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Build Your Blueprint</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>

        <a
          href="#scene-002"
          onClick={scrollToNextScene}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white font-mono text-sm uppercase tracking-wider border border-white/20 transition-all duration-150 hover:border-white/40 flex items-center justify-center gap-2.5 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Layers className="w-4 h-4 text-zinc-300" />
          <span>Explore the Platform</span>
        </a>
      </div>

      {/* Proof Points Row (Real Architecture) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 w-full max-w-3xl text-left font-mono">
        <div className="flex items-center gap-2.5 text-xs text-zinc-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Traceable Engineering Graph</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-zinc-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>PostgreSQL Relational Schema & RLS</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-zinc-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>OpenAPI Contracts & Build Packs</span>
        </div>
      </div>
    </div>
  );
};
