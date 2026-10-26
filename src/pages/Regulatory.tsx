import { Link, useSearchParams } from 'react-router-dom'
import { Cite } from '../components/bits'
import { regChipClass } from '../components/RegTimeline'
import { diseaseList, drugList, entityName, hrefFor } from '../lib/graph'

export function Regulatory() {
  const [params, setParams] = useSearchParams()
  const disease = params.get('disease') ?? ''
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p) }

  const rows = drugList
    .flatMap((d) => {
      const diseaseIds = [...new Set(d.regulatory.map((r) => r.diseaseId))]
      return diseaseIds.map((dz) => ({
        d, dz,
        fda: d.regulatory.find((r) => r.jurisdiction === 'FDA' && r.diseaseId === dz),
        ema: d.regulatory.find((r) => r.jurisdiction === 'EMA' && r.diseaseId === dz),
        other: d.regulatory.filter((r) => r.jurisdiction !== 'FDA' && r.jurisdiction !== 'EMA' && r.diseaseId === dz),
      }))
    })
    .filter((r) => !disease || r.dz === disease)
  const designations = drugList.flatMap((d) => d.regulatory.flatMap((r) => r.timeline.filter((e) => e.kind === 'designation').map((e) => ({ d, e }))))

  const Cell = ({ r }: { r?: (typeof rows)[number]['fda'] }) =>
    r ? (
      <div className="stack-s">
        <span className={`chip ${regChipClass(r.status)}`}>{r.status}{r.brand ? ` as ${r.brand}` : ''}</span>
        <div className="xsmall">{r.indication}{r.date ? `, ${r.date}` : ''}</div>
        <div className="xsmall faint">{r.population}</div>
        <Cite ids={r.sourceIds} />
      </div>
    ) : <span className="xsmall faint">No record in atlas</span>

  return (
    <div>
      <header className="ent-head">
        <div className="ent-kind">Regulatory landscape</div>
        <h1>Who can get which drug, where</h1>
        <p className="lede">Authorization status by jurisdiction and indication, with the eligible population and the public document behind each decision.</p>
      </header>
      <div className="stack-l">
        <section className="stack">
          <div className="filters">
            <label className="field">Disease
              <select value={disease} onChange={(e) => set('disease', e.target.value)}>
                <option value="">All</option>
                {diseaseList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <span className="count">{rows.length} drug–indication pairs</span>
          </div>
          <div className="table-wrap">
            <table className="cmp-table">
              <thead><tr><th>Drug</th><th>Disease area</th><th>United States (FDA)</th><th>European Union (EMA)</th><th>Other</th></tr></thead>
              <tbody>
                {rows.map(({ d, dz, fda, ema, other }) => (
                  <tr key={d.id + dz}>
                    <td><Link to={`${hrefFor('drug', d.id)}#regulatory`}>{d.name}</Link></td>
                    <td className="small">{entityName('disease', dz)}</td>
                    <td><Cell r={fda} /></td>
                    <td><Cell r={ema} /></td>
                    <td>{other.length ? other.map((o) => <div key={o.jurisdiction} className="stack-s"><span className={`chip ${regChipClass(o.status)}`}>{o.jurisdiction}: {o.status}</span><div className="xsmall faint">{o.population}</div></div>) : <span className="xsmall faint">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="disclaimer">“No record in atlas” means this release has not captured a decision for that jurisdiction. It is not evidence of a rejection. Labels change: always confirm against the linked regulatory document.</p>
        </section>

        <section className="stack">
          <h2>Expedited designations</h2>
          <p className="small muted">A designation can speed development or review. It does not establish that a drug is safe or effective, and it is not an approval.</p>
          <ul className="linklist">
            {designations.map(({ d, e }) => <li key={d.id + e.date}><Link to={`${hrefFor('drug', d.id)}#regulatory`}><span><strong>{d.name}</strong>: {e.text}{d.status === 'approved' && <> <span className="chip approved">Since approved</span></>}</span><span className="rel">{e.date}</span></Link></li>)}
          </ul>
        </section>

        <section className="stack">
          <h2>How a drug typically reaches patients</h2>
          <ol className="timeline">
            <li className="ind"><div className="when">Step 1</div><strong>IND clearance.</strong> <span className="small">Authorization to begin clinical investigation, subject to applicable requirements.</span></li>
            <li className="designation"><div className="when">Step 2, if granted</div><strong>Expedited designations</strong> <span className="small">such as Fast Track or Breakthrough Therapy. These may help development and review but do not establish approval.</span></li>
            <li className="submission"><div className="when">Step 3</div><strong>NDA or BLA submission.</strong> <span className="small">A marketing application submitted for regulatory review.</span></li>
            <li className="decision"><div className="when">Step 4</div><strong>Regulatory decision.</strong> <span className="small">Approval, accelerated or conditional approval, a complete response letter, or another outcome.</span></li>
            <li className="label"><div className="when">Step 5</div><strong>Post-marketing updates.</strong> <span className="small">Safety communications, label revisions and new indications.</span></li>
          </ol>
          <p className="disclaimer">An example sequence only. Actual regulatory paths vary, and not every program receives these designations.</p>
        </section>
      </div>
    </div>
  )
}
