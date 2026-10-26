import { Link } from 'react-router-dom'
import type { EntityKind } from '../data/types'
import { entityName, kindLabel, neighbors } from '../lib/graph'

const order: EntityKind[] = ['disease', 'target', 'pathway', 'drug', 'company', 'trial']

/**
 * Radial map: the focus entity in the middle, first-degree neighbors on a ring grouped
 * by kind. Selecting a neighbor re-centers the map on it.
 */
export function RelationMap({ kind, id, size = 760 }: { kind: EntityKind; id: string; size?: number }) {
  const all = neighbors(kind, id).sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
  // Dense hubs: leave trials to the side list so the ring stays readable.
  const hidesTrials = all.length > 26 && all.some((n) => n.kind === 'trial')
  const ns = hidesTrials ? all.filter((n) => n.kind !== 'trial') : all
  const c = size / 2
  const R = size / 2 - 150
  const kinds = order.filter((k) => ns.some((n) => n.kind === k))
  const groupGap = ns.length > 1 ? 0.35 : 0
  const totalArc = Math.PI * 2 - groupGap * kinds.length
  const per = ns.length ? totalArc / ns.length : 0
  let angle = -Math.PI / 2
  let lastKind: EntityKind | null = null
  const placed = ns.map((n) => {
    if (lastKind && n.kind !== lastKind) angle += groupGap
    lastKind = n.kind
    const a = angle + per / 2
    angle += per
    return { ...n, a, x: c + R * Math.cos(a), y: c + R * Math.sin(a) }
  })

  return (
    <div className="map">
      <svg viewBox={`0 0 ${size} ${size}`} role="group" aria-label={`Relationship map centered on ${entityName(kind, id)}`}>
        <circle className="ring" cx={c} cy={c} r={R} />
        {placed.map((n) => <line key={`l-${n.kind}-${n.id}`} className="link" x1={c} y1={c} x2={n.x} y2={n.y} />)}
        {placed.map((n) => {
          const right = Math.cos(n.a) >= 0
          const label = entityName(n.kind, n.id)
          return (
            <g className="node" key={`${n.kind}-${n.id}`}>
              <Link to={`/map?focus=${n.kind}:${n.id}`} aria-label={`${kindLabel[n.kind]}: ${label}, ${n.relation}. Re-center map.`}>
                <circle className={`kind-${n.kind}`} cx={n.x} cy={n.y} r={9} />
                <text x={n.x + (right ? 14 : -14)} y={n.y + 4} textAnchor={right ? 'start' : 'end'}>{label.length > 22 ? label.slice(0, 21) + '…' : label}</text>
              </Link>
            </g>
          )
        })}
        <g className="node center">
          <circle className={`kind-${kind}`} cx={c} cy={c} r={16} />
          <text x={c} y={c + 36} textAnchor="middle">{entityName(kind, id)}</text>
        </g>
      </svg>
      {hidesTrials && <p className="xsmall faint" style={{ textAlign: 'center' }}>{all.length - ns.length} trials are listed beside the map to keep it readable.</p>}
      <div className="legend" style={{ justifyContent: 'center', marginTop: 8 }}>
        {order.map((k) => (
          <span key={k} className="row" style={{ gap: 6 }}>
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="5" className={`kind-${k}`} /></svg>
            {kindLabel[k]}
          </span>
        ))}
      </div>
    </div>
  )
}
