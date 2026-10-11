'use client';

import React, { useRef, useState, useEffect } from 'react';

export const HeroBacklitPrism: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);
      setMousePos({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center select-none"
      style={{ perspective: '1000px' }}
    >
      {/* 1. Large Ambient Soft Radial Glow Field (Emanating Outward) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 107, 44, 0.22) 28%, rgba(255, 107, 44, 0.08) 50%, transparent 72%)',
          filter: 'blur(45px)',
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
        }}
      />

      {/* 2. Focused Solar-Eclipse White Backlight (Directly behind the triangle perimeter) */}
      <div
        className="absolute w-[280px] sm:w-[340px] h-[260px] sm:h-[310px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)`,
        }}
      >
        <svg
          viewBox="0 0 320 280"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Edge Glow Filter */}
            <filter id="monolithHalo" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="16" result="heavyBlur" />
              <feGaussianBlur stdDeviation="6" result="sharpBlur" />
              <feMerge>
                <feMergeNode in="heavyBlur" />
                <feMergeNode in="sharpBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ember-white gradient for backlight */}
            <radialGradient id="backlightGrad" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FFF1EB" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#FF6B2C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glowing Backlight Triangle Silhouette */}
          <polygon
            points="160,20 305,270 15,270"
            fill="url(#backlightGrad)"
            filter="url(#monolithHalo)"
          />
        </svg>
      </div>

      {/* 3. The Solid Pitch-Black Monolithic Triangle (Eclipse Centerpiece) */}
      <div
        className="relative z-10 w-[260px] sm:w-[310px] h-[240px] sm:h-[285px] transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${mousePos.x * 8}deg) rotateX(${-mousePos.y * 8}deg) translateZ(10px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="0 0 320 280"
          className="w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pitch-Black Equilateral Face */}
          <polygon
            points="160,24 300,266 20,266"
            fill="#050505"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.2"
          />

          {/* Subtle Hairline Rim Light Reflection along the left top edge */}
          <line
            x1="160"
            y1="24"
            x2="20"
            y2="266"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Subtle Hairline Ember Accent along the right top edge */}
          <line
            x1="160"
            y1="24"
            x2="300"
            y2="266"
            stroke="rgba(255, 107, 44, 0.3)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
