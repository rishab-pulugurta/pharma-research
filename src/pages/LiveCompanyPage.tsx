import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AskPanel } from '../components/AskPanel'
import { FdaProducts, LivePipeline, useFdaProducts } from '../components/LiveCompany'
import type { Company } from '../data/types'
import { companyContext } from '../lib/context'
import { fetchLivePipeline, fetchSponsorTrialCount, useAsync } from '../lib/live'
import { search } from '../lib/search'

/** Any company, looked up live: no curation, just public registries plus the assistant. */
export function LiveCompanyPage() {
  const { name = '' } = useParams()
  const query = decodeURIComponent(name).trim()
  const head = query.split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const company: Company = useMemo(() => ({
    id: `live-${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: query,
    hq: 'Not in the PharmAtlas directory',
    type: 'Looked up live',
    focus: [],
    summary: `Live registry lookup for “${query}”.`,
    marketed: [],
    partnerships: [],
    verified: new Date().toISOString().slice(0, 10),
    sourceIds: [],
    registry: [query],
    fda: head.length >= 4 ? [`${head}*`] : [],
  }), [query, head])

  const fda = useFdaProducts(company.fda ?? [])
  const pipe = useAsync(() => fetchLivePipeline([query]), [query])
  const anyTrials = useAsync(() => fetchSponsorTrialCount(query), [query])
  const known = search(query, 3).find((h) => h.kind === 'company' && h.score >= 70)
  const ownGenerics = new Set(fda.status === 'ok' ? fda.data.flatMap((p) => p.generic.split(' + ').map((g) => g.split(' ')[0])) : [])
  const sponsors = pipe.status === 'ok'
    ? Object.entries(pipe.data.trials.reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.lead]: (acc[t.lead] ?? 0) + 1 }), {}))
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
    : []

  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/companies">Company</Link><span className="chip warn">Live lookup</span></div>
        <h1>{query}</h1>
        <p className="lede">Built live from ClinicalTrials.gov and Drugs@FDA. This company isn’t curated in PharmAtlas, so everything below comes straight from public registries.</p>
        {known && <div className="ent-meta"><span className="small">There’s a full profile for this company: <Link to={known.href}>{known.title}</Link>.</span></div>}
      </header>

      {anyTrials.status === 'ok' && anyTrials.data === 0 && fda.status === 'ok' && fda.data.length === 0 ? (
        <div className="empty-state">
          <h3>No sponsor matching “{query}” was found</h3>
          <p>ClinicalTrials.gov has no trials and Drugs@FDA has no approvals under this name. Check the spelling, try the company’s full legal name (e.g. “Kymera Therapeutics”), or browse the <Link to="/companies">company directory</Link>.</p>
        </div>
      ) : (
      <div className="stack-l">
        {sponsors.length > 1 && (
          <section className="stack-s">
            <h2 style={{ fontSize: '1.125rem' }}>Sponsors matching “{query}”</h2>
            <p className="xsmall faint">The registry search also matches collaborators. Choose an exact sponsor name to narrow the pipeline to one organization.</p>
            <div className="try" style={{ marginTop: 0 }}>
              {sponsors.map(([s, n]) => <Link key={s} to={`/companies/live/${encodeURIComponent(s)}`}>{s} ({n})</Link>)}
            </div>
          </section>
        )}

        <section className="section">
          <AskPanel title={`Ask about ${query}`} scope={{ kind: 'company', id: company.id }} buildContext={() => companyContext(company)} suggestions={[
            `What does ${query} do, and what are its most advanced programs?`,
            `Explain the mechanism of ${query}'s lead drug.`,
            `What are the key upcoming catalysts and risks for ${query}'s pipeline?`,
          ]} />
        </section>

        <section className="section">
          <div className="section-head"><h2>Active pipeline</h2><span className="chip outline">Live from ClinicalTrials.gov</span></div>
          <LivePipeline registry={[query]} ownGenerics={ownGenerics} />
        </section>

        <section className="section">
          <div className="section-head"><h2>FDA-approved products</h2><span className="chip outline">Live from Drugs@FDA</span></div>
          <FdaProducts fda={company.fda ?? []} note={`Matched sponsor names beginning with “${head}”. Products filed under a subsidiary’s name may be missing.`} />
        </section>
      </div>
      )}
    </article>
  )
}
