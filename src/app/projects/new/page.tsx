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
  Check,
  X,
  Edit2,
  RotateCcw,
  Database,
  Globe2,
  Kanban,
} from 'lucide-react';

interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  assumedIfSkipped: string;
  status: 'pending' | 'answered' | 'skipped';
  answer?: string;
}

export default function NewProjectWizard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Wizard Steps: 1 = Capture, 2 = Clarify, 3 = Generating, 4 = Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Capture State
  const [projectName, setProjectName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Step 2: Clarify State
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [clarifyError, setClarifyError] = useState<string | null>(null);

  // Constraints
  const [frontendStack, setFrontendStack] = useState('Next.js 14 (App Router) + Tailwind');
  const [backendStack, setBackendStack] = useState('PostgreSQL (Supabase) with RLS');
  const [developerSkill, setDeveloperSkill] = useState('Full-Stack TypeScript & PostgreSQL');
  const [budgetBand, setBudgetBand] = useState('$0 Free Tier MVP');
  const [timeline, setTimeline] = useState('4-6 Weeks to MVP');

  // Step 3: Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Step 4: Review State
  const [activeReviewTab, setActiveReviewTab] = useState<'requirements' | 'architecture' | 'database' | 'api' | 'tasks' | 'testing'>('requirements');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Enforce authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/projects/new');
    }
  }, [user, loading, router]);

  // Elapsed timer during generation
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Handlers for Step 1 -> Step 2
  const handleProceedToClarify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setCaptureError('Project Name is required.');
      return;
    }
    if (!projectIdea.trim()) {
      setCaptureError('The Idea Statement is required.');
      return;
    }

    setCaptureError(null);
    setCurrentStep(2);
    setLoadingQuestions(true);
    setClarifyError(null);

    try {
      const res = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: projectIdea.trim(),
          projectName: projectName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate clarifying questions.');
      }

      setQuestions(
        data.questions.map((q: any) => ({
          ...q,
          status: 'pending',
          answer: '',
        }))
      );
    } catch (err: any) {
      setClarifyError(err.message || 'Error calling AI provider.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerQuestion = (id: string, ans: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, answer: ans, status: ans.trim() ? 'answered' : 'pending' } : q
      )
    );
  };

  const handleSkipQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: 'skipped', answer: q.assumedIfSkipped } : q
      )
    );
  };

  // Handlers for Step 2 -> Step 3 (Generation)
  const handleStartGeneration = async () => {
    setCurrentStep(3);
    setIsGenerating(true);
    setGenerationError(null);

    const formattedClarifications = questions.map((q) => ({
      question: q.question,
      answer: q.answer || q.assumedIfSkipped,
      assumed: q.status === 'skipped' || !q.answer,
    }));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: projectIdea.trim(),
          projectName: projectName.trim(),
          clarifications: formattedClarifications,
          constraints: {
            stack: [frontendStack, backendStack],
            skills: developerSkill,
            budget: budgetBand,
            timeline,
          },
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.blueprint) {
        throw new Error(data.error || 'AI generation failed.');
      }

      setGeneratedBlueprint(data.blueprint);
      setCurrentStep(4); // Move to review screen
    } catch (err: any) {
      setGenerationError(err.message || 'Blueprint synthesis error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handlers for Step 4 (Review) -> Commit to Database
  const handleCommitBlueprint = async () => {
    if (!generatedBlueprint) return;
    setIsCommitting(true);
    setCommitError(null);

    try {
      const res = await fetch('/api/projects/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint: generatedBlueprint,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.projectId) {
        throw new Error(data.error || 'Failed to save project to database.');
      }

      // Route directly to workspace
      router.push(`/projects/${data.projectId}`);
    } catch (err: any) {
      setCommitError(err.message || 'Failed to commit project blueprint to database.');
      setIsCommitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={currentStep === 1 ? 'text-ember font-bold' : 'text-zinc-500'}>1. Capture</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={currentStep === 2 ? 'text-ember font-bold' : 'text-zinc-500'}>2. Clarify</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={currentStep === 3 ? 'text-ember font-bold' : 'text-zinc-500'}>3. Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className={currentStep === 4 ? 'text-ember font-bold' : 'text-zinc-500'}>4. Review</span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* ==================================================================== */}
        {/* STEP 1: STAGE 1 · CAPTURE */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ember/10 border border-ember/20 text-ember font-mono text-xs font-bold uppercase mb-4">
                STAGE 1 · CAPTURE
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Describe your software idea
              </h1>
              <p className="text-sm text-zinc-300 font-sans mt-2 leading-relaxed">
                Tell IDEAPRINT what you want to build in your own words. We will structure the rest.
              </p>
            </div>

            {captureError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{captureError}</span>
              </div>
            )}

            <form onSubmit={handleProceedToClarify} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme SaaS Platform or FinTrack AI"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ember"
                />
              </div>

              {/* The Idea Statement */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider">
                  The Idea Statement *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe your software in detail: what problem does it solve, who are the users, what are the primary workflows, and what makes it valuable..."
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-ember leading-relaxed"
                />
              </div>

              {/* Platform Type (Locked: Website) */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Globe2 className="w-4 h-4 text-ember" />
                  <span>Platform Target:</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-bold border border-white/10">
                  Website (Next.js 14 Web Application)
                </span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Continue to Clarify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: STAGE 2 · CLARIFY */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold uppercase mb-4">
                STAGE 2 · CLARIFY
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Architectural Clarifications
              </h1>
              <p className="text-sm text-zinc-300 font-sans mt-2 leading-relaxed">
                The AI analyzed your idea and identified key architectural decisions. Answer to steer, or skip to accept safe defaults.
              </p>
            </div>

            {loadingQuestions ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-400 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin mx-auto" />
                <span>AI Architect analyzing idea for fork decisions...</span>
              </div>
            ) : clarifyError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono space-y-3">
                <div>Error: {clarifyError}</div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-mono cursor-pointer"
                >
                  Back to Idea Canvas
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-ember font-bold">QUESTION {idx + 1} OF {questions.length}</span>
                        {q.status === 'skipped' ? (
                          <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                            Assumed Default
                          </span>
                        ) : q.status === 'answered' ? (
                          <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                            Answered
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono">Pending</span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">{q.question}</h4>

                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        <strong className="text-zinc-300">Why it matters:</strong> {q.why}
                      </p>

                      <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-white/5 text-[11px] font-mono text-zinc-400">
                        <span className="text-zinc-500">If skipped: </span>
                        {q.assumedIfSkipped}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Your answer (optional)..."
                          value={q.answer || ''}
                          onChange={(e) => handleAnswerQuestion(q.id, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-ember text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSkipQuestion(q.id)}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono cursor-pointer whitespace-nowrap"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints Section */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Technical Constraints
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <label className="text-zinc-400 block mb-1">Frontend Stack</label>
                      <input
                        type="text"
                        value={frontendStack}
                        onChange={(e) => setFrontendStack(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Backend & Database</label>
                      <input
                        type="text"
                        value={backendStack}
                        onChange={(e) => setBackendStack(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleStartGeneration}
                    className="flex-1 py-4 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Implementation Blueprint</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: STAGE 3 · GENERATION PIPELINE */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-8 text-center animate-fadeIn py-8">
            <div className="w-16 h-16 rounded-3xl bg-ember/10 border border-ember/20 text-ember flex items-center justify-center mx-auto shadow-glow">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Synthesizing Blueprint Architecture
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-2">
                Running dual AI engine passes · Validating Zod structured output · Time elapsed: {elapsedSeconds}s
              </p>
            </div>

            {generationError ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono space-y-4 max-w-lg mx-auto text-left">
                <div className="font-bold">Generation Stopped:</div>
                <div className="leading-relaxed">{generationError}</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartGeneration}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer"
                  >
                    Retry Generation
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 cursor-pointer"
                  >
                    Adjust Clarifications
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3 text-left font-mono text-xs text-zinc-400">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span>Synthesizing Requirements (FR & NFR display IDs)...</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <span>Designing PostgreSQL Schema & Row Level Security DDL...</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span>Assembling Task DAG & Test Strategy (Not Run)...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: STAGE 4 · BLUEPRINT REVIEW */}
        {/* ==================================================================== */}
        {currentStep === 4 && generatedBlueprint && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono text-ember font-bold uppercase tracking-wider">
                  STAGE 4 · BLUEPRINT REVIEW
                </span>
                <h2 className="text-2xl font-display font-bold text-white mt-1">
                  {generatedBlueprint.name}
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {generatedBlueprint.tagline || generatedBlueprint.description}
                </p>
              </div>

              <button
                onClick={handleCommitBlueprint}
                disabled={isCommitting}
                className="px-6 py-3 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs font-mono shadow-glow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCommitting ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <span>Commit & Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {commitError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="flex-1">{commitError}</div>
                <button
                  onClick={handleCommitBlueprint}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Review Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono">
              {[
                { id: 'requirements', label: `Requirements (${generatedBlueprint.requirements?.length || 0})` },
                { id: 'architecture', label: `Architecture (${generatedBlueprint.components?.length || 0})` },
                { id: 'database', label: `Database (${generatedBlueprint.entities?.length || 0})` },
                { id: 'api', label: `API (${generatedBlueprint.endpoints?.length || 0})` },
                { id: 'tasks', label: `Tasks (${generatedBlueprint.tasks?.length || 0})` },
                { id: 'testing', label: `Tests (${generatedBlueprint.testCases?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReviewTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeReviewTab === tab.id
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Requirements */}
            {activeReviewTab === 'requirements' && (
              <div className="space-y-3">
                {generatedBlueprint.requirements?.map((req: any, idx: number) => (
                  <div
                    key={req.displayId || idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-ember font-bold">{req.displayId}</span>
                      <span className="uppercase text-zinc-400 px-2 py-0.5 rounded bg-zinc-800">
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-white font-medium">{req.statement}</p>
                    <p className="text-zinc-400 text-[11px]">{req.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Architecture */}
            {activeReviewTab === 'architecture' && (
              <div className="space-y-3">
                {generatedBlueprint.components?.map((c: any, idx: number) => (
                  <div
                    key={c.displayId || idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">{c.name}</span>
                      <span className="text-[10px] text-zinc-400 uppercase">{c.type}</span>
                    </div>
                    <div className="text-zinc-300 font-sans text-xs">
                      Technology: <strong className="text-white font-mono">{c.technology}</strong>
                    </div>
                    <ul className="list-disc list-inside text-zinc-400 text-[11px] font-sans">
                      {c.responsibilities?.map((r: string, ridx: number) => (
                        <li key={ridx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Database */}
            {activeReviewTab === 'database' && (
              <div className="space-y-3">
                {generatedBlueprint.entities?.map((e: any, idx: number) => (
                  <div
                    key={e.displayId || idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">{e.name}</span>
                      <span className="text-[10px] text-zinc-500">{e.fields?.length || 0} fields</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Fields: {(e.fields || []).map((f: any) => `${f.name} (${f.type})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: API */}
            {activeReviewTab === 'api' && (
              <div className="space-y-2">
                {generatedBlueprint.endpoints?.map((ep: any, idx: number) => (
                  <div
                    key={ep.displayId || idx}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-ember font-bold text-[10px]">
                        {ep.method}
                      </span>
                      <span className="text-white font-medium">{ep.path}</span>
                    </div>
                    <span className="text-zinc-400 text-[11px] truncate max-w-xs">{ep.summary}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Tasks */}
            {activeReviewTab === 'tasks' && (
              <div className="space-y-2">
                {generatedBlueprint.tasks?.map((t: any, idx: number) => (
                  <div
                    key={t.displayId || idx}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono text-[10px] text-ember font-bold">{t.displayId}</div>
                      <div className="text-white font-medium mt-0.5">{t.title}</div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-full border border-white/5">
                      {t.effortMinDays || 1}-{t.effortMaxDays || 3} days
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Testing */}
            {activeReviewTab === 'testing' && (
              <div className="space-y-3">
                {generatedBlueprint.testCases?.map((tc: any, idx: number) => (
                  <div
                    key={tc.displayId || idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-cyan-400 font-bold">{tc.displayId}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">
                        NOT RUN
                      </span>
                    </div>
                    <div className="text-white font-medium">{tc.objective}</div>
                    <div className="text-zinc-400 text-[11px] font-mono">Expected: {tc.expectedResult}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Commit Bar */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={handleCommitBlueprint}
                disabled={isCommitting}
                className="px-8 py-3.5 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-sm tracking-wide shadow-glow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCommitting ? <span>Saving Blueprint to Database...</span> : <span>Commit & Open Workspace →</span>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
