import type { FunctionDeclaration } from '@google/genai'

/**
 * Free research tools the chat model can call. Each hits a public, keyless API from the server
 * and returns compact JSON plus the URLs it drew on, which become the answer's cited sources.
 */

export interface ToolResult {
  data: unknown
  sources: { url: string; title: string }[]
}

const clip = (s: string | undefined, n: number) => (s && s.length > n ? `${s.slice(0, n)}…` : s ?? '')

async function getJson(url: string): Promise<unknown> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`${new URL(url).host} returned ${r.status}`)
  return r.json()
}

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'search_trials',
    description: 'Search ClinicalTrials.gov for clinical trials. Use for questions about what is being tested, trial status, phases, sponsors or enrollment. Returns up to 8 trials.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Drug, condition or keywords, e.g. "retatrutide obesity" or "KRAS G12D"' },
        sponsor: { type: 'string', description: 'Optional sponsor or company name to filter by' },
        active_only: { type: 'boolean', description: 'Only recruiting or ongoing trials (default false)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_trial',
    description: 'Get details of one ClinicalTrials.gov trial by NCT number: design, arms, primary outcomes, enrollment, status and dates.',
    parametersJsonSchema: {
      type: 'object',
      properties: { nct: { type: 'string', description: 'NCT identifier, e.g. NCT04184622' } },
      required: ['nct'],
    },
  },
  {
    name: 'fda_drug',
    description: 'Look up a drug in FDA records (Drugs@FDA and drug labels): whether and when it is approved, under what brand, by which sponsor, its labeled indications and boxed warning. Use for any question about approval status or labeling.',
    parametersJsonSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Generic or brand name, e.g. "orforglipron" or "Zepbound"' } },
      required: ['name'],
    },
  },
  {
    name: 'search_literature',
    description: 'Search PubMed-indexed literature through Europe PMC. Returns up to 5 recent papers with abstracts. Use for mechanisms, trial results and reviews.',
    parametersJsonSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search terms, e.g. "tirzepatide GIP receptor mechanism review"' } },
      required: ['query'],
    },
  },
]

type Args = Record<string, unknown>

interface Study {
  protocolSection: {
    identificationModule: { nctId: string; briefTitle: string; acronym?: string }
    statusModule: { overallStatus: string; startDateStruct?: { date: string }; primaryCompletionDateStruct?: { date: string } }
    sponsorCollaboratorsModule?: { leadSponsor?: { name: string } }
    designModule?: { phases?: string[]; enrollmentInfo?: { count?: number } }
    conditionsModule?: { conditions?: string[] }
    armsInterventionsModule?: { interventions?: { name: string }[]; armGroups?: { label: string; type?: string; description?: string }[] }
    outcomesModule?: { primaryOutcomes?: { measure: string; timeFrame?: string }[] }
    descriptionModule?: { briefSummary?: string }
  }
  hasResults?: boolean
}

const summarizeStudy = (s: Study) => {
  const p = s.protocolSection
  return {
    nct: p.identificationModule.nctId,
    title: p.identificationModule.acronym ? `${p.identificationModule.acronym}: ${p.identificationModule.briefTitle}` : p.identificationModule.briefTitle,
    status: p.statusModule.overallStatus,
    phase: (p.designModule?.phases ?? []).join('/'),
    sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name,
    enrollment: p.designModule?.enrollmentInfo?.count,
    conditions: (p.conditionsModule?.conditions ?? []).slice(0, 4),
    interventions: (p.armsInterventionsModule?.interventions ?? []).map((i) => i.name).slice(0, 5),
    start: p.statusModule.startDateStruct?.date,
    primary_completion: p.statusModule.primaryCompletionDateStruct?.date,
    results_posted: Boolean(s.hasResults),
  }
}

export async function runTool(name: string, args: Args): Promise<ToolResult> {
  if (name === 'search_trials') {
    const q = new URLSearchParams({ 'query.term': String(args.query ?? ''), pageSize: '8', sort: 'LastUpdatePostDate' })
    if (args.sponsor) q.set('query.spons', String(args.sponsor))
    if (args.active_only) q.set('filter.overallStatus', 'RECRUITING,ACTIVE_NOT_RECRUITING,NOT_YET_RECRUITING,ENROLLING_BY_INVITATION')
    const j = (await getJson(`https://clinicaltrials.gov/api/v2/studies?${q}`)) as { studies?: Study[] } | null
    const trials = (j?.studies ?? []).map(summarizeStudy)
    return { data: { trials }, sources: trials.map((t) => ({ url: `https://clinicaltrials.gov/study/${t.nct}`, title: `${t.title} (${t.nct})` })) }
  }

  if (name === 'get_trial') {
    const nct = String(args.nct ?? '').toUpperCase().trim()
    if (!/^NCT\d{8}$/.test(nct)) return { data: { error: 'Not a valid NCT number' }, sources: [] }
    const s = (await getJson(`https://clinicaltrials.gov/api/v2/studies/${nct}`)) as Study | null
    if (!s) return { data: { error: `${nct} not found` }, sources: [] }
    const p = s.protocolSection
    return {
      data: {
        ...summarizeStudy(s),
        arms: (p.armsInterventionsModule?.armGroups ?? []).map((a) => ({ label: a.label, type: a.type, description: clip(a.description, 200) })),
        primary_outcomes: (p.outcomesModule?.primaryOutcomes ?? []).map((o) => `${o.measure}${o.timeFrame ? ` (${o.timeFrame})` : ''}`),
        summary: clip(p.descriptionModule?.briefSummary, 800),
      },
      sources: [{ url: `https://clinicaltrials.gov/study/${nct}`, title: `ClinicalTrials.gov ${nct}` }],
    }
  }

  if (name === 'fda_drug') {
    const term = String(args.name ?? '').trim().replace(/["\\]/g, '')
    if (!term) return { data: { error: 'A drug name is required' }, sources: [] }
    const enc = encodeURIComponent(`"${term.toUpperCase()}"`)
    const approvals = (await getJson(`https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:${enc}+openfda.generic_name:${enc}+openfda.brand_name:${enc}&limit=5`)) as {
      results?: { application_number: string; sponsor_name: string; products?: { brand_name?: string; marketing_status?: string }[]; submissions?: { submission_type?: string; submission_status?: string; submission_status_date?: string }[]; openfda?: { generic_name?: string[] } }[]
    } | null
    const label = (await getJson(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${enc}+openfda.brand_name:${enc}&limit=1`)) as {
      results?: { indications_and_usage?: string[]; boxed_warning?: string[]; effective_time?: string; openfda?: { brand_name?: string[]; manufacturer_name?: string[] } }[]
    } | null
    const apps = (approvals?.results ?? []).map((a) => {
      const orig = (a.submissions ?? []).filter((s) => s.submission_type === 'ORIG' && s.submission_status === 'AP').map((s) => s.submission_status_date ?? '').sort()[0]
      return {
        application: a.application_number,
        sponsor: a.sponsor_name,
        brands: [...new Set((a.products ?? []).map((p) => p.brand_name).filter(Boolean))],
        generic: a.openfda?.generic_name?.[0],
        marketing_status: [...new Set((a.products ?? []).map((p) => p.marketing_status).filter(Boolean))],
        first_approved: orig ? `${orig.slice(0, 4)}-${orig.slice(4, 6)}-${orig.slice(6, 8)}` : undefined,
      }
    })
    const l = label?.results?.[0]
    const sources = apps.map((a) => ({ url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${a.application.replace(/\D/g, '')}`, title: `Drugs@FDA ${a.application} (${a.brands.join(', ')})` }))
    if (l) sources.push({ url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(term)}`, title: `FDA label for ${l.openfda?.brand_name?.[0] ?? term} (DailyMed)` })
    return {
      data: apps.length || l
        ? { approvals: apps, label: l ? { brand: l.openfda?.brand_name?.[0], manufacturer: l.openfda?.manufacturer_name?.[0], label_date: l.effective_time, indications: clip(l.indications_and_usage?.[0], 1200), boxed_warning: clip(l.boxed_warning?.[0], 600) } : null }
        : { note: `No FDA (CDER) approval or label found for "${term}". It may be investigational, approved only outside the US, or a vaccine or cell/gene therapy regulated by CBER, which this source does not cover.` },
      sources,
    }
  }

  if (name === 'search_literature') {
    const q = new URLSearchParams({ query: `${String(args.query ?? '')} AND SRC:MED`, format: 'json', pageSize: '5', resultType: 'core', sort: 'P_PDATE_D desc' })
    const j = (await getJson(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${q}`)) as {
      resultList?: { result?: { pmid?: string; doi?: string; title: string; journalTitle?: string; journalInfo?: { journal?: { title?: string } }; firstPublicationDate?: string; abstractText?: string; pubType?: string }[] }
    } | null
    const papers = (j?.resultList?.result ?? []).map((r) => ({
      pmid: r.pmid,
      title: r.title,
      journal: r.journalInfo?.journal?.title ?? r.journalTitle,
      published: r.firstPublicationDate,
      abstract: clip(r.abstractText?.replace(/<[^>]+>/g, ''), 700),
    }))
    return {
      data: { papers },
      sources: papers.map((p) => ({ url: p.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/` : 'https://europepmc.org', title: `${p.title} (${p.journal ?? 'journal'}, ${p.published?.slice(0, 4) ?? ''})` })),
    }
  }

  return { data: { error: `Unknown tool ${name}` }, sources: [] }
}

export const toolStatus: Record<string, string> = {
  search_trials: 'Searching ClinicalTrials.gov…',
  get_trial: 'Reading the trial record…',
  fda_drug: 'Checking FDA records…',
  search_literature: 'Searching PubMed…',
}
