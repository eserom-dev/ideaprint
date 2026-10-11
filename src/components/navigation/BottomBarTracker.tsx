'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowUp } from 'lucide-react';

interface BottomBarTrackerProps {
  totalScenes?: number;
}

export const BottomBarTracker: React.FC<BottomBarTrackerProps> = ({
  totalScenes = 6,
}) => {
  const [currentScene, setCurrentScene] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sceneNames = [
    'The Spark & Vision',
    'The Planning Gap',
    'Atomic Requirements',
    'Architecture Graph',
    'Engineering Workspace',
    'Execution & Build',
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        setScrollProgress(progress);
        const sceneIndex = Math.min(Math.floor(progress * totalScenes) + 1, totalScenes);
        setCurrentScene(sceneIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalScenes]);

  const scrollToNext = () => {
    if (currentScene >= totalScenes) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const step = window.innerHeight * 0.85;
      window.scrollBy({ top: step, behavior: 'smooth' });
    }
  };

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-5 px-5 py-2 rounded-full bg-zinc-950/85 border border-white/10 shadow-2xl backdrop-blur-2xl text-xs font-mono">
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-ember">0{currentScene}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">0{totalScenes}</span>
        </div>

        {/* Section title */}
        <div className="hidden sm:block text-zinc-200 font-sans text-xs tracking-wide border-x border-white/10 px-4">
          <span className="font-medium text-white">{sceneNames[currentScene - 1] || 'Overview'}</span>
        </div>

        {/* Next / Top Button */}
        <button
          onClick={scrollToNext}
          className="group flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
          aria-label="Scroll section"
        >
          <span className="text-[11px] uppercase tracking-wider font-medium text-zinc-300 group-hover:text-white">
            {currentScene >= totalScenes ? 'Top' : 'Next'}
          </span>
          
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7 -rotate-90 transform" viewBox="0 0 34 34">
              <circle
                cx="17"
                cy="17"
                r={radius}
                className="text-zinc-800"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="17"
                cy="17"
                r={radius}
                className="text-ember transition-all duration-150"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 group-hover:text-ember transition-colors">
              {currentScene >= totalScenes ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
