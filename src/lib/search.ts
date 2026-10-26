import type { EntityKind } from '../data/types'
import { companyList, diseaseList, drugList, pathwayList, targetList, targets as targetsById, trialList, hrefFor } from './graph'

export interface SearchDoc {
  kind: EntityKind
  id: string
  title: string
  subtitle: string
  terms: string[] // lowercased name + aliases
  related: string[] // weaker matches: a drug's targets, a disease's synonyms for symptoms
  href: string
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[‐-―]/g, '-')

export const index: SearchDoc[] = [
  ...drugList.map((d) => ({ kind: 'drug' as const, id: d.id, title: d.name, subtitle: `${d.modality} for ${d.targets.map((t) => t.targetId.toUpperCase()).join(' + ')}`, terms: [d.name, ...d.aliases, ...d.brands], related: d.targets.flatMap((t) => [t.targetId, targetsById[t.targetId]?.symbol ?? '', targetsById[t.targetId]?.name ?? '']), href: hrefFor('drug', d.id) })),
  ...companyList.map((c) => ({ kind: 'company' as const, id: c.id, title: c.name, subtitle: c.type, terms: [c.name, c.id, c.name.split(' ')[0]], related: [c.summary, c.platform ?? '', ...(c.leadPrograms ?? []).map((p) => p.name)], href: hrefFor('company', c.id) })),
  ...diseaseList.map((d) => ({ kind: 'disease' as const, id: d.id, title: d.name, subtitle: d.summary, terms: [d.name, ...d.aliases], related: [], href: hrefFor('disease', d.id) })),
  ...targetList.map((t) => ({ kind: 'target' as const, id: t.id, title: t.symbol, subtitle: t.name, terms: [t.symbol, t.name, t.gene, t.id], related: [], href: hrefFor('target', t.id) })),
  ...trialList.map((t) => ({ kind: 'trial' as const, id: t.nct, title: t.name, subtitle: `${t.nct}, ${t.phase}`, terms: [t.name, t.nct], related: [t.title], href: hrefFor('trial', t.nct) })),
  ...pathwayList.map((p) => ({ kind: 'pathway' as const, id: p.id, title: p.name, subtitle: 'Pathway', terms: [p.name], related: ['camp', 'signaling', 'pathway'], href: hrefFor('pathway', p.id) })),
].map((d) => ({ ...d, terms: d.terms.map(norm), related: d.related.filter(Boolean).map(norm) }))

export interface Hit extends SearchDoc {
  score: number
  matched: string // which alias matched, shown when it differs from the title
}

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

const words = (t: string) => t.split(/[\s/(),-]+/).filter(Boolean)

function scoreTerm(term: string, query: string): number {
  if (term === query) return 100
  if (term.startsWith(query)) return 70
  if (words(term).some((w) => w.startsWith(query))) return 50
  if (query.length > 2 && term.includes(query)) return 30
  // Typo tolerance: compare against each word's prefix of similar length.
  if (query.length >= 5) {
    const tol = query.length >= 8 ? 2 : 1
    if (words(term).some((w) => w.length >= query.length - 1 && editDistance(w.slice(0, query.length), query) <= tol)) return 18
  }
  return 0
}

/** Alias-aware ranking: exact > prefix > word-prefix > substring > related (e.g. a drug's target) > typo. */
export function search(q: string, limit = 12): Hit[] {
  const query = norm(q.trim())
  if (!query) return []
  const hits: Hit[] = []
  for (const doc of index) {
    let best = 0
    let matched = ''
    doc.terms.forEach((term, i) => {
      const raw = scoreTerm(term, query)
      const s = raw ? raw + (i === 0 ? 3 : 0) : 0 // the entity's own name wins ties
      if (s > best) { best = s; matched = term }
    })
    for (const term of doc.related) {
      const s = Math.min(25, scoreTerm(term, query) / 2)
      if (s > best) { best = s; matched = doc.kind === 'drug' ? `acts on ${term.toUpperCase()}` : '' }
    }
    if (best) hits.push({ ...doc, score: best + (doc.kind === 'drug' ? 2 : 0), matched })
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit)
}

export const nctPattern = /^nct\d{8}$/i
