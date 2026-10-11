'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { ArrowRight, Menu, X, Sparkles, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const FloatingNav: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '/product' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Use cases', href: '/use-cases' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
        <div
          className={`pointer-events-auto transition-all duration-300 w-full max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-6 py-2.5 rounded-full ${
            isScrolled
              ? 'bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl'
              : 'bg-zinc-950/75 backdrop-blur-xl border border-white/10'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-white/15 font-semibold'
                      : 'text-zinc-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-200 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-ember" />
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="whitespace-nowrap flex-shrink-0 text-xs font-medium text-zinc-200 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/sign-up"
              className="whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center text-xs font-bold px-5 py-2 rounded-full bg-ember hover:bg-ember-hover text-zinc-950 shadow-glow transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-200 hover:text-white rounded-lg hover:bg-white/5 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden pt-24 px-6 flex flex-col justify-between pb-8">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-white hover:text-ember py-2 border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-ember py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>Console Dashboard</span>
                <span className="text-xs font-mono text-zinc-400">{user.email}</span>
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-zinc-900 border border-white/10 text-rose-400 font-mono text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-900 border border-white/10 text-center text-xs font-mono text-zinc-200 hover:text-white"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/projects/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-center text-xs font-mono flex items-center justify-center gap-2 shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
