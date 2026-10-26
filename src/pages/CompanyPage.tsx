import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Cite, ConnectedRail, EntityActions, Facts, NotFound, NotesPanel, SourceList, StatusChip, SubNav, Verified } from '../components/bits'
import { PipelineChart } from '../components/PipelineChart'
import { FdaProducts, LivePipeline, useFdaProducts } from '../components/LiveCompany'
import { AskPanel } from '../components/AskPanel'
import { companyContext } from '../lib/context'
import {
  companies, companyList, diseases, drugList, entityName, hrefFor, phaseOrder, phaseRank, programsForCompany, targets, trialsForCompany,
} from '../lib/graph'

function brandLink(product: string) {
  const d = drugList.find((x) => x.brands.some((b) => product.startsWith(b)))
  return d ? <Link to={hrefFor('drug', d.id)}>{product}</Link> : <span>{product}</span>
}

function summarize(cid: string) {
  const rows = programsForCompany(cid).filter((r) => r.role === 'Developer')
  return {
    rows,
    byPhase: phaseOrder.map((p) => rows.filter((r) => r.program.phase === p && r.program.status !== 'discontinued').length),
    discontinued: rows.filter((r) => r.program.status === 'discontinued').length,
    diseases: [...new Set(rows.map((r) => r.program.diseaseId))],
    targets: [...new Set(rows.flatMap((r) => r.drug.targets.map((t) => t.targetId)))],
  }
}

export function CompanyPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [sort, setSort] = useState<'stage' | 'recent'>('stage')
  const c = companies[id]
  const fdaState = useFdaProducts(c?.fda ?? [])
  if (!c) return <NotFound what={`“${id}”`} />
  const ownGenerics = new Set(fdaState.status === 'ok' ? fdaState.data.flatMap((p) => p.generic.split(' + ').map((g) => g.split(' ')[0])) : [])
  for (const lp of c.leadPrograms ?? []) ownGenerics.add(lp.name.toLowerCase().split(/[\s(]/)[0])

  const all = programsForCompany(c.id)
  const f = Object.fromEntries(params)
  const setF = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p)
  }
  const rows = all
    .filter((r) =>
      (!f.disease || r.program.diseaseId === f.disease) &&
      (!f.phase || r.program.phase === f.phase) &&
      (!f.modality || r.drug.modality === f.modality) &&
      (!f.status || r.program.status === f.status) &&
      (!f.target || r.drug.targets.some((t) => t.targetId === f.target)),
    )
    .sort((a, b) => (sort === 'stage' ? phaseRank(b.program.phase) - phaseRank(a.program.phase) : b.program.latest.date.localeCompare(a.program.latest.date)))

  const opt = <T extends string>(vals: T[], label: (v: T) => string) => vals.map((v) => <option key={v} value={v}>{label(v)}</option>)
  const vs = f.vs && companies[f.vs] ? f.vs : ''
  const trials = trialsForCompany(c.id)

  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/companies">Company</Link></div>
        <h1>{c.name}</h1>
        <p className="lede">{c.summary}</p>
        <div className="ent-meta">
          {c.focus.map((x) => <span key={x} className="chip neutral">{x}</span>)}
          <EntityActions kind="company" id={c.id} />
        </div>
        <div className="ent-meta" style={{ marginTop: 10 }}><Verified date={c.verified} /></div>
      </header>

      <div className="layout">
        <div className="stack-l">
          <SubNav items={[['profile', 'Profile'], ['ask', 'Ask'], ['live-pipeline', 'Active pipeline'], ['approved', 'FDA approvals'], ...(all.length ? [['pipeline', 'In-depth programs'], ['compare', 'Compare pipelines']] as [string, string][] : []), ...(trials.length ? [['trials', 'Curated trials']] as [string, string][] : [])]} />
          <section id="profile" className="section stack">
            <h2>Profile</h2>
            <Facts items={[
              ['Headquarters', c.hq],
              ['Company type', c.type],
              ['Ownership', [c.ownership, c.ticker].filter(Boolean).join(', ') || '—'],
              ...(c.founded ? [['Founded', c.founded] as [string, string]] : []),
              ...(c.platform ? [['Platform', c.platform] as [string, string]] : []),
              ...(c.funding ? [['Notable financing', <>{c.funding}<Cite ids={c.sourceIds} /></>] as [string, React.ReactNode]] : []),
              ['Key marketed products', c.marketed.length ? <>{c.marketed.map((m, i) => <span key={m}>{i > 0 && ', '}{brandLink(m)}</span>)}</> : 'None listed; see FDA approvals below'],
              ...(c.website ? [['Website', <a href={c.website} target="_blank" rel="noreferrer">{c.website.replace(/^https?:\/\/(www\.)?/, '')}</a>] as [string, React.ReactNode]] : []),
            ]} />
            {c.leadPrograms && c.leadPrograms.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 8 }}>Notable programs</h3>
                <div className="table-wrap">
                  <table>
                    <tbody>
                      {c.leadPrograms.map((lp) => (
                        <tr key={lp.name}><td style={{ width: '28%' }}><strong>{lp.name}</strong></td><td className="small">{lp.what}</td><td className="small" style={{ whiteSpace: 'nowrap' }}>{lp.stage}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="xsmall faint" style={{ marginTop: 6 }}>Highlights from the company profile. The live pipeline below is the complete, current registry view.</p>
              </div>
            )}
            {c.note && <div className="callout info small">{c.note}</div>}
            {c.partnerships.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 8 }}>Partnerships and deals</h3>
                <ul className="small">
                  {c.partnerships.map((p) => (
                    <li key={p.partner}>
                      <strong>{companyList.find((x) => x.name.startsWith(p.partner)) ? <Link to={hrefFor('company', companyList.find((x) => x.name.startsWith(p.partner))!.id)}>{p.partner}</Link> : p.partner}</strong>: {p.detail}
                      {p.sourceIds && <Cite ids={p.sourceIds} />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section id="ask" className="section">
            <AskPanel title={`Ask about ${c.name}`} scope={{ kind: 'company', id: c.id }} buildContext={() => companyContext(c)} suggestions={[
              `What is ${c.name}'s most important late-stage program, and how does it work?`,
              ...(c.leadPrograms?.[0] ? [`Explain the mechanism of ${c.leadPrograms[0].name} step by step.`] : []),
              `What are the biggest risks in ${c.name}'s pipeline right now?`,
            ]} />
          </section>

          <section id="live-pipeline" className="section">
            <div className="section-head"><h2>Active pipeline</h2><span className="chip outline">Live from ClinicalTrials.gov</span></div>
            <LivePipeline registry={c.registry ?? []} ownGenerics={ownGenerics} />
          </section>

          <section id="approved" className="section">
            <div className="section-head"><h2>FDA-approved products</h2><span className="chip outline">Live from Drugs@FDA</span></div>
            <FdaProducts fda={c.fda ?? []} note={c.note} />
          </section>

          {all.length > 0 && (
          <section id="pipeline" className="section">
            <div className="section-head">
              <h2>In-depth programs</h2>
              <div className="row">
                <div className="seg" role="group" aria-label="Pipeline view">
                  <button aria-pressed={view === 'chart'} onClick={() => setView('chart')}>Chart</button>
                  <button aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
                </div>
              </div>
            </div>
            <div className="filters">
              <label className="field">Disease<select value={f.disease ?? ''} onChange={(e) => setF('disease', e.target.value)}><option value="">All</option>{opt([...new Set(all.map((r) => r.program.diseaseId))], (v) => entityName('disease', v))}</select></label>
              <label className="field">Phase<select value={f.phase ?? ''} onChange={(e) => setF('phase', e.target.value)}><option value="">All</option>{opt(phaseOrder.filter((p) => all.some((r) => r.program.phase === p)), (v) => v)}</select></label>
              <label className="field">Modality<select value={f.modality ?? ''} onChange={(e) => setF('modality', e.target.value)}><option value="">All</option>{opt([...new Set(all.map((r) => r.drug.modality))], (v) => v)}</select></label>
              <label className="field">Target<select value={f.target ?? ''} onChange={(e) => setF('target', e.target.value)}><option value="">All</option>{opt([...new Set(all.flatMap((r) => r.drug.targets.map((t) => t.targetId)))], (v) => targets[v].symbol)}</select></label>
              <label className="field">Status<select value={f.status ?? ''} onChange={(e) => setF('status', e.target.value)}><option value="">All, including discontinued</option>{opt([...new Set(all.map((r) => r.program.status))], (v) => v[0].toUpperCase() + v.slice(1))}</select></label>
              <label className="field">Sort<select value={sort} onChange={(e) => setSort(e.target.value as 'stage' | 'recent')}><option value="stage">Development stage</option><option value="recent">Most recent development</option></select></label>
              <span className="count">{rows.length} of {all.length} programs</span>
            </div>
            {view === 'chart' ? (
              <PipelineChart rows={rows} />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Drug</th><th>Modality</th><th>Target</th><th>Indication</th><th>Phase</th><th>Status</th><th>Latest</th></tr></thead>
                  <tbody>
                    {rows.map(({ drug, program, role }) => (
                      <tr key={drug.id + program.indication}>
                        <td><Link to={hrefFor('drug', drug.id)}>{drug.name}</Link><div className="xsmall faint">{drug.aliases.slice(0, 2).join(', ')}{role !== 'Developer' && <><br />{role}</>}</div></td>
                        <td className="small">{drug.modality}</td>
                        <td className="small">{drug.targets.map((t) => targets[t.targetId].symbol).join(' + ')}</td>
                        <td className="small">{diseases[program.diseaseId] ? <Link to={hrefFor('disease', program.diseaseId)} style={{ fontWeight: 500 }}>{program.indication}</Link> : program.indication}</td>
                        <td className="small" style={{ whiteSpace: 'nowrap' }}>{program.phase}</td>
                        <td><StatusChip status={program.status} scope={drug.approvalScope} /></td>
                        <td className="xsmall"><span className="faint">{program.latest.date}</span> {program.latest.text}<Cite ids={program.latest.sourceIds} />{program.trialIds.length > 0 && <div style={{ marginTop: 4 }}>{program.trialIds.map((t) => <Link key={t} to={hrefFor('trial', t)} style={{ marginRight: 8 }}>{entityName('trial', t)}</Link>)}</div>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="xsmall faint" style={{ marginTop: 8 }}>Shows publicly disclosed programs in the atlas’s therapeutic scope. Bar length shows the furthest phase reached. Hatched bars are discontinued programs. Programs this company originated or partners on, but doesn’t run, are labeled.</p>
          </section>
          )}

          {all.length > 0 && (
          <section id="compare" className="section">
            <div className="section-head">
              <h2>Compare pipelines</h2>
              <label className="field" style={{ minWidth: 220 }}>
                Compare with
                <select value={vs} onChange={(e) => setF('vs', e.target.value)}>
                  <option value="">Choose a company</option>
                  {companyList.filter((x) => x.id !== c.id && programsForCompany(x.id).length > 0).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </label>
            </div>
            {!vs ? (
              <p className="muted small">Pick a company to compare active programs by phase, disease and target.</p>
            ) : (
              (() => {
                const a = summarize(c.id)
                const b = summarize(vs)
                const sharedTargets = a.targets.filter((t) => b.targets.includes(t))
                return (
                  <>
                  <p className="xsmall faint" style={{ marginBottom: 8 }}>Counts the active programs each company runs itself. Programs it only originated or licensed out are left out, so totals can differ from the pipeline chart above.</p>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th></th><th>{c.name}</th><th>{companies[vs].name}</th></tr></thead>
                      <tbody>
                        {phaseOrder.map((p, i) => (a.byPhase[i] || b.byPhase[i] ? <tr key={p}><td>{p}</td><td>{a.byPhase[i]}</td><td>{b.byPhase[i]}</td></tr> : null))}
                        <tr><td>Discontinued</td><td>{a.discontinued}</td><td>{b.discontinued}</td></tr>
                        <tr><td>Diseases</td><td className="small">{a.diseases.map((x) => entityName('disease', x)).join(', ') || '—'}</td><td className="small">{b.diseases.map((x) => entityName('disease', x)).join(', ') || '—'}</td></tr>
                        <tr><td>Targets</td><td className="small">{a.targets.map((x) => targets[x].symbol).join(', ') || '—'}</td><td className="small">{b.targets.map((x) => targets[x].symbol).join(', ') || '—'}</td></tr>
                        <tr><td>Overlap</td><td colSpan={2} className="small">{sharedTargets.length ? <>Both pursue {sharedTargets.map((t) => <Link key={t} to={hrefFor('target', t)} style={{ marginRight: 6 }}>{targets[t].symbol}</Link>)}</> : 'No shared targets in the atlas.'}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  </>
                )
              })()
            )}
          </section>
          )}

          {trials.length > 0 && (
          <section id="trials" className="section">
            <h2>Curated trials</h2>
            <ul className="linklist">
              {trials.map((t) => <li key={t.nct}><Link to={hrefFor('trial', t.nct)}><span>{t.name} <span className="xsmall faint">{t.nct}</span></span><span className="rel">{t.phase}, {t.evidenceStatus}</span></Link></li>)}
            </ul>
          </section>
          )}
        </div>
        <aside className="rail">
          <ConnectedRail kind="company" id={c.id} />
          <NotesPanel kind="company" id={c.id} />
          {[...c.sourceIds, ...c.partnerships.flatMap((p) => p.sourceIds ?? [])].length > 0 && <div><h3>Sources</h3><SourceList ids={[...c.sourceIds, ...c.partnerships.flatMap((p) => p.sourceIds ?? [])]} /></div>}
        </aside>
      </div>
    </article>
  )
}
