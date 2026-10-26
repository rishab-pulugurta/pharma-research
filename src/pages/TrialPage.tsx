import { Link, useParams } from 'react-router-dom'
import { Cite, ConnectedRail, EntityActions, EntityLink, Facts, NotesPanel, SourceList, SubNav, Verified } from '../components/bits'
import { LiveRegistry } from '../components/LiveRegistry'
import { ResultChart } from '../components/ResultChart'
import { sources } from '../data/sources'
import type { Trial } from '../data/types'
import { hrefFor, trialList, trials } from '../lib/graph'
import { useRegistry } from '../lib/registry'
import { nctPattern, search } from '../lib/search'
import { fmtVal, lowerFirst } from '../lib/format'
import { AskPanel } from '../components/AskPanel'
import { trialContext } from '../lib/context'


function Headline({ t }: { t: Trial }) {
  const r = t.results.find((x) => x.kind === 'primary')
  if (!r) return null
  const best = [...r.arms].filter((a) => !a.isComparator).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0]
  const cmp = r.arms.find((a) => a.isComparator)
  const signed = r.arms.some((a) => a.value < 0)
  return (
    <div className="panel" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr)', alignItems: 'end' }}>
      <div>
        <div className="hero-number">{fmtVal(best.value, r.unit, signed)}</div>
        <div className="small muted" style={{ marginTop: 6 }}>{lowerFirst(r.endpoint)}, {best.arm}</div>
      </div>
      <div className="small" style={{ borderLeft: '1px solid var(--rule)', paddingLeft: 18 }}>
        {cmp ? <>vs <strong>{fmtVal(cmp.value, r.unit, signed)}</strong> with {lowerFirst(cmp.arm)}</> : <span style={{ color: 'var(--s-warn)' }}>No comparator value captured. Read this number on its own, not as an effect size.</span>}
        <div className="faint xsmall" style={{ marginTop: 4 }}>{r.timepoint}. {t.population.eligibility.split(';')[0]}. Comparator: {t.design.comparator}.</div>
      </div>
    </div>
  )
}

function RegistryOnly({ nct }: { nct: string }) {
  const s = useRegistry(nct)
  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/trials">Clinical trial</Link><span className="chip warn">Registry data only</span></div>
        <h1>{s.status === 'ok' ? s.data.acronym || nct : nct}</h1>
        {s.status === 'ok' && <p className="lede">{s.data.title}</p>}
        {s.status !== 'error' && <div className="ent-meta"><span className="xsmall muted">PharmAtlas has not curated this trial. The details below come straight from ClinicalTrials.gov and have not been checked or interpreted. Drugs that are in the atlas are linked.</span></div>}
      </header>
      <div className="stack">
        <LiveRegistry nct={nct} />
        {s.status === 'ok' && (
          <>
            <Facts items={[
              ['Sponsor', s.data.sponsor ?? '—'],
              ['Phase', s.data.phases.map((p) => p.replace(/^PHASE(\d)/, 'Phase $1').replace('EARLY_PHASE1', 'Early Phase 1').replace('NA', 'Not applicable')).join(', ') || '—'],
              ['Conditions', s.data.conditions.join(', ') || '—'],
              ['Interventions', <>{s.data.interventions.map((name, i) => {
                const hit = search(name, 1).find((h) => h.kind === 'drug' && h.score >= 50)
                return <span key={name}>{i > 0 && ', '}{hit ? <Link to={hit.href}>{name}</Link> : name}</span>
              })}{s.data.interventions.length === 0 && '—'}</>],
            ]} />
            {s.data.briefSummary && <div><h2 style={{ marginBottom: 8 }}>Registry summary</h2><p className="prose" style={{ whiteSpace: 'pre-line' }}>{s.data.briefSummary}</p></div>}
          </>
        )}
      </div>
    </article>
  )
}

export function TrialPage() {
  const { nct = '' } = useParams()
  const key = nct.toUpperCase()
  const t = trials[key]
  if (!t) {
    if (nctPattern.test(key)) return <RegistryOnly nct={key} />
    return <div className="empty-state"><h3>“{nct}” is not a trial identifier</h3><p>Trial pages use NCT numbers, e.g. NCT04184622.</p></div>
  }

  const primary = t.results.filter((r) => r.kind === 'primary')
  const other = t.results.filter((r) => r.kind !== 'primary')
  const prior = trialList.filter((x) => x.nct !== t.nct && x.diseaseId === t.diseaseId && (x.drugIds.some((d) => t.drugIds.includes(d)) || x.design.comparatorType === t.design.comparatorType)).slice(0, 5)
  const companyOnly = t.results.length > 0 && t.results.every((r) => r.sourceIds.every((s) => sources[s]?.type === 'company'))

  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/trials">Clinical trial</Link><span className="faint">{t.nct}</span></div>
        <h1>{t.name}</h1>
        <p className="lede">{t.title}</p>
        <div className="ent-meta">
          <span className="chip neutral">{t.phase}</span>
          <span className={`chip ${t.evidenceStatus === 'published' ? 'approved' : t.evidenceStatus === 'topline reported' ? 'warn' : 'neutral'}`}>{t.evidenceStatus}</span>
          <span className="chip outline">{t.design.comparatorType === 'active' ? 'Active comparator' : t.design.comparatorType === 'placebo' ? 'Placebo-controlled' : 'Uncontrolled'}</span>
          <span className="xsmall muted">Sponsor <EntityLink kind="company" id={t.sponsor} /></span>
          <EntityActions kind="trial" id={t.nct} />
        </div>
        <div className="ent-meta" style={{ marginTop: 10 }}><Verified date={t.verified} /></div>
      </header>

      <div className="layout">
        <div className="stack-l">
          <SubNav items={[['summary', 'Summary'], ['design', 'Design'], ['results', 'Results'], ['safety', 'Safety'], ['history', 'Status history'], ['sources', 'Original evidence']]} />

          <section id="summary" className="section stack">
            <div className="layer-tag">Layer 1 of 3</div>
            <h2 style={{ marginTop: 2 }}>What was studied, what happened</h2>
            <Headline t={t} />
            {companyOnly && <div className="callout"><strong>Company-reported results.</strong> These figures come from a sponsor press release and have not been peer reviewed. Full methods, estimands and safety detail may change the picture.</div>}
            {t.evidenceStatus === 'completed — results not captured' && <div className="callout info"><strong>Results not captured.</strong> This trial is complete, but PharmAtlas has not yet abstracted its results. Missing results are not evidence that the treatment failed.</div>}
            {t.summary && (
              <div className="stack-s">
                <p className="prose"><strong>Studied.</strong> {t.summary.studied}</p>
                <p className="prose"><strong>Found.</strong> {t.summary.happened}</p>
                {t.summary.limitations.length > 0 && (
                  <div><h3 style={{ margin: '12px 0 6px' }}>Main limitations</h3><ul className="small">{t.summary.limitations.map((l) => <li key={l}>{l}</li>)}</ul></div>
                )}
              </div>
            )}
          </section>

          <section id="design" className="section stack">
            <h2>Design and population</h2>
            <Facts
              items={[
                ['Design', `${t.design.randomized ? 'Randomized' : 'Non-randomized'}, ${t.design.blinding.toLowerCase()}`],
                ['Arms', t.design.arms.join('; ')],
                ['Comparator', t.design.comparator],
                ['Enrollment', t.population.enrollment.toLocaleString()],
                ['Eligibility', t.population.eligibility],
                ...(t.population.baseline ? [['Baseline', t.population.baseline] as [string, string]] : []),
                ['Treatment', `${t.treatment.route}. ${t.treatment.regimen}`],
                ['Duration', t.treatment.duration],
              ]}
            />
            <div className="two-col" style={{ gap: 24 }}>
              <div><h3 style={{ marginBottom: 6 }}>Primary endpoints</h3><ul className="small">{t.endpoints.primary.map((e) => <li key={e}>{e}</li>)}</ul></div>
              {t.endpoints.secondary.length > 0 && <div><h3 style={{ marginBottom: 6 }}>Key secondary endpoints</h3><ul className="small">{t.endpoints.secondary.map((e) => <li key={e}>{e}</li>)}</ul></div>}
            </div>
          </section>

          <section id="results" className="section stack layer">
            <div className="layer-tag">Layer 2 of 3</div>
            <h2 style={{ marginTop: 2 }}>Detailed results</h2>
            {t.results.length === 0 && <p className="muted">No arm-level results are recorded in PharmAtlas for this trial. {t.evidenceStatus === 'ongoing' || t.evidenceStatus === 'recruiting' ? 'The trial is still running.' : 'Check the original sources below.'}</p>}
            {primary.map((r, i) => <div className="panel" key={i}><ResultChart r={r} /></div>)}
            {other.length > 0 && <>
              <h3>Secondary and other analyses</h3>
              <p className="xsmall faint" style={{ marginTop: 4 }}>Not the prespecified primary analysis. Read these as supportive evidence, not as confirmation.</p>
              {other.map((r, i) => <div className="panel" key={i}><ResultChart r={r} /></div>)}
            </>}
          </section>

          <section id="safety" className="section stack">
            <h2>Safety</h2>
            {!t.safety ? <p className="muted">Safety data not yet abstracted. See the original publication.</p> : (
              <>
                {t.safety.discontinuationAE.length > 0 && (
                  <div className="table-wrap" style={{ maxWidth: 520 }}>
                    <table>
                      <thead><tr><th>Arm</th><th>Discontinued due to adverse events</th></tr></thead>
                      <tbody>{t.safety.discontinuationAE.map((d) => <tr key={d.arm}><td>{d.arm}</td><td>{d.value}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
                <p className="small"><strong>Common adverse events.</strong> {t.safety.common}<Cite ids={t.safety.sourceIds} /></p>
                {t.safety.serious && <p className="small"><strong>Serious or notable.</strong> {t.safety.serious}</p>}
              </>
            )}
            {t.terminationReason && <div className="callout"><strong>Terminated.</strong> {t.terminationReason}</div>}
          </section>

          <section id="ask" className="section">
            <AskPanel title={`Ask about ${t.name}`} scope={{ kind: 'trial', id: t.nct }} buildContext={() => trialContext(t)} suggestions={[
              `What did ${t.name} actually show, in plain language?`,
              `What are the most important limitations of ${t.name}?`,
              'How should I interpret the primary endpoint and its effect size?',
            ]} />
          </section>

          <section id="history" className="section stack">
            <h2>Status history</h2>
            <LiveRegistry nct={t.nct} curated={t} />
            <ol className="timeline">
              {t.statusHistory.map((h) => <li key={h.date + h.status}><div className="when">{h.date}</div><div className="small">{h.status}</div></li>)}
            </ol>
          </section>

          {prior.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>Related studies</h2>
                <Link className="btn small" to={`/compare?d=${[...new Set([...t.drugIds, ...prior.flatMap((p) => p.drugIds)])].slice(0, 3).join(',')}&mode=clinical`}>Compare these drugs</Link>
              </div>
              <ul className="linklist">
                {prior.map((p) => <li key={p.nct}><Link to={hrefFor('trial', p.nct)}><span>{p.name}</span><span className="rel">{p.design.comparator}, {p.treatment.duration}</span></Link></li>)}
              </ul>
            </section>
          )}

          <section id="sources" className="section layer stack">
            <div className="layer-tag">Layer 3 of 3</div>
            <h2 style={{ marginTop: 2 }}>Original evidence</h2>
            <SourceList ids={t.sourceIds} />
          </section>
        </div>
        <aside className="rail">
          <ConnectedRail kind="trial" id={t.nct} />
          <NotesPanel kind="trial" id={t.nct} />
        </aside>
      </div>
    </article>
  )
}
