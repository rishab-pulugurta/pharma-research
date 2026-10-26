import { Link, useParams } from 'react-router-dom'
import { ConfidenceLegend, ConfidenceTag, ConnectedRail, EntityActions, NotFound, SourceList } from '../components/bits'
import { drugsForTarget, hrefFor, pathways, targets } from '../lib/graph'

export function PathwayPage() {
  const { id = '' } = useParams()
  const p = pathways[id]
  if (!p) return <NotFound what={`“${id}”`} />
  const ds = [...new Map(p.targetIds.flatMap((t) => drugsForTarget(t)).map((d) => [d.id, d])).values()]
  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/pathways">Pathway</Link></div>
        <h1>{p.name}</h1>
        <p className="lede">{p.summary}</p>
        <div className="ent-meta">
          {p.targetIds.map((t) => <Link key={t} className="chip active" to={hrefFor('target', t)}>{targets[t].symbol}</Link>)}
          <EntityActions kind="pathway" id={p.id} />
        </div>
      </header>
      <div className="layout">
        <div className="stack-l">
          <section className="section stack">
            <div className="section-head"><h2>Step by step</h2><ConfidenceLegend /></div>
            <ol className="timeline">
              {p.steps.map((s) => (
                <li key={s.label}>
                  <h3 style={{ fontSize: '1rem' }}>{s.label}</h3>
                  <p className="small" style={{ margin: '2px 0 4px' }}>{s.detail}</p>
                  <ConfidenceTag c={s.confidence} />
                </li>
              ))}
            </ol>
            <div className="callout">{p.caveat}</div>
          </section>
          <section className="section">
            <h2>Drugs that act on this pathway</h2>
            <ul className="linklist">
              {ds.map((d) => <li key={d.id}><Link to={hrefFor('drug', d.id)}><span>{d.name}</span><span className="rel">{d.targets.map((t) => targets[t.targetId].symbol).join(' + ')}</span></Link></li>)}
            </ul>
          </section>
        </div>
        <aside className="rail">
          <ConnectedRail kind="pathway" id={p.id} />
          <div><h3>Sources</h3><SourceList ids={p.sourceIds} /></div>
        </aside>
      </div>
    </article>
  )
}
