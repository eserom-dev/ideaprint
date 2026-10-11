import React from 'react';
import { User, Sparkles, HelpCircle, CheckCircle2, Lock } from 'lucide-react';
import { ProvenanceOrigin, ConfidenceLevel, PriorityLevel, TestVerification } from '@/types/blueprint';

interface ProvenanceBadgeProps {
  origin: ProvenanceOrigin;
  confidence?: ConfidenceLevel;
  confidenceReason?: string;
  locked?: boolean;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  origin,
  confidence,
  confidenceReason,
  locked,
  className = '',
}) => {
  const getOriginConfig = () => {
    switch (origin) {
      case 'user':
        return {
          label: 'User Provided',
          icon: User,
          badgeClass: 'bg-zinc-800/80 text-zinc-200 border-zinc-600',
        };
      case 'ai_proposed':
        return {
          label: 'AI Proposed',
          icon: Sparkles,
          badgeClass: 'bg-ember-soft text-ember border-ember/30 shadow-[0_0_12px_rgba(255,107,44,0.15)]',
        };
      case 'ai_assumed':
        return {
          label: 'AI Assumed',
          icon: HelpCircle,
          badgeClass: 'bg-amber-950/40 text-amber-300 border-dashed border-amber-500/50',
        };
      case 'imported':
        return {
          label: 'Imported',
          icon: CheckCircle2,
          badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
    }
  };

  const config = getOriginConfig();
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full border ${config.badgeClass} ${className}`}>
      <IconComponent className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
      {confidence && (
        <span className="opacity-75 text-[10px] uppercase border-l border-current/30 pl-1.5 ml-0.5" title={confidenceReason || `Confidence: ${confidence}`}>
          {confidence}
        </span>
      )}
      {locked && (
        <span title="Locked against AI regeneration">
          <Lock className="w-2.5 h-2.5 ml-0.5 text-zinc-400" />
        </span>
      )}
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; className?: string }> = ({
  priority,
  className = '',
}) => {
  const map = {
    must: { label: 'MUST', class: 'bg-red-500/10 text-red-400 border-red-500/30' },
    should: { label: 'SHOULD', class: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    could: { label: 'COULD', class: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
    wont: { label: "WON'T", class: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  };

  const curr = map[priority] || map.should;

  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${curr.class} ${className}`}>
      {curr.label}
    </span>
  );
};

export const VerificationBadge: React.FC<{ verification: TestVerification; className?: string }> = ({
  verification,
  className = '',
}) => {
  const map = {
    not_run: { label: 'Not Run', class: 'bg-zinc-800/90 text-zinc-400 border-zinc-700', dot: 'bg-zinc-500' },
    passed: { label: 'Passed', class: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400' },
    failed: { label: 'Failed', class: 'bg-rose-950/40 text-rose-300 border-rose-500/40', dot: 'bg-rose-500' },
    blocked: { label: 'Blocked', class: 'bg-amber-950/40 text-amber-300 border-amber-500/40', dot: 'bg-amber-400' },
  };

  const curr = map[verification] || map.not_run;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full border ${curr.class} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${curr.dot}`} />
      <span>{curr.label}</span>
    </span>
  );
};
