'use client';

import React from 'react';
import { FloatingNav } from '@/components/navigation/FloatingNav';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { Footer } from '@/components/landing/Footer';

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      <FloatingNav />
      <div className="pt-20">
        <UseCasesSection />
      </div>
      <Footer />
    </div>
  );
}
