'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Database,
  FileCode2,
  Globe2,
  Kanban,
  ShieldCheck,
  Code2,
  CheckCircle2,
} from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  count: string;
  detail: string;
  codeSnippet: string;
  connectedTo: string[];
}

export const ArchitectureScene: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('db');

  const nodes: Record<string, GraphNode> = {
    req: {
      id: 'req',
      name: 'Requirements Model',
      type: 'Specs',
      icon: FileCode2,
      count: '24 Items',
      detail: 'Atomic Must/Should/Could/Won\'t requirements with acceptance criteria.',
      codeSnippet: `// FR-001 (Must)
{
  "displayId": "FR-001",
  "statement": "Teachers record daily period attendance",
  "origin": "user",
  "derivesFrom": ["US-001", "PRB-001"],
  "acceptanceCriteria": [
    "Loads roster in < 500ms",
    "Optimistic UI update"
  ]
}`,
      connectedTo: ['cmp', 'tasks', 'tests'],
    },
    cmp: {
      id: 'cmp',
      name: 'Component Architecture',
      type: 'System Design',
      icon: Cpu,
      count: '6 Services',
      detail: 'Next.js App Router, Supabase Auth Gateway, Postgres Database, and Edge Workers.',
      codeSnippet: `// CMP-001: Web Application UI Shell
satisfies: ["FR-001", "FR-002", "NFR-002"]
technology: "Next.js 14 App Router, TypeScript"
responsibilities: [
  "Server component data prefetching",
  "Optimistic attendance entry grid"
]`,
      connectedTo: ['req', 'db', 'api'],
    },
    db: {
      id: 'db',
      name: 'Postgres & Row Level Security',
      type: 'Database',
      icon: Database,
      count: '8 Tables',
      detail: 'Normalized relational schema with row-level security policies enforcing tenant isolation.',
      codeSnippet: `-- Row Level Security Policy on students table
create policy students_isolation on students
  for all using (
    school_id = (select auth.jwt() ->> 'tenant_id')::uuid
  );`,
      connectedTo: ['cmp', 'api'],
    },
    api: {
      id: 'api',
      name: 'API Contracts (OpenAPI 3.1)',
      type: 'API Contracts',
      icon: Globe2,
      count: '14 Endpoints',
      detail: 'Type-safe route contracts, auth guards, parameters, and error shapes.',
      codeSnippet: `// POST /api/v1/attendance
summary: "Batch record course attendance"
security: [{ bearerAuth: [] }]
requestBody: {
  entries: Array<{ studentId: UUID, status: Status }>
}
response: 200 OK { syncTimestamp: string }`,
      connectedTo: ['cmp', 'tasks'],
    },
    tasks: {
      id: 'tasks',
      name: 'Task Graph & Dependencies',
      type: 'Sprint Tasks',
      icon: Kanban,
      count: '31 Tasks',
      detail: 'Strict dependency enforcement: blocked tasks cannot be marked Done without audit override.',
      codeSnippet: `// TSK-003: Daily Attendance Grid
implements: "FR-001"
dependsOn: ["TSK-002"] // Blocked until Auth & RLS is done!
effort: "3-5 days (low confidence range)"
status: "in_progress"`,
      connectedTo: ['req', 'api'],
    },
    tests: {
      id: 'tests',
      name: 'Testing Lab (Honest Verification)',
      type: 'QA Matrix',
      icon: ShieldCheck,
      count: '16 Tests',
      detail: 'Zero fake security claims. Generated tests remain Not Run until verified with real runs.',
      codeSnippet: `// TC-001 (Permissions)
objective: "Verify cross-school tenant isolation"
verifiesReq: "NFR-001"
status: "passed"
runBy: "Vitest Local RLS Suite (14/14 passed)"
runAt: "2026-10-09 14:22:00 UTC"`,
      connectedTo: ['req'],
    },
  };

  const selectedNode = nodes[selectedNodeId] || nodes.db;

  return (
    <section id="architecture" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <span className="text-ember font-bold">SYSTEM ARCHITECTURE</span>
            <span>·</span>
            <span>THE BLUEPRINT GRAPH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight uppercase text-white max-w-3xl leading-tight">
            Everything stays <span className="metal">connected</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl font-normal">
            A requirement links to its component, its task, and its test case. 
            When scope shifts, the Blueprint Graph shows you exactly what changes downstream.
          </p>
        </div>

        {/* Interactive Graph & Inspector Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visual Mesh */}
          <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-white/10 relative">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
                Live Traceability Graph
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Click any node to inspect schema
              </span>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 relative">
              {Object.values(nodes).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const IconComponent = node.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 group relative ${
                      isSelected
                        ? 'bg-zinc-900 border-ember shadow-glow-sm scale-[1.02]'
                        : 'bg-zinc-950 border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-ember" />
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-ember text-zinc-950' : 'bg-white/5 text-zinc-300 group-hover:text-white'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">{node.type}</span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white mb-1">
                      {node.name}
                    </h3>

                    <div className="text-xs font-mono text-ember font-semibold">
                      {node.count}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Central Core Box */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ember/20 border border-ember/40 flex items-center justify-center text-ember shadow-glow-sm">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Graph Consistency Engine</div>
                  <div className="text-xs font-mono text-zinc-300">Zero orphaned tasks · Cycle-free DAG</div>
                </div>
              </div>
              <div className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Intact
              </div>
            </div>
          </div>

          {/* Live Inspector Drawer */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-7 border border-white/15 sticky top-28">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-ember" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Node Inspector: {selectedNode.name}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 uppercase">
                {selectedNode.type}
              </span>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed mb-4">
              {selectedNode.detail}
            </p>

            {/* Connected Downstream Links */}
            <div className="mb-4">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Traceable Graph Connections:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connectedTo.map((targetId) => {
                  const targetNode = nodes[targetId];
                  return (
                    <button
                      key={targetId}
                      onClick={() => setSelectedNodeId(targetId)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-200 hover:text-ember border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{targetNode.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code / Record Preview */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-950 font-mono text-xs">
              <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-zinc-300">
                <span>Schema Definition</span>
                <span className="text-ember font-bold">Validated</span>
              </div>
              <pre className="p-3.5 text-zinc-200 overflow-x-auto text-[11px] leading-relaxed">
                <code>{selectedNode.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
