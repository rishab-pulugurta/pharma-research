import { companies, companyList } from '../data/companies'
import { diseases, diseaseList, externalDiseaseLabels } from '../data/diseases'
import { drugList, drugs } from '../data/drugs'
import { pathways, pathwayList, targets, targetList } from '../data/targets'
import { trialList, trials } from '../data/trials'
import type { Drug, EntityKind, Phase } from '../data/types'

export const kindPath: Record<EntityKind, string> = {
  company: 'companies',
  drug: 'drugs',
  disease: 'diseases',
  target: 'targets',
  trial: 'trials',
  pathway: 'pathways',
}

export const kindLabel: Record<EntityKind, string> = {
  company: 'Company',
  drug: 'Drug',
  disease: 'Disease',
  target: 'Target',
  trial: 'Trial',
  pathway: 'Pathway',
}

export const hrefFor = (kind: EntityKind, id: string) => `/${kindPath[kind]}/${id}`

export function entityName(kind: EntityKind, id: string): string {
  switch (kind) {
    case 'company': return companies[id]?.name ?? id
    case 'drug': return drugs[id]?.name ?? id
    case 'disease': return diseases[id]?.name ?? externalDiseaseLabels[id] ?? id
    case 'target': return targets[id]?.symbol ?? id
    case 'trial': return trials[id]?.name ?? id
    case 'pathway': return pathways[id]?.name ?? id
  }
}

export function entityExists(kind: EntityKind, id: string): boolean {
  const table = ({ company: companies, drug: drugs, disease: diseases, target: targets, trial: trials, pathway: pathways } as Record<string, Record<string, unknown>>)[kind]
  return Boolean(table) && id in table
}

export const phaseOrder: Phase[] = ['Preclinical', 'Phase 1', 'Phase 2', 'Phase 3', 'Filed', 'Approved']
export const phaseRank = (p: Phase) => phaseOrder.indexOf(p)

/** Highest development phase a drug has reached for any indication. */
export function leadPhase(d: Drug): Phase {
  return d.programs.reduce<Phase>((best, p) => (phaseRank(p.phase) > phaseRank(best) ? p.phase : best), 'Preclinical')
}

export const drugCompanies = (d: Drug) => [...new Set([d.owner, d.originator, ...(d.partners ?? []), ...d.programs.map((p) => p.company)])]

export const drugsForCompany = (cid: string) => drugList.filter((d) => drugCompanies(d).includes(cid))

export type CompanyRole = 'Developer' | 'Originator / licensor' | 'Partner'

export const programsForCompany = (cid: string) =>
  drugList.flatMap((d) =>
    d.programs
      .filter((p) => p.company === cid || d.originator === cid || (d.partners ?? []).includes(cid))
      .map((p) => ({
        drug: d,
        program: p,
        role: (p.company === cid ? 'Developer' : d.originator === cid ? 'Originator / licensor' : 'Partner') as CompanyRole,
      })),
  )

export const drugsForTarget = (tid: string) => drugList.filter((d) => d.targets.some((t) => t.targetId === tid))
export const drugsForDisease = (did: string) => drugList.filter((d) => d.programs.some((p) => p.diseaseId === did))
export const trialsForDrug = (did: string) => trialList.filter((t) => t.drugIds.includes(did))
export const trialsForDisease = (did: string) => trialList.filter((t) => t.diseaseId === did)
export const trialsForCompany = (cid: string) => trialList.filter((t) => t.sponsor === cid)
export const pathwaysForTarget = (tid: string) => pathwayList.filter((p) => p.targetIds.includes(tid))
export const diseasesForTarget = (tid: string) => diseaseList.filter((d) => d.targetIds.includes(tid))

export function companiesForDisease(did: string) {
  return [...new Set(drugsForDisease(did).flatMap((d) => d.programs.filter((p) => p.diseaseId === did).map((p) => p.company)))]
    .filter((c) => companies[c])
}

export interface Related {
  drug: Drug
  reasons: string[]
}

/** Drugs related by shared target, modality, or disease, ranked by overlap. */
export function relatedDrugs(d: Drug): Related[] {
  const myTargets = new Set(d.targets.map((t) => t.targetId))
  const myDiseases = new Set(d.programs.map((p) => p.diseaseId))
  return drugList
    .filter((o) => o.id !== d.id)
    .map((o) => {
      const reasons: string[] = []
      const shared = o.targets.filter((t) => myTargets.has(t.targetId)).map((t) => targets[t.targetId]?.symbol)
      if (shared.length) reasons.push(`Also targets ${shared.join(', ')}`)
      if (o.modality === d.modality) reasons.push(`Same modality (${o.modality.toLowerCase()})`)
      const sharedDz = o.programs.filter((p) => myDiseases.has(p.diseaseId) && diseases[p.diseaseId]).map((p) => diseases[p.diseaseId].name)
      if (sharedDz.length) reasons.push(`Competes in ${[...new Set(sharedDz)].join(', ')}`)
      return { drug: o, reasons, score: shared.length * 3 + (sharedDz.length ? 2 : 0) + (o.modality === d.modality ? 1 : 0) }
    })
    .filter((r) => r.reasons.length)
    .sort((a, b) => b.score - a.score)
}

export interface Neighbor {
  kind: EntityKind
  id: string
  relation: string
}

/** First-degree neighbors of any entity, used by the relationship map and "Connected" rails. */
export function neighbors(kind: EntityKind, id: string): Neighbor[] {
  const out: Neighbor[] = []
  const push = (k: EntityKind, i: string, relation: string) => {
    if (!out.some((n) => n.kind === k && n.id === i)) out.push({ kind: k, id: i, relation })
  }
  if (kind === 'drug') {
    const d = drugs[id]
    if (!d) return out
    d.targets.forEach((t) => push('target', t.targetId, t.action))
    d.programs.forEach((p) => diseases[p.diseaseId] && push('disease', p.diseaseId, p.phase))
    drugCompanies(d).forEach((c) => companies[c] && push('company', c, c === d.owner ? 'Developer' : 'Originator / partner'))
    trialsForDrug(id).forEach((t) => push('trial', t.nct, t.phase))
  }
  if (kind === 'disease') {
    diseases[id]?.targetIds.forEach((t) => push('target', t, 'Pursued target'))
    drugsForDisease(id).forEach((d) => push('drug', d.id, d.programs.find((p) => p.diseaseId === id)!.phase))
    companiesForDisease(id).forEach((c) => push('company', c, 'Developer'))
    trialsForDisease(id).forEach((t) => push('trial', t.nct, t.phase))
  }
  if (kind === 'target') {
    drugsForTarget(id).forEach((d) => push('drug', d.id, d.targets.find((t) => t.targetId === id)!.action))
    diseasesForTarget(id).forEach((d) => push('disease', d.id, 'Indication'))
    pathwaysForTarget(id).forEach((p) => push('pathway', p.id, 'Signaling'))
  }
  if (kind === 'company') {
    drugsForCompany(id).forEach((d) => push('drug', d.id, leadPhase(d)))
    trialsForCompany(id).forEach((t) => push('trial', t.nct, 'Sponsor'))
  }
  if (kind === 'trial') {
    const t = trials[id]
    if (!t) return out
    t.drugIds.forEach((d) => push('drug', d, 'Studied'))
    push('disease', t.diseaseId, 'Condition')
    if (companies[t.sponsor]) push('company', t.sponsor, 'Sponsor')
  }
  if (kind === 'pathway') {
    pathways[id]?.targetIds.forEach((t) => push('target', t, 'Member'))
  }
  return out
}

export { companies, companyList, diseases, diseaseList, drugs, drugList, pathways, pathwayList, targets, targetList, trials, trialList }
