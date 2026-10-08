import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface RecoverySimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  eucName: string;
}

const PHASES = [
  {
    title: 'Decompiling VBA Project & Abstract Syntax Tree (AST)',
    desc: 'Extracting procedures `ProcessMonthEndProvisions`, local variables, cell references, and loop constructs.',
    duration: 800,
  },
  {
    title: 'Mapping Upstream / Downstream Schema Contracts',
    desc: 'Identifying inputs: `SAP_GL_DUMP_*.csv`, column mapping D (Balance), F (DPD), H (Collateral). Output journal sheets.',
    duration: 900,
  },
  {
    title: 'Inferring Implicit Accounting & Regulatory Rules',
    desc: 'Synthesizing IFRS 9 / CECL Stage 1 (0.85%), Stage 2 (6.20%), and Stage 3 (100%/45%) degradation matrix.',
    duration: 850,
  },
  {
    title: 'Detecting Undocumented Logic & Operational Risks',
    desc: 'ALERT: Discovered undocumented EU-4 jurisdiction surcharge (+2.5%) tied to hidden cell `Raw_Extract!M14`.',
    isAlert: true,
    duration: 1000,
  },
  {
    title: 'Generating Emergency 911 Runbook & Exit Handover Dossier',
    desc: 'Assembling troubleshooting resolutions for Type Mismatch 13 and critical exit interview questions for Marcus Vance.',
    duration: 750,
  },
];

export const RecoverySimulationModal: React.FC<RecoverySimulationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  eucName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCompleted(false);
      return;
    }

    let isMounted = true;
    let stepIndex = 0;

    const runSteps = () => {
      if (stepIndex < PHASES.length) {
        setCurrentStep(stepIndex);
        const timer = setTimeout(() => {
          if (isMounted) {
            stepIndex++;
            runSteps();
          }
        }, PHASES[stepIndex].duration);
        return () => clearTimeout(timer);
      } else {
        setCompleted(true);
      }
    };

    const cleanup = runSteps();
    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Autonomous Knowledge Recovery Engine</h3>
              <p className="text-xs text-slate-400 font-mono">Analyzing: {eucName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress List */}
        <div className="p-6 space-y-4">
          {PHASES.map((phase, idx) => {
            const isDone = completed || idx < currentStep;
            const isCurrent = !completed && idx === currentStep;
            const isPending = !completed && idx > currentStep;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                    : isDone
                    ? phase.isAlert
                      ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      phase.isAlert ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-white' : isDone ? (phase.isAlert ? 'text-amber-300' : 'text-slate-200') : 'text-slate-500'}`}>
                        {phase.title}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-mono text-emerald-400">Recovered</span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 text-slate-400 leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{completed ? 'Knowledge Graph Synthesized' : 'Decompiling Citizen Artifact...'}</span>
          </div>

          <div className="flex items-center gap-2">
            {!completed && (
              <button
                onClick={() => {
                  setCompleted(true);
                  setCurrentStep(PHASES.length);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Skip Animation
              </button>
            )}
            
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              disabled={!completed}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
                completed
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Explore Recovered Knowledge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
