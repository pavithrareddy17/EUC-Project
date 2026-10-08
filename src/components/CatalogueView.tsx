import React, { useState } from 'react';
import { EUC_CATALOGUE } from '../data/mockData';
import { EUCInventoryRecord } from '../types';
import {
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  FileCode,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Lock,
  GitBranch,
  Database,
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface CatalogueViewProps {
  onSelectEuc: (euc: EUCInventoryRecord) => void;
  onOpenScanner: (euc: EUCInventoryRecord) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({ onSelectEuc, onOpenScanner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [inspectingEuc, setInspectingEuc] = useState<EUCInventoryRecord | null>(null);

  const filteredEucs = EUC_CATALOGUE.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTech =
      selectedTech === 'ALL' || item.technology.toLowerCase().includes(selectedTech.toLowerCase());

    return matchesSearch && matchesTech;
  });

  return (
    <div className="space-y-6">
      
      {/* 3-Way AI Triangulation Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-indigo-900/60 text-indigo-300 border border-indigo-700/80 px-2 py-0.5 rounded font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>3-Source AI Triangulation Engine</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Zero-Code Reverse Engineering</span>
            </div>
            <h2 className="text-base font-bold text-white">
              Bridging the Finance Knowledge Void
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              When citizen developers leave, external documentation links are often restricted or outdated. The AI combines <strong>(1) Corporate Inventory Metadata</strong>, <strong>(2) Ingested Code Artifacts</strong>, and <strong>(3) Partial Documentation</strong> to synthesize complete process documentation, data lineage, control narratives, test cases, and functional specifications automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectEuc(EUC_CATALOGUE[0])}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Explore Hero: EUC-DEMO-001</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Sources Visual Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <Database className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">1. Inventory Metadata</div>
              <div className="text-[10px] text-slate-400">Lifecycle, Feeds, Controls &amp; Status</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">2. Code &amp; Workflow AST</div>
              <div className="text-[10px] text-slate-400">Excel VBA, Python, Alteryx Scripts</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">3. Restricted Doc Links</div>
              <div className="text-[10px] text-slate-400">Confluence / SharePoint (Partial Access)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by EUC ID, name, owner, or process description..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">Technology:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
            {(['ALL', 'Excel VBA', 'Python', 'Alteryx'] as const).map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  selectedTech === tech
                    ? 'bg-slate-800 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* EUC Inventory Cards (Matching Finance Team's Sample Format) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredEucs.map((euc) => {
          const isHero = euc.isHero;
          return (
            <div
              key={euc.id}
              className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                isHero
                  ? 'bg-slate-900 border-amber-800/80 shadow-md ring-1 ring-amber-700/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {euc.id}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                        Lifecycle: {euc.lifecycle}
                      </span>
                      {isHero && (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-800 px-1.5 py-0.2 rounded font-semibold">
                          Departure T-18h
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight mt-1">
                      {euc.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      euc.criticality.includes('Tier 1')
                        ? 'text-rose-400 bg-rose-950/60 border-rose-900'
                        : 'text-amber-400 bg-amber-950/60 border-amber-900'
                    }`}
                  >
                    {euc.criticality}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {euc.description}
                </p>

                {/* Exact Sample Format Grid */}
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Technology:</span>{' '}
                    <span className="font-mono text-slate-200">{euc.technology}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Frequency:</span>{' '}
                    <span className="text-slate-200">{euc.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner:</span>{' '}
                    <span className="text-slate-200 font-medium">{euc.owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Code Review:</span>{' '}
                    <span className={`font-mono font-semibold ${euc.codeReview === 'No' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {euc.codeReview}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Input Integrity:</span>{' '}
                    <span className="text-emerald-400 font-mono">{euc.inputDataIntegrity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Controls Documented:</span>{' '}
                    <span className={`font-mono ${euc.controlsDocumented === 'No' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}>
                      {euc.controlsDocumented}
                    </span>
                  </div>
                </div>

                {/* Upstream & Downstream Feeds */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">Upstream Feeds:</span>
                    <span className="text-slate-300 font-mono truncate">
                      {euc.upstreamDependencies.join(' · ')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">Downstream:</span>
                    <span className="text-slate-300 font-mono truncate">
                      {euc.downstreamDependencies.join(' · ')}
                    </span>
                  </div>
                  {euc.docLink && (
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-amber-300/80">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>External Documentation: {euc.externalDocumentation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setInspectingEuc(euc)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono cursor-pointer"
                >
                  View Full Inventory Record
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectEuc(euc)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Reverse Engineer Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: FULL INVENTORY RECORD (Matching User's Sample Format Verbatim)
         ========================================================================= */}
      {inspectingEuc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Corporate Inventory Record: {inspectingEuc.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Technology: {inspectingEuc.technology} · Lifecycle: {inspectingEuc.lifecycle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingEuc(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-200 space-y-3 bg-slate-950">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 whitespace-pre-line leading-relaxed">
{`ID:
${inspectingEuc.id}

Name:
${inspectingEuc.name}

Technology:
${inspectingEuc.technology}

Lifecycle:
${inspectingEuc.lifecycle}

Description:
${inspectingEuc.description}

Owner:
${inspectingEuc.owner}

Frequency:
${inspectingEuc.frequency}

Upstream Dependencies:
${inspectingEuc.upstreamDependencies.map(d => `• ${d}`).join('\n')}

Downstream Dependencies:
${inspectingEuc.downstreamDependencies.map(d => `• ${d}`).join('\n')}

Input Data Integrity:
${inspectingEuc.inputDataIntegrity}

Output Data Integrity:
${inspectingEuc.outputDataIntegrity}

Version Control:
${inspectingEuc.versionControl}

Repository:
${inspectingEuc.repository}

External Documentation:
${inspectingEuc.externalDocumentation}

Access Right Review:
${inspectingEuc.accessRightReview}

Recovery Personnel:
${inspectingEuc.recoveryPersonnel}

EUC Execution:
${inspectingEuc.eucExecution}

Code Review:
${inspectingEuc.codeReview}

Data Quality Controls:
${inspectingEuc.dataQualityControls}

Controls Documented:
${inspectingEuc.controlsDocumented}

Controls Effectively Performed:
${inspectingEuc.controlsEffectivelyPerformed}

Issues Tracked:
${inspectingEuc.issuesTracked}`}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Source: Finance Inventory Register (.xlsx)
              </span>
              <button
                onClick={() => {
                  onSelectEuc(inspectingEuc);
                  setInspectingEuc(null);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Launch Reverse Engineering →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
