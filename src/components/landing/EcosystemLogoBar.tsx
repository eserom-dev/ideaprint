'use client';

import React from 'react';

export const EcosystemLogoBar: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-16 sm:pt-20 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-8 sm:gap-12 opacity-70 hover:opacity-90 transition-opacity">
        {/* 1. Meta */}
        <div className="flex items-center gap-2 text-white">
          <svg className="w-7 h-5 fill-current" viewBox="0 0 32 20">
            <path d="M16 9.4C13.8 4.2 10.9 1 7.4 1 3.3 1 0 5 0 10s3.3 9 7.4 9c3.7 0 6.6-3.4 8.6-8.6 2 5.2 4.9 8.6 8.6 8.6 4.1 0 7.4-4 7.4-9s-3.3-9-7.4-9c-3.5 0-6.4 3.2-8.6 8.4zm-8.6 6.6c-2.4 0-4.4-2.7-4.4-6s2-6 4.4-6c2.5 0 4.7 3 6.3 6-1.6 3-3.8 6-6.3 6zm17.2 0c-2.5 0-4.7-3-6.3-6 1.6-3 3.8-6 6.3-6 2.4 0 4.4 2.7 4.4 6s-2 6-4.4 6z" />
          </svg>
          <span className="font-sans font-semibold text-lg tracking-tight">Meta</span>
        </div>

        {/* 2. BLACKBOX.AI */}
        <div className="flex items-center gap-2 text-white">
          <div className="w-5 h-5 rounded border-2 border-white flex items-center justify-center font-mono text-[10px] font-bold">
            B
          </div>
          <span className="font-sans font-bold text-sm tracking-wider">BLACKBOX.AI</span>
        </div>

        {/* 3. DOORDASH */}
        <div className="flex items-center gap-2 text-white">
          <svg className="w-7 h-4 fill-current" viewBox="0 0 24 14">
            <path d="M22.5 7c0-3.9-3.1-7-7-7H0l3.8 7H15.5c1.9 0 3.5 1.6 3.5 3.5S17.4 14 15.5 14H8l3.8 0c5.9 0 10.7-3.1 10.7-7z" />
          </svg>
          <span className="font-sans font-extrabold text-sm tracking-tight">DOORDASH</span>
        </div>

        {/* 4. OpenAI */}
        <div className="flex items-center gap-2 text-white">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .778 0l5.842-3.37v2.332a.08.08 0 0 1-.033.064L9.73 19.986a4.5 4.5 0 0 1-6.13-1.682zm-1.1-9.92a4.47 4.47 0 0 1 2.34-1.975v5.676a.799.799 0 0 0 .387.68l5.836 3.37-2.02 1.168a.08.08 0 0 1-.073.007L4.1 14.502a4.499 4.499 0 0 1-1.6-6.118zm16.924 3.42l-5.84-3.37 2.02-1.166a.08.08 0 0 1 .073-.008l4.842 2.796a4.499 4.499 0 0 1-.715 8.125v-5.696a.799.799 0 0 0-.38-.681zm2.096-3.804l-.143-.085-4.777-2.758a.776.776 0 0 0-.782 0l-5.84 3.37V6.195a.08.08 0 0 1 .033-.064l4.847-2.81a4.5 4.5 0 0 1 6.662 4.479zM8.706 13.068l2.5-1.442 2.5 1.442v2.884l-2.5 1.443-2.5-1.443v-2.884z" />
          </svg>
          <span className="font-sans font-bold text-base tracking-tight">OpenAI</span>
        </div>

        {/* 5. SPACEX */}
        <div className="flex items-center text-white">
          <span className="font-sans font-extrabold text-sm tracking-[0.25em]">SPACEX</span>
        </div>

        {/* 6. The Weather Company */}
        <div className="flex items-center gap-1.5 text-white">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a9 9 0 0 0-9 9c0 6.6 9 11 9 11s9-4.4 9-11a9 9 0 0 0-9-9zm0 15a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
          </svg>
          <div className="flex flex-col text-left leading-none">
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-400">The</span>
            <span className="font-sans font-bold text-xs tracking-tight">Weather Company</span>
          </div>
        </div>

        {/* 7. Polymarket */}
        <div className="flex items-center gap-2 text-white">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-10-5v10l10 5 10-5V6l-10 5z" />
          </svg>
          <span className="font-sans font-bold text-sm tracking-tight">Polymarket</span>
        </div>
      </div>
    </div>
  );
};
