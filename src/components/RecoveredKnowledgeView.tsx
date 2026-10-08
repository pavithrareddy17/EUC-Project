import React, { useState, useRef, useEffect } from 'react';
import {
  FileCode,
  Shield,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
  CheckCircle2,
  Database,
  Layers,
  FileSpreadsheet,
  Cpu,
  HelpCircle,
  GitBranch,
  CheckSquare,
  Lock,
  Copy,
  Check,
  Play,
  Share2,
  CornerDownLeft,
  RotateCcw,
} from 'lucide-react';
import {
  BUSINESS_RULES,
  MODERNIZATION_PLAN,
  SYNTHESIZED_DATA_LINEAGE,
  CONTROL_NARRATIVES,
  SYNTHESIZED_TEST_CASES,
  FUNCTIONAL_SPECS,
  COPILOT_PRESET_ANSWERS,
} from '../data/mockData';
import { EUCInventoryRecord, TestCase, CopilotMessage, ProvenanceType } from '../types';
import { ProvenanceBadge } from './ProvenanceBadge';

interface RecoveredKnowledgeViewProps {
  euc: EUCInventoryRecord;
  onOpenVbaModal: () => void;
  onOpenScanner: () => void;
  onOpenDossier: () => void;
}

function renderFormattedMessage(content: string) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-200">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const textToFormat = isBullet ? trimmed.replace(/^[-•]\s*/, '') : trimmed;
        const parts = textToFormat.split('**');

        const formattedText = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <div className="flex-1 leading-relaxed">{formattedText}</div>
            </div>
          );
        }

        return (
          <p key={lIdx} className="leading-relaxed">
            {formattedText}
          </p>
        );
      })}
    </div>
  );
}

const DEFAULT_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-init',
    sender: 'assistant',
    timestamp: 'Live Model Ready',
    text: `Greetings. I am the **EUC Knowledge Copilot**, indexed against the reverse engineered AST, decompiled VBA formulas, and upstream golden source feeds of **EUC-DEMO-001 (Customer Provision Macro)**.

Ask me anything about how this macro functions, how to troubleshoot month-end calculations, or select one of the governance prompts below:`,
    provenanceTags: [
      { label: 'Decompiled AST Knowledge', type: 'code' },
      { label: 'BCBS 239 Model Governance', type: 'inventory' },
    ],
    suggestedFollowUps: [
      'What does this EUC do in simple terms?',
      'What should I check if today\'s provision calculation looks wrong?',
      'What are the undocumented business rules found in the code?',
      'Show me the auto-generated test cases for this macro',
    ],
  },
];

export const RecoveredKnowledgeView: React.FC<RecoveredKnowledgeViewProps> = ({
  euc,
  onOpenVbaModal,
  onOpenScanner,
  onOpenDossier,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'process-doc'
    | 'data-lineage'
    | 'control-narratives'
    | 'test-cases'
    | 'functional-specs'
    | 'copilot'
    | 'modernization'
  >('process-doc');

  const [selectedTestCase, setSelectedTestCase] = useState<TestCase>(SYNTHESIZED_TEST_CASES[0]);
  const [executedTests, setExecutedTests] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState(false);

  // Embedded Copilot State (Tab 6)
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(DEFAULT_COPILOT_MESSAGES);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const [copiedCopilotId, setCopiedCopilotId] = useState<string | null>(null);
  const copilotChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'copilot') {
      copilotChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, isCopilotTyping, activeTab]);

  const handleExecuteTest = (testId: string) => {
    setExecutedTests((prev) => ({ ...prev, [testId]: true }));
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(MODERNIZATION_PLAN.generatedPythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendCopilotMessage = (textToSend?: string) => {
    const query = (textToSend || copilotInput).trim();
    if (!query || isCopilotTyping) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotInput('');
    setIsCopilotTyping(true);

    setTimeout(() => {
      const preset = COPILOT_PRESET_ANSWERS[query];
      let responseText = '';
      let tags: { label: string; type: ProvenanceType }[] = [];
      let followUps: string[] = [];

      if (preset) {
        responseText = preset.answer;
        tags = preset.tags;
        followUps = preset.followUps;
      } else {
        const lower = query.toLowerCase();
        if (lower.includes('error') || lower.includes('fail') || lower.includes('type mismatch')) {
          responseText = `**Troubleshooting Guidance for Run-time Error:**\n\n1. **Error 13 (Type Mismatch):** Occurs because SAP exported German decimal notation (\`,\` instead of \`.\`) in Column D (Balance) or dates in text format.\n2. **Error 9 (Subscript Out of Range):** The raw extract tab was renamed. Rename it to exactly \`Raw_Extract\`.\n3. **Resolution:** Inspect column D row 2 for non-numeric values; verify that cell M14 still contains \`0.025\`.`;
          tags = [{ label: 'VBA Error Handler Analysis', type: 'code' }];
        } else if (lower.includes('marcus') || lower.includes('exit') || lower.includes('question') || lower.includes('leave')) {
          responseText = `**Marcus Vance Departure Handover Priorities:**\n\n1. **Line 66:** The undocumented 2.5% surcharge for region EU-4 (cell M14).\n2. **Archive Password:** The unprotect key for \`Historical_Provisions_2022\`.\n3. **Exceptions Approval:** Who formally signs off when balances exceed $500,000.`;
          tags = [{ label: 'Departure Risk Matrix', type: 'sme' }];
        } else if (lower.includes('formula') || lower.includes('rule') || lower.includes('logic')) {
          responseText = `**EUC-DEMO-001 Provisioning Logic:**\n- **Stage 1 (<30 DPD):** 0.85% * inflationAdjustment\n- **Stage 2 (30-89 DPD):** 6.20% * inflationAdjustment\n- **Stage 3 (>=90 DPD):** 100% if unsecured, 45% if collateral exists\n- **Haircut:** Exposure is reduced by 70% of pledged collateral value\n- **Region EU-4:** +2.5% penalty (cell M14).`;
          tags = [{ label: 'Decompiled AST Rules', type: 'code' }, { label: 'Accounting Synthesis', type: 'ai' }];
        } else {
          responseText = `**Reverse Engineered Assessment for "${query}":**\n\nBased on the decompiled AST of \`Customer_Provision_Macro.bas\`, this computation is triggered at Month-End close by the Finance desk. All calculations debit account 641000 (Impairment Expense) and credit 149000 (Allowance for Loan Losses).\n\nSelect one of the suggested follow-ups below to explore specific rules or test cases.`;
          tags = [{ label: 'General Knowledge Graph', type: 'ai' }, { label: 'Inventory Register', type: 'inventory' }];
        }
        followUps = [
          'What should I check if today\'s provision calculation looks wrong?',
          'What are the undocumented business rules found in the code?',
          'Show me the auto-generated test cases for this macro',
        ];
      }

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
        provenanceTags: tags,
        suggestedFollowUps: followUps,
      };

      setCopilotMessages((prev) => [...prev, botMsg]);
      setIsCopilotTyping(false);
    }, 500);
  };

  const copyCopilotAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCopilotId(id);
    setTimeout(() => setCopiedCopilotId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Asset Governance Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800 px-2 py-0.5 rounded">
                {euc.id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300 font-mono">{euc.technology}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                Lifecycle: {euc.lifecycle}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-rose-400 bg-rose-950/80 border border-rose-900 px-2 py-0.5 rounded font-semibold">
                Handover Critical (T-18h)
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>{euc.name}</span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                Reverse Engineered · 100% Complete
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
              <div>
                Owner: <strong className="text-rose-300">{euc.owner}</strong>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                Frequency: <span className="text-slate-200">{euc.frequency}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                Exposure: <strong className="text-emerald-400 font-mono">{euc.portfolioExposure}</strong>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                Code Review: <span className="font-mono text-rose-400 font-bold">{euc.codeReview}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenVbaModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Inspect Raw VBA</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask EUC Copilot</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
              title="Re-run AI reverse engineering decompiler"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Re-Analyze</span>
            </button>

            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <span>Export Dossier</span>
            </button>
          </div>

        </div>

        {/* 3-Source Triangulation Audit Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Knowledge Synthesis Origin:</span>
            <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300 font-mono text-[11px]">
              [1] Inventory Register
            </span>
            <span className="text-slate-600">+</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono text-[11px]">
              [2] VBA Code AST
            </span>
            <span className="text-slate-600">+</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-mono text-[11px]">
              [3] Partial Confluence Link
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Model Criticality: <strong className="text-rose-400">Tier 1 (High)</strong> · RTO: <strong>{euc.rto}</strong>
          </div>
        </div>
      </div>

      {/* Main Reverse Engineering Deliverables Tabs (7 Tabs with Copilot as Tab 6) */}
      <div className="border-b border-slate-800">
        <nav className="flex flex-wrap gap-1 -mb-px">
          {[
            { id: 'process-doc', label: '1. Process Documentation', icon: Layers },
            { id: 'data-lineage', label: '2. Data Lineage & Feeds', icon: GitBranch },
            { id: 'control-narratives', label: '3. Control Narratives & Risks', icon: Shield },
            { id: 'test-cases', label: '4. Test Cases & Validation (4)', icon: CheckSquare },
            { id: 'functional-specs', label: '5. Functional Specifications', icon: FileSpreadsheet },
            { id: 'copilot', label: '6. Ask EUC Copilot', icon: Bot, isHighlighted: true },
            { id: 'modernization', label: '7. Modernization & Python Target', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHighlighted = tab.isHighlighted;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-white bg-slate-900/60'
                    : isHighlighted
                    ? 'border-transparent text-indigo-300 hover:text-white hover:border-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : isHighlighted ? 'text-indigo-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {isHighlighted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: PROCESS DOCUMENTATION (Plain English & Executive Overview)
         ========================================================================= */}
      {activeTab === 'process-doc' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Synthesized Process Narrative (Zero-Jargon Documentation)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reverse-engineered by AI from unreviewed code because external Confluence docs were restricted.
                </p>
              </div>
              <ProvenanceBadge type="ai" customLabel="Synthesized Process Spec" />
            </div>

            <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3">
              <p className="text-sm font-medium text-slate-100">
                The <strong>Customer Provision Macro</strong> is the critical monthly accounting engine calculating the bank's Expected Credit Loss (ECL) reserves across $1.84 Billion in customer credit facilities under IFRS 9 / CECL standards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
                    Step 1: Exposure Ingestion
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Ingests the SAP General Ledger dump and Customer Risk Feed with balance, days past due (DPD), and collateral values.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
                    Step 2: Staging &amp; Haircut
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Classifies loans into Stage 1 (0.85%), Stage 2 (6.20%), and Stage 3 (up to 100%). Deducts 70% of pledged collateral and applies a hidden 2.5% EU-4 surcharge.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
                    Step 3: General Ledger Posting
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Generates journal lines debiting Credit Loss Expense (641000) and credits Loan Loss Reserve (149000). Flags facilities &gt;$500k for CFO review.
                  </p>
                </div>
              </div>
            </div>

            {/* Triangulation Callout */}
            <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-indigo-900/60 text-xs flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">How the AI Reconstructed This Documentation:</span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  The finance inventory record marked <code className="text-indigo-300">Controls Documented: No</code> and <code className="text-indigo-300">External Documentation: Partial</code>. The AI parsed the 112-line VBA AST, mapped the variable names (<code className="text-slate-200">daysPastDue, collateralVal, regionalHaircut</code>), and reconciled them with the upstream Customer Risk and GL feeds to generate this complete operational documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Execution Frequency</span>
              <div className="font-bold text-white text-sm">Monthly Close (Day -1)</div>
              <p className="text-[11px] text-slate-400">Triggered between 17:00 and 19:00 after SAP DW batch completes.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Target Runtime</span>
              <div className="font-bold text-white text-sm">Excel 365 32-bit (~4 mins)</div>
              <p className="text-[11px] text-slate-400">Processes ~14,200 loan facilities in memory.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase">Critical Vulnerability</span>
              <div className="font-bold text-rose-300 text-sm">Hidden Cell Parameter (M14)</div>
              <p className="text-[11px] text-slate-400">2.5% EU-4 surcharge is hardcoded in cell M14 with no schema lock.</p>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: DATA LINEAGE & DEPENDENCIES
         ========================================================================= */}
      {activeTab === 'data-lineage' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Synthesized End-to-End Data Lineage
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lineage reconstructed from the inventory feeds and VBA cell offset readers.
                </p>
              </div>
              <ProvenanceBadge type="ai" customLabel="Auto-Mapped Lineage" />
            </div>

            <div className="space-y-4 pt-2">
              <div className="text-xs font-mono uppercase text-sky-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Upstream Golden Source Feeds (3 Inbound Feeds)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SYNTHESIZED_DATA_LINEAGE.filter((n) => n.category === 'upstream').map((node) => (
                  <div key={node.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-white">{node.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Format: {node.format}</div>
                    <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/60 w-fit">
                      {node.integrity}
                    </div>
                    <p className="text-[11px] text-slate-300">{node.notes}</p>
                  </div>
                ))}
              </div>

              {/* Core EUC Node */}
              <div className="flex justify-center py-2">
                <div className="text-slate-600 font-mono">▼ Automated Ingestion &amp; Memory Array Transformation ▼</div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>EUC-DEMO-001: Customer Provision Macro (Excel VBA)</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                    Core Transformation Engine
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Transforms raw SAP records using IFRS 9 degradation matrix. Calculates monetary provision amounts using net exposure after 30% collateral deduction, applies regional EU-4 haircut (+2.5%), and verifies $500,000 management override threshold.
                </p>
              </div>

              {/* Downstream Postings */}
              <div className="flex justify-center py-2">
                <div className="text-slate-600 font-mono">▼ Journal Output &amp; Exception Export ▼</div>
              </div>

              <div className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Downstream Posting Systems (2 Target Deliverables)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SYNTHESIZED_DATA_LINEAGE.filter((n) => n.category === 'downstream').map((node) => (
                  <div key={node.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-emerald-400">{node.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Output: {node.format}</div>
                    <div className="text-[10px] text-emerald-300 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/60 w-fit">
                      Target Cadence: {node.cadence}
                    </div>
                    <p className="text-[11px] text-slate-300">{node.notes}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: CONTROL NARRATIVES & DISCREPANCY RISKS
         ========================================================================= */}
      {activeTab === 'control-narratives' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Control Narratives &amp; Reality Discrepancy Findings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI triangulation comparing what the corporate inventory claims vs. what the code actually does.
                </p>
              </div>
              <ProvenanceBadge type="ai" customLabel="Triangulated Control Audit" />
            </div>

            <div className="space-y-4 pt-2">
              {CONTROL_NARRATIVES.map((ctl) => (
                <div key={ctl.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="font-mono text-indigo-400 text-xs">{ctl.id}</span>
                      {ctl.controlTitle}
                    </span>
                    <span className="font-mono text-[10px] text-rose-400 bg-rose-950/70 border border-rose-900 px-2 py-0.5 rounded uppercase font-semibold">
                      {ctl.financialRisk}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block mb-1">
                        Corporate Inventory Record Claim:
                      </span>
                      <p className="text-slate-300">{ctl.inventoryClaim}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-amber-900/50">
                      <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold block mb-1">
                        Decompiled Code Reality:
                      </span>
                      <p className="text-amber-200">{ctl.codeReality}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-[11px] space-y-1">
                    <div className="font-semibold text-rose-300">{ctl.auditFinding}</div>
                    <div className="text-slate-400">
                      <strong className="text-slate-300">Remediation:</strong> {ctl.remediationStep}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 4: SYNTHESIZED TEST CASES & VALIDATION SUITE
         ========================================================================= */}
      {activeTab === 'test-cases' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Synthesized Test Cases (Auto-Generated Validation Suite)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows non-technical finance staff to verify calculation boundaries, edge cases, and policy overlays.
                </p>
              </div>
              <ProvenanceBadge type="ai" customLabel="Auto-Synthesized Tests" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              {SYNTHESIZED_TEST_CASES.map((tc) => {
                const isSelected = selectedTestCase.id === tc.id;
                const isExecuted = executedTests[tc.id];

                return (
                  <div
                    key={tc.id}
                    onClick={() => setSelectedTestCase(tc)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                      <span className="text-indigo-400 font-bold">{tc.id}</span>
                      <span className="text-slate-500">{tc.type}</span>
                    </div>
                    <div className="font-semibold text-white text-xs leading-snug line-clamp-1">
                      {tc.title}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{tc.codeReference}</span>
                      {isExecuted ? (
                        <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" /> Passed
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">Ready</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{selectedTestCase.id}</span>
                    <span className="text-slate-600">·</span>
                    <h4 className="font-bold text-white text-sm">{selectedTestCase.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedTestCase.scenario}</p>
                </div>

                <button
                  onClick={() => handleExecuteTest(selectedTestCase.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute Simulated Test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">
                    Simulated Input Payload:
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 space-y-1">
                    {Object.entries(selectedTestCase.inputs).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-800/60 py-0.5">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-indigo-300 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">
                    Expected Regulatory Output:
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-emerald-300 text-xs">
                    {selectedTestCase.expectedOutput}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-slate-300">Rationale:</strong> {selectedTestCase.businessRationale}
                  </div>
                </div>
              </div>

              {executedTests[selectedTestCase.id] && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Test executed against reverse-engineered Python model. Output matched expected accounting tolerances within 0.001%.</span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                    STATUS: PASS
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 5: FUNCTIONAL SPECIFICATIONS & BUSINESS RULES
         ========================================================================= */}
      {activeTab === 'functional-specs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Functional Specifications (Module Requirements)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decompiled technical specifications ready for IT migration or audit documentation.
                </p>
              </div>
              <ProvenanceBadge type="code" customLabel="AST Extracted Specs" />
            </div>

            <div className="space-y-4 pt-2">
              {FUNCTIONAL_SPECS.map((spec, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="font-bold text-white text-sm font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {spec.module}
                  </div>
                  <p className="text-slate-300">{spec.objective}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block mb-1">
                        Transformation Logic:
                      </span>
                      <p className="text-slate-300 font-mono">{spec.transformationLogic}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block mb-1">
                        Data Quality Checks:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {spec.dataQualityChecks.map((chk, cIdx) => (
                          <li key={cIdx}>{chk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Decompiled Mathematical Formulas (BR-001 through BR-006)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BUSINESS_RULES.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{rule.id}: {rule.name}</span>
                    <ProvenanceBadge type={rule.provenance} size="sm" />
                  </div>
                  <p className="text-slate-300 text-[11px]">{rule.plainSummary}</p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-emerald-300 text-[11px] border border-slate-800">
                    {rule.extractedFormula}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{rule.codeAnchor}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 6: ASK EUC COPILOT (Embedded directly as Tab 6 for this EUC)
         ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[750px]">
            
            {/* Copilot Tab Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Ask EUC Copilot</h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                      Context: EUC-DEMO-001
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Grounded directly in reverse-engineered code, upstream feeds, and accounting rules
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCopilotMessages(DEFAULT_COPILOT_MESSAGES)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preset Queries (Click to Ask Immediately):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(COPILOT_PRESET_ANSWERS).map((chipKey) => (
                  <button
                    key={chipKey}
                    onClick={() => handleSendCopilotMessage(chipKey)}
                    disabled={isCopilotTyping}
                    className="text-left text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-950/70 hover:text-indigo-200 border border-slate-700 hover:border-indigo-700 text-slate-300 transition-all cursor-pointer"
                  >
                    💡 {chipKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/40">
              {copilotMessages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[11px] opacity-75 mb-1 pb-1 border-b border-white/10">
                        <span className="font-semibold">{isUser ? 'Finance Operator' : 'EUC Guardian Copilot'}</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <div className="text-xs font-sans">
                        {renderFormattedMessage(msg.text)}
                      </div>

                      {msg.provenanceTags && msg.provenanceTags.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-mono">Attribution:</span>
                          {msg.provenanceTags.map((tag, i) => (
                            <ProvenanceBadge key={i} type={tag.type} customLabel={tag.label} size="sm" />
                          ))}
                        </div>
                      )}

                      {!isUser && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => copyCopilotAnswer(msg.id, msg.text)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                          >
                            {copiedCopilotId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-2 pl-2 space-y-1">
                        <div className="text-[10px] text-slate-500 font-mono">Suggested follow-ups:</div>
                        <div className="flex flex-col gap-1">
                          {msg.suggestedFollowUps.map((fu, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendCopilotMessage(fu)}
                              disabled={isCopilotTyping}
                              className="text-left text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                            >
                              → {fu}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isCopilotTyping && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-900 border border-slate-800 p-3 rounded-lg w-fit">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Consulting reverse-engineered AST and upstream feeds...</span>
                </div>
              )}

              <div ref={copilotChatRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCopilotMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask about IFRS 9 staging rules, SAP column offsets, cell M14, or test scenarios..."
                  disabled={isCopilotTyping}
                  className="w-full pl-4 pr-24 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={!copilotInput.trim() || isCopilotTyping}
                  className={`absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    copilotInput.trim() && !isCopilotTyping
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Ask</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 7: MODERNIZATION & PYTHON TARGET
         ========================================================================= */}
      {activeTab === 'modernization' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {MODERNIZATION_PLAN.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reverse-engineered production Python script replacing the fragile desktop macro entirely.
                </p>
              </div>

              <button
                onClick={handleCopyPython}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Python' : 'Copy Generated Python'}</span>
              </button>
            </div>

            {/* Generated Python Code Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
              <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
                {MODERNIZATION_PLAN.generatedPythonSnippet}
              </pre>
            </div>

            {/* Comparison Table */}
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2">
                Operational Fragility Comparison (Excel VBA vs Cloud Pipeline)
              </h4>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Governance Attribute</th>
                      <th className="py-2.5 px-4 font-semibold text-rose-400">Current Excel VBA Macro</th>
                      <th className="py-2.5 px-4 font-semibold text-emerald-400">Target Cloud Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {MODERNIZATION_PLAN.architecturalComparison.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-slate-200">{row.attribute}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{row.current}</td>
                        <td className="py-3 px-4 font-mono text-emerald-300 text-[11px] font-semibold">{row.modern}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3-Week Roadmap */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODERNIZATION_PLAN.phases.map((ph, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-indigo-400">{ph.timeline}</span>
                    <span className="text-slate-500 text-[10px]">Phase {idx + 1}</span>
                  </div>
                  <div className="font-semibold text-white">{ph.phase}</div>
                  <p className="text-slate-400 text-[11px]">{ph.action}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
