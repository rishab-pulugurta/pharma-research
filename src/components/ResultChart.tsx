import { useState } from 'react'
import type { EndpointResult } from '../data/types'
import { fmtNum, lowerFirst } from '../lib/format'
import { Cite } from './bits'


/** Arm-level bars on a shared zero baseline. Comparator arms are drawn in neutral gray. */
export function ResultChart({ r }: { r: EndpointResult }) {
  const [table, setTable] = useState(false)
  const vals = r.arms.map((a) => a.value)
  const signed = vals.some((v) => v < 0) // changes get a sign; proportions don't
  const fmt = (v: number) => fmtNum(v, signed)
  const rawSpan = Math.max(0, ...vals) - Math.min(0, ...vals) || 1
  const step = rawSpan > 40 ? 10 : rawSpan > 15 ? 5 : rawSpan > 4 ? 1 : 0.5
  // Round the domain outward to whole ticks so no bar runs past the axis.
  const lo = Math.floor(Math.min(0, ...vals) / step) * step
  const hi = Math.ceil(Math.max(0, ...vals) / step) * step
  const span = hi - lo || 1
  const W = 640
  const LABEL = 190
  const VALW = 58 // room for value labels beyond the bar ends
  const left = LABEL + (lo < 0 ? VALW : 8)
  const right = W - (hi > 0 ? VALW : 12)
  const plotW = right - left
  const ROW = 34
  const H = r.arms.length * ROW + 30
  const x = (v: number) => left + ((v - lo) / span) * plotW
  const ticks: number[] = []
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(+t.toFixed(2))
  const unit = r.unit === '%' ? '%' : ''

  return (
    <figure className="stack-s" style={{ margin: 0 }}>
      <figcaption className="spread">
        <span>
          <strong>{r.endpoint}</strong>
          <span className="muted small">, {lowerFirst(r.measure)} ({r.unit}), {r.timepoint}</span>
        </span>
        <button className="btn ghost small" aria-pressed={table} onClick={() => setTable(!table)}>{table ? 'Show chart' : 'Show table'}</button>
      </figcaption>
      <div className="chips">
        <span className={`chip ${r.kind === 'primary' ? 'active' : 'neutral'}`}>{r.kind === 'primary' ? 'Prespecified primary' : r.kind === 'subgroup' ? 'Subgroup' : r.kind === 'secondary' ? 'Secondary' : 'Exploratory'}</span>
        <span className={`chip ${r.surrogate ? 'warn' : 'approved'}`}>{r.surrogate ? 'Surrogate endpoint' : 'Patient-important outcome'}</span>
        {r.estimand && <span className="chip outline">Estimand: {r.estimand}</span>}
        <Cite ids={r.sourceIds} />
      </div>
      {table ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Arm</th><th>{r.measure}</th>{r.arms.some((a) => a.n) && <th>n</th>}</tr></thead>
            <tbody>
              {r.arms.map((a) => (
                <tr key={a.arm}><td>{a.arm}{a.isComparator ? ' (comparator)' : ''}</td><td>{fmt(a.value)}{unit}</td>{r.arms.some((b) => b.n) && <td>{a.n?.toLocaleString() ?? '—'}</td>}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
        <div className="rbars" role="list" aria-label={`${r.endpoint} by arm`}>
          {r.arms.map((a) => (
            <div key={a.arm} className="rbar-row" role="listitem">
              <span className="rbar-label">{a.arm}</span>
              <span className="rbar-track"><span className={`rbar${a.isComparator ? ' cmp' : ''}`} style={{ width: `${Math.max(2, (Math.abs(a.value) / Math.max(...vals.map(Math.abs), 1)) * 100)}%` }} /></span>
              <span className="rbar-val">{fmt(a.value)}{unit}</span>
            </div>
          ))}
        </div>
        <svg className="rchart rchart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${r.endpoint}: ${r.arms.map((a) => `${a.arm} ${a.value}${unit}`).join('; ')}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="grid" x1={x(t)} x2={x(t)} y1={4} y2={H - 22} />
              <text className="tick" x={x(t)} y={H - 6} textAnchor="middle">{fmt(t)}{unit}</text>
            </g>
          ))}
          <line className="axis" x1={x(0)} x2={x(0)} y1={2} y2={H - 22} />
          {r.arms.map((a, i) => {
            const y = 8 + i * ROW
            const x0 = Math.min(x(0), x(a.value))
            const w = Math.max(2, Math.abs(x(a.value) - x(0)))
            const neg = a.value < 0
            return (
              <g key={a.arm}>
                <title>{`${a.arm}: ${fmt(a.value)}${unit}${a.n ? ` (n=${a.n.toLocaleString()})` : ''}`}</title>
                <text className="arm-label" x={LABEL - 10} y={y + 15} textAnchor="end">{a.arm.length > 26 ? a.arm.slice(0, 25) + '…' : a.arm}</text>
                <rect className={`bar${a.isComparator ? ' cmp' : ''}`} x={x0} y={y + 3} width={w} height={18} rx={4} />
                <text className="val" x={neg ? x0 - 6 : x0 + w + 6} y={y + 16} textAnchor={neg ? 'end' : 'start'}>{fmt(a.value)}{unit}</text>
              </g>
            )
          })}
        </svg>
        </>
      )}
      {(r.contrast || r.absolute) && (
        <dl className="small stack-s">
          {r.contrast && <div><dt className="faint xsmall">Between-arm comparison</dt><dd style={{ margin: 0 }}>{r.contrast}</dd></div>}
          {r.absolute && <div><dt className="faint xsmall">Absolute terms</dt><dd style={{ margin: 0 }}>{r.absolute}</dd></div>}
        </dl>
      )}
    </figure>
  )
}
