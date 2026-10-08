import {
  EUCInventoryRecord,
  BusinessRule,
  TestCase,
  FunctionalSpec,
  ControlNarrative,
  DataLineageNode,
  RunbookItem,
  SMEHandoverGap,
} from '../types';

export const HERO_VBA_CODE = `' ==============================================================================
' INSTITUTIONAL BANKING & RETAIL CREDIT RISK DIVISION
' EUC Identifier: EUC-DEMO-001 | Customer Provision Macro (IFRS 9 / CECL Stage 1-3)
' Primary Author: Marcus Vance (Finance Process Owner / Credit Analytics)
' Lifecycle: Released | Version: 4.2.14-PROD | Status: Handover Critical
' Target Runtime: Excel 365 32-bit (Requires Legacy OLE DB / Access Database Engine)
' Shared Network Path: \\\\fin-srv01\\shares\\credit_provisions\\legacy\\Customer_Provision_Macro.xlsm
' WARNING: DO NOT CHANGE COLUMN HEADERS IN SOURCE SAP DUMP WITHOUT UPDATING OFFSETS!
' ==============================================================================
Option Explicit

Public Sub ProcessMonthEndProvisions()
    On Error GoTo CriticalErrorHandler
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    Application.Calculation = xlCalculationManual

    Dim wsRaw As Worksheet, wsOutput As Worksheet, wsExceptions As Worksheet
    Dim lastRow As Long, i As Long
    Dim custId As String, balance As Double, daysPastDue As Long
    Dim collateralVal As Double, regionCode As String, stage As Integer
    Dim provisionRate As Double, provisionAmount As Double
    Dim regionalHaircut As Double, inflationAdjustment As Double

    Set wsRaw = ThisWorkbook.Sheets("Raw_Extract")
    Set wsOutput = ThisWorkbook.Sheets("GL_Journal_Output")
    Set wsExceptions = ThisWorkbook.Sheets("Exceptions_SignOff")

    ' [ALERT] Hardcoded parameter reference in hidden cell range
    ' Cell M14 was placed by Marcus in Oct 2023 for EU-4 local regulatory surcharge
    regionalHaircut = wsRaw.Range("M14").Value       ' Value: 0.025 (2.5% fixed penalty)
    inflationAdjustment = wsRaw.Range("M15").Value   ' Value: 1.018 (Unverified multiplier)

    lastRow = wsRaw.Cells(wsRaw.Rows.Count, "A").End(xlUp).Row
    If lastRow < 2 Then
        Err.Raise 1001, , "SAP GL Extract is empty or sheet header mismatch"
    End If

    ' Wipe previous run output lines preserving header formatting
    wsOutput.Range("A2:H" & (lastRow + 20)).ClearContents
    wsExceptions.Range("A2:F" & (lastRow + 20)).ClearContents

    For i = 2 To lastRow
        custId = Trim(CStr(wsRaw.Cells(i, 1).Value))
        balance = CDbl(wsRaw.Cells(i, 4).Value)        ' Column D: Net Outstanding Principal
        daysPastDue = CLng(wsRaw.Cells(i, 6).Value)    ' Column F: DPD (Days Past Due)
        collateralVal = CDbl(wsRaw.Cells(i, 8).Value)  ' Column H: Pledged Asset Haircut Valuation
        regionCode = Trim(CStr(wsRaw.Cells(i, 9).Value))' Column I: Geographic Risk Code

        ' ------------------------------------------------------------------
        ' IFRS 9 Three-Stage Deterioration Classification
        ' ------------------------------------------------------------------
        If daysPastDue < 30 Then
            stage = 1
            provisionRate = 0.0085 * inflationAdjustment ' 12-Month ECL: Base PD 0.85%
        ElseIf daysPastDue >= 30 And daysPastDue < 90 Then
            stage = 2
            provisionRate = 0.0620 * inflationAdjustment ' Lifetime ECL: Base PD 6.20%
        Else
            stage = 3
            ' Defaulted status: If unsecured, charge-off provision is 100%
            If collateralVal <= 0 Then
                provisionRate = 1.0000                   ' Full uncollateralized reserve
            Else
                provisionRate = 0.4500                   ' Assumed Loss Given Default (LGD)
            End If
        End If

        ' ------------------------------------------------------------------
        ' UNDOCUMENTED RULE: Jurisdiction EU-4 Manual Surcharge
        ' ------------------------------------------------------------------
        If regionCode = "EU-4" Then
            provisionRate = provisionRate + regionalHaircut
        End If

        ' Guarantee probability cap bound [0.0, 1.0]
        If provisionRate > 1# Then provisionRate = 1#

        ' Compute final monetary provision with 30% collateral liquidation buffer
        provisionAmount = (balance - (collateralVal * 0.70)) * provisionRate
        If provisionAmount < 0 Then provisionAmount = 0

        ' ------------------------------------------------------------------
        ' Management Override Governance Threshold (>$500k Balance)
        ' ------------------------------------------------------------------
        If balance > 500000# Then
            Dim excRow As Long
            excRow = wsExceptions.Cells(wsExceptions.Rows.Count, 1).End(xlUp).Row + 1
            wsExceptions.Cells(excRow, 1).Value = custId
            wsExceptions.Cells(excRow, 2).Value = balance
            wsExceptions.Cells(excRow, 3).Value = provisionAmount
            wsExceptions.Cells(excRow, 4).Value = "MGT OVERRIDE REQ: Balance exceeds $500k"
            wsExceptions.Cells(excRow, 5).Value = Now()
        End If

        ' Write to General Ledger Journal sheet
        wsOutput.Cells(i, 1).Value = custId
        wsOutput.Cells(i, 2).Value = stage
        wsOutput.Cells(i, 3).Value = balance
        wsOutput.Cells(i, 4).Value = collateralVal
        wsOutput.Cells(i, 5).Value = provisionRate
        wsOutput.Cells(i, 6).Value = provisionAmount
        wsOutput.Cells(i, 7).Value = "PROV-ECL-MTH-" & Format(Date, "yyyymm")
    Next i

    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    MsgBox "Month-End ECL Processing Completed: " & (lastRow - 1) & " Records committed.", vbInformation, "EUC-DEMO-001 Execution"
    Exit Sub

CriticalErrorHandler:
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    MsgBox "CRITICAL ABORT at Row " & i & ": " & Err.Description & " (Code " & Err.Number & ")", vbCritical, "EUC Failure"
End Sub`;

// Faithfully populated using the real enterprise sample format provided by the Finance team
export const EUC_CATALOGUE: EUCInventoryRecord[] = [
  {
    id: 'EUC-DEMO-001',
    name: 'Customer Provision Macro',
    technology: 'Excel VBA',
    lifecycle: 'Released',
    description: 'Processes customer exposure and rating data, calculates monthly credit loss provisions under IFRS 9 / CECL, applies risk haircuts, and generates general ledger journal postings.',
    owner: 'Finance Process Owner (Marcus Vance - Leaving Tomorrow)',
    frequency: 'Monthly',
    upstreamDependencies: [
      'Customer Risk Feed (CRM_EXP_01)',
      'General Ledger Feed (SAP FI-CO)',
      'Ratings Reference File (MOODYS_SNP_MAP)',
    ],
    downstreamDependencies: [
      'Accounting Posting System (SAP Ledger 01)',
      'Finance Reconciliation Report (Month-End Pack)',
    ],
    inputDataIntegrity: 'Golden Source',
    outputDataIntegrity: 'Golden Source',
    versionControl: 'Yes',
    repository: 'Available (\\\\fin-srv01\\shares\\credit_provisions\\legacy\\)',
    externalDocumentation: 'Partial (Confluence link restricted / no write permissions)',
    docLink: 'https://confluence.bank.internal/display/FIN/Customer+Provision+Macro+v4.2',
    accessRightReview: 'Yes',
    recoveryPersonnel: 'Yes',
    eucExecution: 'Manual',
    codeReview: 'No',
    dataQualityControls: 'Output reconciliation only',
    controlsDocumented: 'No',
    controlsEffectivelyPerformed: 'Yes',
    issuesTracked: 'Yes',
    criticality: 'Tier 1 (High)',
    rto: '4 Hours',
    portfolioExposure: '$1.84 Billion',
    healthScore: 34,
    lastRunDate: 'Yesterday 17:42',
    isHero: true,
  },
  {
    id: 'EUC-DEMO-002',
    name: 'FX Hedge Reconciler',
    technology: 'Python / Pandas',
    lifecycle: 'Released',
    description: 'Reconciles daily cross-currency swap hedges and collateral margin calls between Murex trading front-office and custodian collateral statements.',
    owner: 'Operations Desk Quant (Elena Rostova - Transferred)',
    frequency: 'Daily',
    upstreamDependencies: [
      'Murex Trade Extract (MT_CONFIRM_DAILY)',
      'Custodian Collateral Feed (EUROCLEAR_569)',
    ],
    downstreamDependencies: [
      'Collateral Management Ledger',
      'Daily Margin Call Dispatch',
    ],
    inputDataIntegrity: 'Golden Source',
    outputDataIntegrity: 'Reconciled',
    versionControl: 'Yes',
    repository: 'Available (Local Desktop WKS-812 C:\\Scripts\\)',
    externalDocumentation: 'Partial',
    docLink: 'https://confluence.bank.internal/display/OPS/FX+Hedge+Reconciliation',
    accessRightReview: 'Yes',
    recoveryPersonnel: 'No',
    eucExecution: 'Semi-Automated',
    codeReview: 'No',
    dataQualityControls: 'Validation rules & NaN checks',
    controlsDocumented: 'Yes',
    controlsEffectivelyPerformed: 'Yes',
    issuesTracked: 'Yes',
    criticality: 'Tier 2 (Medium)',
    rto: '8 Hours',
    portfolioExposure: '$620 Million',
    healthScore: 58,
    lastRunDate: 'Today 08:15',
  },
  {
    id: 'EUC-DEMO-003',
    name: 'Trade Sanctions Sifter',
    technology: 'Alteryx Workflow',
    lifecycle: 'Released',
    description: 'Pre-screens outbound SWIFT payment batches against OFAC, UK HMT, and EU consolidated sanctions lists prior to wire execution.',
    owner: 'Lead AML Investigator (Devon Reed - Departed 2 Weeks Ago)',
    frequency: 'Hourly',
    upstreamDependencies: [
      'SWIFT Wire Gateway (MT103_STREAM)',
      'OFAC Sanctions List Feed (TREASURY_OFAC_XML)',
    ],
    downstreamDependencies: [
      'AML Alert Case Management (Actimize)',
      'Sanctions Pre-Clearance Ledger',
    ],
    inputDataIntegrity: 'Golden Source',
    outputDataIntegrity: 'Golden Source',
    versionControl: 'No',
    repository: 'Available (\\\\corp-shares\\compliance\\devon_sandbox\\)',
    externalDocumentation: 'None',
    accessRightReview: 'No',
    recoveryPersonnel: 'No',
    eucExecution: 'Manual',
    codeReview: 'No',
    dataQualityControls: 'Output reconciliation only',
    controlsDocumented: 'No',
    controlsEffectivelyPerformed: 'Yes',
    issuesTracked: 'No',
    criticality: 'Tier 1 (High)',
    rto: '2 Hours',
    portfolioExposure: '$3.10 Billion / day',
    healthScore: 22,
    lastRunDate: 'Today 06:00',
  },
  {
    id: 'EUC-DEMO-004',
    name: 'Liquidity LCR Stress Aggregator',
    technology: 'Excel PowerQuery / SQL',
    lifecycle: 'Released',
    description: 'Aggregates multi-currency high-quality liquid assets and 30-day cash net outflows to compute daily Basel III Liquidity Coverage Ratios.',
    owner: 'Treasury Analyst (Siddharth Rao)',
    frequency: 'Daily',
    upstreamDependencies: [
      'Treasury Ledger Balance Extract',
      'Bloomberg Market Index Feed',
    ],
    downstreamDependencies: [
      'ALCO Liquidity Dashboard',
      'PRA Daily Regulatory Reporting',
    ],
    inputDataIntegrity: 'Golden Source',
    outputDataIntegrity: 'Golden Source',
    versionControl: 'Yes',
    repository: 'Available (SharePoint Treasury Team Site)',
    externalDocumentation: 'Full',
    accessRightReview: 'Yes',
    recoveryPersonnel: 'Yes',
    eucExecution: 'Manual',
    codeReview: 'Yes',
    dataQualityControls: 'Validation rules & cross-footing',
    controlsDocumented: 'Yes',
    controlsEffectivelyPerformed: 'Yes',
    issuesTracked: 'Yes',
    criticality: 'Tier 1 (High)',
    rto: '4 Hours',
    portfolioExposure: '$8.45 Billion',
    healthScore: 74,
    lastRunDate: 'Today 09:30',
  },
];

// Data Lineage: Synthesized by AI combining the Inventory Feeds + VBA Extraction
export const SYNTHESIZED_DATA_LINEAGE: DataLineageNode[] = [
  {
    id: 'up-1',
    name: 'Customer Risk Feed (CRM_EXP_01)',
    category: 'upstream',
    format: 'CSV batch export (Daily 05:00 UTC)',
    integrity: 'Golden Source (Core Data Warehouse)',
    cadence: 'Daily / Month-End',
    notes: 'Provides Customer ID, Outstanding Principal, Days Past Due (DPD), and Geographic Region.',
  },
  {
    id: 'up-2',
    name: 'General Ledger Feed (SAP FI-CO)',
    category: 'upstream',
    format: 'Fixed-width extract (Job DW_EXTRACT_0400)',
    integrity: 'Golden Source (SAP S/4HANA)',
    cadence: 'Month-End Close',
    notes: 'Provides trial balance reference numbers and legal entity allocation codes.',
  },
  {
    id: 'up-3',
    name: 'Ratings Reference File (MOODYS_SNP_MAP)',
    category: 'upstream',
    format: 'Excel reference table (.xlsx)',
    integrity: 'Static Reference File',
    cadence: 'Quarterly',
    notes: 'Maps internal credit scores to external benchmark rating curves.',
  },
  {
    id: 'core-1',
    name: 'EUC-DEMO-001: Customer Provision Macro',
    category: 'core_euc',
    format: 'Excel 365 32-bit (.xlsm VBA)',
    integrity: 'Transformation Engine (In-Memory Processing)',
    cadence: 'Monthly Manual Trigger',
    notes: 'Performs IFRS 9 staging, collateral 30% haircut, EU-4 regional surcharge (+2.5%), and $500k override isolation.',
  },
  {
    id: 'down-1',
    name: 'Accounting Posting System (SAP Ledger 01)',
    category: 'downstream',
    format: 'Batch Journal CSV (Range GL_Journal_Output)',
    integrity: 'Golden Source Target',
    cadence: 'Closing Day 19:00',
    notes: 'Directly debits P&L Credit Loss Expense (641000) and credits Allowance for Loan Losses (149000).',
  },
  {
    id: 'down-2',
    name: 'Finance Reconciliation Report (Month-End Pack)',
    category: 'downstream',
    format: 'Worksheet Exceptions_SignOff (.xlsx)',
    integrity: 'Reconciled Audit Output',
    cadence: 'CFO Review Deck',
    notes: 'Isolates accounts >$500k requiring senior management manual approval before ledger sign-off.',
  },
];

// Control Narratives: AI Triangulation comparing Inventory claim vs Code Reality
export const CONTROL_NARRATIVES: ControlNarrative[] = [
  {
    id: 'CTL-01',
    controlTitle: 'Data Quality & Schema Lock Control',
    financialRisk: 'High ($1.84B Miscalculation Risk)',
    inventoryClaim: 'Inventory marks: "Input Data Integrity: Golden Source"',
    codeReality: 'VBA code reads columns by hardcoded positional offsets (Col D: Balance, Col F: DPD, Col H: Collateral). If SAP IT inserts a column, calculations execute silently against the wrong data.',
    auditFinding: 'Audit Discrepancy: Golden Source ingestion is negated by lack of runtime schema validation.',
    remediationStep: 'Implement dynamic column name lookup via header matching (Application.Match) or dbt schema contracts.',
  },
  {
    id: 'CTL-02',
    controlTitle: 'Code Review & Segregation of Duties',
    financialRisk: 'Critical (Key-Person Dependency)',
    inventoryClaim: 'Inventory marks: "Code Review: No" and "Controls Documented: No"',
    codeReality: 'Entire macro is authored and maintained by Marcus Vance on an unversioned shared drive. Marcus departs in <18 hours with no secondary reviewer on record.',
    auditFinding: 'Severe Governance Defect: BCBS 239 Level 1 Key-Person Risk violation.',
    remediationStep: 'Complete AI-guided handover interview with Marcus today and transfer code ownership to Risk Engineering.',
  },
  {
    id: 'CTL-03',
    controlTitle: 'Reconciliation & Management Override Control',
    financialRisk: 'Medium ($500k+ Single Exposure Leakage)',
    inventoryClaim: 'Inventory marks: "Data Quality Controls: Output reconciliation only"',
    codeReality: 'Lines 77-84 automatically isolate accounts >$500k to sheet Exceptions_SignOff, but there is no automated dispatch, notification, or audit trail confirming who reviews them.',
    auditFinding: 'Control Narrative: Manual controls are performed but lack an immutable electronic signature log.',
    remediationStep: 'Introduce digital approval sign-off gate before journal CSV export is ingested into SAP.',
  },
  {
    id: 'CTL-04',
    controlTitle: 'Undocumented Policy Overlay (Hidden Cell Parameter)',
    financialRisk: 'High (Silent Regulatory Inconsistency)',
    inventoryClaim: 'Inventory marks: "Controls Effectively Performed: Yes"',
    codeReality: 'Macro reads a 2.5% surcharge from hidden cell M14 (`regionalHaircut = wsRaw.Range("M14").Value`). This policy rule is undocumented in external documentation.',
    auditFinding: 'Model Risk Finding: Magic numbers stored in volatile spreadsheet cells without change-control tracking.',
    remediationStep: 'Promote Cell M14 into a formally validated configuration database table with version history.',
  },
];

export const OPERATIONAL_RISKS = CONTROL_NARRATIVES.map((ctl) => ({
  id: ctl.id,
  title: ctl.controlTitle,
  severity: ctl.financialRisk.includes('Critical') ? ('Critical' as const) : ctl.financialRisk.includes('High') ? ('High' as const) : ('Medium' as const),
  location: ctl.inventoryClaim,
  impact: ctl.codeReality,
  mitigation: ctl.remediationStep,
  provenance: 'ai' as const,
}));


// Synthesized Test Cases: Automatically generated test harness for non-technical validation
export const SYNTHESIZED_TEST_CASES: TestCase[] = [
  {
    id: 'TC-001',
    title: 'Standard Stage 1 Healthy Facility Baseline',
    type: 'Boundary',
    scenario: 'Customer with 0 DPD and standard inflation multiplier',
    inputs: {
      custId: 'CUST-88102',
      balance: '$100,000.00',
      daysPastDue: 14,
      collateral: '$20,000.00',
      regionCode: 'US-1',
      cellM14: 0.025,
      cellM15: 1.018,
    },
    expectedOutput: 'Stage: 1 | Net Exposure: $86,000.00 | Rate: 0.8653% | Final Provision: $744.16',
    businessRationale: 'Verifies 12-Month ECL rate (0.85% * 1.018) applied to net exposure post-30% collateral haircut ($100k - $14k = $86k).',
    codeReference: 'Lines 48-50',
  },
  {
    id: 'TC-002',
    title: 'Stage 2 Significant Credit Deterioration (SICR Boundary)',
    type: 'Boundary',
    scenario: 'Customer reaches exactly 30 DPD trigger threshold',
    inputs: {
      custId: 'CUST-41908',
      balance: '$250,000.00',
      daysPastDue: 30,
      collateral: '$50,000.00',
      regionCode: 'UK-2',
      cellM14: 0.025,
      cellM15: 1.018,
    },
    expectedOutput: 'Stage: 2 | Net Exposure: $215,000.00 | Rate: 6.3116% | Final Provision: $13,569.94',
    businessRationale: 'Validates cliff-edge jump to Lifetime ECL (6.20% * 1.018) on day 30 past due.',
    codeReference: 'Lines 51-53',
  },
  {
    id: 'TC-003',
    title: 'Stage 3 Default with Zero Eligible Collateral',
    type: 'Edge Case',
    scenario: 'Customer at 95 DPD with no pledged collateral assets',
    inputs: {
      custId: 'CUST-99014',
      balance: '$80,000.00',
      daysPastDue: 95,
      collateral: '$0.00',
      regionCode: 'FR-1',
      cellM14: 0.025,
      cellM15: 1.018,
    },
    expectedOutput: 'Stage: 3 | Net Exposure: $80,000.00 | Rate: 100.0% | Final Provision: $80,000.00',
    businessRationale: 'Ensures 100% full impairment is reserved when defaulted facility is entirely unsecured.',
    codeReference: 'Lines 55-58',
  },
  {
    id: 'TC-004',
    title: 'Undocumented Jurisdiction EU-4 Surcharge Overlay',
    type: 'Regression',
    scenario: 'Customer located in Region EU-4 with Cell M14 parameter active',
    inputs: {
      custId: 'CUST-55120',
      balance: '$120,000.00',
      daysPastDue: 45,
      collateral: '$0.00',
      regionCode: 'EU-4',
      cellM14: 0.025,
      cellM15: 1.018,
    },
    expectedOutput: 'Stage: 2 | Net Exposure: $120,000.00 | Rate: 8.8116% (6.3116% + 2.50%) | Final Provision: $10,573.92',
    businessRationale: 'Validates that hidden 2.5% surcharge is added accurately for EU-4 borrowers.',
    codeReference: 'Lines 66-68',
  },
];

// Functional Specifications: Complete requirement spec reverse engineered from code
export const FUNCTIONAL_SPECS: FunctionalSpec[] = [
  {
    module: 'FS-01: Ingestion & Record Parsing',
    objective: 'Ingest monthly SAP general ledger customer extract and establish memory working arrays.',
    inputsRequired: [
      'Raw_Extract sheet active in host workbook',
      'Row 1 column headers: Cust_ID, Entity, Product, Balance, CCY, DPD, Rating, Collateral, Region',
    ],
    transformationLogic: 'Validates row count >= 2. Casts Column D to Double (Balance), Column F to Long (DPD), Column H to Double (Collateral), and trims string identifiers.',
    dataQualityChecks: [
      'Ensure Balance >= 0',
      'Check that DPD is non-negative integer',
      'Ensure worksheet names match Raw_Extract, GL_Journal_Output, Exceptions_SignOff',
    ],
    outputDestination: 'Internal memory variables within loop execution.',
    edgeHandling: 'If row count < 2, raises error 1001 and aborts execution to protect target ledger.',
  },
  {
    module: 'FS-02: IFRS 9 Staging & ECL Calculation',
    objective: 'Apply regulatory 3-stage degradation matrix to compute monetary loan loss provision.',
    inputsRequired: ['Days Past Due (Col F)', 'Collateral Valuation (Col H)', 'Inflation Parameter (M15)'],
    transformationLogic: 'Stage 1 if DPD < 30 (Rate = 0.85% * M15). Stage 2 if 30 <= DPD < 90 (Rate = 6.20% * M15). Stage 3 if DPD >= 90 (Rate = 100% if collateral = 0, else 45%). Applies 30% collateral haircut (0.70x).',
    dataQualityChecks: ['Cap provision rate at 1.0000', 'Ensure net provision amount is never negative (bounded at 0)'],
    outputDestination: 'Worksheet GL_Journal_Output Columns A through G.',
    edgeHandling: 'If collateral exceeds 142% of balance, provision amount resolves safely to $0.00.',
  },
  {
    module: 'FS-03: Regional Policy Overlay & Exception Isolation',
    objective: 'Execute local credit policy add-ons and route high-balance facilities for CFO sign-off.',
    inputsRequired: ['Region Code (Col I)', 'Regional Haircut Parameter (M14)', 'Threshold limit $500,000.00'],
    transformationLogic: 'If Region == "EU-4", adds cell M14 (+2.5%) to calculated rate. If Balance > $500,000, appends record with timestamp to Exceptions_SignOff sheet.',
    dataQualityChecks: ['Confirm Cell M14 holds numeric value', 'Verify exception log appends without overwriting'],
    outputDestination: 'Worksheet Exceptions_SignOff with timestamp.',
    edgeHandling: 'Does not halt execution on exceptions; logs and proceeds with journal compilation.',
  },
];

export const BUSINESS_RULES: BusinessRule[] = [
  {
    id: 'BR-001',
    name: 'Stage 1 Healthy Exposure Baseline (12-Month ECL)',
    category: 'IFRS 9 Standard',
    plainSummary: 'Loans with less than 30 Days Past Due are assigned Stage 1 status with a 0.85% baseline reserve multiplied by inflation parameter.',
    extractedFormula: 'If DPD < 30 Then Rate = 0.0085 * Range("M15").Value',
    codeAnchor: 'Customer_Provision_Macro.bas : Lines 48-50',
    riskRating: 'Low',
    provenance: 'code',
    notes: 'Standard Tier-1 retail credit policy aligns with regulatory floor.',
  },
  {
    id: 'BR-002',
    name: 'Stage 2 Significant Credit Deterioration (SICR)',
    category: 'IFRS 9 Standard',
    plainSummary: 'Loans between 30 and 89 Days Past Due jump immediately to Stage 2 with a lifetime ECL baseline reserve of 6.20%.',
    extractedFormula: 'ElseIf DPD >= 30 And DPD < 90 Then Rate = 0.0620 * Range("M15").Value',
    codeAnchor: 'Customer_Provision_Macro.bas : Lines 51-53',
    riskRating: 'Medium',
    provenance: 'code',
    notes: 'Sudden cliff-edge jump from 0.85% to 6.20% on day 30 past due.',
  },
  {
    id: 'BR-003',
    name: 'Stage 3 Default & Collateral Liquidation Haircut',
    category: 'Credit Default Policy',
    plainSummary: 'Loans past 90 days are considered defaulted. If unsecured, provision is 100%. If collateralized, 45% LGD is assessed against exposure post-30% collateral haircut.',
    extractedFormula: 'If Collateral <= 0 Then Rate = 1.0 Else Rate = 0.45; NetProvision = (Balance - (Collateral * 0.70)) * Rate',
    codeAnchor: 'Customer_Provision_Macro.bas : Lines 55-61 & 74',
    riskRating: 'High',
    provenance: 'code',
    notes: 'The 30% collateral haircut (0.70 multiplier) is embedded as a magic number without documented regulatory sign-off.',
  },
  {
    id: 'BR-004',
    name: 'Undocumented Jurisdiction EU-4 Surcharge (+2.5%)',
    category: 'Ad-hoc Business Overlay',
    plainSummary: 'Any loan originated in region "EU-4" receives an extra 2.50% added to its provision rate, read directly from hidden cell M14.',
    extractedFormula: 'If RegionCode == "EU-4" Then Rate = Rate + Range("M14").Value [0.025]',
    codeAnchor: 'Customer_Provision_Macro.bas : Lines 66-68',
    riskRating: 'High',
    provenance: 'sme',
    notes: 'FLAGGED GAP: Marcus verbally stated this was for an Eastern Europe portfolio embargo, but no formal audit document exists.',
  },
  {
    id: 'BR-005',
    name: 'Executive Override Protocol Threshold (>$500,000)',
    category: 'Governance & Escalation',
    plainSummary: 'Any single facility exceeding $500,000 is automatically appended to an Exceptions tab requiring manual CFO initial before journal posting.',
    extractedFormula: 'If Balance > 500000 Then AppendTo(wsExceptions, CustID, Balance, "MGT OVERRIDE REQ")',
    codeAnchor: 'Customer_Provision_Macro.bas : Lines 77-84',
    riskRating: 'Medium',
    provenance: 'ai',
    notes: 'Prevents rogue macro writes from silently committing massive corporate defaults into ledger without senior visibility.',
  },
  {
    id: 'BR-006',
    name: 'Implicit Macroeconomic Inflation Factor (1.018x)',
    category: 'Forward-Looking Overlay',
    plainSummary: 'All stage 1 & 2 rates are inflated by 1.8% via cell M15. Marcus added this in response to Central Bank forward guidance in 2024.',
    extractedFormula: 'inflationAdjustment = wsRaw.Range("M15").Value (Hardcoded 1.018)',
    codeAnchor: 'Customer_Provision_Macro.bas : Line 31',
    riskRating: 'High',
    provenance: 'ai',
    notes: 'No automated mechanism exists to update or recalibrate this factor when macroeconomic scenarios shift.',
  },
];

export const RUNBOOK_ITEMS: RunbookItem[] = [
  {
    id: 'RUN-01',
    errorSignature: 'Run-time error 13: Type mismatch',
    frequency: 'Common (Happens every ~3 months)',
    rootCause: 'SAP export contains German/European formatting (commas instead of periods: "1250,50") or date text in Column D (Balance).',
    resolutionSteps: [
      'Open the source CSV file in Notepad++ or Excel.',
      'Check Column D: ensure there are no textual headers, blank strings ("--"), or currency symbols ("$").',
      'Select Column D, run Find & Replace: Replace `,` with `.` if exported from European SAP server.',
      'Verify that Cell M14 contains numeric `0.025` and has not been cleared during data copy-paste.',
      'Restart the macro by pressing ALT + F8 -> Select `ProcessMonthEndProvisions` -> Run.',
    ],
    preventativeTip: 'Always verify SAP export regional language profile is set to EN-US before running the extraction batch.',
    provenance: 'code',
  },
  {
    id: 'RUN-02',
    errorSignature: 'Run-time error 9: Subscript out of range',
    frequency: 'Occasional (After month-end template refresh)',
    rootCause: 'A worksheet tab was renamed or deleted. The macro strictly expects exact sheet names: `Raw_Extract`, `GL_Journal_Output`, and `Exceptions_SignOff`.',
    resolutionSteps: [
      'Check the sheet tabs at the bottom of the Excel workbook.',
      'Ensure the raw data sheet is named exactly `Raw_Extract` with an underscore, NO trailing spaces.',
      'Ensure `GL_Journal_Output` and `Exceptions_SignOff` exist.',
      'If missing, right-click any tab -> Insert Sheet -> rename to the exact string.',
    ],
    preventativeTip: 'Protect the workbook structure using password `CreditOps2024!` so users cannot accidentally rename tabs.',
    provenance: 'code',
  },
];

export const SME_HANDOVER_GAPS: SMEHandoverGap[] = [
  {
    id: 'GAP-01',
    question: 'Why is there an undocumented 2.5% manual haircut applied specifically to Region Code "EU-4"?',
    context: 'Found in Customer_Provision_Macro.bas Line 66: `If regionCode = "EU-4" Then provisionRate = provisionRate + regionalHaircut`. Cell M14 holds 0.025. No regulatory justification attached.',
    urgency: 'Immediate (Before Exit)',
    codeLine: 'Line 66-68',
    status: 'Open',
    provenance: 'sme',
  },
  {
    id: 'GAP-02',
    question: 'Where is the master password stored for the locked archive sheet "Historical_Provisions_2022"?',
    context: 'Historical comparisons rely on this locked sheet, but Marcus is the only person who knows the unprotect key.',
    urgency: 'Immediate (Before Exit)',
    codeLine: 'Workbook Security Settings',
    status: 'Open',
    provenance: 'sme',
  },
  {
    id: 'GAP-03',
    question: 'Who formally signs off on accounts in "Exceptions_SignOff" when balance exceeds $500,000?',
    context: 'The macro flags accounts >$500k into an exceptions tab, but there is no audit log or email dispatch. Does Marcus email the CFO directly or is it reviewed in a meeting?',
    urgency: 'Immediate (Before Exit)',
    codeLine: 'Line 77-84',
    status: 'Open',
    provenance: 'sme',
  },
];

export const MODERNIZATION_PLAN = {
  title: 'Automated Migration: Excel VBA to Governed Python & SQL Pipeline',
  targetArchitecture: 'Snowflake + dbt (Data Build Tool) + Apache Airflow + Great Expectations',
  estimatedEffort: '3 Weeks (Sprint 12)',
  riskReductionScore: '92% Risk Elimination',
  generatedPythonSnippet: `# ==============================================================================
# AUTOMATICALLY REVERSE ENGINEERED PIPELINE: EUC-DEMO-001
# Replaces Customer_Provision_Macro.xlsm with Governed Python/Pandas
# ==============================================================================
import pandas as pd
import numpy as np

def calculate_ecl_provisions(df: pd.DataFrame, regional_haircut: float = 0.025, inflation_adj: float = 1.018) -> pd.DataFrame:
    """
    Computes IFRS 9 ECL Provisions replacing legacy Excel macro.
    Grounded in reverse-engineered rules BR-001 through BR-006.
    """
    # 1. Staging Logic
    conditions = [
        df['days_past_due'] < 30,
        (df['days_past_due'] >= 30) & (df['days_past_due'] < 90),
        df['days_past_due'] >= 90
    ]
    
    stages = [1, 2, 3]
    df['stage'] = np.select(conditions, stages, default=1)
    
    # 2. Baseline Provision Rates
    stage_rates = [
        0.0085 * inflation_adj,  # Stage 1: 12-Month ECL
        0.0620 * inflation_adj,  # Stage 2: Lifetime ECL
        np.where(df['collateral_value'] <= 0, 1.0, 0.45) # Stage 3
    ]
    df['provision_rate'] = np.select(conditions, stage_rates, default=0.0085)
    
    # 3. Regional Overlay (EU-4 Surcharge)
    df.loc[df['region_code'] == 'EU-4', 'provision_rate'] += regional_haircut
    df['provision_rate'] = df['provision_rate'].clip(upper=1.0)
    
    # 4. Monetary ECL Calculation with 30% Collateral Haircut
    net_exposure = df['principal_balance'] - (df['collateral_value'] * 0.70)
    df['provision_amount'] = (net_exposure.clip(lower=0) * df['provision_rate']).round(2)
    
    # 5. Management Override Flagging
    df['requires_cfo_signoff'] = df['principal_balance'] > 500000.0
    
    return df`,
  phases: [
    {
      phase: 'Phase 1: Ingestion & Schema Contracts',
      timeline: 'Days 1-5',
      action: 'Replace manual CSV drop with direct Snowflake connector to SAP HANA CDS Views; enforce Great Expectations schema tests.',
    },
    {
      phase: 'Phase 2: dbt Transformation Models',
      timeline: 'Days 6-11',
      action: 'Encode the 6 reverse-engineered rules into version-controlled SQL models in Git (`models/credit/ecl_staging.sql`). Remove cell M14 magic numbers.',
    },
    {
      phase: 'Phase 3: Automated Audit & Orchestration',
      timeline: 'Days 12-15',
      action: 'Airflow DAG schedule with PagerDuty alerts, Slack notifications, and automated electronic sign-off workflow for CFO.',
    },
  ],
  architecturalComparison: [
    { attribute: 'Version Control', current: 'Manual (Network share overwrite)', modern: 'Git (Pull requests, code review, git-blame)' },
    { attribute: 'Execution Environment', current: "Marcus's 32-bit physical PC", modern: 'Containerized Airflow workers in Kubernetes' },
    { attribute: 'Data Validation', current: 'Manual visual spot-check', modern: 'Automated Great Expectations unit & boundary tests' },
    { attribute: 'Audit Trail', current: 'None (Untracked cell overwrites)', modern: 'Immutable Snowflake time-travel & access logs' },
    { attribute: 'Key-Person Risk', current: 'Single employee (Marcus Vance)', modern: 'Shared Engineering & Risk Governance Team' },
  ],
};

export const COPILOT_PRESET_ANSWERS: Record<string, { answer: string; tags: { label: string; type: 'inventory' | 'code' | 'ai' | 'sme' }[]; followUps: string[] }> = {
  'What does this EUC do in simple terms?': {
    answer: `**Executive Process Summary:**
The **Customer Provision Macro (EUC-DEMO-001)** is a month-end accounting calculator. Every month, the bank must set aside money in reserve (called an Expected Credit Loss provision) to cover loans that customers might default on.

**How it works in 3 steps:**
1. It ingests the **Customer Risk Feed** and **General Ledger Feed** from SAP containing customer balances and overdue days.
2. It classifies each facility into one of 3 regulatory stages (Stage 1: healthy = 0.85% reserve; Stage 2: 30-89 days overdue = 6.20% reserve; Stage 3: 90+ days defaulted = up to 100% reserve).
3. It subtracts 70% of pledged collateral, applies an undocumented regional surcharge (+2.5%) for EU-4 borrowers, and generates the exact journal entries for the **Accounting Posting System**.`,
    tags: [
      { label: 'IFRS 9 Regulatory Standard', type: 'code' },
      { label: 'Triangulated Inventory Metadata', type: 'inventory' },
      { label: 'Synthesized Process Logic', type: 'ai' },
    ],
    followUps: [
      'What should I check if today\'s provision calculation looks wrong?',
      'What are the undocumented business rules found in the code?',
      'What critical questions must I ask Marcus before he leaves tomorrow?',
    ],
  },

  'What should I check if today\'s provision calculation looks wrong?': {
    answer: `**Emergency Diagnostic Checklist (First 15 Minutes):**

1. **Verify Cell M14 and M15 on \`Raw_Extract\`:**
   - Check if Cell **M14** still contains \`0.025\` (the regional haircut parameter). If someone pasted new SAP data over Column M, this cell was wiped, which causes EU-4 provisions to plummet by 2.5%.
   - Check if Cell **M15** contains \`1.018\` (the macroeconomic inflation multiplier).

2. **Check Column Alignments in \`Raw_Extract\`:**
   - Col D must be **Outstanding Balance** (numeric).
   - Col F must be **Days Past Due (DPD)** (integer).
   - Col H must be **Collateral Valuation** (numeric).
   - Col I must be **Geographic Region Code** (text like "EU-4", "US-1").
   *If SAP IT added a new column, the macro reads the wrong values without failing.*

3. **Check the \`Exceptions_SignOff\` sheet:**
   - Look for accounts over $500,000. If total provisions look lower than normal, a large corporate credit may have been pushed to exceptions rather than journal output.`,
    tags: [
      { label: 'Code Parameter M14', type: 'code' },
      { label: 'Emergency Runbook', type: 'code' },
      { label: 'Operational Risk Analysis', type: 'ai' },
    ],
    followUps: [
      'What are the undocumented business rules found in the code?',
      'What critical questions must I ask Marcus before he leaves tomorrow?',
      'How does the AI synthesize the data lineage from feeds to posting?',
    ],
  },

  'What are the undocumented business rules found in the code?': {
    answer: `**Reverse Engineered Undocumented Rules (Discovered via Code Decompiler):**

1. **The "EU-4" Regional Surcharge (+2.5% add-on):**
   - **Code:** \`If regionCode = "EU-4" Then provisionRate = provisionRate + regionalHaircut\` (Line 66).
   - **Finding:** Marcus coded a secret 250 bps penalty for borrowers in Region "EU-4", referencing cell M14. **There is no credit policy document or model validation sign-off in the external Confluence documentation.**

2. **The 30% Collateral Liquidation Haircut:**
   - **Code:** \`provisionAmount = (balance - (collateralVal * 0.70)) * provisionRate\` (Line 74).
   - **Finding:** Pledged collateral is automatically reduced by 30% (multiplied by 0.70). This is hardcoded directly into the formula without commentary.

3. **The Unverified Macro Inflation Multiplier (1.018x):**
   - **Code:** \`provisionRate = 0.0085 * inflationAdjustment\` (Line 49).
   - **Finding:** Reads cell M15 (\`1.018\`). All Stage 1 and Stage 2 provisions are artificially increased by 1.8% to simulate macroeconomic recession scenarios.`,
    tags: [
      { label: 'Undocumented EU-4 Logic', type: 'sme' },
      { label: 'VBA AST Analysis', type: 'code' },
      { label: 'Control Narrative Gap', type: 'ai' },
    ],
    followUps: [
      'What critical questions must I ask Marcus before he leaves tomorrow?',
      'Show me the auto-generated test cases for this macro',
      'What does this EUC do in simple terms?',
    ],
  },

  'What critical questions must I ask Marcus before he leaves tomorrow?': {
    answer: `**CRITICAL EXIT INTERVIEW HANDOVER PROTOCOL (MARCUS VANCE - EXIT T-18 HOURS):**

Ask Marcus these 3 exact questions before his badge is revoked at 17:00 tomorrow:

1. **Question 1 (Highest Urgency):**
   *"Marcus, line 66 adds a 2.5% haircut to Region 'EU-4' using cell M14. Who instructed this surcharge, is there a written credit committee memo, and what happens if cell M14 gets cleared?"*

2. **Question 2:**
   *"Where is the password for the locked sheet \`Historical_Provisions_2022\`? We cannot open prior year comparisons without it."*

3. **Question 3:**
   *"When facilities exceed $500k and are routed to the \`Exceptions_SignOff\` tab, who do you email for approval? Is there an email template or a formal sign-off folder?"*

*You can record his answers directly in the 'Emergency Runbook & Handover' tab of this dashboard to lock them into the institutional knowledge base forever.*`,
    tags: [
      { label: 'Urgent SME Action Items', type: 'sme' },
      { label: 'Key-Person Risk Defense', type: 'inventory' },
      { label: 'Governance Dossier', type: 'ai' },
    ],
    followUps: [
      'What does this EUC do in simple terms?',
      'What should I check if today\'s provision calculation looks wrong?',
      'Show me the auto-generated test cases for this macro',
    ],
  },

  'Show me the auto-generated test cases for this macro': {
    answer: `**Synthesized Test Cases (Auto-Generated by AI Reverse Engineering):**

The platform synthesized 4 executable test cases covering normal and edge conditions:

1. **TC-001 (Stage 1 Standard):** Balance $100k, 14 DPD, Collateral $20k -> Expected Provision: **$744.16** (Verifies 0.85% base PD * 1.018 on net exposure).
2. **TC-002 (Stage 2 SICR Cliff-Edge):** Balance $250k, 30 DPD, Collateral $50k -> Expected Provision: **$13,569.94** (Verifies 6.20% lifetime ECL jump).
3. **TC-003 (Stage 3 Default & Unsecured):** Balance $80k, 95 DPD, Collateral $0 -> Expected Provision: **$80,000.00** (Verifies 100% full charge-off).
4. **TC-004 (EU-4 Jurisdiction Surcharge):** Balance $120k, 45 DPD, Region EU-4 -> Expected Rate: **8.81%** (Validates +2.5% hidden surcharge).

*You can inspect and execute these test cases directly under the 'Test Cases & Validation' tab.*`,
    tags: [
      { label: 'Auto-Generated Test Suite', type: 'ai' },
      { label: 'Code Boundary Verification', type: 'code' },
    ],
    followUps: [
      'What does this EUC do in simple terms?',
      'What critical questions must I ask Marcus before he leaves tomorrow?',
      'What are the undocumented business rules found in the code?',
    ],
  },
};
