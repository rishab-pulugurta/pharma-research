import type { RegRecord } from '../data/types'
import { Cite } from './bits'

const kindText = { ind: 'IND / trial authorization', designation: 'Designation', submission: 'Submission', decision: 'Regulatory decision', label: 'Label change', safety: 'Safety communication', hold: 'Clinical hold' }

export function RegTimeline({ rec }: { rec: RegRecord }) {
  if (!rec.timeline.length) return <p className="small muted">No regulatory milestones are recorded for this indication yet.</p>
  const events = [...rec.timeline].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <ol className="timeline">
      {events.map((e, i) => (
        <li key={i} className={e.kind}>
          <div className="when">{e.date}, {kindText[e.kind]}</div>
          <div className="small">{e.text}<Cite ids={e.sourceIds} /></div>
        </li>
      ))}
    </ol>
  )
}

export function regChipClass(status: RegRecord['status']) {
  if (status === 'Approved') return 'approved'
  if (status === 'Accelerated approval' || status === 'Conditional approval') return 'approved'
  if (status === 'Under review') return 'active'
  if (status === 'Withdrawn' || status === 'Refused') return 'discontinued'
  return 'neutral'
}
