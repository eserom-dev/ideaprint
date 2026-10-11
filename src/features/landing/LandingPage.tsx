'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { HeroVideoBackground } from './HeroVideoBackground';
import { HeroGlassInterface } from './HeroGlassInterface';
import { SceneStages } from './SceneStages';
import { CapabilitiesBento } from './CapabilitiesBento';
import { BottomBarController } from './BottomBarController';
import { ChipMarquee } from '@/components/landing/ChipMarquee';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { Footer } from '@/components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-base text-primary selection:bg-ember selection:text-zinc-950 font-sans relative overflow-x-hidden">
      {/* Navigation Layer */}
      <FloatingNav />

      {/* Hero Cinematic World Container */}
      <div id="hero" className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden isolate">
        {/* Layer 1: Vivid Monochrome Smoke Background Video */}
        <HeroVideoBackground />

        {/* Layer 2: Glass Interface with Canonical Headline & Isometric Blueprint Graph */}
        <HeroGlassInterface />
      </div>

      {/* Marquee Separator */}
      <ChipMarquee />

      {/* The 6 Scenes Explaining the 5 Stages */}
      <SceneStages />

      {/* 8 Core Capabilities Bento */}
      <CapabilitiesBento />

      {/* Builder Archetypes Deep Dive */}
      <UseCasesSection />

      {/* Transparent Pricing with Real Limits and Working Waitlist */}
      <PricingSection />

      {/* Honesty & Architecture FAQ */}
      <FaqSection />

      {/* Final Call to Action & Footer */}
      <Footer />

      {/* Fixed Bottom Bar Tracker with 001/006 Counter & Dot Rail */}
      <BottomBarController />
    </div>
  );
};
