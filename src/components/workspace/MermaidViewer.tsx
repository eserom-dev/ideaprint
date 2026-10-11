'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw, Code, Eye } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  projectName: string;
}

declare global {
  interface Window {
    mermaid?: any;
  }
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, projectName }) => {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'source'>('visual');
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMermaid() {
      try {
        if (!window.mermaid) {
          // Dynamically import or load mermaid script
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById('mermaid-cdn-script');
            if (existingScript) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.id = 'mermaid-cdn-script';
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Mermaid engine'));
            document.head.appendChild(script);
          });
        }

        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'strict',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            themeVariables: {
              darkMode: true,
              background: '#09090b',
              primaryColor: '#f97316',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#ea580c',
              lineColor: '#71717a',
              secondaryColor: '#27272a',
              tertiaryColor: '#18181b',
            },
          });

          const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await window.mermaid.render(uniqueId, chart);
          if (isMounted) {
            setSvgHtml(svg);
            setRenderError(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid render error:', err);
          setRenderError(err.message || 'Error rendering Mermaid diagram');
        }
      }
    }

    initMermaid();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([chart], { type: 'text/vnd.mermaid' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${safeName}-architecture.mmd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
              viewMode === 'visual'
                ? 'bg-zinc-800 text-white font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-ember" />
            <span>Interactive Diagram</span>
          </button>
          <button
            onClick={() => setViewMode('source')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
              viewMode === 'source'
                ? 'bg-zinc-800 text-white font-bold border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mermaid Source (.mmd)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'visual' && (
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-xl border border-white/5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-zinc-400 w-10 text-center font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 text-zinc-500 hover:text-zinc-300 ml-1 border-l border-white/10 pl-2"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 rounded-xl bg-ember hover:bg-ember-hover text-zinc-950 font-bold flex items-center gap-1.5 transition-colors shadow-glow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .mmd</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas or Source Code View */}
      {viewMode === 'visual' ? (
        <div
          ref={containerRef}
          className="relative min-h-[420px] max-h-[640px] overflow-auto rounded-2xl bg-zinc-950 border border-white/10 p-6 flex items-center justify-center"
        >
          {svgHtml ? (
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
              className="w-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          ) : renderError ? (
            <div className="flex flex-col items-center gap-3 text-center p-6 max-w-md">
              <span className="text-amber-400 text-sm font-bold font-mono">Mermaid Rendering Notice</span>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                The diagram engine could not compile this specific diagram layout. You can view and copy the raw Mermaid source directly.
              </p>
              <button
                onClick={() => setViewMode('source')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-white hover:bg-zinc-700 font-mono"
              >
                Switch to Source Code
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-ember border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-zinc-400">Rendering system architecture diagram...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-950 border border-white/10 p-4 font-mono text-xs overflow-x-auto text-zinc-300">
          <pre className="whitespace-pre leading-relaxed">{chart}</pre>
        </div>
      )}
    </div>
  );
};
