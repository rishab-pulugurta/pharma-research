import { Link, useSearchParams } from 'react-router-dom'
import { Cite, EvidenceTag, StatusChip } from '../components/bits'
import { mechNodes } from '../data/mechNodes'
import { sources } from '../data/sources'
import type { Drug, EndpointResult, Trial } from '../data/types'
import { diseases, drugList, drugs, entityName, hrefFor, leadPhase, targets, trialList, trialsForDrug } from '../lib/graph'
import { regChipClass } from '../components/RegTimeline'
import { estimandClass, fmtNum, fmtVal, lowerFirst } from '../lib/format'

type Mode = 'mechanism' | 'clinical' | 'development'

const fmt = (v: number, signed = true) => fmtNum(v, signed)

interface Headline {
  trial: Trial
  r: EndpointResult
  bestArm: string
  best: number
  cmp?: number
  cmpArm?: string
  diff?: number
  evidence: 'peer-reviewed' | 'company' | 'other'
}

function headlinesFor(d: Drug, diseaseId: string, endpoint: string): Headline[] {
  return trialsForDrug(d.id)
    .filter((t) => t.diseaseId === diseaseId)
    .flatMap((t) => {
      const r = t.results.find((x) => x.kind === 'primary' && x.endpoint === endpoint) ?? t.results.find((x) => x.endpoint === endpoint)
      if (!r) return []
      // Multi-drug trials (head-to-head, or combination vs monocomponents): read only this drug's arms.
      const key = d.name.toLowerCase().split(' ')[0]
      const mine = r.arms.filter((a) => a.arm.toLowerCase().includes(key) && (t.design.headToHead || !a.isComparator))
      if (!mine.length) return []
      const top = [...mine].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0]
      const cmp = r.arms.find((a) => !mine.includes(a) && (a.isComparator || t.design.headToHead))
      const types = r.sourceIds.map((s) => sources[s]?.type)
      return [{
        trial: t, r, bestArm: top.arm, best: top.value, cmp: cmp?.value, cmpArm: cmp?.arm,
        diff: cmp && t.design.comparatorType === 'placebo' ? +(top.value - cmp.value).toFixed(1) : undefined,
        evidence: types.includes('peer-reviewed') ? 'peer-reviewed' : types.includes('company') ? 'company' : 'other',
      } as Headline]
    })
}

export function Compare() {
  const [params, setParams] = useSearchParams()
  const requested = (params.get('d') ?? '').split(',').filter(Boolean)
  const unknown = requested.filter((x) => !drugs[x])
  const ids = [...new Set(requested.filter((x) => drugs[x]))].slice(0, 4)
  const overflow = [...new Set(requested.filter((x) => drugs[x]))].slice(4)
  const mode = (params.get('mode') as Mode) || 'mechanism'
  const sel = ids.map((i) => drugs[i])
  const update = (next: Partial<{ d: string[]; mode: Mode; disease: string; endpoint: string }>) => {
    const p = new URLSearchParams(params)
    if (next.d) p.set('d', next.d.join(','))
    if (next.endpoint !== undefined) { if (next.endpoint) p.set('endpoint', next.endpoint); else p.delete('endpoint') }
    if (next.mode) p.set('mode', next.mode)
    if (next.disease) p.set('disease', next.disease)
    setParams(p)
  }

  const sharedDiseases = [...new Set(sel.flatMap((d) => d.programs.map((p) => p.diseaseId)))].filter((dz) => diseases[dz] && sel.filter((d) => d.programs.some((p) => p.diseaseId === dz)).length >= Math.min(2, sel.length))
  const disease = params.get('disease') && sharedDiseases.includes(params.get('disease')!) ? params.get('disease')! : sharedDiseases[0]
  const headToHead = trialList.filter((t) => t.design.headToHead && t.design.headToHead.filter((x) => ids.includes(x)).length >= 2)

  return (
    <div>
      <header className="ent-head">
        <div className="ent-kind">Comparison workspace</div>
        <h1>Compare drugs</h1>
        <p className="lede">Line up drugs that address the same clinical problem, even when they work differently, and see where the evidence can and can’t be compared.</p>
      </header>

      <div className="stack">
        <div className="picker">
          {sel.map((d) => (
            <span key={d.id} className="chip active" style={{ fontSize: '0.875rem', padding: '4px 10px' }}>
              <Link to={hrefFor('drug', d.id)} style={{ color: 'inherit' }}>{d.name}</Link>
              <button aria-label={`Remove ${d.name}`} onClick={() => update({ d: ids.filter((x) => x !== d.id) })}>×</button>
            </span>
          ))}
          {ids.length < 4 && (
            <select aria-label="Add a drug" value="" onChange={(e) => e.target.value && update({ d: [...ids, e.target.value] })}>
              <option value="">Add a drug…</option>
              {drugList.filter((d) => !ids.includes(d.id)).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>

        {sel.length < 2 ? (
          <div className="empty-state">
            <h3>Choose at least two drugs</h3>
            <p>Or start from a common question:</p>
            <div className="try" style={{ justifyContent: 'center' }}>
              <Link to="/compare?d=tirzepatide,semaglutide&mode=clinical">Tirzepatide vs semaglutide</Link>
              <Link to="/compare?d=retatrutide,tirzepatide,survodutide&mode=mechanism">Triple vs dual agonists</Link>
              <Link to="/compare?d=orforglipron,semaglutide,danuglipron&mode=development">Oral GLP-1 options</Link>
              <Link to="/compare?d=evolocumab,inclisiran,enlicitide,verve102&mode=mechanism">Four ways to block PCSK9</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="seg" role="group" aria-label="Comparison mode">
              {(['mechanism', 'clinical', 'development'] as Mode[]).map((m) => <button key={m} aria-pressed={mode === m} onClick={() => update({ mode: m })}>{m[0].toUpperCase() + m.slice(1)}</button>)}
            </div>

            {(unknown.length > 0 || overflow.length > 0) && (
              <div className="callout info small">
                {overflow.length > 0 && <>Up to four drugs can be compared at once, so {overflow.map((x) => entityName('drug', x)).join(', ')} {overflow.length === 1 ? 'was' : 'were'} left out. </>}
                {unknown.length > 0 && <>Not found in the atlas: {unknown.join(', ')}.</>}
              </div>
            )}
            {mode === 'mechanism' ? null : headToHead.length > 0 ? (
              <div className="callout good">
                <strong>Direct randomized evidence exists.</strong>{' '}
                {headToHead.map((t, i) => <span key={t.nct}>{i > 0 && '; '}<Link to={hrefFor('trial', t.nct)}>{t.name}</Link> compared {t.design.headToHead!.map((x) => entityName('drug', x)).join(' and ')} directly ({t.design.blinding.toLowerCase()}, {t.treatment.duration})</span>)}.
                {' '}Prefer it over the cross-trial figures below.
              </div>
            ) : (
              mode === 'clinical' && <div className="callout"><strong>No head-to-head trial among these drugs.</strong> Any clinical comparison here is indirect: the numbers come from different trials with different populations, durations, comparators and analysis methods. A larger number does not mean one drug is clinically superior.</div>
            )}

            {mode === 'mechanism' && <MechanismMode sel={sel} />}
            {mode === 'clinical' && (
              <ClinicalMode sel={sel} disease={disease} diseases={sharedDiseases} onDisease={(x) => update({ disease: x, endpoint: '' })} endpointParam={params.get('endpoint')} onEndpoint={(x) => update({ endpoint: x })} />
            )}
            {mode === 'development' && <DevelopmentMode sel={sel} />}
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return <tr><td>{label}</td>{cells.map((c, i) => <td key={i} className="small">{c}</td>)}</tr>
}

function Head({ sel }: { sel: Drug[] }) {
  return <thead><tr><th>Dimension</th>{sel.map((d) => <th key={d.id}><Link to={hrefFor('drug', d.id)}>{d.name}</Link></th>)}</tr></thead>
}

function MechanismMode({ sel }: { sel: Drug[] }) {
  const nodeSets = sel.map((d) => new Set(d.mechanism.flatMap((e) => [e.from, e.to]).filter((x) => x !== 'self')))
  const shared = [...nodeSets[0]].filter((n) => nodeSets.every((s) => s.has(n)))
  return (
    <>
      <div className="table-wrap">
        <table className="cmp-table">
          <Head sel={sel} />
          <tbody>
            <Row label="Modality" cells={sel.map((d) => d.modality)} />
            <Row label="Targets" cells={sel.map((d) => d.targets.map((t) => <div key={t.targetId}><Link to={hrefFor('target', t.targetId)}>{targets[t.targetId].symbol}</Link>, {lowerFirst(t.action)}</div>))} />
            <Row label="Molecular basis" cells={sel.map((d) => d.levels.molecular)} />
            <Row label="Cellular effect" cells={sel.map((d) => d.levels.cellular)} />
            <Row label="Unique to this drug" cells={sel.map((_, i) => {
              const own = [...nodeSets[i]].filter((n) => nodeSets.filter((s) => s.has(n)).length === 1 && mechNodes[n])
              return own.length ? own.map((n) => mechNodes[n].label).join('; ') : 'Nothing unique among the selected drugs'
            })} />
            <Row label="Route and dosing" cells={sel.map((d) => `${d.route}. ${d.dosing}`)} />
            <Row label="Tradeoffs" cells={sel.map((d) => <ul>{d.tradeoffs.slice(0, 3).map((t) => <li key={t}>{t}</li>)}</ul>)} />
          </tbody>
        </table>
      </div>
      <p className="small muted">{shared.length ? <>All selected drugs converge on: {shared.map((n) => mechNodes[n]?.label).filter(Boolean).join(', ')}.</> : 'These drugs share no mechanism steps in the atlas model.'}</p>
    </>
  )
}

function ClinicalMode({ sel, disease, diseases: options, onDisease, endpointParam, onEndpoint }: { sel: Drug[]; disease?: string; diseases: string[]; onDisease: (d: string) => void; endpointParam: string | null; onEndpoint: (e: string) => void }) {
  if (!disease) return <p className="muted">These drugs aren’t studied for a common disease in the atlas, so a clinical comparison isn’t meaningful.</p>
  const candidates = [...new Set(trialList.filter((t) => t.diseaseId === disease && t.drugIds.some((d) => sel.some((s) => s.id === d))).flatMap((t) => t.results.map((r) => r.endpoint)))]
  // Default to the endpoint that covers the most selected drugs.
  const coverage = (e: string) => sel.filter((d) => headlinesFor(d, disease, e).length > 0).length
  const endpoints = candidates.sort((a, b) => coverage(b) - coverage(a))
  const endpoint = endpointParam && endpoints.includes(endpointParam) ? endpointParam : endpoints[0]
  const rows = sel.map((d) => ({ d, hs: endpoint ? headlinesFor(d, disease, endpoint) : [] }))
  const all = rows.flatMap((r) => r.hs)
  const issues: string[] = []
  const durations = [...new Set(all.map((h) => h.r.timepoint))]
  if (durations.length > 1) issues.push(`Timepoints differ (${durations.join(', ')}). ${/weight/i.test(endpoint ?? '') ? 'Weight loss keeps increasing for months, so shorter trials understate the effect.' : /mace|event|death|composite/i.test(endpoint ?? '') ? 'Event rates accumulate with follow-up, so longer trials record more events in both arms.' : 'Effects measured at different times are not directly comparable.'}`)
  const estimands = [...new Set(all.map((h) => estimandClass(h.r.estimand)))]
  if (estimands.length > 1) issues.push(`Analysis methods differ (${estimands.join('; ')}). Efficacy estimands leave out the effect of people stopping treatment, so they give larger numbers than treatment-policy analyses.`)
  if (all.some((h) => h.evidence === 'company') && all.some((h) => h.evidence === 'peer-reviewed')) issues.push('Some results are company press releases and others are peer-reviewed publications.')
  if (new Set(all.map((h) => h.trial.design.comparatorType)).size > 1) issues.push('Some trials used placebo and others an active comparator, so the reference points differ.')
  if (all.some((h) => h.trial.phase.startsWith('Phase 2'))) issues.push('Some results come from Phase 2 trials, whose smaller, selected populations often show larger effects than Phase 3.')
  if (all.every((h) => h.r.surrogate)) issues.push(`“${endpoint}” is a surrogate endpoint. None of these trials alone shows effects on outcomes such as heart attack or death.`)

  return (
    <div className="stack">
      <div className="row">
        {options.length > 1 && (
          <label className="field">Disease<select value={disease} onChange={(e) => onDisease(e.target.value)}>{options.map((o) => <option key={o} value={o}>{entityName('disease', o)}</option>)}</select></label>
        )}
        {endpoints.length > 1 ? (
          <label className="field">Endpoint<select value={endpoint} onChange={(e) => onEndpoint(e.target.value)}>{endpoints.map((e) => <option key={e} value={e}>{e} ({coverage(e)} of {sel.length} drugs)</option>)}</select></label>
        ) : (
          <span className="small muted">Comparing <strong>{endpoint ?? 'no recorded endpoint'}</strong> in {entityName('disease', disease)} trials.</span>
        )}
      </div>
      <div className="table-wrap">
        <table className="wide">
          <thead><tr><th>Drug</th><th>Trial</th><th>Reported result</th><th>Comparator</th><th>Population</th><th>Timepoint</th><th>Estimand</th><th>Evidence</th><th>Discontinued for AEs</th></tr></thead>
          <tbody>
            {rows.map(({ d, hs }) =>
              hs.length === 0 ? (
                <tr key={d.id}><td><Link to={hrefFor('drug', d.id)}>{d.name}</Link></td><td colSpan={8} className="small faint">No primary results for this endpoint are recorded in the atlas. That does not mean the drug has no effect.</td></tr>
              ) : (
                hs.map((h, i) => (
                  <tr key={d.id + h.trial.nct}>
                    {i === 0 && <td rowSpan={hs.length}><Link to={hrefFor('drug', d.id)}>{d.name}</Link></td>}
                    <td className="small"><Link to={hrefFor('trial', h.trial.nct)} style={{ fontWeight: 600 }}>{h.trial.name}</Link><div className="xsmall faint">{h.trial.phase}</div></td>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '1rem' }}>{fmtVal(h.best, h.r.unit, h.r.arms.some((a) => a.value < 0))}</strong>
                      <div className="xsmall faint">{h.bestArm}</div>
                      {h.cmp != null && <div className="xsmall faint">vs {fmtVal(h.cmp, h.r.unit, h.r.arms.some((a) => a.value < 0))} {lowerFirst(h.cmpArm ?? '')}</div>}
                      {h.diff != null && <div className="xsmall">Placebo-adjusted {fmt(h.diff)} pts</div>}
                    </td>
                    <td className="small">{h.trial.design.comparatorType === 'active' ? 'Active (head-to-head)' : h.trial.design.comparatorType === 'placebo' ? 'Placebo' : 'None'}</td>
                    <td className="small">{h.trial.population.enrollment.toLocaleString()}. {h.trial.population.eligibility.split(';')[0]}</td>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>{h.r.timepoint}</td>
                    <td className="small">{estimandClass(h.r.estimand)}{h.r.estimand && <div className="xsmall faint">Reported as “{h.r.estimand}”</div>}</td>
                    <td><Cite ids={h.r.sourceIds} /></td>
                    <td className="xsmall">{h.trial.safety?.discontinuationAE.length ? h.trial.safety.discontinuationAE.map((x) => `${x.arm}: ${x.value}`).join('; ') : <span className="faint">Not abstracted</span>}</td>
                  </tr>
                ))
              ),
            )}
          </tbody>
        </table>
      </div>
      {issues.length > 0 && (
        <div className="panel inset">
          <h3 style={{ marginBottom: 8 }}>Why these numbers aren’t directly comparable</h3>
          <ul className="small">{issues.map((i) => <li key={i}>{i}</li>)}</ul>
          <p className="xsmall faint" style={{ marginTop: 10 }}>PharmAtlas does not rank drugs on cross-trial results. Relative and absolute effects, and statistical and clinical significance, are shown on each trial page.</p>
        </div>
      )}
      <p className="xsmall faint">Evidence key: <EvidenceTag type="peer-reviewed" /> <EvidenceTag type="company" /> <EvidenceTag type="registry" /></p>
    </div>
  )
}

function DevelopmentMode({ sel }: { sel: Drug[] }) {
  return (
    <div className="table-wrap">
      <table className="cmp-table">
        <Head sel={sel} />
        <tbody>
          <Row label="Status" cells={sel.map((d) => <StatusChip status={d.status} scope={d.approvalScope} />)} />
          <Row label="Furthest phase" cells={sel.map((d) => leadPhase(d))} />
          <Row label="Developer" cells={sel.map((d) => <Link to={hrefFor('company', d.owner)}>{entityName('company', d.owner)}</Link>)} />
          <Row label="Programs" cells={sel.map((d) => d.programs.map((p) => <div key={p.indication}>{p.indication}: {p.phase}{p.status === 'discontinued' ? ' (discontinued)' : ''}</div>))} />
          <Row label="Trials in atlas" cells={sel.map((d) => {
            const ts = trialsForDrug(d.id)
            const done = ts.filter((t) => ['published', 'topline reported', 'completed — results not captured'].includes(t.evidenceStatus)).length
            return `${ts.length} total: ${done} completed, ${ts.length - done} ongoing`
          })} />
          <Row label="FDA" cells={sel.map((d) => { const r = d.regulatory.filter((x) => x.jurisdiction === 'FDA'); return r.length ? r.map((x) => <div key={x.indication}><span className={`chip ${regChipClass(x.status)}`}>{x.status}</span> {x.indication}{x.date ? `, ${x.date}` : ''}</div>) : <span className="faint">No FDA record</span> })} />
          <Row label="EMA" cells={sel.map((d) => { const r = d.regulatory.filter((x) => x.jurisdiction === 'EMA'); return r.length ? r.map((x) => <div key={x.indication}><span className={`chip ${regChipClass(x.status)}`}>{x.status}</span> {x.indication}{x.date ? `, ${x.date}` : ''}</div>) : <span className="faint">No EMA record</span> })} />
          <Row label="Latest development" cells={sel.map((d) => { const p = [...d.programs].sort((a, b) => b.latest.date.localeCompare(a.latest.date))[0]; return <>{p.latest.date}: {p.latest.text}<Cite ids={p.latest.sourceIds} /></> })} />
        </tbody>
      </table>
    </div>
  )
}
