'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BlueprintGraphSceneProps {
  className?: string;
}

export const BlueprintGraphScene: React.FC<BlueprintGraphSceneProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Subtle 3D mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);
      setMouseOffset({
        x: Math.max(-1, Math.min(1, dx)) * 12,
        y: Math.max(-1, Math.min(1, dy)) * 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[520px] sm:h-[580px] lg:h-[640px] select-none pointer-events-auto ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Parallax Canvas Container */}
      <div
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${mouseOffset.x * 0.7}deg) rotateX(${-mouseOffset.y * 0.7}deg) translateZ(0)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Central Intense Radial Aura (Ember Glow behind IDEAPRINT node) */}
        <div
          className="absolute left-[54%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 44, 0.42) 0%, rgba(255, 85, 0, 0.18) 45%, transparent 72%)',
            filter: 'blur(30px)',
            transform: 'translateZ(-20px)',
          }}
        />

        {/* SVG Orthogonal Circuit Connecting Lines Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 700 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="emberLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Line 1: Center (380, 300) to REQUIREMENTS (270, 160) */}
          <path
            d="M 380 290 L 380 200 L 290 200 L 290 170"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="none"
          />

          {/* Line 2: Center (380, 300) to DECISIONS (140, 320) */}
          <path
            d="M 340 310 L 170 310"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.2"
          />

          {/* Line 3: Center (380, 300) to DATABASE (580, 170) */}
          <path
            d="M 430 310 L 510 310 L 510 175 L 560 175"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />

          {/* Line 4: DATABASE down to API (630, 330) */}
          <path
            d="M 610 200 L 610 320 L 640 320"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
          />

          {/* Line 5: Center (380, 300) down-left to TESTS (230, 460) */}
          <path
            d="M 370 340 L 370 420 L 230 420 L 230 445"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
          />

          {/* Line 6: Center (380, 300) down-right to TASKS (560, 460) */}
          <path
            d="M 400 340 L 400 420 L 560 420 L 560 445"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
          />

          {/* Circuit Connection Junction Dots */}
          <circle cx="380" cy="200" r="2.5" fill="#FF6B2C" />
          <circle cx="510" cy="310" r="2.5" fill="rgba(255, 255, 255, 0.6)" />
          <circle cx="510" cy="175" r="2.5" fill="rgba(255, 255, 255, 0.6)" />
          <circle cx="610" cy="260" r="3" fill="#FF6B2C" filter="url(#glowFilter)" />
          <circle cx="370" cy="420" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="400" cy="420" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
        </svg>

        {/* Ambient Floating Wireframe Cube 1 (top background) */}
        <div
          className="absolute left-[70%] top-[8%] opacity-20 pointer-events-none transition-transform duration-700"
          style={{ transform: 'scale(0.55) translateZ(-50px)' }}
        >
          <WireframeCube size={50} />
        </div>

        {/* Ambient Floating Wireframe Cube 2 (far left background) */}
        <div
          className="absolute left-[4%] top-[34%] opacity-25 pointer-events-none transition-transform duration-700"
          style={{ transform: 'scale(0.45) translateZ(-40px)' }}
        >
          <WireframeCube size={45} />
        </div>

        {/* Ambient Floating Wireframe Cube 3 (bottom background) */}
        <div
          className="absolute left-[62%] top-[86%] opacity-20 pointer-events-none transition-transform duration-700"
          style={{ transform: 'scale(0.48) translateZ(-60px)' }}
        >
          <WireframeCube size={48} />
        </div>

        {/* ======================================================== */}
        {/* NODE 1: REQUIREMENTS (Top Node)                          */}
        {/* ======================================================== */}
        <div
          className="absolute left-[34%] sm:left-[36%] top-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(15px)' }}
        >
          <WireframeCube size={58} active={false} />
          <div className="mt-2.5 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            REQUIREMENTS
          </div>
        </div>

        {/* ======================================================== */}
        {/* NODE 2: DECISIONS (Left Node)                            */}
        {/* ======================================================== */}
        <div
          className="absolute left-[16%] sm:left-[18%] top-[52%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(20px)' }}
        >
          <WireframeCube size={62} active={false} />
          <div className="mt-2.5 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            DECISIONS
          </div>
        </div>

        {/* ======================================================== */}
        {/* NODE 3: DATABASE (Top-Right Node)                        */}
        {/* ======================================================== */}
        <div
          className="absolute left-[84%] sm:left-[83%] top-[24%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(10px)' }}
        >
          <WireframeCube size={64} active={false} />
          <div className="mt-2.5 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            DATABASE
          </div>
        </div>

        {/* ======================================================== */}
        {/* NODE 4: API (Far-Right Node)                             */}
        {/* ======================================================== */}
        <div
          className="absolute left-[94%] sm:left-[93%] top-[54%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(18px)' }}
        >
          <WireframeCube size={52} active={false} />
          <div className="mt-2.5 px-2.5 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            API
          </div>
        </div>

        {/* ======================================================== */}
        {/* NODE 5: TESTS (Bottom-Left Node)                         */}
        {/* ======================================================== */}
        <div
          className="absolute left-[31%] sm:left-[33%] top-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(25px)' }}
        >
          <WireframeCube size={62} active={false} />
          <div className="mt-2.5 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            TESTS
          </div>
        </div>

        {/* ======================================================== */}
        {/* NODE 6: TASKS (Bottom-Right Node)                        */}
        {/* ======================================================== */}
        <div
          className="absolute left-[79%] sm:left-[80%] top-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{ transform: 'translateZ(15px)' }}
        >
          <WireframeCube size={64} active={false} />
          <div className="mt-2.5 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-zinc-200 group-hover:border-white/30 group-hover:text-white transition-all">
            TASKS
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTRAL NODE: IDEAPRINT (Glowing Ember 3D Isometric Cube)*/}
        {/* ======================================================== */}
        <div
          className="absolute left-[54%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group cursor-pointer"
          style={{ transform: 'translateZ(45px)' }}
        >
          {/* Glowing Isometric Ember Cube */}
          <div className="relative hover:scale-105 transition-transform duration-300">
            <CentralEmberCube size={88} />
          </div>

          {/* Central Pill Badge */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-ember/40 backdrop-blur-md shadow-glow text-xs font-mono font-bold tracking-widest text-ember group-hover:border-ember group-hover:shadow-glow-lg transition-all">
            IDEAPRINT
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Renders the central glowing Ember Isometric Cube
 */
const CentralEmberCube: React.FC<{ size?: number }> = ({ size = 88 }) => {
  const w = size;
  const h = size * 1.15;
  const halfW = w / 2;
  const quarterH = h / 4;
  const halfH = h / 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="drop-shadow-[0_0_25px_rgba(255,107,44,0.7)]"
    >
      <defs>
        {/* Top Face Gradient */}
        <linearGradient id="topFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA67A" />
          <stop offset="100%" stopColor="#FF6B2C" />
        </linearGradient>

        {/* Left Face Gradient */}
        <linearGradient id="leftFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B2C" />
          <stop offset="100%" stopColor="#C93F05" />
        </linearGradient>

        {/* Right Face Gradient */}
        <linearGradient id="rightFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#9E2F00" />
        </linearGradient>
      </defs>

      {/* Top Face */}
      <polygon
        points={`${halfW},0 ${w},${quarterH} ${halfW},${halfH} 0,${quarterH}`}
        fill="url(#topFaceGrad)"
        stroke="#FFB693"
        strokeWidth="1.2"
      />

      {/* Left Face */}
      <polygon
        points={`0,${quarterH} ${halfW},${halfH} ${halfW},${h} 0,${h - quarterH}`}
        fill="url(#leftFaceGrad)"
        stroke="#FF8149"
        strokeWidth="1.2"
      />

      {/* Right Face */}
      <polygon
        points={`${halfW},${halfH} ${w},${quarterH} ${w},${h - quarterH} ${halfW},${h}`}
        fill="url(#rightFaceGrad)"
        stroke="#FF6B2C"
        strokeWidth="1.2"
      />
    </svg>
  );
};

/**
 * Renders an Isometric Wireframe Glass Cube for Architecture Nodes
 */
const WireframeCube: React.FC<{ size?: number; active?: boolean }> = ({
  size = 60,
  active = false,
}) => {
  const w = size;
  const h = size * 1.15;
  const halfW = w / 2;
  const quarterH = h / 4;
  const halfH = h / 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="transition-transform duration-200 group-hover:scale-105"
    >
      {/* Translucent Glass Fills */}
      <polygon
        points={`${halfW},0 ${w},${quarterH} ${halfW},${halfH} 0,${quarterH}`}
        fill="rgba(255, 255, 255, 0.04)"
      />
      <polygon
        points={`0,${quarterH} ${halfW},${halfH} ${halfW},${h} 0,${h - quarterH}`}
        fill="rgba(255, 255, 255, 0.02)"
      />
      <polygon
        points={`${halfW},${halfH} ${w},${quarterH} ${w},${h - quarterH} ${halfW},${h}`}
        fill="rgba(255, 255, 255, 0.06)"
      />

      {/* Inner Wireframe Lines */}
      <line
        x1={halfW}
        y1={0}
        x2={halfW}
        y2={halfH}
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
      />
      <line
        x1={0}
        y1={quarterH}
        x2={w}
        y2={quarterH}
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
      />

      {/* Outer Edges */}
      <polygon
        points={`${halfW},0 ${w},${quarterH} ${halfW},${halfH} 0,${quarterH}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="1.2"
      />
      <polygon
        points={`0,${quarterH} ${halfW},${halfH} ${halfW},${h} 0,${h - quarterH}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1.2"
      />
      <polygon
        points={`${halfW},${halfH} ${w},${quarterH} ${w},${h - quarterH} ${halfW},${h}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="1.2"
      />

      {/* Corner Vertex Highlights */}
      <circle cx={halfW} cy="0" r="1.5" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx={w} cy={quarterH} r="1.5" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="0" cy={quarterH} r="1.5" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx={halfW} cy={halfH} r="1.8" fill="#FF8149" />
    </svg>
  );
};
