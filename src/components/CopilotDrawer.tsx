import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, CornerDownLeft, RotateCcw, Copy, Check } from 'lucide-react';
import { COPILOT_PRESET_ANSWERS } from '../data/mockData';
import { ProvenanceBadge } from './ProvenanceBadge';
import { CopilotMessage, ProvenanceType } from '../types';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string | null;
}

const DEFAULT_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-init',
    sender: 'assistant',
    timestamp: 'Just now',
    text: `Greetings. I am the **EUC Knowledge Copilot**, indexed against the recovered AST, decompiled VBA formulas, and regulatory dependencies of **Customer Provision Macro (v4.2)**.

Marcus Vance departs in less than 18 hours. Ask me anything about how this macro functions, how to troubleshoot month-end failures, or select one of the critical handover prompts below.`,
    provenanceTags: [
      { label: 'EUC-001 Indexed Knowledge Base', type: 'code' },
      { label: 'BCBS 239 Model Governance', type: 'inventory' },
    ],
    suggestedFollowUps: [
      'What does this EUC do in simple terms?',
      'What should I check if today\'s provision calculation looks wrong?',
      'What are the undocumented business rules found in the code?',
      'What critical questions must I ask Marcus before he leaves tomorrow?',
    ],
  },
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle external initial prompt if triggered
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Realistic simulated latency with high-precision banking domain knowledge response
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
        // Fallback intelligent domain answering based on query keywords
        const lower = query.toLowerCase();
        if (lower.includes('error') || lower.includes('fail') || lower.includes('type mismatch')) {
          responseText = `**Troubleshooting Guidance for Run-time Error:**\n\n1. **Error 13 (Type Mismatch):** Occurs because SAP exported German decimal notation (\`,\` instead of \`.\`) in Column D (Balance) or dates in text format.\n2. **Error 9 (Subscript Out of Range):** The raw extract tab was renamed. Rename it to exactly \`Raw_Extract\`.\n3. **Resolution:** Inspect column D row 2 for non-numeric values; verify that cell M14 still contains \`0.025\`.\n\n*Reference: Runbook items RUN-01 and RUN-02.*`;
          tags = [{ label: 'VBA Error Handler Analysis', type: 'code' }];
        } else if (lower.includes('marcus') || lower.includes('exit') || lower.includes('question') || lower.includes('leave')) {
          responseText = `**Departure Contingency Priority:**\n\nMarcus's top 2 unconfirmed areas:\n1. **Line 66:** The undocumented 2.5% surcharge for region EU-4 (cell M14).\n2. **Archive Password:** The unprotect key for \`Historical_Provisions_2022\`.\n\nSchedule a 20-minute sign-off meeting prior to 16:00 today.`;
          tags = [{ label: 'Departure Risk Matrix', type: 'sme' }];
        } else if (lower.includes('formula') || lower.includes('rule') || lower.includes('logic')) {
          responseText = `**EUC-001 Provisioning Logic:**\n- **Stage 1 (<30 DPD):** 0.85% * inflationAdjustment\n- **Stage 2 (30-89 DPD):** 6.20% * inflationAdjustment\n- **Stage 3 (>=90 DPD):** 100% if unsecured, 45% if collateral exists\n- **Haircut:** Exposure is reduced by 70% of pledged collateral value\n- **Region EU-4:** +2.5% penalty (cell M14).`;
          tags = [{ label: 'Decompiled AST Rules', type: 'code' }, { label: 'Accounting Synthesis', type: 'ai' }];
        } else {
          responseText = `**Recovered Assessment for "${query}":**\n\nBased on the decompiled AST of \`Customer_Provision_v4_2.bas\`, this computation is triggered at Month-End close by the Credit Risk desk. All calculations debit account 641000 (Impairment Expense) and credit 149000 (Allowance for Loan Losses).\n\nIf you need specific details, check the **Business Rules Engine** tab or ask about **emergency troubleshooting** or **undocumented rules**.`;
          tags = [{ label: 'General Knowledge Graph', type: 'ai' }, { label: 'Inventory Register', type: 'inventory' }];
        }
        followUps = [
          'What should I check if today\'s provision calculation looks wrong?',
          'What are the undocumented business rules found in the code?',
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

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Ask This EUC · Copilot</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded">
                Active Context: EUC-001
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Recovered Knowledge Graph &amp; Decompiled AST Grounded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages(DEFAULT_MESSAGES)}
            title="Reset Conversation"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Handover &amp; Emergency Presets (Click to Execute):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(COPILOT_PRESET_ANSWERS).map((presetKey) => (
            <button
              key={presetKey}
              onClick={() => handleSend(presetKey)}
              disabled={isTyping}
              className="text-left text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-200 border border-slate-700/70 hover:border-indigo-700/80 text-slate-300 transition-all cursor-pointer"
            >
              💡 {presetKey}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 text-[11px] opacity-75 mb-1 pb-1 border-b border-white/10">
                  <span className="font-semibold">{isUser ? 'Operator Query' : 'Guardian Intelligence'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Content */}
                <div className="whitespace-pre-line text-xs font-sans">
                  {msg.text}
                </div>

                {/* Provenance Tags */}
                {msg.provenanceTags && msg.provenanceTags.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">Attribution:</span>
                    {msg.provenanceTags.map((tag, i) => (
                      <ProvenanceBadge key={i} type={tag.type} customLabel={tag.label} size="sm" />
                    ))}
                  </div>
                )}

                {/* Copy Button for Assistant */}
                {!isUser && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
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

              {/* Follow-up suggestions if assistant */}
              {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-2 pl-2 space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">Suggested follow-ups:</div>
                  <div className="flex flex-col gap-1">
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(fu)}
                        disabled={isTyping}
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

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-950/80 border border-slate-800 p-3 rounded-lg w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Consulting recovered AST and regulatory logic...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about formulas, SAP columns, error 13, Marcus handover..."
            disabled={isTyping}
            className="w-full pl-4 pr-24 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              inputText.trim() && !isTyping
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Ask</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Enterprise Guardrails Active · No External LLM Data Leakage</span>
          <span>Target-1 Banking Knowledge Core</span>
        </div>
      </div>

    </div>
  );
};
