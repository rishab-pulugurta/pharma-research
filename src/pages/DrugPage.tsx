import { Link, useParams } from 'react-router-dom'
import {
  Cite, ConfidenceTag, ConnectedRail, EntityActions, EntityLink, Facts, NotFound, NotesPanel, SourceList, StatusChip, SubNav, Verified,
} from '../components/bits'
import { MechanismExplorer, MechanismWalkthrough } from '../components/MechanismExplorer'
import { RegTimeline, regChipClass } from '../components/RegTimeline'
import { Structure } from '../components/Structure'
import { companies, drugs, entityName, hrefFor, leadPhase, relatedDrugs, targets, trialsForDrug } from '../lib/graph'
import { fmtVal, lowerFirst } from '../lib/format'
import { AskPanel } from '../components/AskPanel'
import { drugContext } from '../lib/context'

export function DrugPage() {
  const { id = '' } = useParams()
  const d = drugs[id]
  if (!d) return <NotFound what={`“${id}”`} />
  const trials = trialsForDrug(d.id)
  const related = relatedDrugs(d)
  const allSources = [...d.sourceIds, ...d.programs.flatMap((p) => p.latest.sourceIds), ...d.regulatory.flatMap((r) => r.sourceIds), ...trials.flatMap((t) => t.sourceIds)]

  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/drugs">Drug</Link></div>
        <h1>{d.name}</h1>
        <p className="lede">{d.oneLiner}</p>
        <div className="ent-meta">
          <StatusChip status={d.status} scope={d.approvalScope} />
          <span className="chip neutral">{d.modality}</span>
          {d.status !== 'approved' && <span className="chip neutral">{leadPhase(d)}</span>}
          {d.aliases.length > 0 && <span className="xsmall muted">Also known as {d.aliases.join(', ')}</span>}
          <EntityActions kind="drug" id={d.id} />
        </div>
        <div className="ent-meta" style={{ marginTop: 10 }}>
          <Verified date={d.verified} />
          {d.status === 'investigational' && <span className="xsmall" style={{ color: 'var(--s-warn)' }}>Investigational: not approved for any use. Efficacy and safety are still being established.</span>}
        </div>
      </header>

      <SubNav items={[['mechanism', 'Mechanism'], ['ask', 'Ask'], ['overview', 'Overview'], ['pipeline', 'Indications'], ['evidence', 'Clinical evidence'], ['regulatory', 'Regulatory'], ['related', 'Related drugs']]} />
      <section id="mechanism" className="section stack" style={{ marginBottom: 48 }}>
        <div className="section-head">
          <h2>How it works</h2>
          <span className="xsmall faint">Switch the depth, then select a node</span>
        </div>
        <MechanismExplorer drug={d} />
        <details className="walk-wrap" open>
          <summary><h3 style={{ display: 'inline' }}>Step-by-step walkthrough</h3> <span className="xsmall faint">every step in the map, explained in order</span></summary>
          <MechanismWalkthrough drug={d} />
        </details>
        <div className="two-col" style={{ gap: 24 }}>
          <div>
            <h3 style={{ marginBottom: 8 }}>Target engagement</h3>
            <ul className="linklist">
              {d.targets.map((t) => (
                <li key={t.targetId}>
                  <Link to={hrefFor('target', t.targetId)}><span>{targets[t.targetId].symbol}, {lowerFirst(t.action)}</span><ConfidenceTag c={t.confidence} /></Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ marginBottom: 8 }}>Biological tradeoffs and open questions</h3>
            <ul className="small">{d.tradeoffs.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="ask" className="section" style={{ marginBottom: 48 }}>
        <AskPanel title={`Ask about ${d.name}`} scope={{ kind: 'drug', id: d.id }} buildContext={() => drugContext(d)} suggestions={[
          `Explain how ${d.name} works, step by step, from receptor to body.`,
          `What are the main side effects of ${d.name}, and why does the mechanism cause them?`,
          `How does ${d.name} compare with its closest competitors, and what does the evidence actually support?`,
        ]} />
      </section>

      <div className="layout">
        <div className="stack-l">

          <section id="overview" className="section stack">
            <h2>Overview</h2>
            <div className="two-col" style={{ gap: 24 }}>
              <Facts
                items={[
                  ['What it is', d.modality],
                  ['Developer', <EntityLink kind="company" id={d.owner} />],
                  ['Originator', d.originator === d.owner ? 'Same as developer' : <EntityLink kind="company" id={d.originator} />],
                  ['Route & dosing', `${d.route}. ${d.dosing}`],
                  ['Targets', <>{d.targets.map((t, i) => <span key={t.targetId}>{i > 0 && ', '}<EntityLink kind="target" id={t.targetId}>{targets[t.targetId].symbol}</EntityLink> ({lowerFirst(t.action)})</span>)}</>],
                  ['Being studied for', [...new Set(d.programs.map((p) => entityName('disease', p.diseaseId)))].join(', ')],
                ]}
              />
              <Structure drug={d} />
            </div>
          </section>


          <section id="pipeline" className="section">
            <h2>Indications and development status</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Indication</th><th>Phase</th><th>Status</th><th>Latest development</th></tr></thead>
                <tbody>
                  {d.programs.map((p) => (
                    <tr key={p.indication}>
                      <td><EntityLink kind="disease" id={p.diseaseId}>{p.indication}</EntityLink>{companies[p.company] && p.company !== d.owner && <div className="xsmall faint">Run by {companies[p.company].name}</div>}</td>
                      <td className="small" style={{ whiteSpace: 'nowrap' }}>{p.phase}</td>
                      <td><StatusChip status={p.status} /></td>
                      <td className="small"><span className="faint">{p.latest.date}</span> {p.latest.text}<Cite ids={p.latest.sourceIds} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="evidence" className="section">
            <h2>Clinical evidence</h2>
            {trials.length === 0 ? (
              <p className="muted">No trials for this drug have been curated yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Trial</th><th>Design</th><th>Headline result</th><th>Evidence</th></tr></thead>
                  <tbody>
                    {trials.map((t) => {
                      const r = t.results.find((x) => x.kind === 'primary')
                      const best = r && [...r.arms].filter((a) => !a.isComparator).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0]
                      const cmp = r?.arms.find((a) => a.isComparator)
                      return (
                        <tr key={t.nct}>
                          <td><Link to={hrefFor('trial', t.nct)}>{t.name}</Link><div className="xsmall faint">{t.nct}, {t.phase}</div></td>
                          <td className="small">{t.population.enrollment.toLocaleString()} participants, {t.treatment.duration}<div className="xsmall faint">vs {lowerFirst(t.design.comparator)}</div></td>
                          <td className="small">
                            {r && best ? <>{r.endpoint} <span className="faint">({lowerFirst(r.timepoint)}, primary)</span>: <strong>{fmtVal(best.value, r.unit, best.value < 0)}</strong> ({best.arm}){cmp && <> vs {fmtVal(cmp.value, r.unit, best.value < 0)} ({lowerFirst(cmp.arm)})</>}</> : <span className="faint">{t.evidenceStatus === 'completed — results not captured' ? 'Results not yet captured (not the same as negative)' : t.summary?.happened ?? 'No results reported'}</span>}
                          </td>
                          <td><span className={`chip ${t.evidenceStatus === 'published' ? 'approved' : t.evidenceStatus === 'topline reported' ? 'warn' : 'neutral'}`}>{t.evidenceStatus}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="xsmall faint" style={{ marginTop: 8 }}>Headline values come from different trials with different populations, durations and estimands, so do not rank them against each other. Open the comparison workspace to see the caveats side by side.</p>
          </section>

          <section id="regulatory" className="section stack">
            <h2>Regulatory status</h2>
            {d.regulatory.length === 0 && <p className="muted">No regulatory submissions are recorded. {d.status === 'discontinued' ? 'Development was discontinued before filing.' : 'The drug remains investigational.'}</p>}
            {d.regulatory.map((r) => (
              <div key={r.jurisdiction + r.indication} className="panel stack">
                <div className="spread">
                  <h3>{r.jurisdiction}: {r.indication}</h3>
                  <span className={`chip ${regChipClass(r.status)}`}>{r.status}{r.brand ? ` as ${r.brand}` : ''}</span>
                </div>
                <Facts items={[['Eligible population', r.population], ['Pathway', r.pathway ?? 'Not applicable'], ['Decision date', r.date ?? 'Pending']]} />
                {r.warnings.length > 0 && (
                  <div>
                    <div className="xsmall faint" style={{ marginBottom: 4 }}>Key warnings and restrictions</div>
                    <ul className="small">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                  </div>
                )}
                <RegTimeline rec={r} />
                <div className="xsmall">Source <Cite ids={r.sourceIds} /></div>
              </div>
            ))}
          </section>

          <section id="related" className="section">
            <div className="section-head">
              <h2>Related and competing drugs</h2>
              {related.length > 0 && <Link className="btn small" to={`/compare?d=${[d.id, ...related.slice(0, 2).map((r) => r.drug.id)].join(',')}&mode=clinical`}>Compare the top three</Link>}
            </div>
            <ul className="linklist">
              {related.map((r) => (
                <li key={r.drug.id}>
                  <Link to={hrefFor('drug', r.drug.id)}>
                    <span><strong>{r.drug.name}</strong> <span className="xsmall faint">{r.drug.status === 'discontinued' ? 'discontinued' : leadPhase(r.drug)}</span></span>
                    <span className="rel">{r.reasons.join('; ')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="rail">
          <ConnectedRail kind="drug" id={d.id} />
          <NotesPanel kind="drug" id={d.id} />
          <div id="sources">
            <h3>Sources</h3>
            <SourceList ids={allSources} />
          </div>
        </aside>
      </div>
    </article>
  )
}
