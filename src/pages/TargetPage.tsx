import { Link, useParams } from 'react-router-dom'
import { ConfidenceTag, ConnectedRail, EntityActions, Facts, NotFound, NotesPanel, SourceList, StatusChip, SubNav } from '../components/bits'
import { diseasesForTarget, drugsForTarget, hrefFor, leadPhase, pathwaysForTarget, phaseRank, targets } from '../lib/graph'
import { AskPanel } from '../components/AskPanel'
import { targetContext } from '../lib/context'

export function TargetPage() {
  const { id = '' } = useParams()
  const t = targets[id]
  if (!t) return <NotFound what={`“${id}”`} />
  const ds = drugsForTarget(t.id).sort((a, b) => phaseRank(leadPhase(b)) - phaseRank(leadPhase(a)))
  const byAction = new Map<string, typeof ds>()
  ds.forEach((d) => {
    const a = d.targets.find((x) => x.targetId === t.id)!.action.split(' (')[0]
    byAction.set(a, [...(byAction.get(a) ?? []), d])
  })
  const modalities = [...new Set(ds.map((d) => d.modality))]
  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/targets">Target</Link></div>
        <h1>{t.symbol}</h1>
        <p className="lede">{t.name}. {t.summary}</p>
        <div className="ent-meta">
          <span className="chip neutral">{t.family}</span>
          <span className="chip neutral">Gene {t.gene}</span>
          <span className="chip active">{ds.length} drugs in atlas</span>
          <EntityActions kind="target" id={t.id} />
        </div>
      </header>
      <div className="layout">
        <div className="stack-l">
          <SubNav items={[['biology', 'Biology'], ['rationale', 'Why target it'], ['drugs', 'Drugs'], ['approaches', 'Approaches compared']]} />
          <section id="biology" className="section stack">
            <h2>Biology</h2>
            <p className="prose">{t.biology}</p>
            <Facts items={[['Where it is expressed', t.tissues.join(', ')], ['Pathways', pathwaysForTarget(t.id).length ? <>{pathwaysForTarget(t.id).map((p) => <Link key={p.id} to={hrefFor('pathway', p.id)}>{p.name}</Link>)}</> : 'Not mapped yet'], ['Diseases', diseasesForTarget(t.id).map((d) => d.name).join(', ')]]} />
          </section>
          <section id="rationale" className="section stack">
            <h2>Why target it</h2>
            <p className="prose">{t.whyTarget}</p>
            {t.geneticEvidence && <div className="callout good"><strong>Human genetic evidence.</strong> {t.geneticEvidence}</div>}
            <div><h3 style={{ marginBottom: 6 }}>Tradeoffs and open questions</h3><ul className="small">{t.tradeoffs.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </section>
          <section id="ask" className="section">
            <AskPanel title={`Ask about ${t.symbol}`} scope={{ kind: 'target', id: t.id }} buildContext={() => targetContext(t)} suggestions={[
              `Explain ${t.symbol} biology like I'm a first-year medical student.`,
              `Why do different drugs act on ${t.symbol} in different ways (agonist, antagonist, silencing, editing)?`,
              `What are the safety risks of targeting ${t.symbol}?`,
            ]} />
          </section>

          <section id="drugs" className="section stack">
            <h2>Drugs acting on {t.symbol}</h2>
            {[...byAction.entries()].map(([action, list]) => (
              <div key={action}>
                <h3 style={{ marginBottom: 6 }}>{action}s</h3>
                <div className="table-wrap">
                  <table>
                    <tbody>
                      {list.map((d) => {
                        const link = d.targets.find((x) => x.targetId === t.id)!
                        return (
                          <tr key={d.id}>
                            <td style={{ width: '26%' }}><Link to={hrefFor('drug', d.id)}>{d.name}</Link><div className="xsmall faint">{d.modality}</div></td>
                            <td className="small">{d.targets.length > 1 ? `Also ${d.targets.filter((x) => x.targetId !== t.id).map((x) => targets[x.targetId].symbol).join(', ')}` : 'Selective'}</td>
                            <td className="small">{leadPhase(d)}</td>
                            <td><StatusChip status={d.status} scope={d.approvalScope} /></td>
                            <td><ConfidenceTag c={link.confidence} /></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
          {modalities.length > 1 && (
            <section id="approaches" className="section stack">
              <h2>Approaches compared</h2>
              <p className="muted">{modalities.length} different modalities reach {t.symbol}. Compare their mechanisms, dosing and evidence side by side.</p>
              <div><Link className="btn primary" to={`/compare?d=${ds.map((d) => d.id).slice(0, 4).join(',')}&mode=mechanism`}>Compare {ds.slice(0, 4).map((d) => d.name).join(', ')}</Link></div>
            </section>
          )}
        </div>
        <aside className="rail">
          <ConnectedRail kind="target" id={t.id} />
          <NotesPanel kind="target" id={t.id} />
          <div><h3>Sources</h3><SourceList ids={t.sourceIds} /></div>
        </aside>
      </div>
    </article>
  )
}
