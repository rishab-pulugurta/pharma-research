import { Link } from 'react-router-dom'
import type { Drug, Program } from '../data/types'
import { entityName, hrefFor, phaseOrder, phaseRank } from '../lib/graph'

export interface PipeRow {
  drug: Drug
  program: Program
  role?: string
}

/** Classic pipeline chart: one bar per program, length = furthest phase reached. */
export function PipelineChart({ rows }: { rows: PipeRow[] }) {
  if (!rows.length) return <div className="empty-state"><h3>No programs match these filters</h3><p>Clear a filter to see more of the pipeline.</p></div>
  return (
    <div className="pipe" role="table" aria-label="Pipeline by development phase">
      <div className="pipe-head" role="row">
        <div role="columnheader">Program</div>
        {phaseOrder.map((p) => <div key={p} role="columnheader">{p}</div>)}
      </div>
      {rows.map(({ drug, program, role }) => {
        const pct = ((phaseRank(program.phase) + 1) / phaseOrder.length) * 100
        return (
          <div className="pipe-row" role="row" key={drug.id + program.indication}>
            <div className="label" role="cell">
              <Link to={hrefFor('drug', drug.id)}>{drug.name}</Link>
              <small>{program.indication}{role && role !== 'Developer' ? `, ${role.toLowerCase()}` : ''}</small>
            </div>
            <div className="pipe-track" role="cell" aria-label={`${program.phase}, ${program.status}`}>
              <div className={`pipe-bar ${program.status}`} style={{ width: `calc(${pct}% - 8px)` }} title={`${drug.name}: ${program.phase} (${program.status}) for ${entityName('disease', program.diseaseId)}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
