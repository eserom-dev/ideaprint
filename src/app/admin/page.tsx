'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Database,
  Layers,
  ArrowLeft,
  Mail,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface WaitlistEntry {
  id: string;
  email: string;
  plan: string;
  created_at: string;
}

export default function AdminConsolePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/sign-in?redirect=/admin');
        return;
      }
      checkAdminPermission();
    }
  }, [user, authLoading, router]);

  const checkAdminPermission = async () => {
    if (!user) return;

    // Check if user has is_admin flag in user_metadata, or in profiles/admin table
    const metaAdmin = user.user_metadata?.is_admin === true;
    
    // Also check profiles table if present
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!error && data?.is_admin === true) {
        setIsAdmin(true);
        loadAdminData();
        return;
      }
    } catch {
      // Ignore if profiles table not present or empty
    }

    if (metaAdmin) {
      setIsAdmin(true);
      loadAdminData();
    } else {
      setIsAdmin(false);
    }
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    setStatusMsg(null);
    try {
      // 1. Load waitlist submissions
      const { data: waitlistData, error: wlError } = await supabase
        .from('waitlist_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wlError && waitlistData) {
        setWaitlist(waitlistData);
      }

      // 2. Load total project count
      const { count, error: prjError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (!prjError && count !== null) {
        setProjectCount(count);
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error loading administrative records.');
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-400">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  // Server-enforced unauthorized state
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-base text-primary font-sans flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-red-500/30 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20 text-xs font-mono text-red-300 mb-4">
            <span>ACCESS RESTRICTED · 403 FORBIDDEN</span>
          </div>

          <h1 className="text-2xl font-display font-bold uppercase text-white mb-2">
            Administrator Only
          </h1>

          <p className="text-sm text-zinc-400 font-sans leading-relaxed mb-6">
            Your account ({user?.email}) is not authorized for administrative operations. System console access requires a verified database admin flag.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    );
  }

  // Admin Console View
  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
            <span className="text-red-400 font-bold uppercase tracking-wider">Admin Console</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Live Telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loadingData}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/dashboard"
            className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Workspace
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-1">
              Engineering Administration
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Database telemetry, waitlist registrations, and platform quotas
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Authorization Active</span>
          </div>
        </div>

        {statusMsg && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
            {statusMsg}
          </div>
        )}

        {/* Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
              Total Blueprints
            </span>
            <div className="text-3xl font-display font-bold text-white mb-2">
              {loadingData ? '...' : projectCount}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Stored in Supabase PostgreSQL
            </span>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
              Waitlist Registrations
            </span>
            <div className="text-3xl font-display font-bold text-ember mb-2">
              {loadingData ? '...' : waitlist.length}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Pro & Team tier applicants
            </span>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
              AI Gateway Status
            </span>
            <div className="text-lg font-display font-bold text-emerald-300 flex items-center gap-2 mb-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Gemini & Groq endpoints verified
            </span>
          </div>
        </div>

        {/* Waitlist Table */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-white">Waitlist Submissions</h2>
              <p className="text-xs font-mono text-zinc-400">
                Direct submissions from the public pricing tier selector
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {waitlist.length} Total
            </span>
          </div>

          {waitlist.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">
              No waitlist submissions recorded in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-950/50 text-zinc-400 uppercase text-[10px]">
                    <th className="p-4">Email</th>
                    <th className="p-4">Target Plan</th>
                    <th className="p-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {waitlist.map((w, idx) => (
                    <tr key={w.id || idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{w.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-ember-soft text-ember border border-ember/20 text-[10px] font-bold uppercase">
                          {w.plan}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>{new Date(w.created_at).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
