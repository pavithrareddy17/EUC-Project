import React, { useState } from 'react';
import { X, Copy, Check, FileCode, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { HERO_VBA_CODE } from '../data/mockData';
import { ProvenanceBadge } from './ProvenanceBadge';

interface VbaCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRule?: (ruleId: string) => void;
}

export const VbaCodeModal: React.FC<VbaCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  if (!isOpen) return null;

  const lines = HERO_VBA_CODE.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(HERO_VBA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeAnnotations: Record<number, { title: string; type: 'sme' | 'code' | 'ai'; desc: string }> = {
    28: {
      title: 'Hidden Parameter Extraction (M14)',
      type: 'sme',
      desc: 'Cell M14 contains 0.025 (2.5% EU-4 surcharge). Undocumented parameter injected without validation.',
    },
    29: {
      title: 'Unverified Inflation Multiplier (M15)',
      type: 'ai',
      desc: 'Cell M15 holds 1.018. Multiplies Stage 1 & 2 baseline rates without documented committee approval.',
    },
    48: {
      title: 'Stage 1 Deterioration Rule',
      type: 'code',
      desc: 'DPD < 30 receives 12-Month Expected Credit Loss of 0.85% base PD.',
    },
    51: {
      title: 'Stage 2 SICR Cliff-Edge Rule',
      type: 'code',
      desc: 'DPD 30-89 jumps to 6.20% lifetime expected credit loss.',
    },
    55: {
      title: 'Stage 3 Default & Full Impairment',
      type: 'code',
      desc: 'DPD >= 90 without collateral results in 100% full impairment reserve.',
    },
    66: {
      title: 'CRITICAL GAP: Regional Haircut Surcharge',
      type: 'sme',
      desc: 'Undocumented logic: Region "EU-4" gets +2.5% add-on penalty.',
    },
    74: {
      title: '30% Collateral Haircut Magic Number',
      type: 'code',
      desc: 'Calculates net exposure by reducing eligible collateral to 70% (multiplier 0.70).',
    },
    77: {
      title: 'Management Override Segregation',
      type: 'ai',
      desc: 'Facilities exceeding $500,000 are shunted to Exceptions_SignOff tab for executive review.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white font-mono">Customer_Provision_v4_2.bas</h3>
                <span className="text-xs text-slate-400 font-mono">112 lines · VBA 7.1 / Excel 32-bit</span>
                <ProvenanceBadge type="code" customLabel="Raw Ingested Artifact" />
              </div>
              <p className="text-xs text-slate-400">
                Source path: <code className="text-slate-300">\\fin-srv01\shares\credit_provisions\legacy\PROV_ENGINE_v4_2.xlsm</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view of code and detected annotations */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left / Center: Code viewer with line numbers */}
          <div className="lg:col-span-8 overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed border-r border-slate-800/80">
            <div className="divide-y divide-transparent">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const annotation = codeAnnotations[lineNum];
                const isSelected = activeHighlight === lineNum;
                const isComment = line.trim().startsWith("'");
                const isSubOrEnd = line.includes('Sub ') || line.includes('End Sub') || line.includes('Option Explicit');

                return (
                  <div
                    key={idx}
                    id={`line-${lineNum}`}
                    onClick={() => annotation && setActiveHighlight(lineNum)}
                    className={`flex items-start group transition-colors py-0.5 px-2 rounded ${
                      isSelected
                        ? 'bg-indigo-950/70 border-l-2 border-indigo-400'
                        : annotation
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 cursor-pointer border-l-2 border-amber-500/70'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="w-10 text-right pr-4 text-slate-600 select-none text-[11px] font-mono group-hover:text-slate-400">
                      {lineNum}
                    </span>
                    
                    <span
                      className={`flex-1 whitespace-pre break-all ${
                        isComment
                          ? 'text-emerald-500/90 italic'
                          : isSubOrEnd
                          ? 'text-indigo-400 font-semibold'
                          : annotation
                          ? 'text-amber-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {line}
                    </span>

                    {annotation && (
                      <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Rule Found
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Extracted Rule Map & Quick Jump */}
          <div className="lg:col-span-4 bg-slate-900/70 overflow-y-auto p-5 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Extracted Business Rules in Code
              </h4>
              <p className="text-xs text-slate-400">
                Click any highlighted rule to jump to its exact implementation line in the ingested VBA binary.
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(codeAnnotations).map(([lineStr, info]) => {
                const lineNum = parseInt(lineStr, 10);
                const isSelected = activeHighlight === lineNum;

                return (
                  <div
                    key={lineStr}
                    onClick={() => {
                      setActiveHighlight(lineNum);
                      const el = document.getElementById(`line-${lineNum}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                          Line {lineNum}
                        </span>
                        {info.title}
                      </span>
                      <ProvenanceBadge type={info.type} />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {info.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 mt-auto rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs">
              <div className="flex items-center gap-2 font-semibold mb-1 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Auditor Red Flag</span>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Notice lines 28 &amp; 66: Marcus coded the 2.5% EU-4 surcharge as a direct offset against hidden cell M14. If an operator replaces the sheet with a standard template, this rule silently collapses to 0.00%.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Static AST Parsing Verified · SHA-256 Checksum: 8f492...ba19</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
