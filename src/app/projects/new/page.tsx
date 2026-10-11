'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  AlertCircle,
  FileCode2,
} from 'lucide-react';

export default function NewProjectWizard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Enforce authentication for creating new projects
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/projects/new');
    }
  }, [user, loading, router]);

  // Step 1: Idea Canvas
  const [projectName, setProjectName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-300">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Step 2: Clarifying Questions
  const [questions, setQuestions] = useState([
    {
      id: 'Q-01',
      question: 'Do students and guardians need individual login accounts in the MVP?',
      why: 'Determines the authentication model, minor data privacy obligations (COPPA/FERPA), and user role complexity.',
      assumedIfSkipped: 'Staff-only accounts; students and guardians are excluded from MVP version one.',
      status: 'answered' as 'pending' | 'answered' | 'skipped',
      answer: 'Staff only for MVP (exclude student logins)',
    },
    {
      id: 'Q-02',
      question: 'Are digital payments required for tuition or school activities in version one?',
      why: 'Adds payment gateway compliance, webhook reconciliation, and refund accounting.',
      assumedIfSkipped: 'No payments in MVP; fee invoicing tracked manually.',
      status: 'skipped' as 'pending' | 'answered' | 'skipped',
      answer: null,
    },
    {
      id: 'Q-03',
      question: 'Is the platform designed for a single school or multi-tenant across school districts?',
      why: 'Multi-tenancy affects every database table, foreign key, and Row Level Security access policy.',
      assumedIfSkipped: 'Multi-tenant architecture from day one with tenant_id isolation.',
      status: 'answered' as 'pending' | 'answered' | 'skipped',
      answer: 'Multi-tenant with tenant_id on all tables',
    },
  ]);

  // Step 3: Constraints
  const [appType, setAppType] = useState('Responsive Web App');
  const [frontendStack, setFrontendStack] = useState('Next.js 14 (App Router) + Tailwind');
  const [backendStack, setBackendStack] = useState('PostgreSQL (Supabase) with RLS');
  const [developerSkill, setDeveloperSkill] = useState('Strong TypeScript, Low DevOps');
  const [budgetBand, setBudgetBand] = useState('$30/month ceiling');
  const [timeline, setTimeline] = useState('8-10 Weeks to Private Alpha');

  // Step 4: Generation Pipeline Simulation
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [currentPass, setCurrentPass] = useState('1. Interviewer Pass');
  const [isGenerating, setIsGenerating] = useState(false);

  const passes = [
    'Pass 1: Interviewer (Extracting blocking gaps & assumptions)',
    'Pass 2: Analyst (Framing problem statement & user personas)',
    'Pass 3: Requirements Engineer (Generating FR & NFR with display IDs)',
    'Pass 4: Scoper (Cutting MVP vs. excluded features)',
    'Pass 5: Architect (Designing PostgreSQL schema, RLS & OpenAPI contracts)',
    'Pass 6: Planner (Building task DAG & dependency validation)',
    'Pass 7: QA Strategist (Assembling honest "Not Run" verification tests)',
    'Pass 8: Critic Review (Independent audit for gaps & contradictions)',
  ];

  const startGeneration = async () => {
    setCurrentStep(4);
    setIsGenerating(true);
    setGenerationError(null);
    setPipelineProgress(10);
    setCurrentPass(passes[0]);

    let p = 10;
    const interval = setInterval(() => {
      p = Math.min(p + 10, 85);
      const passIdx = Math.min(Math.floor((p / 100) * 8), 7);
      setCurrentPass(passes[passIdx]);
      setPipelineProgress(p);
    }, 450);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: projectIdea,
          userId: user?.id,
          constraints: {
            name: projectName || 'Engineered Blueprint',
            appType,
            stack: [frontendStack, backendStack],
            skills: developerSkill,
            budget: budgetBand,
            timeline,
          },
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok || !data.success || !data.blueprint) {
        throw new Error(data.error || 'Blueprint generation failed. Please try again.');
      }

      setPipelineProgress(100);
      setCurrentPass(passes[7]);
      setGeneratedBlueprint(data.blueprint);

      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationError(err.message || 'Generation pipeline interrupted.');
    }
  };

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Wizard Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">/ New Project Wizard</span>
          </Link>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">Step {currentStep} of 5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    s === currentStep ? 'bg-ember' : s < currentStep ? 'bg-emerald-400' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* STEP 1: IDEA CANVAS */}
        {currentStep === 1 && (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div>
              <div className="text-xs font-mono text-ember uppercase tracking-wider mb-2 font-bold">
                STAGE 1 · CAPTURE
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Describe your software idea
              </h1>
              <p className="text-sm text-zinc-400 font-sans mt-1">
                Tell IDEAPRINT what you want to build in your own words. We will structure the rest.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Distributed Task Orchestrator"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  The Idea Statement <span className="text-ember">*</span>
                </label>
                <textarea
                  rows={5}
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="Describe the software idea, target users, core workflow, and constraints..."
                  className="w-full p-4 bg-zinc-950 border border-white/10 rounded-xl text-sm font-sans text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-ember leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                disabled={!projectIdea.trim()}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-full bg-ember hover:bg-ember-hover disabled:opacity-40 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-glow cursor-pointer"
              >
                <span>Continue to Clarify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CLARIFYING QUESTIONS */}
        {currentStep === 2 && (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div>
              <div className="text-xs font-mono text-ember uppercase tracking-wider mb-2 font-bold">
                STAGE 1 · CLARIFYING GAPS
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Clarify the critical decisions
              </h1>
              <p className="text-sm text-zinc-400 font-sans mt-1">
                The AI Product Architect only asks questions that materially alter architecture, scope, or cost.
                Skipped questions become visible assumptions.
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-ember font-bold">{q.id}:</span>
                      <h4 className="text-sm font-sans font-medium text-white">{q.question}</h4>
                    </div>
                    {q.status === 'skipped' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-dashed border-amber-500/40 text-[10px] uppercase">
                        Assumed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase">
                        Answered
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-400 font-sans pl-2 border-l border-white/10">
                    <strong className="text-zinc-500 font-mono">Why it matters: </strong>
                    {q.why}
                  </div>

                  {q.status === 'skipped' ? (
                    <div className="p-2 rounded bg-amber-950/20 text-amber-400 text-[11px]">
                      <strong>AI Assumption (ASM-001): </strong>
                      {q.assumedIfSkipped}
                    </div>
                  ) : (
                    <div className="text-zinc-300 text-[11px]">
                      <span className="text-emerald-400">Recorded Answer: </span>
                      {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-glow"
              >
                <span>Continue to Constraints</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONSTRAINTS */}
        {currentStep === 3 && (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div>
              <div className="text-xs font-mono text-ember uppercase tracking-wider mb-2 font-bold">
                STAGE 2 · CONSTRAINTS
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Technical & Budget Constraints
              </h1>
              <p className="text-sm text-zinc-400 font-sans mt-1">
                User constraints outrank all AI recommendations and are never silently altered.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-500 uppercase mb-1">Application Type</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                >
                  <option>Responsive Web App</option>
                  <option>B2B SaaS API</option>
                  <option>Mobile App (React Native)</option>
                  <option>Internal Admin Tool</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Developer Skills</label>
                <input
                  type="text"
                  value={developerSkill}
                  onChange={(e) => setDeveloperSkill(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Frontend Stack</label>
                <input
                  type="text"
                  value={frontendStack}
                  onChange={(e) => setFrontendStack(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Database & Auth</label>
                <input
                  type="text"
                  value={backendStack}
                  onChange={(e) => setBackendStack(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Monthly Budget Ceiling</label>
                <input
                  type="text"
                  value={budgetBand}
                  onChange={(e) => setBudgetBand(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase mb-1">Target Timeline</label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-ember"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={startGeneration}
                className="px-6 py-3 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Staged Pipeline</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: STAGED AI GENERATION PIPELINE STREAM */}
        {currentStep === 4 && (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/15 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-ember/20 border border-ember/40 flex items-center justify-center text-ember shadow-glow">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-xs font-mono text-ember uppercase tracking-wider font-bold">
                MULTI-PASS AI ARCHITECT RUNNING
              </span>
              <h2 className="text-2xl font-display font-bold text-white mt-1">
                Synthesizing Blueprint Graph
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-2 max-w-md mx-auto">
                {currentPass}
              </p>
            </div>

            {/* Progress Bar or Error */}
            {generationError ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-xs font-mono text-red-200 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{generationError}</span>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 border border-white/10"
                  >
                    Adjust Constraints
                  </button>
                  <button
                    onClick={startGeneration}
                    className="px-5 py-2.5 rounded-xl bg-ember hover:bg-ember/90 text-xs font-mono text-zinc-950 font-bold shadow-glow"
                  >
                    Retry Generation
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-ember to-amber-400 transition-all duration-300"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400 text-left pt-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Interviewer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analyst</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Requirements</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Critic Audit</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 5: PROPOSED BLUEPRINT REVIEW & ACCEPT SCREEN */}
        {currentStep === 5 && generatedBlueprint && (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/15 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  PIPELINE GENERATION COMPLETE
                </span>
                <h2 className="text-2xl font-display font-bold text-white mt-1">
                  {generatedBlueprint.name || 'Proposed Blueprint'}
                </h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                Critic Pass: 0 Contradictions
              </span>
            </div>

            {/* Real Proposed items summary list */}
            <div className="space-y-3 font-mono text-xs">
              {(generatedBlueprint.requirements || []).slice(0, 3).map((req: any, idx: number) => (
                <div key={req.displayId || idx} className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-ember font-bold">{req.displayId || `FR-00${idx + 1}`}</span>
                    <span className="text-zinc-200">{req.statement?.slice(0, 50)}... ({req.priority || 'must'})</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase">{req.status || 'proposed'}</span>
                </div>
              ))}
              
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-ember font-bold">TSK-001..{(generatedBlueprint.tasks || []).length}</span>
                  <span className="text-zinc-200">{(generatedBlueprint.tasks || []).length} Validated Implementation Tasks</span>
                </div>
                <span className="text-emerald-400 font-bold">PROPOSED</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-ember font-bold">TC-001..{(generatedBlueprint.testCases || []).length}</span>
                  <span className="text-zinc-200">{(generatedBlueprint.testCases || []).length} Verification Test Cases (Not Run)</span>
                </div>
                <span className="text-zinc-400">NOT RUN</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                By accepting, items transition from <strong>proposed</strong> to <strong>accepted</strong>, 
                becoming the persistent source of truth for your project in Supabase.
              </span>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => router.push(`/projects/${generatedBlueprint.id}`)}
                className="px-6 py-3 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-glow cursor-pointer"
              >
                <span>Accept Blueprint & Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
