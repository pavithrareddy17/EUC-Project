export type ProvenanceType = 'inventory' | 'code' | 'ai' | 'sme';

// Faithful to the enterprise EUC inventory sample format provided by Finance
export interface EUCInventoryRecord {
  id: string; // e.g. EUC-DEMO-001
  name: string; // Customer Provision Macro
  technology: string; // Excel VBA, Alteryx, Python, SQL
  lifecycle: 'Released' | 'Under Development' | 'Under Review' | 'Deprecated';
  description: string;
  owner: string; // e.g. Finance Process Owner (Marcus Vance)
  frequency: string; // Monthly, Daily, Quarterly
  upstreamDependencies: string[]; // Customer Risk Feed, General Ledger Feed, Ratings Reference File
  downstreamDependencies: string[]; // Accounting Posting System, Finance Reconciliation Report
  inputDataIntegrity: string; // Golden Source, Unvalidated Feed
  outputDataIntegrity: string; // Golden Source, Reconciled
  versionControl: string; // Yes / No
  repository: string; // Available (Network share), Missing, Git
  externalDocumentation: string; // Partial (Link unavailable/restricted), Full, None
  docLink?: string; // Restricted link indicator
  accessRightReview: string; // Yes / No
  recoveryPersonnel: string; // Yes (Marcus Vance - Leaving Tomorrow)
  eucExecution: 'Manual' | 'Automated' | 'Semi-Automated';
  codeReview: 'No' | 'Yes';
  dataQualityControls: string; // Output reconciliation only, Validation rules
  controlsDocumented: 'No' | 'Yes';
  controlsEffectivelyPerformed: 'Yes' | 'No';
  issuesTracked: 'Yes' | 'No';

  // Operational context for the hackathon demo
  criticality: 'Tier 1 (High)' | 'Tier 2 (Medium)' | 'Tier 3 (Low)';
  rto: string;
  portfolioExposure: string;
  healthScore: number;
  lastRunDate: string;
  isHero?: boolean;
}

export interface TestCase {
  id: string;
  title: string;
  type: 'Boundary' | 'Edge Case' | 'Regression' | 'Stress';
  scenario: string;
  inputs: Record<string, any>;
  expectedOutput: string;
  businessRationale: string;
  codeReference: string;
}

export interface FunctionalSpec {
  module: string;
  objective: string;
  inputsRequired: string[];
  transformationLogic: string;
  dataQualityChecks: string[];
  outputDestination: string;
  edgeHandling: string;
}

export interface ControlNarrative {
  id: string;
  controlTitle: string;
  financialRisk: string;
  inventoryClaim: string; // What the inventory sheet says
  codeReality: string; // What the AI decompiler actually found
  auditFinding: string;
  remediationStep: string;
}

export interface DataLineageNode {
  id: string;
  name: string;
  category: 'upstream' | 'core_euc' | 'downstream';
  format: string;
  integrity: string;
  cadence: string;
  notes: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  category: string;
  plainSummary: string;
  extractedFormula: string;
  codeAnchor: string;
  riskRating: 'High' | 'Medium' | 'Low';
  provenance: ProvenanceType;
  notes: string;
}

export interface RunbookItem {
  id: string;
  errorSignature: string;
  frequency: string;
  rootCause: string;
  resolutionSteps: string[];
  preventativeTip: string;
  provenance: ProvenanceType;
}

export interface SMEHandoverGap {
  id: string;
  question: string;
  context: string;
  urgency: 'Immediate (Before Exit)' | 'High' | 'Routine';
  codeLine: string;
  status: 'Open' | 'Addressed' | 'Clarified';
  clarificationNote?: string;
  provenance: ProvenanceType;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  provenanceTags?: { label: string; type: ProvenanceType }[];
  suggestedFollowUps?: string[];
}
