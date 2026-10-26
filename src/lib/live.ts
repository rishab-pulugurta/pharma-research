import { useEffect, useState } from 'react'

/**
 * Live company data from public registries:
 *  - ClinicalTrials.gov v2 (active trials where the company is lead sponsor or collaborator)
 *  - openFDA Drugs@FDA (CDER-approved products by sponsor name)
 * Both APIs allow cross-origin requests, so this runs in the browser.
 */

const ACTIVE = 'RECRUITING,ACTIVE_NOT_RECRUITING,NOT_YET_RECRUITING,ENROLLING_BY_INVITATION'
const FIELDS = [
  'NCTId', 'BriefTitle', 'Acronym', 'OverallStatus', 'Phase', 'LeadSponsorName', 'Condition', 'StartDate',
  'ArmGroupType', 'ArmGroupInterventionName', 'InterventionName', 'InterventionOtherName', 'InterventionType',
].join(',')

const DRUG_TYPES = new Set(['DRUG', 'BIOLOGICAL', 'GENETIC', 'COMBINATION_PRODUCT'])
const NOT_A_PROGRAM = /placebo|standard of care|best supportive|saline|vehicle|investigator'?s choice|physician'?s choice|usual care|sham/i

export interface LiveTrial {
  nct: string
  title: string
  status: string
  phase: string
  phaseRank: number
  lead: string
  isLead: boolean
  conditions: string[]
  start?: string
}

export interface LiveProgram {
  key: string
  name: string
  aliases: string[]
  phase: string
  phaseRank: number
  conditions: string[]
  trials: LiveTrial[]
  sponsoredTrials: number
}

export interface LivePipeline {
  programs: LiveProgram[]
  trials: LiveTrial[]
  totalTrials: number
  truncated: boolean
}

const phaseInfo = (phases: string[] | undefined): [string, number] => {
  const p = (phases ?? []).join('/')
  if (p.includes('PHASE3') && p.includes('PHASE2')) return ['Phase 2/3', 3]
  if (p.includes('PHASE3')) return ['Phase 3', 3]
  if (p.includes('PHASE4')) return ['Phase 4', 4]
  if (p.includes('PHASE2') && p.includes('PHASE1')) return ['Phase 1/2', 2]
  if (p.includes('PHASE2')) return ['Phase 2', 2]
  if (p.includes('PHASE1') || p.includes('EARLY_PHASE1')) return ['Phase 1', 1]
  return ['Not phased', 0]
}

/** Two different nonproprietary names (e.g. two "-mab" antibodies) are never the same molecule. */
const INN_STEM = /(mab|cept|tinib|ciclib|parib|rafenib|metinib|lisib|tide|glutide|glipron|siran|rsen|vir|stat|pril|sartan|gliflozin|gliptin|azole|tidine|dronate|lukast|degib|toclax|zomib|lidomide|platin|taxel|rubicin|cabtagene|leucel|tecan|vedotin)$/
const distinctInns = (a: string, b: string) => {
  const ha = a.split(' ')[0]
  const hb = b.split(' ')[0]
  return ha !== hb && INN_STEM.test(ha) && INN_STEM.test(hb)
}

const CONJUGATE = /^(emtansine|deruxtecan|vedotin|govitecan|mafodotin|tesirine|ozogamicin|soravtansine|duocarmazine|pegol|tiuxetan|pasudotox|sirtratumab)$/

const GENERIC_HEADS = new Set(['insulin', 'vitamin', 'human', 'recombinant', 'anti', 'sodium', 'standard', 'placebo', 'oral', 'drug', 'study'])

/** Collapse dose, regimen and formulation variants ("Ivonescimab 10 mg/kg", "VDPHL01 QD") onto one program key. */
const norm = (raw: string) => {
  let s = raw.toLowerCase()
    .replace(/^(drug|biological|genetic|other|combination product)\s*:\s*/, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(mg\/kg|mg\/m2|mg|mcg|µg|ug|g|ml|iu|units?|%)(\s*\/\s*\w+)?/g, ' ')
    .replace(/\b(dose|level|cohort|arm|part|regimen|schedule)\s*[\w-]*/g, ' ')
    .replace(/\b(qd|bid|tid|qw|q2w|q3w|q4w|q6w|q8w|once|twice|daily|weekly|monthly|high|low|medium|sc|iv|im|po|subcutaneous|intravenous|oral|injection|tablets?|capsules?|solution|infusion|formulation|obds|fixed[- ]dose)\b/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const [head = '', second = ''] = s.split(' ')
  // A distinctive first word (a drug name or code) identifies the program, except for conjugates
  // like "trastuzumab emtansine", which are different drugs from the bare antibody.
  if (head.length >= 6 && !GENERIC_HEADS.has(head)) s = CONJUGATE.test(second) ? `${head} ${second}` : head
  return s
}

/** Common backbone agents that appear in experimental arms as combination partners. */
export const BACKGROUND_AGENTS = new Set([
  'cisplatin', 'carboplatin', 'oxaliplatin', 'paclitaxel', 'nab-paclitaxel', 'docetaxel', 'pemetrexed', 'gemcitabine', 'capecitabine',
  'fluorouracil', '5-fu', '5-fluorouracil', 'leucovorin', 'irinotecan', 'etoposide', 'cyclophosphamide', 'doxorubicin', 'dexamethasone', 'prednisone',
  'prednisolone', 'methylprednisolone', 'lenalidomide', 'pomalidomide', 'bortezomib', 'carfilzomib', 'rituximab', 'bevacizumab',
  'pembrolizumab', 'nivolumab', 'atezolizumab', 'durvalumab', 'ipilimumab', 'trastuzumab', 'cetuximab', 'temozolomide', 'fulvestrant',
  'letrozole', 'anastrozole', 'exemestane', 'metformin', 'enfortumab', 'azacitidine', 'cytarabine', 'fludarabine', 'bendamustine',
  'tislelizumab', 'toripalimab', 'sintilimab', 'camrelizumab', 'daratumumab', 'ramucirumab', 'osimertinib', 'abiraterone', 'enzalutamide',
  'cabazitaxel', 'vinorelbine', 'tacrolimus', 'mycophenolate', 'methotrexate', 'folfox', 'folfiri', 'xelox', 'capox', 'chemotherapy',
  'eribulin', 'pioglitazone', 'actos', 'dapagliflozin', 'farxiga', 'atorvastatin', 'rosuvastatin', 'ezetimibe', 'aspirin', 'velcade', 'revlimid',
  'itraconazole', 'ketoconazole', 'fluconazole', 'clarithromycin', 'rifampin', 'rifampicin', 'midazolam', 'digoxin', 'omeprazole', 'caffeine',
  'warfarin', 'metoprolol', 'bupropion', 'dextromethorphan', 'repaglinide', 'carbamazepine', 'efavirenz', 'levonorgestrel', 'ethinyl',
  'mfolfirinox', 'folfirinox', 'cemiplimab', 'palbociclib', 'ribociclib', 'abemaciclib', 'olaparib', 'semaglutide', 'tirzepatide', 'ibrance', 'prevnar', 'pcv13', 'pcv20',
  'acetaminophen', 'paracetamol', 'diphenhydramine', 'ondansetron', 'filgrastim', 'pegfilgrastim', 'allopurinol', 'carboplatin-pemetrexed',
])

interface RawStudy {
  protocolSection: {
    identificationModule: { nctId: string; briefTitle: string; acronym?: string }
    statusModule: { overallStatus: string; startDateStruct?: { date: string } }
    sponsorCollaboratorsModule: { leadSponsor: { name: string } }
    designModule?: { phases?: string[] }
    conditionsModule?: { conditions?: string[] }
    armsInterventionsModule?: {
      armGroups?: { type?: string; interventionNames?: string[] }[]
      interventions?: { type?: string; name: string; otherNames?: string[] }[]
    }
  }
}

const pipelineCache = new Map<string, Promise<LivePipeline>>()

export function fetchLivePipeline(sponsors: string[]): Promise<LivePipeline> {
  const key = sponsors.join('|').toLowerCase()
  if (!pipelineCache.has(key)) {
    const p = (async () => {
      const results = await Promise.all(
        sponsors.map(async (s) => {
          const url = `https://clinicaltrials.gov/api/v2/studies?query.spons=${encodeURIComponent(s)}&filter.overallStatus=${ACTIVE}&pageSize=1000&countTotal=true&fields=${FIELDS}`
          const r = await fetch(url)
          if (!r.ok) throw new Error(`ClinicalTrials.gov returned ${r.status}`)
          return (await r.json()) as { studies: RawStudy[]; totalCount?: number; nextPageToken?: string }
        }),
      )
      const seen = new Set<string>()
      const studies = results.flatMap((r) => r.studies).filter((s) => {
        const id = s.protocolSection.identificationModule.nctId
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      const terms = sponsors.map((s) => s.toLowerCase().replace(/[,.]|\binc\b|\bllc\b|\bltd\b|\bag\b|\bse\b|\bs\.a\b/g, '').trim().split(/\s+/)[0])
      const programs = new Map<string, LiveProgram & { names: Map<string, number> }>()
      const alias = new Map<string, string>() // normalized name -> program key
      const trials: LiveTrial[] = []
      const COMPANYISH = /\b(inc|ltd|llc|corp|corporation|co\.|gmbh|pharma|pharmaceuticals?|therapeutics|biotech|biosciences|biologics|akeso|hengrui|company)\b/i

      const merge = (into: string, from: string) => {
        const a = programs.get(into)!
        const b = programs.get(from)
        if (!b || into === from) return
        for (const t of b.trials) if (!a.trials.some((x) => x.nct === t.nct)) a.trials.push(t)
        for (const c of b.conditions) if (!a.conditions.includes(c)) a.conditions.push(c)
        for (const [n, c] of b.names) a.names.set(n, (a.names.get(n) ?? 0) + c)
        if (b.phaseRank > a.phaseRank) { a.phaseRank = b.phaseRank; a.phase = b.phase }
        programs.delete(from)
        for (const [n, k] of alias) if (k === from) alias.set(n, into)
      }

      for (const st of studies) {
        const ps = st.protocolSection
        const [phase, rank] = phaseInfo(ps.designModule?.phases)
        const lead = ps.sponsorCollaboratorsModule.leadSponsor.name
        const trial: LiveTrial = {
          nct: ps.identificationModule.nctId,
          title: ps.identificationModule.acronym ? `${ps.identificationModule.acronym}: ${ps.identificationModule.briefTitle}` : ps.identificationModule.briefTitle,
          status: ps.statusModule.overallStatus.replace(/_/g, ' ').toLowerCase(),
          phase,
          phaseRank: rank,
          lead,
          isLead: terms.some((t) => lead.toLowerCase().includes(t)),
          conditions: ps.conditionsModule?.conditions ?? [],
          start: ps.statusModule.startDateStruct?.date,
        }
        trials.push(trial)

        // Only interventions given in an experimental arm count as the company's program,
        // so comparators (e.g. a competitor's drug in the control arm) are left out.
        const arms = ps.armsInterventionsModule?.armGroups ?? []
        const experimental = new Set(
          arms.filter((a) => a.type === 'EXPERIMENTAL').flatMap((a) => (a.interventionNames ?? []).map((n) => n.replace(/^[^:]+:\s*/, '').toLowerCase())),
        )
        const interventions = ps.armsInterventionsModule?.interventions ?? []
        const siblings = new Set(interventions.map((iv) => norm(iv.name)))
        for (const iv of interventions) {
          if (!DRUG_TYPES.has(iv.type ?? '') || NOT_A_PROGRAM.test(iv.name)) continue
          if (arms.length && experimental.size && !experimental.has(iv.name.toLowerCase())) continue
          const own = norm(iv.name)
          if (!own) continue
          // Combination entries ("X + Y", "X, Y and Z") must not link their partners' names to X.
          const single = !/[+,/&;]|\band\b|\bplus\b|\bwith\b/i.test(iv.name)
          // Registry "other names" sometimes list combination partners, backbone drugs or the
          // licensor company; only keep ones that plausibly name this same molecule.
          const otherRaw = single
            ? (iv.otherNames ?? []).filter((o) => {
                const n = norm(o)
                return n && n !== own && !/^\d+$/.test(n) && !/^(immunotherapy|chemotherapy|vaccine|antibody|treatment|study drug|investigational (product|drug)|imp|active|test product)$/.test(n) && !/information|to be determined|\btbd\b|n\/a|\bnone\b|not applicable/i.test(o) && !siblings.has(n) && !distinctInns(own, n) && !BACKGROUND_AGENTS.has(n.split(' ')[0]) && !COMPANYISH.test(o) && !/[+,/&;]|\band\b/i.test(o)
              })
            : []
          const others = otherRaw.map(norm)
          const ownKey = alias.get(own)
          const isBg = (key: string) => BACKGROUND_AGENTS.has(key.split(' ')[0])
          // Link through other names only to compatible programs: never a backbone agent and never
          // a program with a different nonproprietary name.
          const candidates = [ownKey, ...others.map((n) => alias.get(n))].filter((x): x is string => typeof x === 'string')
          const linked = [...new Set(candidates.filter((x) => x === ownKey || (!isBg(x) && !isBg(own) && !distinctInns(own, x))))]
          const k = linked[0] ?? own
          if (!programs.has(k)) programs.set(k, { key: k, name: iv.name.replace(/^(drug|biological|genetic|other)\s*:\s*/i, ''), aliases: [], phase: 'Not phased', phaseRank: -1, conditions: [], trials: [], sponsoredTrials: 0, names: new Map() })
          for (const other of linked.slice(1)) merge(k, other) // the same molecule seen under two names
          for (const n of [own, ...others]) if (!alias.has(n) || n === own) alias.set(n, k)
          const prog = programs.get(k)!
          const display = iv.name.replace(/^(drug|biological|genetic|other)\s*:\s*/i, '')
          if (single) prog.names.set(display, (prog.names.get(display) ?? 0) + 2)
          for (const o of otherRaw) prog.names.set(o, (prog.names.get(o) ?? 0) + 1)
          if (!prog.trials.some((t) => t.nct === trial.nct)) prog.trials.push(trial)
          if (rank > prog.phaseRank) { prog.phaseRank = rank; prog.phase = phase }
          for (const c of trial.conditions) if (!prog.conditions.includes(c)) prog.conditions.push(c)
        }
      }

      // Label: prefer a proper drug name (no digits, not shouty), then the most frequently used.
      const label = (n: string, count: number) => (INN_STEM.test(n.toLowerCase().split(' ')[0]) || /\s(alfa|beta)\b/i.test(n) ? -15 : 0) + (/\d/.test(n) ? 100 : 0) + (n.length > 4 && n === n.toUpperCase() ? 40 : 0) + (/[®™]/.test(n) ? 30 : 0) - count * 3 + n.length * 0.2
      const list: LiveProgram[] = [...programs.values()].map(({ names, ...p }) => {
        const ranked = [...names].sort((a, b) => label(a[0], a[1]) - label(b[0], b[1])).map(([n]) => n)
        const best = ranked[0] ?? p.name
        const name = best.charAt(0).toUpperCase() + best.slice(1)
        const seenAlias = new Set([name.toLowerCase()])
        const aliases = ranked.slice(1).filter((n) => { const k = n.toLowerCase(); if (seenAlias.has(k)) return false; seenAlias.add(k); return true }).slice(0, 6)
        return { ...p, name, aliases, sponsoredTrials: p.trials.filter((t) => t.isLead).length }
      })
        .filter((p) => p.sponsoredTrials > 0 || p.trials.length >= 2)
        .sort((a, b) => b.sponsoredTrials - a.sponsoredTrials || b.phaseRank - a.phaseRank || b.trials.length - a.trials.length)
      return {
        programs: list,
        trials: trials.sort((a, b) => Number(b.isLead) - Number(a.isLead) || b.phaseRank - a.phaseRank),
        totalTrials: results.reduce((n, r) => n + (r.totalCount ?? r.studies.length), 0),
        truncated: results.some((r) => Boolean(r.nextPageToken)),
      }
    })()
    pipelineCache.set(key, p)
    p.catch(() => pipelineCache.delete(key))
  }
  return pipelineCache.get(key)!
}

/** Trials of any status for a sponsor name, to tell "no such sponsor" apart from "no active trials". */
export async function fetchSponsorTrialCount(name: string): Promise<number> {
  const r = await fetch(`https://clinicaltrials.gov/api/v2/studies?query.spons=${encodeURIComponent(name)}&pageSize=1&countTotal=true&fields=NCTId`)
  if (!r.ok) throw new Error(`ClinicalTrials.gov returned ${r.status}`)
  return ((await r.json()) as { totalCount?: number }).totalCount ?? 0
}

export interface FdaProduct {
  brand: string
  generic: string
  route: string
  application: string
  sponsor: string
  firstApproval?: string
}

const fdaCache = new Map<string, Promise<FdaProduct[]>>()

export function fetchFdaProducts(patterns: string[]): Promise<FdaProduct[]> {
  const key = patterns.join('|')
  if (!fdaCache.has(key)) {
    const p = (async () => {
      if (!patterns.length) return []
      const search = patterns.map((x) => `sponsor_name:${x}`).join('+')
      const r = await fetch(`https://api.fda.gov/drug/drugsfda.json?search=${encodeURI(search)}&limit=1000`)
      if (r.status === 404) return []
      if (!r.ok) throw new Error(`openFDA returned ${r.status}`)
      const j = (await r.json()) as {
        results: {
          application_number: string
          sponsor_name: string
          products?: { brand_name?: string; marketing_status?: string; route?: string; dosage_form?: string; active_ingredients?: { name: string }[] }[]
          openfda?: { route?: string[] }
          submissions?: { submission_type?: string; submission_status?: string; submission_status_date?: string }[]
        }[]
      }
      const byBrand = new Map<string, FdaProduct>()
      for (const app of j.results) {
        // Brand-name prescription products only; generics (ANDA) are excluded.
        if (!/^(NDA|BLA)/.test(app.application_number)) continue
        const orig = (app.submissions ?? []).filter((s) => s.submission_type === 'ORIG' && s.submission_status === 'AP').map((s) => s.submission_status_date ?? '').sort()[0]
        for (const prod of app.products ?? []) {
          if (prod.marketing_status !== 'Prescription' || !prod.brand_name) continue
          const brand = prod.brand_name.replace(/\b(KWIKPEN|FLEXTOUCH|SOLOSTAR|PENFILL|AUTOINJECTOR|PREFILLED SYRINGE)\b/g, '').replace(/[()]/g, '').trim()
          if (byBrand.has(brand)) continue
          byBrand.set(brand, {
            brand,
            generic: (prod.active_ingredients ?? []).map((a) => a.name.toLowerCase()).join(' + '),
            route: [prod.dosage_form, app.openfda?.route?.join(', ') || prod.route].filter(Boolean).join(', ').toLowerCase(),
            application: app.application_number,
            sponsor: app.sponsor_name,
            firstApproval: orig ? `${orig.slice(0, 4)}-${orig.slice(4, 6)}-${orig.slice(6, 8)}` : undefined,
          })
        }
      }
      return [...byBrand.values()].sort((a, b) => (b.firstApproval ?? '').localeCompare(a.firstApproval ?? ''))
    })()
    fdaCache.set(key, p)
    p.catch(() => fdaCache.delete(key))
  }
  return fdaCache.get(key)!
}

export type Async<T> = { status: 'idle' } | { status: 'loading' } | { status: 'ok'; data: T } | { status: 'error'; message: string }

export function useAsync<T>(fn: (() => Promise<T>) | null, deps: unknown[]): Async<T> {
  const [state, setState] = useState<Async<T>>(fn ? { status: 'loading' } : { status: 'idle' })
  useEffect(() => {
    if (!fn) { setState({ status: 'idle' }); return }
    let live = true
    setState({ status: 'loading' })
    fn().then(
      (data) => live && setState({ status: 'ok', data }),
      (e: Error) => live && setState({ status: 'error', message: e.message || 'Request failed' }),
    )
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}
