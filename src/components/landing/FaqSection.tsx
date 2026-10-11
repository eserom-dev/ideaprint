'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'How is IDEAPRINT different from ChatGPT, Claude, or general AI chats?',
      answer:
        'General AI chats return unstructured text that vanishes or drifts across sessions. IDEAPRINT stores every requirement, architecture component, entity, and task as schema-validated records connected in a graph. When you modify scope, downstream tasks and tests update their dependency status. Everything has a display ID (FR-014, TSK-003) and provenance badge.',
    },
    {
      question: 'Does IDEAPRINT write my application code?',
      answer:
        'IDEAPRINT focuses entirely on the planning, architecture, schema design, and execution layer that comes before code. It generates ready-to-run PostgreSQL schemas with RLS policies, OpenAPI 3.1 contracts, Mermaid diagrams, and an AI Coding Assistant Build Pack bundle formatted for Claude, Cursor, and Copilot to immediately implement.',
    },
    {
      question: 'Can I edit, reject, or lock AI-proposed items?',
      answer:
        'Yes. Human engineers have the final say on every single item. When the AI proposes a requirement or architecture decision, you can accept, edit, or reject it. You can also toggle the Lock icon: locked items are permanently protected and will never be overwritten by future regenerations.',
    },
    {
      question: 'Who owns the project data and blueprints created in IDEAPRINT?',
      answer:
        'You own 100% of your project data, specifications, and architecture decisions. There is zero vendor lock-in. You can export complete blueprints as Markdown, versioned JSON, PostgreSQL SQL DDL, or a full portable Build Pack at any time.',
    },
    {
      question: 'Are timeline and effort estimates guaranteed delivery dates?',
      answer:
        'No, and IDEAPRINT will never deceive you with invented certainty. Effort estimates are calculated as realistic ranges (optimistic, likely, pessimistic) in effort-days with an explicit confidence level based on your stated team skills. Generated test cases also remain strictly "Not Run" until verified by human or automated testing.',
    },
    {
      question: 'How does the multi-pass AI generation pipeline work?',
      answer:
        'Instead of one fragile, monolithic prompt, IDEAPRINT uses a staged pipeline of specialized passes: 1) Clarifying Interviewer, 2) Problem Analyst, 3) Requirements Engineer, 4) Scoper (MVP Cut), 5) Architect, 6) Planner, 7) QA Strategist, and an independent 8) Critic Pass that rigorously checks for gaps, contradictions, and over-scope.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
            <span className="text-ember font-bold">FAQ</span>
            <span>·</span>
            <span>HONESTY & ARCHITECTURE QUESTIONS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            Frequently asked <span className="metal">questions</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white max-w-xl font-normal">
            Everything you need to know about Blueprint-first engineering and the IDEAPRINT workspace.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-ember flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
