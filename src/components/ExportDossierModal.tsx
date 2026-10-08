import React, { useState } from 'react';
import { X, Printer, Download, Check, Shield, FileCheck, Building2, AlertTriangle } from 'lucide-react';
import { EUC_CATALOGUE, BUSINESS_RULES, OPERATIONAL_RISKS, RUNBOOK_ITEMS, SME_HANDOVER_GAPS } from '../data/mockData';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  eucId: string;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({ isOpen, onClose, eucId }) => {
  const [downloaded, setDownloaded] = useState(false);
  const euc = EUC_CATALOGUE.find((e) => e.id === eucId) || EUC_CATALOGUE[0];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dossierData = {
      applet: 'EUC Knowledge Guardian',
      exportTimestamp: new Date().toISOString(),
      eucMetadata: euc,
      businessRules: BUSINESS_RULES,
      operationalRisks: OPERATIONAL_RISKS,
      emergencyRunbook: RUNBOOK_ITEMS,
      exitHandoverGaps: SME_HANDOVER_GAPS,
      governanceStatus: 'RECOVERED_AUDIT_READY',
      complianceFramework: 'BCBS 239 / SR 11-7 / IFRS 9',
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EUC-DOSSIER-${euc.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Regulatory Handover &amp; Governance Dossier</h3>
              <p className="text-xs text-slate-400 font-mono">
                Document Ref: GOV-EUC-{euc.id}-2026-Q1 · Tier-1 Risk Classification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors shadow-sm"
            >
              {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'Downloaded JSON' : 'Export Machine Dossier'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950 font-sans text-slate-200">
          
          {/* Institution Header */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
                <Building2 className="w-4 h-4" />
                <span>Global Risk Governance &amp; EUC Stewardship Council</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Model &amp; EUC Emergency Continuity Dossier
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Autonomous knowledge recovery audit generated for critical citizen-developed artifact upon departure of primary author.
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 space-y-1">
              <div><span className="text-slate-500">Security Classification:</span> <span className="text-amber-400 font-semibold">RESTRICTED</span></div>
              <div><span className="text-slate-500">Audit Status:</span> <span className="text-emerald-400 font-semibold">RECOVERED</span></div>
              <div><span className="text-slate-500">Standard:</span> BCBS 239 / SR 11-7</div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div>
              <div className="text-slate-500 text-[11px]">EUC Name</div>
              <div className="font-semibold text-white mt-0.5">{euc.name}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Departing Developer</div>
              <div className="font-semibold text-rose-400 mt-0.5">{euc.owner} (Exiting)</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Process &amp; Scope</div>
              <div className="font-semibold text-slate-200 mt-0.5">{euc.description}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Portfolio Exposure</div>
              <div className="font-semibold text-emerald-400 font-mono mt-0.5">{euc.portfolioExposure}</div>
            </div>
          </div>

          {/* Section: Recovered Rules Summary */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Section 1: Ingested Accounting Rules (Decompiled VBA Logic)</span>
            </h4>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
              {BUSINESS_RULES.map((rule) => (
                <div key={rule.id} className="p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="font-mono text-indigo-400">{rule.id}</span>
                      {rule.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{rule.category}</span>
                  </div>
                  <p className="text-slate-300">{rule.plainSummary}</p>
                  <div className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-2 rounded border border-slate-800">
                    {rule.extractedFormula}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Urgent SME Exit Handover Questions */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Section 2: Mandatory Departure Handover Checklist (T-18h Deadline)</span>
            </h4>
            <div className="space-y-3">
              {SME_HANDOVER_GAPS.map((gap, i) => (
                <div key={gap.id} className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20 text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
                    <span>Question {i + 1}: {gap.question}</span>
                    <span className="font-mono text-[10px] uppercase bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
                      {gap.urgency}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">{gap.context}</p>
                  <div className="mt-3 pt-3 border-t border-amber-900/40 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>SME Response Log: __________________________________________________</span>
                    <span>Sign-off: _________ Date: _________</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Emergency 911 Runbook Excerpt */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Section 3: Operator Runbook Excerpt (First 15-Minute Response)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RUNBOOK_ITEMS.slice(0, 2).map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-rose-300 font-mono">{item.errorSignature}</div>
                  <p className="text-slate-400 text-[11px]"><strong className="text-slate-300">Root Cause:</strong> {item.rootCause}</p>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <div className="font-semibold text-slate-200">Resolution Steps:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {item.resolutionSteps.slice(0, 3).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-6 text-xs text-slate-400 pt-6">
            <div>
              <div className="text-slate-500">Departing SME:</div>
              <div className="font-semibold text-slate-200 mt-1">{euc.owner}</div>
              <div className="border-b border-slate-700 mt-6" />
              <div className="text-[10px] text-slate-500 mt-1">Signature &amp; Date</div>
            </div>
            <div>
              <div className="text-slate-500">Incoming Support Lead:</div>
              <div className="font-semibold text-slate-200 mt-1">Designated Credit Risk Officer</div>
              <div className="border-b border-slate-700 mt-6" />
              <div className="text-[10px] text-slate-500 mt-1">Signature &amp; Date</div>
            </div>
            <div>
              <div className="text-slate-500">Model Governance Chair:</div>
              <div className="font-semibold text-slate-200 mt-1">Chief Risk Officer Delegate</div>
              <div className="border-b border-slate-700 mt-6" />
              <div className="text-[10px] text-slate-500 mt-1">Signature &amp; Date</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
