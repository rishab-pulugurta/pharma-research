import type { Trial } from '../data/types'
import { useRegistry } from '../lib/registry'

const curatedToRegistry: Record<string, string[]> = {
  recruiting: ['recruiting', 'not yet recruiting', 'enrolling by invitation'],
  ongoing: ['active, not recruiting', 'recruiting'],
}

/** Live status from ClinicalTrials.gov, with a flag when it disagrees with the curated record. */
export function LiveRegistry({ nct, curated }: { nct: string; curated?: Trial }) {
  const s = useRegistry(nct)
  if (s.status === 'loading') return <div className="panel tight small muted" role="status">Checking ClinicalTrials.gov for the current status…</div>
  if (s.status === 'error') return <div className="callout small" role="status"><strong>Live registry check unavailable.</strong> {s.message}{curated ? ' The curated record on this page is unaffected.' : ''}</div>
  const r = s.data
  const expected = curated && curatedToRegistry[curated.evidenceStatus]
  const drift = expected && !expected.includes(r.status)
  return (
    <div className="panel tight stack-s">
      <div className="spread">
        <h3 style={{ fontSize: '0.9375rem' }}>Live from ClinicalTrials.gov</h3>
        <a className="xsmall" href={`https://clinicaltrials.gov/study/${r.nct}`} target="_blank" rel="noreferrer">Open registry record</a>
      </div>
      <dl className="facts" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        <div><dt>Overall status</dt><dd style={{ textTransform: 'capitalize' }}>{r.status}</dd></div>
        <div><dt>Results posted</dt><dd>{r.hasResults ? 'Yes, on registry' : 'Not on registry'}</dd></div>
        {r.enrollment != null && <div><dt>Enrollment</dt><dd>{r.enrollment.toLocaleString()}</dd></div>}
        {r.firstPosted && <div><dt>First posted</dt><dd>{r.firstPosted}</dd></div>}
        {r.start && <div><dt>Start</dt><dd>{r.start}</dd></div>}
        {r.primaryCompletion && <div><dt>Primary completion</dt><dd>{r.primaryCompletion}</dd></div>}
        {r.completion && <div><dt>Study completion</dt><dd>{r.completion}</dd></div>}
        {r.lastUpdate && <div><dt>Registry last updated</dt><dd>{r.lastUpdate}</dd></div>}
      </dl>
      {r.whyStopped && <p className="callout small"><strong>Reason stopped (registry):</strong> {r.whyStopped}</p>}
      {drift && <p className="callout info small">The registry status has changed since this profile was curated. Treat the registry as the more current source.</p>}
      {!r.hasResults && <p className="xsmall faint">No results posted on the registry. That does not mean the trial failed; results may be published elsewhere or not yet reported.</p>}
    </div>
  )
}
