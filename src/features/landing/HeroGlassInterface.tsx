'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { HeroBacklitPrism } from './HeroBacklitPrism';
import { EcosystemLogoBar } from '@/components/landing/EcosystemLogoBar';

export const HeroGlassInterface: React.FC = () => {
  const scrollToNextScene = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('scene-002');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-20 w-full min-h-[92vh] flex flex-col justify-between pt-24 sm:pt-28 pb-10">
      {/* 1. Top Announcement Banner Pill (Centered horizontally, matching reference) */}
      <div className="w-full flex justify-center px-4 mb-8 sm:mb-12">
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-850 border border-white/10 hover:border-white/25 text-xs text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-200 group"
        >
          <span className="text-zinc-400 group-hover:text-zinc-300 font-normal">
            Stage 1 to 5 Lifecycle Engine
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="font-medium text-white flex items-center gap-1">
            Build your first blueprint
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>

      {/* 2. Main 3-Zone Hero Grid (Left Headline, Center Backlit Monolith, Right Statement) */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* Left Zone: Bold Neo-Grotesque Headline & Primary Action CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start text-left z-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-[82px] font-sans font-bold tracking-[-0.035em] text-white leading-[1.02] mb-8 select-none">
              Agentic <br />
              Architecture
            </h1>

            {/* CTAs matching reference: Solid pill + Dark border pill */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/projects/new"
                className="whitespace-nowrap flex-shrink-0 px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm tracking-tight transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-center"
              >
                Deploy now
              </Link>

              <a
                href="#scene-002"
                onClick={scrollToNextScene}
                className="whitespace-nowrap flex-shrink-0 px-6 sm:px-7 py-3 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-white font-medium text-sm border border-white/15 hover:border-white/30 backdrop-blur-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                Explore platform
              </a>
            </div>
          </div>

          {/* Center Zone: Iconic Backlit Monolithic Triangle (Eclipse Centerpiece) */}
          <div className="lg:col-span-4 flex items-center justify-center relative w-full overflow-visible py-4 sm:py-0">
            <HeroBacklitPrism />
          </div>

          {/* Right Zone: 3-Line Architectural Statement (Aligned with reference layout) */}
          <div className="lg:col-span-3 flex flex-col space-y-3.5 text-left text-zinc-300 text-base sm:text-lg font-normal tracking-[-0.015em] lg:pl-6 z-10">
            <p className="text-zinc-200 font-medium">For full-stack builders</p>
            <p className="text-zinc-300">To ship apps and systems</p>
            <p className="text-zinc-400">Automated by dual AI engines</p>
          </div>

        </div>
      </div>

      {/* 3. Bottom Partner / Ecosystem Logos (Full-width clean row matching reference) */}
      <div className="w-full mt-auto">
        <EcosystemLogoBar />
      </div>
    </div>
  );
};
