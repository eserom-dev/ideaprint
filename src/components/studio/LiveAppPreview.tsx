'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Terminal,
  Sparkles,
  ChevronDown,
  Check,
  AlertCircle,
  Code2,
  Wrench,
  Cpu,
  Layers,
  Play,
  Loader2,
} from 'lucide-react';

export interface LiveAppPreviewProps {
  projectName: string;
  projectDescription: string;
  entities?: any[];
  endpoints?: any[];
  requirements?: any[];
  files?: Array<{ path: string; description: string; language: string; content: string }>;
  selectedStack?: string;
  onCodeRegenerate?: (prompt?: string) => void;
  isGenerating?: boolean;
}

interface ConsoleEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'network' | 'action' | 'warn';
  message: string;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({
  projectName,
  projectDescription,
  entities = [],
  endpoints = [],
  requirements = [],
  files = [],
  selectedStack = 'Next.js 14 App Router + Tailwind CSS',
  onCodeRegenerate,
  isGenerating = false,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEvent[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to postMessages from inside the sandbox iframe for live console telemetry
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'ideaprint-sandbox') {
        const newLog: ConsoleEvent = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: event.data.type || 'info',
          message: event.data.message,
        };
        setConsoleLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Look for generated files
  const indexFile = useMemo(() => {
    return files.find((f) => f.path.toLowerCase() === 'index.html' || f.path.toLowerCase() === 'public/index.html');
  }, [files]);

  const previewFile = useMemo(() => {
    return files.find((f) => f.path.toLowerCase().endsWith('preview/index.html'));
  }, [files]);

  const stylesFile = useMemo(() => {
    return files.find(
      (f) =>
        f.path.toLowerCase().endsWith('styles.css') ||
        f.path.toLowerCase().endsWith('globals.css') ||
        f.path.toLowerCase().endsWith('style.css')
    );
  }, [files]);

  const jsFile = useMemo(() => {
    return files.find(
      (f) =>
        f.path.toLowerCase().endsWith('app.js') ||
        f.path.toLowerCase().endsWith('main.js') ||
        f.path.toLowerCase().endsWith('script.js') ||
        f.path.toLowerCase().endsWith('index.js')
    );
  }, [files]);

  const reactPageFile = useMemo(() => {
    return files.find(
      (f) =>
        f.path.toLowerCase().includes('page.tsx') ||
        f.path.toLowerCase().includes('page.jsx') ||
        f.path.toLowerCase().includes('app.tsx')
    );
  }, [files]);

  // Check if runnable code is ready
  const hasRunnableCode = useMemo(() => {
    return !!(indexFile || previewFile || reactPageFile);
  }, [indexFile, previewFile, reactPageFile]);

  // Construct the complete, self-contained, interactive sandbox HTML from the AI-generated files
  const sandboxHtml = useMemo(() => {
    // Primary HTML File candidate
    const baseHtmlFile =
      previewFile && previewFile.content.length > 500
        ? previewFile
        : indexFile || previewFile;

    if (baseHtmlFile && (baseHtmlFile.content.includes('<html') || baseHtmlFile.content.includes('<!DOCTYPE') || baseHtmlFile.content.includes('<body'))) {
      let doc = baseHtmlFile.content;

      // 1. Ensure Tailwind CDN is in head
      if (!doc.includes('cdn.tailwindcss.com')) {
        doc = doc.replace(
          /<head[^>]*>/i,
          `$&<script src="https://cdn.tailwindcss.com"></script>`
        );
      }

      // 2. Ensure Lucide icons is in head
      if (!doc.includes('unpkg.com/lucide')) {
        doc = doc.replace(
          /<head[^>]*>/i,
          `$&<script src="https://unpkg.com/lucide@latest"></script>`
        );
      }

      // 3. Ensure Font families
      if (!doc.includes('fonts.googleapis.com')) {
        doc = doc.replace(
          /<head[^>]*>/i,
          `$&<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`
        );
      }

      // 4. Inject postMessage telemetry bridge
      const bridgeScript = `
<script>
  function emitLog(type, message) {
    try {
      if (window.parent) {
        window.parent.postMessage({ source: 'ideaprint-sandbox', type: type || 'info', message: String(message) }, '*');
      }
    } catch (_) {}
  }
  // Intercept window console
  const origLog = console.log;
  console.log = function(...args) {
    origLog.apply(console, args);
    emitLog('action', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  };
</script>`;
      doc = doc.replace(/<head[^>]*>/i, `$&${bridgeScript}`);

      // 5. Inline styles.css if present in files
      if (stylesFile && stylesFile.content.trim()) {
        const styleTag = `<style>\n${stylesFile.content}\n</style>`;
        if (doc.includes('styles.css')) {
          doc = doc.replace(/<link[^>]*href=["'][^"']*styles\.css["'][^>]*>/i, styleTag);
        } else {
          doc = doc.replace('</head>', `${styleTag}\n</head>`);
        }
      }

      // 6. Inline app.js if present in files
      if (jsFile && jsFile.content.trim()) {
        const scriptTag = `<script>\n${jsFile.content}\n</script>`;
        if (doc.includes('app.js') || doc.includes('main.js') || doc.includes('script.js')) {
          doc = doc.replace(/<script[^>]*src=["'][^"']*(app|main|script)\.js["'][^>]*><\/script>/i, scriptTag);
        } else {
          doc = doc.replace('</body>', `${scriptTag}\n</body>`);
        }
      }

      // 7. Ensure Lucide icons initialization
      if (doc.includes('data-lucide') && !doc.includes('lucide.createIcons')) {
        doc = doc.replace('</body>', `<script>window.addEventListener('DOMContentLoaded', () => { if (window.lucide) window.lucide.createIcons(); });</script>\n</body>`);
      }

      return doc;
    }

    // If only React page.tsx exists, construct a high-fidelity React runtime container
    if (reactPageFile && reactPageFile.content.length > 50) {
      const sanitizedReactCode = reactPageFile.content
        .replace(/['"]use client['"];?/g, '')
        .replace(/import\s+[^;]+from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+default\s+function/g, 'function App')
        .replace(/export\s+default\s+/g, '');

      return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo } = React;
    
    // Lucide Icon Shims
    const IconStub = ({ name, className }) => <span className={className || "inline-block w-4 h-4"} data-lucide={name}>•</span>;
    const ShoppingCart = (p) => <IconStub name="shopping-cart" {...p} />;
    const Store = (p) => <IconStub name="store" {...p} />;
    const Plus = (p) => <IconStub name="plus" {...p} />;
    const Trash2 = (p) => <IconStub name="trash-2" {...p} />;
    const ShieldCheck = (p) => <IconStub name="shield-check" {...p} />;
    const Search = (p) => <IconStub name="search" {...p} />;
    const Check = (p) => <IconStub name="check" {...p} />;

    ${sanitizedReactCode}

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);

    window.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) window.lucide.createIcons();
    });
  </script>
</body>
</html>`;
    }

    // Fallback when no code is synthesized yet
    return '';
  }, [indexFile, previewFile, stylesFile, jsFile, reactPageFile, projectName]);

  // Open the sandbox in a standalone real browser tab
  const handleOpenInNewTab = () => {
    if (!sandboxHtml) return;
    const blob = new Blob([sandboxHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCustomAiUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !onCodeRegenerate) return;
    onCodeRegenerate(customPrompt.trim());
    setCustomPrompt('');
  };

  return (
    <div
      className={`flex flex-col bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-zinc-950' : 'h-[740px]'
      }`}
    >
      {/* 1. Browser Simulation Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 backdrop-blur-md">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop View (100%)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'desktop' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'tablet' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile View (390px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'mobile' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-2">
          <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-zinc-950 border border-white/10 text-[11px] font-mono text-zinc-300 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">https://{projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.app.preview</span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase font-mono font-bold">
              AI Developed
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            title="Toggle Developer Telemetry Console"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
              showConsole
                ? 'bg-ember/10 border-ember/30 text-ember'
                : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Console ({consoleLogs.length})</span>
          </button>

          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload sandbox"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenInNewTab}
            disabled={!sandboxHtml}
            title="Open in Full Browser Tab"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Quick AI Refine Bar */}
      {onCodeRegenerate && (
        <form
          onSubmit={handleCustomAiUpdate}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border-b border-white/5 text-xs font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-ember flex-shrink-0" />
          <input
            type="text"
            placeholder="Instruct AI to code or modify features: e.g. 'Add coupon discount code', 'Make dark theme', 'Add reviews'..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isGenerating}
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-xs outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !customPrompt.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Developing...</span>
              </>
            ) : (
              <span>Update App</span>
            )}
          </button>
        </form>
      )}

      {/* 3. The Live Iframe Sandbox Viewport */}
      <div className="flex-1 overflow-hidden bg-zinc-950 flex justify-center items-stretch relative">
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 font-mono bg-zinc-950">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-ember/10 border border-ember/30 flex items-center justify-center text-ember animate-pulse">
                <Cpu className="w-6 h-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-sans">
                AI Full-Stack Engineer is Developing Your Application
              </h3>
              <p className="text-xs text-zinc-400 max-w-md">
                Synthesizing custom responsive UI, event handlers, and data models for <strong className="text-white">{projectName}</strong>...
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time API Code Generation · {selectedStack}</span>
            </div>
          </div>
        ) : !sandboxHtml ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 font-mono bg-zinc-950">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-ember">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-bold text-white font-sans">Ready to Develop {projectName}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                "{projectDescription || 'Custom software application'}"
              </p>
              <div className="text-[11px] text-zinc-400 font-mono">
                Target: <span className="text-white">{selectedStack}</span> · {requirements.length} Requirements
              </div>
            </div>

            {onCodeRegenerate && (
              <button
                onClick={() => onCodeRegenerate()}
                className="px-6 py-3 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-glow transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Develop Website with AI Now</span>
              </button>
            )}
          </div>
        ) : (
          <div
            className={`h-full transition-all duration-300 flex flex-col ${
              device === 'desktop'
                ? 'w-full'
                : device === 'tablet'
                ? 'w-[768px] border-x border-white/10 shadow-2xl'
                : 'w-[390px] border-x border-white/10 shadow-2xl'
            }`}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={sandboxHtml}
              sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-popups"
              className="w-full h-full border-none bg-slate-950"
              title={projectName}
            />
          </div>
        )}
      </div>

      {/* 4. Collapsible Developer Console Drawer */}
      {showConsole && (
        <div className="h-44 bg-zinc-950 border-t border-white/10 flex flex-col font-mono text-[11px]">
          <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-white/5 text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-ember" />
              <span className="font-bold text-white">Runtime Console & Network Telemetry</span>
              <span className="text-[10px] text-zinc-500">({selectedStack})</span>
            </div>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-zinc-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scroll">
            {consoleLogs.length === 0 ? (
              <div className="text-zinc-500 italic">No console logs yet. Interact with the application above to view runtime telemetry.</div>
            ) : (
              consoleLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                      log.type === 'network'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : log.type === 'action'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-zinc-200">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
