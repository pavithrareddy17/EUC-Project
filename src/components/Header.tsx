import React from 'react';
import { Shield, Sparkles, Bot, Download, Layers, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenEvolution: () => void;
  onOpenScanner: () => void;
  onOpenDossier: () => void;
  activeView: 'inventory' | 'hero-euc';
  setActiveView: (view: 'inventory' | 'hero-euc') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEvolution,
  onOpenScanner,
  onOpenDossier,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md">
      
      {/* Top Priority Handover Banner */}
      <div className="bg-amber-950/70 border-b border-amber-800/70 px-4 py-2 text-xs flex items-center justify-between text-amber-200">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700/60 shrink-0">
            Key-Person Risk Alert
          </span>
          <span className="truncate text-slate-300">
            <strong className="text-white">Marcus Vance</strong> (Finance Process Owner) departs in{' '}
            <strong className="text-amber-300">&lt; 18 hours</strong>. Macro{' '}
            <code className="text-amber-200 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-800">EUC-DEMO-001 (Customer Provision Macro)</code>{' '}
            governs <strong className="text-emerald-400">$1.84B</strong> in loan provisions with zero written documentation.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button
            onClick={() => setActiveView('hero-euc')}
            className="text-[11px] font-semibold text-amber-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Open Reverse Engineered Specs →
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-md shadow-indigo-950/60">
              <Zap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  AI-Powered EUC Reverse Engineering &amp; Modernization
                </h1>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  No-Code Finance Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Process Docs · Data Lineage · Control Narratives · Test Cases · Specifications
              </p>
            </div>
          </div>

          {/* Quick Metrics (3 Triangulated Sources + Key Exposure) */}
          <div className="flex items-center gap-5 text-xs text-slate-400 border-y md:border-y-0 md:border-x border-slate-800 py-2 md:py-0 md:px-5">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Inventory Status</div>
              <div className="font-semibold text-white font-mono text-sm">4 Registered EUCs</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-indigo-400">AI Triangulation</div>
              <div className="font-semibold text-indigo-300 font-mono text-sm">3 Sources Combined</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-emerald-400">Total Exposure</div>
              <div className="font-semibold text-emerald-400 font-mono text-sm">$1.84B Governed</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reverse Engineer EUC</span>
            </button>

            {/* EUC Evolution Feature Button (Moving Beyond EUCs) */}
            <button
              onClick={onOpenEvolution}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-400/40 text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              title="Autonomous direct upstream data agent (Moving beyond EUCs)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>EUC Evolution</span>
            </button>

            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
              title="Export complete regulatory dossier"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeView === 'inventory'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>1. EUC Inventory Catalogue</span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/70 border border-indigo-800/80 px-1 rounded">
              Sample Format
            </span>
          </button>

          <button
            onClick={() => setActiveView('hero-euc')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeView === 'hero-euc'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. Reverse-Engineered Workspace (EUC-DEMO-001)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-1.5 rounded border border-emerald-800">
              Recovered
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
