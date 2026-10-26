import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BACKGROUND_AGENTS, fetchFdaProducts, fetchLivePipeline, useAsync, type FdaProduct, type LiveProgram } from '../lib/live'
import { search } from '../lib/search'
import { plural } from '../lib/format'

const PHASES = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']
const minRank: Record<string, number> = { 'Phase 1': 1, 'Phase 2': 2, 'Phase 3': 3, 'Phase 4': 4 }

const isBackground = (p: LiveProgram, own: Set<string>) => {
  const tokens = p.name.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean)
  return tokens.some((t) => BACKGROUND_AGENTS.has(t)) && !tokens.some((t) => own.has(t))
}

/** Atlas profile for a program name, when one exists. */
function atlasLink(name: string) {
  const hit = search(name, 1).find((h) => h.kind === 'drug' && h.score >= 70)
  return hit ? <Link to={hit.href} className="chip active" style={{ marginLeft: 6 }}>Atlas profile</Link> : null
}

function ProgramRow({ p, background }: { p: LiveProgram; background: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr>
        <td>
          <strong>{p.name}</strong> {atlasLink(p.name)}
          {background && <span className="chip neutral" style={{ marginLeft: 6 }}>Combination partner</span>}
          {p.aliases.length > 0 && <div className="xsmall faint">Also: {p.aliases.slice(0, 4).join(', ')}</div>}
          <div className="xsmall m-only">{p.phase}{p.conditions.length ? `, ${p.conditions.slice(0, 2).join('; ')}` : ''}</div>
        </td>
        <td className="small d-only" style={{ whiteSpace: 'nowrap' }}>{p.phase}</td>
        <td className="small d-only">{p.conditions.slice(0, 3).join('; ')}{p.conditions.length > 3 && <span className="faint"> +{p.conditions.length - 3} more</span>}</td>
        <td className="small" style={{ whiteSpace: 'nowrap' }}>
          <button className="btn ghost small" aria-expanded={open} onClick={() => setOpen(!open)}>
            {p.sponsoredTrials}<span className="d-only-inline"> sponsored</span> / {p.trials.length}<span className="d-only-inline"> total</span>
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={4} style={{ background: 'var(--surface-2)' }}>
            <ul className="linklist">
              {p.trials.map((t) => (
                <li key={t.nct}>
                  <Link to={`/trials/${t.nct}`}>
                    <span>{t.title}</span>
                    <span className="rel">{t.nct}, {t.phase}, {t.status}{t.isLead ? '' : `, led by ${t.lead}`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  )
}

export function LivePipeline({ registry, ownGenerics }: { registry: string[]; ownGenerics: Set<string> }) {
  const state = useAsync(registry.length ? () => fetchLivePipeline(registry) : null, [registry.join('|')])
  const [phase, setPhase] = useState('')
  const [q, setQ] = useState('')
  const [sponsoredOnly, setSponsoredOnly] = useState(true)
  const [showPartners, setShowPartners] = useState(false)
  const [limit, setLimit] = useState(25)

  const rows = useMemo(() => {
    if (state.status !== 'ok') return []
    const needle = q.trim().toLowerCase()
    return state.data.programs.filter((p) =>
      (!phase || p.phaseRank >= minRank[phase]) &&
      (!sponsoredOnly || p.sponsoredTrials > 0) &&
      (showPartners || !isBackground(p, ownGenerics)) &&
      (!needle || p.name.toLowerCase().includes(needle) || p.aliases.some((a) => a.toLowerCase().includes(needle)) || p.conditions.some((c) => c.toLowerCase().includes(needle))),
    )
  }, [state, phase, q, sponsoredOnly, showPartners, ownGenerics])

  if (!registry.length) return <p className="muted small">This company has no human trials in ClinicalTrials.gov, so no registry pipeline exists. Its programs are described in the profile above.</p>
  if (state.status === 'loading' || state.status === 'idle') return <div className="panel tight small muted" role="status">Loading active trials from ClinicalTrials.gov…</div>
  if (state.status === 'error') return <div className="callout small" role="status"><strong>Live pipeline unavailable.</strong> {state.message}. Try again in a moment.</div>
  const d = state.data
  const lead = d.trials.filter((t) => t.isLead).length
  if (d.trials.length === 0) return <p className="muted small">No recruiting or ongoing trials are registered under this sponsor in ClinicalTrials.gov. Completed or terminated trials aren’t shown here; <a href={`https://clinicaltrials.gov/search?spons=${encodeURIComponent(registry[0])}`} target="_blank" rel="noreferrer">see all of its trials on ClinicalTrials.gov</a>.</p>

  return (
    <div className="stack">
      <p className="small muted">
        {plural(d.trials.length, 'active trial')} in ClinicalTrials.gov ({lead} sponsored by the company, {d.trials.length - lead} where it collaborates or supplies drug).
        Programs are grouped from the interventions in experimental arms, so control-arm comparators are left out.
        {d.truncated && ' This company has more than 1,000 matching trials; only the first 1,000 are shown.'}
      </p>
      <div className="filters">
        <label className="field">Reached at least<select value={phase} onChange={(e) => setPhase(e.target.value)}><option value="">Any phase</option>{PHASES.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label className="field">Search programs or conditions<input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. myeloma, BTK" /></label>
        <label className="row small" style={{ gap: 6, alignSelf: 'center' }}><input type="checkbox" checked={sponsoredOnly} onChange={(e) => setSponsoredOnly(e.target.checked)} />Company-sponsored only</label>
        <label className="row small" style={{ gap: 6, alignSelf: 'center' }}><input type="checkbox" checked={showPartners} onChange={(e) => setShowPartners(e.target.checked)} />Show combination partners</label>
        <span className="count">{rows.length} of {d.programs.length} programs</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state"><h3>No programs match these filters</h3><p>Untick “Company-sponsored only” or clear the search.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Program</th><th className="d-only">Furthest active phase</th><th className="d-only">Conditions</th><th>Active trials</th></tr></thead>
            <tbody>{rows.slice(0, limit).map((p) => <ProgramRow key={p.key} p={p} background={isBackground(p, ownGenerics)} />)}</tbody>
          </table>
        </div>
      )}
      {rows.length > limit && <button className="btn" onClick={() => setLimit(limit + 50)}>Show {Math.min(50, rows.length - limit)} more programs</button>}
      <p className="xsmall faint">Source: ClinicalTrials.gov, fetched live. Phase is the most advanced active trial, not regulatory status. Registry entries are sponsor-reported and not curated by PharmAtlas.</p>
    </div>
  )
}

export function useFdaProducts(fda: string[]) {
  return useAsync(fda.length ? () => fetchFdaProducts(fda) : null, [fda.join('|')])
}

export function FdaProducts({ fda, note }: { fda: string[]; note?: string }) {
  const state = useFdaProducts(fda)
  const [all, setAll] = useState(false)
  if (!fda.length) return <p className="muted small">{note ?? 'No FDA (CDER) approvals are recorded for this company in Drugs@FDA.'}</p>
  if (state.status === 'loading' || state.status === 'idle') return <div className="panel tight small muted" role="status">Loading approvals from Drugs@FDA…</div>
  if (state.status === 'error') return <div className="callout small"><strong>FDA data unavailable.</strong> {state.message}.</div>
  const items: FdaProduct[] = state.data
  if (!items.length) return <p className="muted small">No brand-name prescription approvals found in Drugs@FDA under this company’s sponsor names. {note}</p>
  const shown = all ? items : items.slice(0, 15)
  return (
    <div className="stack-s">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Brand</th><th>Active ingredient</th><th>Form and route</th><th>Application first approved</th><th>Application</th></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.brand + p.application}>
                <td><strong>{p.brand}</strong> {atlasLink(p.generic.split(' + ')[0] || p.brand)}</td>
                <td className="small">{p.generic}</td>
                <td className="small">{p.route}</td>
                <td className="small">{p.firstApproval ?? '—'}</td>
                <td className="small"><a href={`https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${p.application.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{p.application}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 15 && <button className="btn small" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${items.length}`}</button>}
      <p className="xsmall faint">Source: openFDA Drugs@FDA, fetched live. Covers drugs and therapeutic biologics reviewed by FDA’s CDER; vaccines and cell and gene therapies (CBER) are not included. Dates are when each application was first approved, so a later formulation can show its parent application’s date, and insulins show their 2020 transition to biologics licenses. Products co-marketed with a partner may be filed under the partner’s or a subsidiary’s name. {note}</p>
    </div>
  )
}
