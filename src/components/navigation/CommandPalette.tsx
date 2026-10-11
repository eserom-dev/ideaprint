'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  LayoutDashboard,
  Settings,
  BookOpen,
  LogOut,
  Layers,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CommandPaletteProps {
  projects?: { id: string; name: string; stage?: string }[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ projects = [] }) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const defaultActions = [
    {
      id: 'new-project',
      title: 'Create New Project',
      subtitle: 'Start Stage 1 · Capture',
      icon: Plus,
      onSelect: () => router.push('/projects/new'),
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      subtitle: 'View active projects & stats',
      icon: LayoutDashboard,
      onSelect: () => router.push('/dashboard'),
    },
    {
      id: 'settings',
      title: 'Account Settings',
      subtitle: 'Manage profile & plan quotas',
      icon: Settings,
      onSelect: () => router.push('/settings'),
    },
    {
      id: 'docs',
      title: 'Architecture Documentation',
      subtitle: 'Read specifications & guides',
      icon: BookOpen,
      onSelect: () => router.push('/docs'),
    },
    {
      id: 'logout',
      title: 'Sign Out',
      subtitle: 'End active session',
      icon: LogOut,
      onSelect: () => signOut(),
    },
  ];

  // Project search items
  const projectItems = projects.map((p) => ({
    id: `project-${p.id}`,
    title: p.name,
    subtitle: `Project Workspace · Stage: ${p.stage || 'plan'}`,
    icon: Layers,
    onSelect: () => router.push(`/projects/${p.id}`),
  }));

  const allItems = [...projectItems, ...defaultActions];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleSelect = (idx: number) => {
    const item = filteredItems[idx];
    if (item) {
      item.onSelect();
      setIsOpen(false);
      setQuery('');
    }
  };

  // Keyboard navigation within palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 px-4">
      <div
        className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-white/15 shadow-2xl overflow-hidden flex flex-col font-sans animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative px-4 py-3.5 border-b border-white/10 flex items-center gap-3 bg-zinc-900/60">
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search blueprints... (ESC to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-850 text-white font-medium border border-white/10'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-ember/20 text-ember' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs text-white font-semibold truncate">{item.title}</div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-ember flex-shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No matching commands or projects found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Keyboard Hints Footer */}
        <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>IDEAPRINT Command Console</span>
        </div>
      </div>
    </div>
  );
};
