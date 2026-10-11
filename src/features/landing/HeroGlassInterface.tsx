'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { BlueprintGraphScene } from './BlueprintGraphScene';

export const HeroGlassInterface: React.FC = () => {
  const scrollToNextScene = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('scene-002');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-16 sm:pt-20 pb-4 h-full flex flex-col justify-center items-center">
      {/* 1. Top Announcement Pill */}
      <div className="w-full flex justify-center mb-3 sm:mb-5">
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/25 text-xs text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-200 group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
          <span className="font-semibold text-white">Stage 1 to 5 Lifecycle Engine</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-300 flex items-center gap-1 group-hover:text-white">
            Build Your First Blueprint
            <ChevronRight className="w-3.5 h-3.5 text-ember group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>

      {/* 2. Main Hero Grid: Left Content & Right 3D Isometric Architecture Graph */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Left Column: Authentic IDEAPRINT Headline, Subtitle, and CTAs */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-[66px] font-display font-extrabold tracking-tight text-white leading-[0.98] mb-3 sm:mb-5 select-none drop-shadow-2xl uppercase">
            MAKE IDEAS <br />
            <span className="metal">BUILDABLE.</span>
          </h1>

          <p className="max-w-xl text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-6 sm:mb-7 drop-shadow-md">
            Turn your software ideas into structured requirements, technical architecture, 
            development tasks, and actionable product blueprints — all in one intelligent workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/projects/new"
              className="whitespace-nowrap flex-shrink-0 w-full sm:w-auto px-7 py-3.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Build Your Blueprint</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <a
              href="#scene-002"
              onClick={scrollToNextScene}
              className="whitespace-nowrap flex-shrink-0 w-full sm:w-auto px-7 py-3.5 rounded-full bg-zinc-900/80 hover:bg-zinc-850 text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Explore the Platform
            </a>
          </div>
        </div>

        {/* Right Column: Interactive 3D Isometric Architecture Graph */}
        <div className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center lg:justify-end overflow-visible">
          <BlueprintGraphScene />
        </div>
      </div>
    </div>
  );
};
