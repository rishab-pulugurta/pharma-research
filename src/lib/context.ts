import { mechNodes } from '../data/mechNodes'
import { sources } from '../data/sources'
import type { Company, Disease, Drug, Target, Trial } from '../data/types'
import { companies, drugsForCompany, drugsForDisease, drugsForTarget, entityName, programsForCompany, targets, trialsForDrug } from './graph'
import { fetchFdaProducts, fetchLivePipeline } from './live'

/** Plain-text page context sent with the first chat question, so answers start from the atlas's own sourced data. */

const cite = (ids: string[]) => ids.map((i) => sources[i]).filter(Boolean).map((s) => `${s.title} (${s.type}, ${s.publisher}, ${s.date}) ${s.url}`)

function drugBlock(d: Drug): string {
  const lines = [
    `DRUG: ${d.name} (${d.aliases.join(', ')})`,
    `Status: ${d.status}${d.approvalScope ? ` (${d.approvalScope})` : ''}. Modality: ${d.modality}. Route: ${d.route}. Dosing: ${d.dosing}`,
    `Developer: ${companies[d.owner]?.name}; originator: ${companies[d.originator]?.name}`,
    `Targets: ${d.targets.map((t) => `${targets[t.targetId]?.symbol} (${t.action}, ${t.confidence})`).join('; ')}`,
    `Molecular: ${d.levels.molecular}`,
    `Cellular: ${d.levels.cellular}`,
    `Physiological: ${d.levels.physiological}`,
    `Mechanism links (from -> to [evidence]): ${d.mechanism.map((e) => `${e.from === 'self' ? d.name : mechNodes[e.from]?.label} -> ${mechNodes[e.to]?.label} [${e.confidence}]`).join('; ')}`,
    `Tradeoffs: ${d.tradeoffs.join(' | ')}`,
    `Programs: ${d.programs.map((p) => `${p.indication}: ${p.phase}, ${p.status}; latest ${p.latest.date}: ${p.latest.text}`).join(' | ')}`,
    `Regulatory: ${d.regulatory.map((r) => `${r.jurisdiction} ${r.indication}: ${r.status}${r.date ? ` ${r.date}` : ''}`).join(' | ') || 'none recorded'}`,
  ]
  return lines.join('\n')
}

function trialBlock(t: Trial): string {
  return [
    `TRIAL: ${t.name} (${t.nct}), ${t.phase}, sponsor ${entityName('company', t.sponsor)}, status ${t.evidenceStatus}`,
    `Design: ${t.design.randomized ? 'randomized' : 'non-randomized'}, ${t.design.blinding}; arms ${t.design.arms.join('; ')}; comparator ${t.design.comparator}`,
    `Population: ${t.population.enrollment} enrolled; ${t.population.eligibility}${t.population.baseline ? `; baseline ${t.population.baseline}` : ''}`,
    `Duration: ${t.treatment.duration}. Primary endpoints: ${t.endpoints.primary.join('; ')}`,
    ...t.results.map((r) => `Result (${r.kind}, ${r.surrogate ? 'surrogate' : 'outcome'}): ${r.endpoint}, ${r.measure}, ${r.timepoint}${r.estimand ? `, ${r.estimand}` : ''}: ${r.arms.map((a) => `${a.arm} ${a.value}${r.unit.startsWith('%') ? '%' : ` ${r.unit}`}`).join(', ')}${r.contrast ? `; ${r.contrast}` : ''}${r.absolute ? `; ${r.absolute}` : ''}`),
    t.summary ? `Summary: ${t.summary.happened} Limitations: ${t.summary.limitations.join(' | ')}` : '',
    t.safety ? `Safety: ${t.safety.discontinuationAE.map((x) => `${x.arm} ${x.value}`).join(', ')}. ${t.safety.common}` : '',
  ].filter(Boolean).join('\n')
}

const sourceList = (ids: string[]) => {
  const list = cite([...new Set(ids)])
  return list.length ? `\nSOURCES:\n- ${list.join('\n- ')}` : ''
}

export async function companyContext(c: Company): Promise<string> {
  const parts = [
    `PAGE: Company profile for ${c.name}`,
    `HQ: ${c.hq}. Type: ${c.type}. ${[c.ownership, c.ticker].filter(Boolean).join(', ')}${c.founded ? `. Founded ${c.founded}` : ''}`,
    `Summary: ${c.summary}`,
    c.platform ? `Platform: ${c.platform}` : '',
    c.funding ? `Financing: ${c.funding}` : '',
    c.marketed.length ? `Key marketed products: ${c.marketed.join(', ')}` : '',
    c.leadPrograms?.length ? `Notable programs:\n${c.leadPrograms.map((p) => `- ${p.name}: ${p.what} (${p.stage})`).join('\n')}` : '',
    c.partnerships.length ? `Partnerships: ${c.partnerships.map((p) => `${p.partner}: ${p.detail}`).join(' | ')}` : '',
    c.note ? `Note: ${c.note}` : '',
    `Profile last verified: ${c.verified}`,
  ]
  const curated = drugsForCompany(c.id)
  if (curated.length) parts.push(`\nIN-DEPTH CURATED DRUGS:\n${curated.map(drugBlock).join('\n\n')}`)
  if (programsForCompany(c.id).length === 0 && !curated.length) parts.push('No in-depth curated drug profiles exist for this company in PharmAtlas yet.')

  const [pipe, fda] = await Promise.allSettled([
    c.registry?.length ? fetchLivePipeline(c.registry) : Promise.resolve(null),
    c.fda?.length ? fetchFdaProducts(c.fda) : Promise.resolve([]),
  ])
  if (pipe.status === 'fulfilled' && pipe.value) {
    const p = pipe.value
    parts.push(
      `\nLIVE CLINICALTRIALS.GOV PIPELINE (fetched ${new Date().toISOString().slice(0, 10)}; ${p.trials.length} active trials; programs grouped from experimental-arm interventions, may include combination partners):`,
      ...p.programs.slice(0, 40).map((x) => `- ${x.name}${x.aliases.length ? ` (aka ${x.aliases.slice(0, 3).join(', ')})` : ''}: furthest active ${x.phase}; ${x.sponsoredTrials} company-sponsored of ${x.trials.length} trials; conditions: ${x.conditions.slice(0, 5).join('; ')}`),
    )
  }
  if (fda.status === 'fulfilled' && fda.value.length) {
    parts.push(`\nFDA (CDER) APPROVED BRANDS (Drugs@FDA, live): ${fda.value.slice(0, 60).map((x) => `${x.brand} [${x.generic}${x.firstApproval ? `, first approved ${x.firstApproval}` : ''}]`).join('; ')}`)
  }
  parts.push(sourceList([...c.sourceIds, ...curated.flatMap((d) => d.sourceIds)]))
  return parts.filter(Boolean).join('\n')
}

export function drugContext(d: Drug): string {
  const trials = trialsForDrug(d.id)
  return [`PAGE: Drug profile for ${d.name}`, drugBlock(d), trials.length ? `\nTRIALS:\n${trials.map(trialBlock).join('\n\n')}` : '', sourceList([...d.sourceIds, ...trials.flatMap((t) => t.sourceIds)])].join('\n')
}

export function trialContext(t: Trial): string {
  return [`PAGE: Clinical trial ${t.name}`, trialBlock(t), sourceList(t.sourceIds)].join('\n')
}

export function targetContext(t: Target): string {
  const ds = drugsForTarget(t.id)
  return [
    `PAGE: Target profile for ${t.symbol} (${t.name}, gene ${t.gene}, ${t.family})`,
    `Biology: ${t.biology}`, `Tissues: ${t.tissues.join(', ')}`, `Why target it: ${t.whyTarget}`,
    t.geneticEvidence ? `Genetic evidence: ${t.geneticEvidence}` : '', `Tradeoffs: ${t.tradeoffs.join(' | ')}`,
    `\nDRUGS ACTING HERE:\n${ds.map(drugBlock).join('\n\n')}`, sourceList(t.sourceIds),
  ].filter(Boolean).join('\n')
}

export function diseaseContext(d: Disease): string {
  const ds = drugsForDisease(d.id)
  return [
    `PAGE: Disease hub for ${d.name}`, `Summary: ${d.summary}`, `Pathophysiology: ${d.pathophysiology}`, `Progression: ${d.progression}`,
    `Epidemiology: ${d.epidemiology.prevalence} ${d.epidemiology.burden}`,
    `Standard of care: ${d.standardOfCare.map((s) => `${s.drugClass} (${s.examples.join(', ')}): ${s.role}`).join(' | ')}`,
    `Unmet needs: ${d.unmetNeeds.join(' | ')}`, `Biomarkers: ${d.biomarkers.map((b) => `${b.name}: ${b.implication}`).join(' | ')}`,
    `Failures: ${d.failures.map((f) => `${f.name}: ${f.what}`).join(' | ')}`,
    `\nDRUGS IN DEVELOPMENT OR APPROVED:\n${ds.map((x) => `- ${x.name}: ${x.oneLiner} (${x.programs.filter((p) => p.diseaseId === d.id).map((p) => `${p.phase}, ${p.status}`).join('; ')})`).join('\n')}`,
    sourceList(d.sourceIds),
  ].join('\n')
}
