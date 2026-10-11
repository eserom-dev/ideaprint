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
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const [stats, setStats] = useState<any>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/sign-in?redirect=/admin');
        return;
      }
      verifyAdminServerSide();
    }
  }, [user, authLoading, router]);

  const verifyAdminServerSide = async () => {
    if (!user) return;
    setLoadingData(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (res.status === 403 || !data.isAdmin) {
        setIsAdmin(false);
        setStatusMsg(data.error || 'Access Denied: Administrator clearance required.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error validating admin credentials');
      }

      setIsAdmin(true);
      setStats(data.stats);
      setWaitlist(data.waitlist || []);
      setRecentEvents(data.recentEvents || []);
    } catch (err: any) {
      setIsAdmin(false);
      setStatusMsg(err.message || 'Failed to authenticate admin access.');
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-400">Verifying server administrator clearance...</p>
        </div>
      </div>
    );
  }

  // Not Admin: Render Server-Enforced Access Denied Screen
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
        <header className="border-b border-white/10 bg-zinc-950/80 px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/dashboard"
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">403 · Access Denied</h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              {statusMsg || 'Your account does not have administrator clearance. This area is enforced on the server.'}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-block px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-primary font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
            <span className="text-zinc-600">/</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              Platform Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={verifyAdminServerSide}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Console */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
            SECURITY LEVEL 1 · SERVER ENFORCED
          </span>
          <h1 className="text-3xl font-display font-bold text-white mt-1">Platform Admin Console</h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Real system metrics across user profiles, projects, and waitlist allocations
          </p>
        </div>

        {/* Aggregate Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] block">Total User Profiles</span>
            <div className="text-3xl font-bold text-white">{stats?.totalProfiles || 0}</div>
            <span className="text-[10px] text-zinc-400">Authenticated accounts</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] block">Total Blueprints</span>
            <div className="text-3xl font-bold text-ember">{stats?.totalProjects || 0}</div>
            <span className="text-[10px] text-zinc-400">Generated projects</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] block">Total Tasks</span>
            <div className="text-3xl font-bold text-emerald-400">{stats?.totalTasks || 0}</div>
            <span className="text-[10px] text-zinc-400">Engineering tasks tracked</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] block">Waitlist Entries</span>
            <div className="text-3xl font-bold text-cyan-400">{stats?.waitlistCount || 0}</div>
            <span className="text-[10px] text-zinc-400">Verified emails</span>
          </div>
        </div>

        {/* Recent Platform Activity Stream */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-display font-bold text-white">Recent System Audit Events</h3>
          <div className="space-y-2.5 font-mono text-xs max-h-80 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-400 text-[10px] uppercase font-bold">
                      {ev.event_type}
                    </span>
                    <span className="text-zinc-300 font-sans">{ev.action}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-xs py-4 text-center">No recent activity events.</div>
            )}
          </div>
        </div>

        {/* Waitlist Table */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-display font-bold text-white">Waitlist Submissions ({waitlist.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/60 border-b border-white/5 text-zinc-400 text-[11px]">
                <tr>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Plan Requested</th>
                  <th className="p-3">Submission Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {waitlist.length > 0 ? (
                  waitlist.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{w.email}</td>
                      <td className="p-3 uppercase text-amber-400">{w.plan || 'Free / Pro'}</td>
                      <td className="p-3 text-zinc-500">{new Date(w.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-zinc-500">
                      No waitlist records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
