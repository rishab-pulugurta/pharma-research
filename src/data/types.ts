export type EntityKind = 'company' | 'drug' | 'disease' | 'target' | 'trial' | 'pathway'

/** What kind of document backs a claim. Drives the evidence label next to every citation. */
export type EvidenceType =
  | 'regulatory'
  | 'registry'
  | 'peer-reviewed'
  | 'company'
  | 'guideline'
  | 'preclinical'
  | 'news'

export interface Source {
  id: string
  title: string
  publisher: string
  type: EvidenceType
  url: string
  date: string // ISO date or year
}

/** How well a mechanistic relationship is supported. */
export type Confidence = 'established' | 'clinical' | 'inferred' | 'hypothetical'

export type Phase = 'Preclinical' | 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Filed' | 'Approved'

export type ProgramStatus = 'active' | 'approved' | 'discontinued' | 'suspended' | 'partnered'

export type Modality =
  | 'Peptide'
  | 'Peptide combination'
  | 'Small molecule'
  | 'Monoclonal antibody'
  | 'Antibody–peptide conjugate'
  | 'siRNA'
  | 'Gene editing'

export interface Company {
  id: string
  name: string
  hq: string
  type: string
  focus: string[]
  summary: string
  marketed: string[] // free text product names; linked when they match a drug brand
  partnerships: { partner: string; detail: string; sourceIds?: string[] }[]
  verified: string
  sourceIds: string[]
  ownership?: 'Public' | 'Private' | 'Subsidiary'
  ticker?: string
  founded?: string
  platform?: string
  funding?: string // only figures backed by a cited source
  leadPrograms?: { name: string; what: string; stage: string }[]
  /** Sponsor names to query on ClinicalTrials.gov (query.spons). */
  registry?: string[]
  /** openFDA sponsor_name patterns, e.g. SANOFI* or "ELI LILLY AND CO". */
  fda?: string[]
  website?: string
  note?: string
}

export interface TargetLink {
  targetId: string
  action: string // agonist, antagonist, inhibitor, silencer, editor
  confidence: Confidence
}

export interface Program {
  diseaseId: string
  indication: string
  phase: Phase
  status: ProgramStatus
  company: string // company id running the program
  trialIds: string[]
  latest: { date: string; text: string; sourceIds: string[] }
}

export type RegStatus =
  | 'Approved'
  | 'Accelerated approval'
  | 'Conditional approval'
  | 'Under review'
  | 'Not submitted'
  | 'Withdrawn'
  | 'Refused'

export interface RegEvent {
  date: string
  kind: 'ind' | 'designation' | 'submission' | 'decision' | 'label' | 'safety' | 'hold'
  text: string
  sourceIds: string[]
}

export interface RegRecord {
  jurisdiction: 'FDA' | 'EMA' | 'NMPA'
  indication: string
  diseaseId: string
  status: RegStatus
  brand?: string
  population: string
  pathway?: string
  date?: string
  warnings: string[]
  timeline: RegEvent[]
  sourceIds: string[]
}

export interface MechEdge {
  from: string
  to: string
  confidence: Confidence
  label?: string
}

export interface Drug {
  id: string
  name: string
  aliases: string[] // codes, brands, alternate names
  brands: string[]
  originator: string // company id
  owner: string // company id currently developing/marketing
  partners?: string[]
  modality: Modality
  route: string
  dosing: string
  status: 'approved' | 'investigational' | 'discontinued'
  /** Set when approval is limited to specific jurisdictions, e.g. "China only". */
  approvalScope?: string
  oneLiner: string
  targets: TargetLink[]
  levels: { molecular: string; cellular: string; physiological: string }
  mechanism: MechEdge[]
  tradeoffs: string[]
  structure: {
    note: string
    pubchemName?: string // small molecules: 2D image + 3D conformer link from PubChem
    sequenceNote?: string
  }
  programs: Program[]
  regulatory: RegRecord[]
  verified: string
  sourceIds: string[]
}

export interface StandardOfCare {
  drugClass: string
  examples: string[]
  drugIds: string[]
  role: string
}

export interface Guideline {
  org: string
  region: string
  year: string
  title: string
  url: string
}

export interface Disease {
  id: string
  name: string
  aliases: string[]
  summary: string
  organs: string[]
  pathophysiology: string
  symptoms: string[]
  progression: string
  mechanisms: string[]
  epidemiology: {
    prevalence: string
    burden: string
    risks: string[]
    subpopulations: string[]
    sourceIds: string[]
  }
  standardOfCare: StandardOfCare[]
  guidelines: Guideline[]
  unmetNeeds: string[]
  biomarkers: { name: string; role: string; implication: string }[]
  failures: { name: string; what: string; drugId?: string }[]
  targetIds: string[]
  verified: string
  sourceIds: string[]
}

export interface Target {
  id: string
  symbol: string
  name: string
  gene: string
  family: string
  summary: string
  biology: string
  tissues: string[]
  whyTarget: string
  tradeoffs: string[]
  pathwayIds: string[]
  geneticEvidence?: string
  sourceIds: string[]
}

export interface Pathway {
  id: string
  name: string
  summary: string
  steps: { label: string; detail: string; confidence: Confidence }[]
  targetIds: string[]
  caveat: string
  sourceIds: string[]
}

export interface ArmResult {
  arm: string
  value: number
  ci?: [number, number]
  n?: number
  isComparator?: boolean
}

export interface EndpointResult {
  endpoint: string
  kind: 'primary' | 'secondary' | 'exploratory' | 'subgroup'
  unit: string
  measure: string // e.g. "Mean % change from baseline"
  timepoint: string
  estimand?: string
  surrogate: boolean
  arms: ArmResult[]
  contrast?: string // e.g. "HR 0.80 (95% CI 0.72–0.90)"
  absolute?: string // absolute risk statement when relevant
  sourceIds: string[]
}

export type TrialEvidenceStatus =
  | 'recruiting'
  | 'ongoing'
  | 'completed — results not captured'
  | 'topline reported'
  | 'published'
  | 'terminated'

export interface Trial {
  nct: string
  name: string
  sponsor: string // company id
  drugIds: string[]
  diseaseId: string
  phase: string
  title: string
  design: {
    randomized: boolean
    blinding: string
    arms: string[]
    comparatorType: 'placebo' | 'active' | 'none'
    comparator: string
    headToHead?: string[] // drug ids compared directly
  }
  population: { enrollment: number; eligibility: string; baseline?: string }
  treatment: { route: string; regimen: string; duration: string }
  endpoints: { primary: string[]; secondary: string[] }
  evidenceStatus: TrialEvidenceStatus
  statusHistory: { date: string; status: string }[]
  terminationReason?: string
  summary?: { studied: string; happened: string; limitations: string[] }
  results: EndpointResult[]
  safety?: {
    discontinuationAE: { arm: string; value: string }[]
    common: string
    serious?: string
    sourceIds: string[]
  }
  sourceIds: string[]
  verified: string
}

export interface Update {
  id: string
  date: string
  kind: 'results' | 'regulatory' | 'discontinuation' | 'registration' | 'publication' | 'deal'
  title: string
  what: string
  why: string
  entities: { kind: EntityKind; id: string }[]
  sourceIds: string[]
}
