'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { ArrowRight, Sparkles, Lock, Mail, Github, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const { signUp, signInWithGithub, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signUp(email, password, name);
      if (res.error) {
        setErrorMsg(res.error.message || 'Registration failed. Please check your details.');
      } else {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async () => {
    setErrorMsg(null);
    const res = await signInWithGithub();
    if (res.error) {
      setErrorMsg(res.error.message);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrorMsg(res.error.message);
    }
  };

  return (
    <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-white/15 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4">
          <Logo size="md" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-white">Create Free Account</h1>
        <p className="text-xs font-mono text-zinc-300 mt-1">Start building your first blueprint</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="text-zinc-200 uppercase tracking-wider block mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Amara Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-zinc-200 uppercase tracking-wider block mb-1">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="amara@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-zinc-200 uppercase tracking-wider block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-mono uppercase text-zinc-400">Or sign up with</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleOAuth}
          className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-mono flex items-center justify-center gap-2 transition-colors hover:text-white cursor-pointer"
        >
          <Github className="w-4 h-4" />
          <span>GitHub</span>
        </button>

        <button
          onClick={handleGoogleOAuth}
          className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-mono flex items-center justify-center gap-2 transition-colors hover:text-white cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </button>
      </div>

      <div className="mt-8 text-center text-xs font-mono text-zinc-300">
        Already have an account?{' '}
        <Link href={`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`} className="text-ember hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col justify-center items-center px-4 relative overflow-hidden blueprint-grid">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ember/15 blur-[140px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/15 text-center text-xs font-mono text-zinc-400">
          Loading sign up portal...
        </div>
      }>
        <SignUpContent />
      </Suspense>
    </div>
  );
}
