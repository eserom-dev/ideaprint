'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Check,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  Database,
  Kanban,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  id: string;
  target: string;
  type: 'requirement' | 'entity' | 'endpoint' | 'task' | 'code' | 'general';
  action: 'add' | 'update' | 'delete';
  summary: string;
  originalContent?: string;
  proposedContent: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposals?: Proposal[];
  timestamp: string;
}

interface ProjectAssistantProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated?: () => void;
}

export const ProjectAssistant: React.FC<ProjectAssistantProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your IDEAPRINT Engineering Copilot, grounded directly in the live specifications of **${project.name}**. Ask me to analyze trade-offs, add new requirements, modify schemas, or draft code implementations.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedProposals, setAcceptedProposals] = useState<string[]>([]);
  const [rejectedProposals, setRejectedProposals] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput('');
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: userMsgText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from AI assistant');
      }

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        proposals: data.proposals || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Error communicating with assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = async (proposal: Proposal) => {
    try {
      const res = await fetch('/api/assistant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          proposal,
          userId: user?.id,
        }),
      });

      if (res.ok) {
        setAcceptedProposals((prev) => [...prev, proposal.id]);
        if (onProjectUpdated) onProjectUpdated();
      }
    } catch (err) {
      console.warn('Failed to apply proposal:', err);
    }
  };

  const handleRejectProposal = (proposalId: string) => {
    setRejectedProposals((prev) => [...prev, proposalId]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ember/10 border border-ember/30 flex items-center justify-center text-ember">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white">Project Copilot</h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Grounded in {project.name} · Audited Diffs
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grounding Context Pill */}
      <div className="px-4 py-2 bg-zinc-900/60 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>Active Specs:</span>
        <div className="flex items-center gap-2">
          <span>{(project.requirements || []).length} Reqs</span>
          <span>·</span>
          <span>{(project.entities || []).length} Entities</span>
          <span>·</span>
          <span>{(project.tasks || []).length} Tasks</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-ember text-zinc-950 font-medium font-sans rounded-br-none'
                  : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-bl-none font-sans'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {/* If Assistant proposed diffs, render actionable cards */}
            {msg.proposals && msg.proposals.length > 0 && (
              <div className="w-full space-y-2 mt-2">
                <span className="text-[10px] font-mono uppercase text-ember font-bold block">
                  Proposed Changes (Requires Acceptance):
                </span>
                {msg.proposals.map((prop) => {
                  const isAccepted = acceptedProposals.includes(prop.id);
                  const isRejected = rejectedProposals.includes(prop.id);

                  return (
                    <div
                      key={prop.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 text-[10px] font-bold uppercase">
                          {prop.action} · {prop.type}
                        </span>
                        <span className="text-[10px] text-zinc-500">{prop.target}</span>
                      </div>

                      <div className="font-sans font-medium text-white">{prop.summary}</div>

                      <div className="p-2 rounded bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 overflow-x-auto">
                        <pre className="whitespace-pre-wrap font-mono">{prop.proposedContent}</pre>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        {isAccepted ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied to Project
                          </span>
                        ) : isRejected ? (
                          <span className="text-zinc-500 text-[11px]">Dismissed</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRejectProposal(prop.id)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAcceptProposal(prop)}
                              className="px-3 py-1 rounded-lg bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept & Apply</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <span className="text-[10px] font-mono text-zinc-500 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-xs font-mono text-zinc-400">
            <div className="w-4 h-4 rounded-full border-2 border-ember border-t-transparent animate-spin" />
            <span>Analyzing blueprint and reasoning...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-zinc-950">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 rounded-xl p-1.5 focus-within:border-ember/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask or propose changes to this blueprint..."
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none font-sans"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-ember hover:bg-ember-hover text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
