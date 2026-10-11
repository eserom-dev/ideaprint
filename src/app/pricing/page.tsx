'use client';

import React from 'react';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { Footer } from '@/components/landing/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />
      <div className="pt-20">
        <PricingSection />
        <FaqSection />
      </div>
      <Footer />
    </div>
  );
}
