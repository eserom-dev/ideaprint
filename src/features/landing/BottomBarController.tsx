'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowUp } from 'lucide-react';

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

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-5 px-5 py-2.5 rounded-full bg-zinc-950/85 border border-white/15 shadow-2xl backdrop-blur-2xl text-xs font-mono text-white">
        {/* Scene Counter */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-ember">00{currentScene}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">006</span>
        </div>

        {/* Dot Rail */}
        <div className="hidden sm:flex items-center gap-2 px-2">
          {sceneIds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => jumpToScene(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentScene === idx + 1
                  ? 'bg-ember w-5 shadow-glow-sm'
                  : 'bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`Jump to Scene 00${idx + 1}`}
            />
          ))}
        </div>

        {/* Circular NEXT button with progress ring */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 pl-3 border-l border-white/10 hover:text-ember transition-colors group"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white">
            {currentScene >= 6 ? 'Top' : 'Next'}
          </span>
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg className="w-7 h-7 -rotate-90">
              <circle
                cx="14"
                cy="14"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="14"
                cy="14"
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
              <ArrowUp className="w-3.5 h-3.5 absolute text-ember" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 absolute text-ember" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
