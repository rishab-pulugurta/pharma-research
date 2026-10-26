import { Link, useSearchParams } from 'react-router-dom'
import { RelationMap } from '../components/RelationMap'
import type { EntityKind } from '../data/types'
import { entityExists, entityName, hrefFor, kindLabel, neighbors } from '../lib/graph'

const starts: [EntityKind, string][] = [['disease', 'obesity'], ['target', 'pcsk9'], ['company', 'lilly'], ['drug', 'retatrutide'], ['target', 'gipr'], ['disease', 'mash']]

export function MapPage() {
  const [params] = useSearchParams()
  const raw = params.get('focus')
  const [k, id] = (raw ?? 'disease:obesity').split(':') as [EntityKind, string]
  const ok = entityExists(k, id)
  const kind = ok ? k : 'disease'
  const focus = ok ? id : 'obesity'
  const ns = neighbors(kind, focus)
  return (
    <div>
      {raw && !ok && (
        <div className="callout" style={{ marginBottom: 20 }} role="status">
          <strong>“{raw}” isn’t in the atlas.</strong> Showing obesity instead. Map links look like <code>?focus=drug:retatrutide</code>.
        </div>
      )}
      <header className="ent-head">
        <div className="ent-kind">Relationship map</div>
        <h1>{entityName(kind, focus)}</h1>
        <p className="lede">Everything one step from this {kindLabel[kind].toLowerCase()}. Select any node to move the map to it.</p>
        <div className="ent-meta">
          <Link className="btn" to={hrefFor(kind, focus)}>Open the {kindLabel[kind].toLowerCase()} profile</Link>
          <div className="try" style={{ marginTop: 0 }}>Jump to {starts.map(([sk, sid]) => <Link key={sid} to={`/map?focus=${sk}:${sid}`}>{entityName(sk, sid)}</Link>)}</div>
        </div>
      </header>
      <div className="layout">
        <RelationMap kind={kind} id={focus} />
        <aside className="rail">
          <div>
            <h3>{ns.length} connections</h3>
            <ul className="linklist">
              {ns.map((n) => <li key={n.kind + n.id}><Link to={`/map?focus=${n.kind}:${n.id}`}><span>{entityName(n.kind, n.id)}</span><span className="rel">{kindLabel[n.kind]}, {n.relation}</span></Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
