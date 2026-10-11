'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Database,
  Cpu,
  Activity,
  X,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface LiveAppPreviewProps {
  projectName: string;
  projectDescription: string;
  entities?: any[];
  endpoints?: any[];
  requirements?: any[];
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({
  projectName,
  projectDescription,
  entities = [],
  endpoints = [],
  requirements = [],
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'analytics' | 'api'>('records');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Determine primary entity name (e.g. Items, Users, Records)
  const primaryEntity = entities.length > 0 ? entities[0].name : 'Records';
  const entityFields = entities.length > 0 && Array.isArray(entities[0].fields) ? entities[0].fields : [
    { name: 'name', type: 'string' },
    { name: 'category', type: 'string' },
    { name: 'status', type: 'string' },
  ];

  // Dynamic live state for records (starts empty, populated strictly by real user input)
  const [records, setRecords] = useState<any[]>([]);

  // Form state for creating a new record
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Production');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRec = {
      id: `REC-00${records.length + 1}`,
      title: newTitle.trim(),
      category: newCategory,
      status: 'Active',
      updatedAt: 'Just now',
    };

    setRecords([newRec, ...records]);
    setNewTitle('');
    setShowAddModal(false);
    triggerToast(`Successfully created ${primaryEntity}: "${newRec.title}"`);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
    triggerToast('Record deleted.');
  };

  const filteredRecords = records.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
      {/* 1. Browser Simulation Header & Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-white/10">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop View (100%)"
            className={`p-1.5 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded-md transition-colors ${
              device === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile View (390px)"
            className={`p-1.5 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-md bg-zinc-950 border border-white/10 text-[11px] font-mono text-zinc-300 truncate">
            <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="truncate">https://{projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.app.local</span>
          </div>
        </div>

        {/* Browser Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearchQuery('');
              triggerToast('Live preview refreshed.');
            }}
            title="Reload sandbox"
            className="p-1.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Application Viewport Sandbox */}
      <div className="flex-1 overflow-auto bg-zinc-950 p-4 sm:p-6 flex justify-center items-start min-h-[580px]">
        <div
          className={`w-full transition-all duration-300 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col ${
            device === 'desktop'
              ? 'max-w-full'
              : device === 'tablet'
              ? 'max-w-[768px]'
              : 'max-w-[390px]'
          }`}
        >
          {/* In-App Navigation Bar */}
          <header className="px-5 py-3.5 bg-zinc-950/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-xs">
                {projectName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xs text-white tracking-tight truncate max-w-[160px]">
                  {projectName}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">v1.0.0 · Production</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add {primaryEntity}</span>
              </button>
            </div>
          </header>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* KPI Stat Cards */}
          <div className="p-5 border-b border-white/10 bg-zinc-900/40">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-400 font-mono uppercase">Total {primaryEntity}</div>
                <div className="text-xl font-bold text-white">{records.length}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span>● Live synced</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-400 font-mono uppercase">API Latency</div>
                <div className="text-xl font-bold text-white">24ms</div>
                <div className="text-[10px] text-zinc-400 font-mono">Edge Optimized</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-400 font-mono uppercase">Database RLS</div>
                <div className="text-xl font-bold text-emerald-400">Isolated</div>
                <div className="text-[10px] text-zinc-400 font-mono">Row Security</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-400 font-mono uppercase">Endpoints</div>
                <div className="text-xl font-bold text-orange-400">{endpoints.length || 4}</div>
                <div className="text-[10px] text-zinc-400 font-mono">REST Handlers</div>
              </div>
            </div>
          </div>

          {/* Application Main Content Area */}
          <div className="p-5 space-y-4 flex-1">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder={`Search ${primaryEntity.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/5 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'records' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'api' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Endpoints
                </button>
              </div>
            </div>

            {/* TAB 1: Records Table */}
            {activeTab === 'records' && (
              <div className="rounded-xl border border-white/10 overflow-hidden bg-zinc-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-zinc-900/80 text-[10px] font-mono text-zinc-400 uppercase border-b border-white/10">
                      <tr>
                        <th className="px-4 py-2.5">Identifier</th>
                        <th className="px-4 py-2.5">Title / Name</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">{item.id}</td>
                            <td className="px-4 py-3 text-white font-medium">{item.title}</td>
                            <td className="px-4 py-3 text-zinc-300 font-mono text-[11px]">{item.category}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                title="Delete record"
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 font-mono text-xs">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-zinc-500">No {primaryEntity.toLowerCase()} records created yet.</span>
                              <button
                                onClick={() => setShowAddModal(true)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create first {primaryEntity}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Endpoints Inspector */}
            {activeTab === 'api' && (
              <div className="space-y-2">
                {(endpoints.length > 0 ? endpoints : [
                  { method: 'GET', path: '/api/health', summary: 'System diagnostics and health status' },
                  { method: 'GET', path: `/api/${primaryEntity.toLowerCase()}`, summary: `List all ${primaryEntity.toLowerCase()} records` },
                  { method: 'POST', path: `/api/${primaryEntity.toLowerCase()}`, summary: `Create a new ${primaryEntity.toLowerCase()} entry` },
                  { method: 'DELETE', path: `/api/${primaryEntity.toLowerCase()}/:id`, summary: 'Delete record by UUID' },
                ]).map((ep: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        ep.method === 'GET' ? 'bg-cyan-500/10 text-cyan-400' :
                        ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                        ep.method === 'DELETE' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-white font-semibold">{ep.path}</span>
                    </div>
                    <span className="text-zinc-400 text-[11px] truncate max-w-xs">{ep.summary}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Modal Form: Add Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Create New {primaryEntity}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. New ${primaryEntity} Entry`}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Environment / Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
