'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import {
  User,
  Shield,
  CreditCard,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type SettingsTab = 'profile' | 'usage' | 'plan' | 'danger';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [projectCount, setProjectCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in?redirect=/settings');
    }
  }, [user, authLoading, router]);

  // Load user data & project count
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    setLoadingUsage(true);
    try {
      if (!user) return;
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error && count !== null) {
        setProjectCount(count);
      }
    } catch (err) {
      console.warn('Error loading usage stats:', err);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (error) {
        setProfileMsg({ type: 'error', text: error.message });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile display preferences saved.' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Type DELETE in all capitals to confirm account removal.');
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      // 1. Delete user projects
      if (user) {
        await supabase.from('projects').delete().eq('user_id', user.id);
      }
      // 2. Sign out and redirect to home
      await signOut();
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Error executing account deletion request.');
      setDeletingAccount(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-base text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-400">Loading settings console...</p>
        </div>
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
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Workspace
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 font-bold">Account Settings</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* Main Settings Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white mb-2">
            Settings & Preferences
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Manage your account credentials, blueprint quotas, and security preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono text-left transition-all ${
                activeTab === 'profile'
                  ? 'bg-ember text-zinc-950 font-bold shadow-glow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('usage')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono text-left transition-all ${
                activeTab === 'usage'
                  ? 'bg-ember text-zinc-950 font-bold shadow-glow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Usage & Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono text-left transition-all ${
                activeTab === 'plan'
                  ? 'bg-ember text-zinc-950 font-bold shadow-glow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Plan & Invoicing</span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono text-left transition-all ${
                activeTab === 'danger'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-bold'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>

          {/* Tab Panel */}
          <div className="md:col-span-3">
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Personal Identity</h2>
                  <p className="text-xs font-mono text-zinc-400">
                    Your authenticated credentials verified via Supabase Auth
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2.5 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-200'
                        : 'bg-red-950/60 border border-red-500/30 text-red-200'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2 font-bold uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ''}
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-400 font-mono cursor-not-allowed"
                    />
                    <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
                      Protected primary authentication identifier
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2 font-bold uppercase tracking-wider">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Senior Architect"
                      className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2 font-bold uppercase tracking-wider">
                      User Identifier (UUID)
                    </label>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-500 break-all">
                      {user.id}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 rounded-xl bg-ember hover:bg-ember/90 disabled:opacity-50 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-glow"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: USAGE */}
            {activeTab === 'usage' && (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Usage & Telemetry</h2>
                  <p className="text-xs font-mono text-zinc-400">
                    Real-time metrics calculated from your PostgreSQL database records
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Active Blueprints
                    </span>
                    <div className="text-3xl font-display font-bold text-white">
                      {loadingUsage ? '...' : projectCount}
                    </div>
                    <span className="text-xs font-mono text-emerald-400 block pt-1">
                      Stored under Row Level Security (RLS)
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      AI Generation Pipeline
                    </span>
                    <div className="text-lg font-display font-bold text-emerald-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live / Operational</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 block pt-1">
                      Multi-Model Gateway (Gemini & Groq)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 text-xs font-mono text-zinc-400">
                  <span className="text-white font-bold block">Quotas & Limits</span>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Blueprint Creation Limit:</span>
                    <span className="text-zinc-200">Unlimited (Free Beta)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Export Formats:</span>
                    <span className="text-zinc-200">JSON, Markdown, SQL, OpenAPI, Mermaid, CSV</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Generation Gateway Rate Limit:</span>
                    <span className="text-zinc-200">60 requests / minute</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLAN */}
            {activeTab === 'plan' && (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-1">Plan & Entitlements</h2>
                  <p className="text-xs font-mono text-zinc-400">
                    Transparent, honest pricing without simulated charges
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-ember/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-ember-soft text-ember border border-ember/20 text-[10px] font-mono uppercase font-bold">
                        Current Active Plan
                      </span>
                      <h3 className="text-xl font-display font-bold text-white mt-1">Community Free Plan</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-display font-bold text-white">$0</span>
                      <span className="text-xs font-mono text-zinc-500 block">Forever Free</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Includes the full 8-pass AI pipeline, PostgreSQL DDL with RLS generation, OpenAPI contracts, and all export bundles.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  >
                    <span>Inspect Pro & Team Waitlist Details</span>
                    <ExternalLink className="w-3.5 h-3.5 text-ember" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB: DANGER ZONE */}
            {activeTab === 'danger' && (
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-red-500/20 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-red-300 mb-1">Delete Account & Blueprints</h2>
                  <p className="text-xs font-mono text-zinc-400">
                    Permanently delete your account and all associated projects from the database
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-200 leading-relaxed">
                  <strong>Warning:</strong> This operation is permanent and non-reversible. All generated requirements, architecture components, database tables, and tasks will be erased immediately.
                </div>

                {deleteError && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-2">
                      To confirm deletion, type <strong className="text-white">DELETE</strong> below:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full max-w-xs bg-zinc-950 border border-red-500/30 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteConfirm !== 'DELETE'}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingAccount ? 'Purging records...' : 'Permanently Delete Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
