import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mechNodes, type MechLayer } from '../data/mechNodes'
import type { Confidence, Drug, MechEdge } from '../data/types'
import { drugList, hrefFor } from '../lib/graph'
import { Cite, ConfidenceLegend, ConfidenceTag } from './bits'

type Level = 'molecular' | 'cellular' | 'physiological'

const layerOrder: MechLayer[] = ['drug', 'target', 'cell', 'physio']
const bandTitle: Record<MechLayer, string> = { drug: 'Drug', target: 'Molecular target', cell: 'Cellular response', physio: 'Physiological effect' }
const levelBands: Record<Level, MechLayer[]> = { molecular: ['drug', 'target'], cellular: ['cell'], physiological: ['physio'] }

const COL_W = 168
const COL_GAP = 40
const PAD_X = 16
const TOP = 44
const GAP_Y = 14
const LINE_H = 15
const MAX_CHARS = 24

function wrap(label: string, max = MAX_CHARS): string[] {
  const words = label.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

interface LNode {
  id: string
  label: string
  layer: MechLayer
  lines: string[]
  x: number
  y: number
  h: number
  tradeoff?: boolean
}

function layout(drug: Drug, edges: MechEdge[]) {
  const ids = new Set<string>(['self'])
  edges.forEach((e) => { ids.add(e.from); ids.add(e.to) })
  const layerOf = (id: string): MechLayer => (id === 'self' ? 'drug' : mechNodes[id]?.layer ?? 'cell')
  const parents = (id: string) => edges.filter((e) => e.to === id).map((e) => e.from)

  // Sub-column within a layer = longest chain of same-layer parents.
  const sub = new Map<string, number>()
  const subOf = (id: string, seen = new Set<string>()): number => {
    if (sub.has(id)) return sub.get(id)!
    if (seen.has(id)) return 0
    seen.add(id)
    const same = parents(id).filter((p) => layerOf(p) === layerOf(id))
    const v = same.length ? Math.max(...same.map((p) => subOf(p, seen) + 1)) : 0
    sub.set(id, v)
    return v
  }
  ids.forEach((id) => subOf(id))

  const cols: { layer: MechLayer; sub: number; ids: string[] }[] = []
  for (const layer of layerOrder) {
    const inLayer = [...ids].filter((id) => layerOf(id) === layer)
    const n = Math.max(0, ...inLayer.map((id) => sub.get(id)!)) + 1
    for (let s = 0; s < n && inLayer.length; s++) cols.push({ layer, sub: s, ids: inLayer.filter((id) => sub.get(id) === s) })
  }

  const nodes = new Map<string, LNode>()
  cols.forEach((col, ci) => {
    const x = PAD_X + ci * (COL_W + COL_GAP)
    const placed = col.ids.map((id) => {
      const m = mechNodes[id]
      const label = id === 'self' ? drug.name : m?.label ?? id
      const lines = wrap(label, id === 'self' ? 18 : MAX_CHARS)
      const h = lines.length * LINE_H + 18
      const ps = parents(id).map((p) => nodes.get(p)).filter(Boolean) as LNode[]
      // Targets keep the order the drug lists them; others sit at their parents' barycenter.
      const targetIdx = drug.targets.findIndex((t) => mechNodes[id]?.link?.id === t.targetId)
      const want = ps.length ? ps.reduce((a, p) => a + p.y + p.h / 2, 0) / ps.length - h / 2 : TOP + Math.max(0, targetIdx) * 60
      return { id, label, layer: col.layer, lines, x, y: want, h, tradeoff: m?.tradeoff }
    })
    placed.sort((a, b) => a.y - b.y || (a.tradeoff ? 1 : 0) - (b.tradeoff ? 1 : 0))
    let floor = TOP
    for (const n of placed) {
      n.y = Math.max(n.y, floor)
      floor = n.y + n.h + GAP_Y
      nodes.set(n.id, n)
    }
  })

  // Center the drug node against its direct targets.
  const self = nodes.get('self')!
  const kids = edges.filter((e) => e.from === 'self').map((e) => nodes.get(e.to)!).filter(Boolean)
  if (kids.length) self.y = Math.max(TOP, (Math.min(...kids.map((k) => k.y)) + Math.max(...kids.map((k) => k.y + k.h))) / 2 - self.h / 2)

  const width = PAD_X * 2 + cols.length * COL_W + (cols.length - 1) * COL_GAP
  const height = Math.max(...[...nodes.values()].map((n) => n.y + n.h)) + 20
  const bands = layerOrder
    .map((layer) => {
      const cs = cols.map((c, i) => ({ c, i })).filter(({ c }) => c.layer === layer)
      if (!cs.length) return null
      const x0 = PAD_X + cs[0].i * (COL_W + COL_GAP) - COL_GAP / 2 + 6
      const x1 = PAD_X + cs[cs.length - 1].i * (COL_W + COL_GAP) + COL_W + COL_GAP / 2 - 6
      return { layer, x0, x1 }
    })
    .filter(Boolean) as { layer: MechLayer; x0: number; x1: number }[]
  return { nodes, width, height, bands }
}

function connectedTo(id: string, edges: MechEdge[]) {
  const set = new Set([id])
  const walk = (cur: string, dir: 'up' | 'down') => {
    edges.forEach((e) => {
      const [a, b] = dir === 'down' ? [e.from, e.to] : [e.to, e.from]
      if (a === cur && !set.has(b)) { set.add(b); walk(b, dir) }
    })
  }
  walk(id, 'down')
  walk(id, 'up')
  return set
}

export function MechanismExplorer({ drug }: { drug: Drug }) {
  const [level, setLevel] = useState<Level>('molecular')
  const [sel, setSel] = useState<string | null>(null)
  const [focusId, setFocusId] = useState('self')
  const edges = drug.mechanism
  const { nodes, width, height, bands } = useMemo(() => layout(drug, edges), [drug, edges])
  const lit = sel ? connectedTo(sel, edges) : null

  const selNode = sel ? nodes.get(sel) : null
  const meta = sel && sel !== 'self' ? mechNodes[sel] : null
  const incoming = sel ? edges.filter((e) => e.to === sel) : []
  const outgoing = sel ? edges.filter((e) => e.from === sel) : []
  const alsoReach = sel && sel !== 'self' ? drugList.filter((d) => d.id !== drug.id && d.mechanism.some((e) => e.to === sel || e.from === sel)) : []
  const name = (id: string) => (id === 'self' ? drug.name : mechNodes[id]?.label ?? id)

  return (
    <div className="mech">
      <div className="mech-top">
        <div className="seg" role="group" aria-label="Mechanism depth">
          {(['molecular', 'cellular', 'physiological'] as Level[]).map((l) => (
            <button key={l} aria-pressed={level === l} onClick={() => setLevel(l)}>
              {l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
        <ConfidenceLegend />
      </div>

      <p className="mech-hint xsmall faint">Scroll sideways to follow the map from drug to body.</p>
      <div className="mech-canvas">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: Math.round(width * 0.82) }} role="group" aria-label={`Mechanism map for ${drug.name}. Use arrow keys to move between steps and Enter to see details.`} onClick={() => setSel(null)}>
          {bands.map((b) => (
            <g key={b.layer}>
              <rect className={`mcol-band${levelBands[level].includes(b.layer) ? ' on' : ''}`} x={b.x0} y={4} width={b.x1 - b.x0} height={height - 8} rx={8} />
              <text className={`mcol-label${levelBands[level].includes(b.layer) ? ' on' : ''}`} x={b.x0 + 12} y={26}>{bandTitle[b.layer]}</text>
            </g>
          ))}
          {edges.map((e, i) => {
            const a = nodes.get(e.from)
            const b = nodes.get(e.to)
            if (!a || !b) return null
            const x1 = a.x + COL_W
            const y1 = a.y + a.h / 2
            const x2 = b.x
            const y2 = b.y + b.h / 2
            const mx = (x1 + x2) / 2
            const dim = lit && !(lit.has(e.from) && lit.has(e.to))
            return (
              <path key={i} className={`medge ${e.confidence}${dim ? ' dim' : ''}`} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 2},${y2}`} markerEnd={`url(#arrow-${e.confidence})`}>
                <title>{`${name(e.from)} → ${name(e.to)}${e.label ? ` (${e.label})` : ''}: ${e.confidence}`}</title>
              </path>
            )
          })}
          <defs>
            {(['established', 'clinical', 'inferred', 'hypothetical'] as Confidence[]).map((c) => (
              <marker key={c} id={`arrow-${c}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" style={{ fill: `var(--c-${c})` }} />
              </marker>
            ))}
          </defs>
          {[...nodes.values()].map((n, idx, all) => (
            <g
              key={n.id}
              data-node={n.id}
              className={`mnode layer-${n.layer}${n.tradeoff ? ' tradeoff' : ''}${sel === n.id ? ' sel' : ''}${lit && !lit.has(n.id) ? ' dim' : ''}`}
              transform={`translate(${n.x},${n.y})`}
              tabIndex={n.id === focusId ? 0 : -1}
              role="button"
              aria-pressed={sel === n.id}
              aria-label={`${n.label}${n.tradeoff ? ' (tradeoff)' : ''}`}
              onClick={(ev) => { ev.stopPropagation(); setSel(sel === n.id ? null : n.id) }}
              onFocus={() => setFocusId(n.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSel(sel === n.id ? null : n.id) }
                // One tab stop for the map; arrow keys move between nodes in reading order.
                const step = ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? -1 : 0
                if (step) {
                  ev.preventDefault()
                  const next = all[(idx + step + all.length) % all.length]
                  setFocusId(next.id)
                  ;(ev.currentTarget.ownerSVGElement?.querySelector(`[data-node="${next.id}"]`) as SVGGElement | null)?.focus()
                }
              }}
            >
              <rect width={COL_W} height={n.h} rx={6} />
              {n.lines.map((l, i) => (
                <text key={i} x={10} y={9 + LINE_H * (i + 1) - 3}>{l}</text>
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="mech-body">
        <div className="mech-text">
          <div className="layer-tag">{level[0].toUpperCase() + level.slice(1)} level</div>
          <p className="prose">{drug.levels[level]}</p>
          <p className="disclaimer" style={{ marginTop: 16 }}>
        A simplified teaching model. Receptor effects depend on tissue and involve additional pathways. Line style shows how well each link is supported, not how large the effect is.
        <Cite ids={drug.sourceIds.slice(0, 2)} />
      </p>
        </div>
        <aside className="mech-detail" aria-live="polite">
          {!selNode && (
            <p className="small muted">Select any node to see what is known about that step, how strong the evidence is, and which other drugs act there.</p>
          )}
          {selNode && (
            <div className="stack-s">
              <h4>{selNode.label}</h4>
              {meta && <p className="small">{meta.detail}</p>}
              {sel === 'self' && <p className="small">{drug.oneLiner}</p>}
              {meta?.tradeoff && <p className="xsmall" style={{ color: 'var(--s-stopped)' }}>Tradeoff or adverse effect</p>}
              {incoming.length > 0 && (
                <div className="stack-s">
                  <div className="xsmall faint">Arrives from</div>
                  {incoming.map((e, i) => (
                    <div key={i} className="xsmall"><strong>{name(e.from)}</strong>{e.label ? `, ${e.label}` : ''}<br /><ConfidenceTag c={e.confidence} /></div>
                  ))}
                </div>
              )}
              {outgoing.length > 0 && (
                <div className="stack-s">
                  <div className="xsmall faint">Leads to</div>
                  {outgoing.map((e, i) => (
                    <div key={i} className="xsmall"><strong>{name(e.to)}</strong>{e.label ? `, ${e.label}` : ''}<br /><ConfidenceTag c={e.confidence} /></div>
                  ))}
                </div>
              )}
              {meta?.link && <Link className="small" to={hrefFor(meta.link.kind, meta.link.id)}>Open the {meta.link.kind} profile</Link>}
              {alsoReach.length > 0 && (
                <div>
                  <div className="xsmall faint" style={{ marginBottom: 4 }}>Other drugs acting here</div>
                  <div className="chips">
                    {alsoReach.map((d) => <Link key={d.id} className="chip neutral" to={hrefFor('drug', d.id)}>{d.name}</Link>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
