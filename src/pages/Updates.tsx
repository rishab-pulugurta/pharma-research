import { Link, useSearchParams } from 'react-router-dom'
import { Cite } from '../components/bits'
import { updates } from '../data/updates'
import type { Update } from '../data/types'
import { entityName, hrefFor } from '../lib/graph'
import { isWatched, useStore } from '../lib/store'
import { plural } from '../lib/format'

const kinds: [Update['kind'], string][] = [['results', 'Results'], ['publication', 'Publications'], ['regulatory', 'Regulatory'], ['discontinuation', 'Discontinuations'], ['deal', 'Deals'], ['registration', 'New trials']]

export function UpdateFeed({ items }: { items: Update[] }) {
  if (!items.length) return <div className="empty-state"><h3>Nothing here yet</h3><p>Follow a drug, company, disease or trial to see its developments in your feed.</p></div>
  return (
    <ul className="feed">
      {items.map((u) => (
        <li key={u.id}>
          <span className="date">{u.date}</span>
          <div className="stack-s">
            <div className="row" style={{ gap: 8 }}>
              <span className="chip neutral">{kinds.find(([k]) => k === u.kind)?.[1]}</span>
              <h3>{u.title}</h3>
            </div>
            <p className="small"><strong>What changed.</strong> {u.what}<Cite ids={u.sourceIds} /></p>
            <p className="small"><strong>Why it matters.</strong> {u.why}</p>
            <div className="chips">
              <span className="xsmall faint">Affects</span>
              {u.entities.map((e) => <Link key={e.kind + e.id} className="chip outline" to={hrefFor(e.kind, e.id)}>{entityName(e.kind, e.id)}</Link>)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Updates() {
  const [params, setParams] = useSearchParams()
  const s = useStore()
  const kind = params.get('kind') ?? ''
  const mine = params.get('mine') === '1'
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p) }
  const items = updates.filter((u) => (!kind || u.kind === kind) && (!mine || u.entities.some((e) => isWatched(s, e))))
  return (
    <div>
      <header className="ent-head">
        <div className="ent-kind">Development feed</div>
        <h1>What changed, and why it matters</h1>
        <p className="lede">Results, publications, regulatory decisions and discontinuations across the atlas, each linked to the entities it affects.</p>
      </header>
      <div className="filters">
        <label className="field">Type
          <select value={kind} onChange={(e) => set('kind', e.target.value)}>
            <option value="">All</option>
            {kinds.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className="row small" style={{ gap: 6, alignSelf: 'center' }}>
          <input type="checkbox" checked={mine} onChange={(e) => set('mine', e.target.checked ? '1' : '')} />
          Only what I follow ({s.watch.length})
        </label>
        <span className="count">{plural(items.length, 'update')}</span>
      </div>
      <UpdateFeed items={items} />
    </div>
  )
}
