import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Database,
  CheckCircle2,
  Loader2,
  CornerDownLeft,
  Server,
  Layers,
  Table,
  RotateCcw,
  Download,
  Check,
  ShieldCheck,
  Cpu,
  FileSpreadsheet,
} from 'lucide-react';

interface EucEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EvolutionMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  upstreamFeeds?: string[];
  executionTime?: string;
  bypassedEuc?: string;
  dataSummary?: {
    totalRecords: string;
    totalExposure: string;
    calculatedOutput: string;
    stage1Amt: string;
    stage2Amt: string;
    stage3Amt: string;
    overridesCount: number;
  };
  sampleTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  suggestedPrompts?: string[];
}

const INITIAL_MESSAGES: EvolutionMessage[] = [
  {
    id: 'evo-init',
    sender: 'assistant',
    timestamp: 'Live Agent Ready',
    text: `Welcome to **EUC Evolution** — the strategic pathway to **move beyond EUCs entirely**.

Instead of running fragile desktop spreadsheets or waiting for departing citizen developers, EUC Evolution connects directly to **upstream golden sources** (Customer Risk Feed, SAP GL, Murex, SWIFT), executes validated governance rules in the cloud, and delivers production-grade results with **zero code**.

Select an autonomous upstream workflow or type a natural-language request below:`,
    suggestedPrompts: [
      'Calculate month-end IFRS 9 provisions directly from SAP & CRM feeds (Bypass EUC-DEMO-001)',
      'Reconcile T+1 swap collateral directly from Murex & Euroclear (Bypass EUC-DEMO-002)',
      'Screen SWIFT payments for sanctions directly from wire gateway (Bypass EUC-DEMO-003)',
      'Simulate a +50 bps macroeconomic rate shock across the active loan book',
    ],
  },
];

// Helper to render markdown bolding and bullet lists cleanly without raw ** asterisks
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

        // Split by ** to alternate between normal text and bold text
        const parts = textToFormat.split('**');

        const formattedText = parts.map((part, pIdx) => {
          // Odd indices are between **...**
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

export const EucEvolutionModal: React.FC<EucEvolutionModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<EvolutionMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);
  const [downloadedCsvId, setDownloadedCsvId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, activeStep]);

  if (!isOpen) return null;

  const handleExecutePrompt = (promptText: string) => {
    if (isProcessing) return;

    const userMsg: EvolutionMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    // Simulated Upstream Direct Pipeline Execution
    setActiveStep('Connecting to Upstream Golden Sources (SAP S/4HANA & CRM Risk Feed)...');

    setTimeout(() => {
      setActiveStep('Querying live customer balance vectors & ratings benchmarks...');
    }, 600);

    setTimeout(() => {
      setActiveStep('Applying reverse-engineered IFRS 9 staging rules & collateral haircuts in cloud engine...');
    }, 1200);

    setTimeout(() => {
      setActiveStep(null);
      setIsProcessing(false);

      let responseText = '';
      let upstream: string[] = [];
      let bypassed = '';
      let summaryData: any = null;
      let tableData: any = null;
      let nextPrompts: string[] = [];

      const lower = promptText.toLowerCase();

      if (lower.includes('provision') || lower.includes('euc-demo-001') || lower.includes('sap & crm')) {
        bypassed = 'EUC-DEMO-001 (Customer Provision Macro)';
        upstream = [
          'Customer Risk Feed (CRM_EXP_01)',
          'SAP FI-CO General Ledger (DW_EXTRACT_0400)',
          'Ratings Reference Benchmark (Moody’s/S&P)',
        ];
        responseText = `**Autonomous Upstream Execution Complete:**
I directly ingested **14,210 active credit facilities** ($1.842B total exposure) from the upstream SAP GL and Customer Risk data lakes, completely bypassing the legacy Excel macro.

**Execution Highlights:**
- **Zero Macro Dependency:** Calculated in **1.8 seconds** in cloud memory vs. 4+ minutes of desktop Excel freezing.
- **Governed Staging:** 11,840 facilities classified as Stage 1 (0.85%), 1,820 as Stage 2 (6.20%), and 550 as Stage 3 Default.
- **Collateral Haircuts & Regional Surcharge:** 30% haircut applied to pledged collateral; +2.5% regional surcharge validated for EU-4 accounts.
- **Management Overrides:** 8 corporate accounts exceeded $500k and are isolated with digital audit hashes.`;

        summaryData = {
          totalRecords: '14,210 Facilities',
          totalExposure: '$1,842,500,000.00',
          calculatedOutput: '$42,840,120.50 (Total Provision)',
          stage1Amt: '$12,410,200.00 (0.865%)',
          stage2Amt: '$19,540,810.50 (6.312%)',
          stage3Amt: '$10,889,110.00 (45.0% - 100%)',
          overridesCount: 8,
        };

        tableData = {
          headers: ['Cust ID', 'Facility Balance', 'DPD', 'Stage', 'Collateral Net', 'Calculated Provision', 'Status'],
          rows: [
            ['CUST-88102', '$100,000.00', '14', '1', '$14,000.00', '$744.16', 'Auto-Approved'],
            ['CUST-41908', '$250,000.00', '30', '2', '$35,000.00', '$13,569.94', 'Auto-Approved'],
            ['CUST-99014', '$80,000.00', '95', '3', '$0.00', '$80,000.00', 'Full Charge-Off'],
            ['CUST-55120', '$120,000.00', '45', '2 (EU-4)', '$0.00', '$10,573.92', 'Regional Haircut (+2.5%)'],
            ['CUST-77401', '$750,000.00', '65', '2', '$120,000.00', '$39,763.00', 'CFO Sign-Off Required'],
          ],
        };

        nextPrompts = [
          'Dispatch these calculated provisions directly to SAP Ledger 01',
          'Simulate a +50 bps macroeconomic rate shock across the active loan book',
          'Reconcile T+1 swap collateral directly from Murex & Euroclear (Bypass EUC-DEMO-002)',
        ];
      } else if (lower.includes('murex') || lower.includes('swap') || lower.includes('euc-demo-002')) {
        bypassed = 'EUC-DEMO-002 (FX Hedge Reconciler)';
        upstream = ['Murex Front Office API (MT_CONFIRM_DAILY)', 'Euroclear Collateral Feed (MT569)'];
        responseText = `**Cross-Currency Hedge Reconciled Directly from Upstream Sources:**
Directly pulled **482 open swap positions** ($620M notional) from the Murex trade feed and matched against Euroclear custodian collateral statements.

- **Match Rate:** 479 of 482 trades matched cleanly (99.4%).
- **Variance Detected:** 3 minor timing breaks totaling $42,100 resolved automatically via intraday pricing fixings.
- **Desktop Python Script Bypassed:** No local machine execution on WKS-812 needed.`;

        summaryData = {
          totalRecords: '482 Trades',
          totalExposure: '$620,000,000.00',
          calculatedOutput: '$18,400,000.00 Margin Call',
          stage1Amt: '479 Clean Matches',
          stage2Amt: '3 Intraday Variances',
          stage3Amt: '$0 Uncollateralized',
          overridesCount: 0,
        };

        nextPrompts = [
          'Calculate month-end IFRS 9 provisions directly from SAP & CRM feeds (Bypass EUC-DEMO-001)',
          'Screen SWIFT payments for sanctions directly from wire gateway (Bypass EUC-DEMO-003)',
        ];
      } else if (lower.includes('sanction') || lower.includes('swift') || lower.includes('euc-demo-003')) {
        bypassed = 'EUC-DEMO-003 (Trade Sanctions Sifter)';
        upstream = ['SWIFT Alliance Wire Gateway', 'US OFAC & UK HMT Real-Time XML'];
        responseText = `**Real-Time SWIFT Wire Screening Executed:**
Streamed **1,240 outbound wire payments** ($3.10B daily flow) directly from SWIFT gateway through the consolidated OFAC/EU watchlists.

- **Cleared Payments:** 1,236 wires pre-cleared for straight-through processing (STP).
- **Flagged Entities:** 4 false-positive fuzzy matches isolated for level-2 AML compliance officer review.
- **Alteryx Workflow Bypassed:** Zero reliance on departed employee's personal network share.`;

        nextPrompts = [
          'Calculate month-end IFRS 9 provisions directly from SAP & CRM feeds (Bypass EUC-DEMO-001)',
          'Simulate a +50 bps macroeconomic rate shock across the active loan book',
        ];
      } else {
        bypassed = 'Desktop Spreadsheet EUC Layer';
        upstream = ['Core Banking Data Lake', 'SAP S/4HANA CDS Views'];
        responseText = `**Autonomous Cloud Execution Result for: "${promptText}"**
Directly analyzed upstream front-office data feeds. Governed financial transformation executed successfully in cloud memory without touching local spreadsheet files or citizen scripts.`;
        nextPrompts = [
          'Calculate month-end IFRS 9 provisions directly from SAP & CRM feeds (Bypass EUC-DEMO-001)',
          'Reconcile T+1 swap collateral directly from Murex & Euroclear (Bypass EUC-DEMO-002)',
        ];
      }

      const botMsg: EvolutionMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
        upstreamFeeds: upstream,
        executionTime: '1.84 seconds (In-Cloud)',
        bypassedEuc: bypassed,
        dataSummary: summaryData,
        sampleTable: tableData,
        suggestedPrompts: nextPrompts,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 1800);
  };

  const handleExportJournal = (msgId: string) => {
    setExportedStatus(msgId);
    setTimeout(() => setExportedStatus(null), 3000);
  };

  // Download output data as CSV directly from EUC Evolution copilot
  const handleDownloadOutputCsv = (msg: EvolutionMessage) => {
    if (!msg.sampleTable) return;

    const headers = msg.sampleTable.headers;
    const rows = msg.sampleTable.rows;

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EUC_Evolution_Output_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedCsvId(msg.id);
    setTimeout(() => setDownloadedCsvId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-indigo-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg text-white shadow-md shadow-indigo-600/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">EUC Evolution</h3>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-semibold">
                  Moving Beyond EUCs
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                  Autonomous Upstream Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct Front-Office &amp; Upstream Execution · Zero Spreadsheets · No Code Required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              title="Reset Conversation"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Task Chips Bar */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Tasks (Pull Live Upstream Data &amp; Calculate Directly):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INITIAL_MESSAGES[0].suggestedPrompts?.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleExecutePrompt(chip)}
                disabled={isProcessing}
                className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950/70 hover:text-indigo-200 border border-slate-700/80 hover:border-indigo-700 text-slate-300 transition-all cursor-pointer"
              >
                ⚡ {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Chat / Execution Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[94%] rounded-xl p-5 text-xs leading-relaxed space-y-3.5 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-4 text-[11px] opacity-75 pb-2 border-b border-white/10">
                    <span className="font-semibold flex items-center gap-1.5">
                      {isUser ? (
                        'Finance Operator Request'
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>EUC Evolution Autonomous Execution Agent</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Body Content with Clean Formatted Typography (No raw ** asterisks) */}
                  <div className="text-xs font-sans">
                    {renderFormattedMessage(msg.text)}
                  </div>

                  {/* Upstream Feeds & Bypassed EUC Badges */}
                  {!isUser && msg.bypassedEuc && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Legacy EUC Bypassed:</span>
                        <span className="font-mono text-rose-400 font-semibold line-through bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-900">
                          {msg.bypassedEuc}
                        </span>
                      </div>

                      {msg.upstreamFeeds && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold block">
                            Direct Upstream Golden Sources Connected:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.upstreamFeeds.map((feed, fIdx) => (
                              <span
                                key={fIdx}
                                className="text-[10px] font-mono text-sky-300 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded flex items-center gap-1"
                              >
                                <Database className="w-2.5 h-2.5 text-sky-400" />
                                {feed}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  {!isUser && msg.dataSummary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Facilities</span>
                        <span className="font-bold text-white font-mono">{msg.dataSummary.totalRecords}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Exposure Covered</span>
                        <span className="font-bold text-emerald-400 font-mono">{msg.dataSummary.totalExposure}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Provision</span>
                        <span className="font-bold text-indigo-300 font-mono">{msg.dataSummary.calculatedOutput}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">CFO Overrides</span>
                        <span className="font-bold text-amber-300 font-mono">{msg.dataSummary.overridesCount} Accounts</span>
                      </div>
                    </div>
                  )}

                  {/* Sample Table Preview with Download Output Data Button */}
                  {!isUser && msg.sampleTable && (
                    <div className="pt-2 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Direct Golden Source Live Extract (Top 5 Facilities)</span>
                        </span>

                        {/* Actions: Download CSV + Dispatch to SAP */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadOutputCsv(msg)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[11px] font-medium font-mono transition-colors cursor-pointer"
                            title="Download calculated output data as CSV"
                          >
                            {downloadedCsvId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Downloaded CSV</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 text-indigo-400" />
                                <span>Download Output Data (.CSV)</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleExportJournal(msg.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 rounded text-[11px] font-medium font-mono transition-colors cursor-pointer"
                          >
                            {exportedStatus === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Dispatched to SAP FI-CO</span>
                              </>
                            ) : (
                              <>
                                <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                                <span>Dispatch to SAP Ledger</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                            <tr>
                              {msg.sampleTable.headers.map((h, hIdx) => (
                                <th key={hIdx} className="py-2 px-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                            {msg.sampleTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/60">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-2 px-3 ${
                                      cIdx === 0
                                        ? 'text-indigo-400 font-semibold'
                                        : cIdx === 5
                                        ? 'text-emerald-400 font-semibold'
                                        : 'text-slate-300'
                                    }`}
                                  >
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] text-slate-500 font-mono uppercase">
                        Recommended Next Steps:
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleExecutePrompt(p)}
                            disabled={isProcessing}
                            className="text-left text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{p}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Processing State Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-700/60 text-xs text-indigo-300 flex items-center gap-3 w-fit shadow-lg">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <div className="font-semibold text-white">EUC Evolution Agent Active</div>
                <div className="text-[11px] text-indigo-300">{activeStep || 'Querying upstream data...'}</div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Form */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) handleExecutePrompt(inputText.trim());
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask EUC Evolution to pull upstream data, compute reserves, or run any finance workflow..."
              disabled={isProcessing}
              className="w-full pl-4 pr-24 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className={`absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                inputText.trim() && !isProcessing
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Execute</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Direct Upstream Ingestion · Governed In-Memory Transformation</span>
            <span>Bypasses intermediate EUC spreadsheets 100%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
