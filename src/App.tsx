/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { CatalogueView } from './components/CatalogueView';
import { RecoveredKnowledgeView } from './components/RecoveredKnowledgeView';
import { VbaCodeModal } from './components/VbaCodeModal';
import { RecoverySimulationModal } from './components/RecoverySimulationModal';
import { ExportDossierModal } from './components/ExportDossierModal';
import { EucEvolutionModal } from './components/EucEvolutionModal';
import { EUC_CATALOGUE } from './data/mockData';
import { EUCInventoryRecord } from './types';
import { Shield, Sparkles, Building2 } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'inventory' | 'hero-euc'>('hero-euc');
  const [selectedEuc, setSelectedEuc] = useState<EUCInventoryRecord>(EUC_CATALOGUE[0]);

  // Modal states
  const [isVbaModalOpen, setIsVbaModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);

  const handleSelectEucFromCatalogue = (euc: EUCInventoryRecord) => {
    setSelectedEuc(euc);
    setActiveView('hero-euc');
  };

  const handleOpenScanner = () => {
    setIsScannerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Governance Bar */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenEvolution={() => setIsEvolutionModalOpen(true)}
        onOpenScanner={handleOpenScanner}
        onOpenDossier={() => setIsDossierModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'inventory' ? (
          <CatalogueView
            onSelectEuc={handleSelectEucFromCatalogue}
            onOpenScanner={(euc) => {
              setSelectedEuc(euc);
              setIsScannerModalOpen(true);
            }}
          />
        ) : (
          <RecoveredKnowledgeView
            euc={selectedEuc}
            onOpenVbaModal={() => setIsVbaModalOpen(true)}
            onOpenScanner={handleOpenScanner}
            onOpenDossier={() => setIsDossierModalOpen(true)}
          />
        )}
      </main>

      {/* Institutional Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-slate-400">AI-Powered EUC Reverse Engineering &amp; Modernization Platform</span>
            <span>· Moving Beyond EUCs</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Framework: BCBS 239 / SR 11-7</span>
            <span>·</span>
            <span>Upstream Direct Engine</span>
            <span>·</span>
            <span className="text-emerald-500">Autonomous Agent Active</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <VbaCodeModal
        isOpen={isVbaModalOpen}
        onClose={() => setIsVbaModalOpen(false)}
      />

      <RecoverySimulationModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onComplete={() => {
          setActiveView('hero-euc');
        }}
        eucName={selectedEuc.name}
      />

      <ExportDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        eucId={selectedEuc.id}
      />

      {/* EUC Evolution (Autonomous Upstream Execution Modal) */}
      <EucEvolutionModal
        isOpen={isEvolutionModalOpen}
        onClose={() => setIsEvolutionModalOpen(false)}
      />

    </div>
  );
}
