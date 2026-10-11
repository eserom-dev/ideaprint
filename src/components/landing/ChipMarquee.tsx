'use client';

import React from 'react';
import {
  FileCode2,
  Cpu,
  Database,
  Globe2,
  Kanban,
  ShieldCheck,
  GitBranch,
  PackageCheck,
  CheckCircle,
} from 'lucide-react';

interface FeatureChip {
  label: string;
  category: string;
  icon: React.ElementType;
}

const chips: FeatureChip[] = [
  { label: 'Atomic Functional Requirements', category: 'Specs', icon: FileCode2 },
  { label: 'Component Architecture Studio', category: 'System Design', icon: Cpu },
  { label: 'PostgreSQL Relational Schema & RLS', category: 'Database', icon: Database },
  { label: 'OpenAPI 3.1 Contract Definitions', category: 'API', icon: Globe2 },
  { label: 'Dependency-Guarded Sprint Board', category: 'Execution', icon: Kanban },
  { label: 'Evidence-Based Test Verification', category: 'QA Matrix', icon: ShieldCheck },
  { label: 'Architecture Decision Records (ADR)', category: 'Decisions', icon: GitBranch },
  { label: 'AI Coding Assistant Build Pack', category: 'Export', icon: PackageCheck },
  { label: '100% Traceable Engineering Graph', category: 'Core', icon: CheckCircle },
];

export const ChipMarquee: React.FC = () => {
  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-zinc-950/90 py-3.5 relative select-none">
      {/* Edge gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-base to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-base to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-3">
        {[...chips, ...chips].map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <div
              key={`${chip.label}-${idx}`}
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-900/80 hover:bg-zinc-850 hover:border-white/20 text-xs font-medium text-zinc-200 transition-all cursor-pointer backdrop-blur-md"
            >
              <Icon className="w-3.5 h-3.5 text-ember" />
              <span className="font-semibold text-white">{chip.label}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                {chip.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
