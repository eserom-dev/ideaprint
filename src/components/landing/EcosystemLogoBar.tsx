'use client';

import React from 'react';
import { Database, Cpu, Terminal, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';

export const EcosystemLogoBar: React.FC = () => {
  const stackItems = [
    { name: 'Next.js 14', label: 'App Router', icon: '▲' },
    { name: 'TypeScript', label: 'Type Safety', icon: 'TS' },
    { name: 'PostgreSQL', label: 'Relational DB', icon: 'PG' },
    { name: 'Supabase', label: 'Auth & RLS', icon: '⚡' },
    { name: 'Tailwind CSS', label: 'Design System', icon: '≈' },
    { name: 'Google Gemini', label: 'Reasoning AI', icon: '✦' },
    { name: 'Groq LPU', label: 'Speed Inference', icon: '⚡' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-16 sm:pt-20 pb-8">
      <div className="text-center mb-6">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          POWERED BY THE PRODUCTION ENGINEERING STACK
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-8 opacity-80 hover:opacity-100 transition-opacity">
        {stackItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/40 border border-white/5 hover:border-white/15 transition-all text-white"
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-ember">
              {item.icon}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-sans font-bold text-xs tracking-tight text-white">{item.name}</span>
              <span className="font-mono text-[9px] text-zinc-400 -mt-0.5">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
