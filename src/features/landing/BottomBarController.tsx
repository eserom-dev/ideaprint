'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowUp, ArrowRight } from 'lucide-react';

export const BottomBarController: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sceneIds = [
    'hero',
    'scene-002',
    'scene-003',
    'scene-004',
    'scene-005',
    'pricing',
  ];

  const nextSceneLabels = [
    'The gap',
    'Atomic specs',
    'System graph',
    'Task DAG',
    'Testing gate',
    'Top',
  ];

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
        setScrollProgress(progress);
        const sceneIndex = Math.min(Math.floor(progress * 6) + 1, 6);
        setCurrentScene(sceneIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToScene = (index: number) => {
    const id = sceneIds[index];
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentScene >= 6) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      jumpToScene(currentScene);
    }
  };

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-6 sm:px-12 pointer-events-none">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
        {/* Left: Explore trigger */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer" onClick={() => jumpToScene(1)}>
          <span className="tracking-widest uppercase font-semibold text-[11px] text-zinc-300">EXPLORE</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Center: Monospace Scene Counter */}
        <div className="pointer-events-auto px-4 py-1.5 rounded-full bg-zinc-950/70 border border-white/10 backdrop-blur-md shadow-xl flex items-center gap-2 font-bold text-zinc-300">
          <span className="text-zinc-100">00{currentScene}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">006</span>
        </div>

        {/* Right: Next Section Pill */}
        <div className="pointer-events-auto flex items-center">
          <button
            onClick={handleNext}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-white/15 backdrop-blur-md hover:border-white/30 transition-all group"
            aria-label="Navigate to next section"
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 group-hover:text-zinc-300">
              NEXT
            </span>
            <span className="text-xs font-semibold text-white group-hover:text-ember transition-colors">
              {nextSceneLabels[currentScene - 1]}
            </span>

            {/* Circular Progress Ring */}
            <div className="relative w-8 h-8 flex items-center justify-center ml-1">
              <svg className="w-8 h-8 -rotate-90 transform">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-zinc-800"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-ember transition-all duration-150"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {currentScene >= 6 ? (
                <ArrowUp className="w-3.5 h-3.5 absolute text-ember group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 absolute text-ember group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
