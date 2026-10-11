'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Terminal, Layers, ShieldCheck, CheckCircle2, Play } from 'lucide-react';

interface HeroSceneProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onSelectPrompt }) => {
  const router = useRouter();
  const [ideaInput, setIdeaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch((err) => {
            console.warn('Hero video autoplay deferred by browser:', err);
          });
      }
    }
  }, []);

  const quickPrompts = [
    { label: 'Edge AI Gateway', prompt: 'An ultra-low latency edge router on Cloudflare Workers load-balancing prompts across Claude and OpenAI with automatic failover.' },
    { label: 'Multi-Tenant SaaS', prompt: 'A B2B school operations platform with period attendance rosters, student gradebooks, and PostgreSQL Row Level Security.' },
    { label: 'Marketplace with Escrow', prompt: 'A two-sided marketplace for freelance designers with milestone payments, Stripe escrow holds, and disputing workflows.' },
  ];

  const handleLaunchBlueprint = async () => {
    if (!ideaInput.trim()) return;
    setIsSubmitting(true);

    try {
      if (onSelectPrompt) onSelectPrompt(ideaInput);

      // Call our real backend generation route
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: ideaInput }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.blueprint?.id) {
          router.push(`/projects/${data.blueprint.id}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Direct API fallback to sandbox view:', e);
    } finally {
      setIsSubmitting(false);
    }

    const target = document.getElementById('features');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[94vh] flex flex-col justify-center items-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden isolate">
      {/* 1. Real Video Background - Stored at z-0 with explicit stacking context */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={() => setIsVideoPlaying(true)}
          className="w-full h-full object-cover opacity-85 transition-opacity duration-700"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Clear, subtle contrast gradient: guarantees crystal clear video in center with readable white typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-zinc-950/90 pointer-events-none" />
      </div>

      {/* 2. Ambient light highlight in 3D perspective */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-ember/15 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* 3. Hero Content Container at z-10 (Always visible on top of video) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto">
        {/* Clean, Refined Headline - Balanced size like Lovable */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.12] mb-5 select-none drop-shadow-lg">
          Make ideas buildable.
        </h1>

        {/* Clean, Compelling Supporting Subtext in Bright White */}
        <p className="max-w-2xl text-base sm:text-lg text-white font-normal leading-relaxed mb-8 drop-shadow-md">
          Turn your software concept into structured requirements, technical architecture, 
          PostgreSQL schemas, and actionable tasks — ready to build with zero guesswork.
        </p>

        {/* Lovable-Style Floating Input Prompt Box with 3D glass elevation */}
        <div className="w-full max-w-2xl bg-zinc-950/85 backdrop-blur-2xl rounded-2xl p-2.5 sm:p-3 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-5 text-left transform hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunchBlueprint()}
                placeholder="What do you want to build? (e.g. A marketplace with escrow...)"
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
              />
            </div>
            <button
              onClick={handleLaunchBlueprint}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-glow transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap disabled:opacity-75"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Synthesizing...' : 'Generate Blueprint'}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Quick Pre-fill Prompts */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2 px-1">
            <span className="text-xs text-zinc-300 font-medium">Try:</span>
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIdeaInput(item.prompt);
                  if (onSelectPrompt) onSelectPrompt(item.prompt);
                }}
                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Action Links with 3D tactile buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 text-white border border-white/15 shadow-lg transition-all font-medium hover:scale-105 active:scale-95"
          >
            <Terminal className="w-3.5 h-3.5 text-ember" />
            <span>Open Engineering Console</span>
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 hover:bg-white/10 text-white border border-white/15 transition-all font-medium backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explore System Graph</span>
          </a>
        </div>

        {/* Trust & Proof Points Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 pt-8 border-t border-white/15 w-full max-w-2xl">
          <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>100% Traceable Graph</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>PostgreSQL Schema + RLS</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>OpenAPI & Build Pack Export</span>
          </div>
        </div>
      </div>
    </section>
  );
};
