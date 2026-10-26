import { useState } from 'react'
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { StatusChip } from '../components/bits'
import type { EntityKind } from '../data/types'
import { plural } from '../lib/format'
import {
  companies, companyList, diseaseList, drugCompanies, drugList, drugsForCompany, drugsForDisease, drugsForTarget,
  entityName, hrefFor, kindPath, leadPhase, pathwayList, phaseOrder, phaseRank, targetList, targets, trialList,
} from '../lib/graph'

const tabs: [EntityKind, string][] = [['company', 'Companies'], ['drug', 'Drugs'], ['disease', 'Diseases'], ['target', 'Targets'], ['trial', 'Trials'], ['pathway', 'Pathways']]
const pathKind = Object.fromEntries(Object.entries(kindPath).map(([k, v]) => [v, k])) as Record<string, EntityKind>

function Select({ label, name, options, params, set }: { label: string; name: string; options: [string, string][]; params: URLSearchParams; set: (p: URLSearchParams) => void }) {
  return (
    <label className="field">
      {label}
      <select
        value={params.get(name) ?? ''}
        onChange={(e) => {
          const p = new URLSearchParams(params)
          if (e.target.value) p.set(name, e.target.value)
          else p.delete(name)
          set(p)
        }}
      >
        <option value="">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function DrugIndex() {
  const [params, set] = useSearchParams()
  const f = Object.fromEntries(params)
  const rows = drugList.filter((d) =>
    (!f.target || d.targets.some((t) => t.targetId === f.target)) &&
    (!f.disease || d.programs.some((p) => p.diseaseId === f.disease)) &&
    (!f.modality || d.modality === f.modality) &&
    (!f.status || d.status === f.status) &&
    (!f.phase || phaseRank(leadPhase(d)) >= phaseRank(f.phase as never)) &&
    (!f.route || d.route.toLowerCase().includes(f.route)) &&
    (!f.company || drugCompanies(d).includes(f.company)),
  ).sort((a, b) => phaseRank(leadPhase(b)) - phaseRank(leadPhase(a)) || a.name.localeCompare(b.name))
  return (
    <>
      <div className="filters">
        <Select label="Target" name="target" params={params} set={set} options={targetList.map((t) => [t.id, t.symbol])} />
        <Select label="Disease" name="disease" params={params} set={set} options={diseaseList.map((d) => [d.id, d.name])} />
        <Select label="Modality" name="modality" params={params} set={set} options={[...new Set(drugList.map((d) => d.modality))].map((m) => [m, m])} />
        <Select label="Reached at least" name="phase" params={params} set={set} options={phaseOrder.map((p) => [p, p])} />
        <Select label="Status" name="status" params={params} set={set} options={[['approved', 'Approved'], ['investigational', 'Investigational'], ['discontinued', 'Discontinued']]} />
        <Select label="Route" name="route" params={params} set={set} options={[['oral', 'Oral'], ['subcutaneous', 'Subcutaneous'], ['intravenous', 'Intravenous']]} />
        <Select label="Company" name="company" params={params} set={set} options={companyList.map((c) => [c.id, c.name])} />
        <span className="count">{rows.length} of {drugList.length} drugs</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state"><h3>No drugs match all of these filters</h3><p>Remove a filter to widen the search.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Drug</th><th>Targets</th><th>Modality</th><th>Furthest phase</th><th>Status</th><th>Developer</th>{f.status === 'discontinued' && <th>Why it stopped</th>}</tr></thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td><Link to={hrefFor('drug', d.id)}>{d.name}</Link><div className="xsmall faint">{d.aliases.slice(0, 2).join(', ')}</div></td>
                  <td>{d.targets.map((t) => <Link key={t.targetId} to={hrefFor('target', t.targetId)} style={{ marginRight: 6, fontWeight: 500 }}>{targets[t.targetId].symbol}</Link>)}</td>
                  <td className="small">{d.modality}<div className="xsmall faint">{d.route}</div></td>
                  <td>{leadPhase(d)}</td>
                  <td><StatusChip status={d.status} scope={d.approvalScope} /></td>
                  <td className="small"><Link to={hrefFor('company', d.owner)} style={{ fontWeight: 500 }}>{companies[d.owner].name}</Link></td>
                  {f.status === 'discontinued' && <td className="small">{d.programs.filter((p) => p.status === 'discontinued').map((p) => <div key={p.indication}><span className="faint">{p.latest.date}</span> {p.latest.text}</div>)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

const companyGroup = (c: (typeof companyList)[number]) =>
  c.ownership === 'Private' ? 'Private biotech' : /large-cap|large cap/i.test(c.type) ? 'Large pharma & biotech' : 'Public biotech & specialty pharma'

function CompanyIndex() {
  const [params, set] = useSearchParams()
  const [lookup, setLookup] = useState('')
  const nav = useNavigate()
  const [text, setText] = useState(params.get('q') ?? '')
  const q = text.trim().toLowerCase()
  const group = params.get('group') ?? ''
  const rows = companyList.filter((c) =>
    (!group || companyGroup(c) === group) &&
    (!q || [c.name, c.type, c.summary, ...c.focus, c.platform ?? '', ...(c.leadPrograms ?? []).map((p) => p.name)].join(' ').toLowerCase().includes(q)),
  )
  const setParam = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); set(p) }
  return (
    <div className="stack">
      <form className="panel tight row" onSubmit={(e) => { e.preventDefault(); if (lookup.trim()) nav(`/companies/live/${encodeURIComponent(lookup.trim())}`) }}>
        <label className="field" style={{ flex: 1, minWidth: 220 }}>
          Look up any company, even one not listed here
          <input type="text" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="e.g. Madrigal, Apogee, Kymera, Neumora…" />
        </label>
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }} disabled={!lookup.trim()}>Look up live</button>
      </form>
      <div className="filters">
        <label className="field">Filter companies<input type="text" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => setParam('q', text.trim())} placeholder="Name, area, platform, drug…" /></label>
        <label className="field">Type<select value={group} onChange={(e) => setParam('group', e.target.value)}><option value="">All</option>{['Large pharma & biotech', 'Public biotech & specialty pharma', 'Private biotech'].map((g) => <option key={g}>{g}</option>)}</select></label>
        <span className="count">{rows.length} of {companyList.length} companies</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state"><h3>No listed company matches</h3><p>Use “Look up live” above to build a page for any company from public registries.</p></div>
      ) : (
        <div className="grid">
          {rows.map((c) => (
            <Link key={c.id} className="card" to={hrefFor('company', c.id)}>
              <div className="spread" style={{ alignItems: 'flex-start' }}>
                <h3>{c.name}</h3>
                {drugsForCompany(c.id).length > 0 && <span className="chip active">In-depth</span>}
              </div>
              <p className="xsmall faint" style={{ marginBottom: 6 }}>{[c.ticker ?? c.ownership, c.hq].filter(Boolean).join(', ')}</p>
              <p>{c.summary}</p>
              <p className="xsmall" style={{ marginTop: 8 }}>{c.focus.slice(0, 3).join(', ')}</p>
            </Link>
          ))}
        </div>
      )}
      <p className="xsmall faint">Every company page includes its live ClinicalTrials.gov pipeline and Drugs@FDA approvals. “In-depth” companies also have hand-curated mechanism and evidence profiles.</p>
    </div>
  )
}

function TrialIndex() {
  const [params, set] = useSearchParams()
  const f = Object.fromEntries(params)
  const rows = trialList.filter((t) =>
    (!f.disease || t.diseaseId === f.disease) && (!f.drug || t.drugIds.includes(f.drug)) && (!f.evidence || t.evidenceStatus === f.evidence) && (!f.comparator || t.design.comparatorType === f.comparator),
  )
  return (
    <>
      <div className="filters">
        <Select label="Disease" name="disease" params={params} set={set} options={diseaseList.map((d) => [d.id, d.name])} />
        <Select label="Drug" name="drug" params={params} set={set} options={drugList.map((d) => [d.id, d.name])} />
        <Select label="Evidence status" name="evidence" params={params} set={set} options={[...new Set(trialList.map((t) => t.evidenceStatus))].map((s) => [s, s[0].toUpperCase() + s.slice(1)])} />
        <Select label="Comparator" name="comparator" params={params} set={set} options={[['placebo', 'Placebo'], ['active', 'Active (head-to-head)'], ['none', 'None (single-arm)']]} />
        <span className="count">{rows.length} of {trialList.length} trials</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Trial</th><th>Drugs</th><th>Phase</th><th>Comparator</th><th>Enrollment</th><th>Evidence status</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.nct}>
                <td><Link to={hrefFor('trial', t.nct)}>{t.name}</Link><div className="xsmall faint">{t.nct}</div></td>
                <td className="small">{t.drugIds.map((d) => entityName('drug', d)).join(', ')}</td>
                <td className="small">{t.phase}</td>
                <td className="small">{t.design.comparator}</td>
                <td>{t.population.enrollment.toLocaleString()}</td>
                <td><span className={`chip ${t.evidenceStatus === 'published' ? 'approved' : t.evidenceStatus === 'topline reported' ? 'warn' : 'neutral'}`}>{t.evidenceStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xsmall faint" style={{ marginTop: 10 }}>Have an NCT number that isn’t listed? Type it into search to look it up live in ClinicalTrials.gov.</p>
    </>
  )
}

export function Explore({ fixed }: { fixed?: EntityKind }) {
  const { kind: k } = useParams()
  const kind: EntityKind = fixed ?? (k ? pathKind[k] : undefined) ?? 'drug'
  return (
    <div>
      <div className="ent-head" style={{ marginBottom: 20 }}>
        <h1>Explore the atlas</h1>
        <p className="lede">Every company, drug, disease, target, trial and pathway in the current release.</p>
      </div>
      <nav className="subnav" aria-label="Entity type">
        {tabs.map(([kk, label]) => (
          <NavLink key={kk} to={`/${kindPath[kk]}`} style={({ isActive }) => (isActive || kk === kind ? { borderColor: 'var(--stain)', color: 'var(--stain-ink)', fontWeight: 600 } : undefined)}>{label}</NavLink>
        ))}
      </nav>
      {kind === 'drug' && <DrugIndex />}
      {kind === 'trial' && <TrialIndex />}
      {kind === 'company' && <CompanyIndex />}
      {kind === 'disease' && (
        <div className="grid">
          {diseaseList.map((d) => (
            <Link key={d.id} className="card" to={hrefFor('disease', d.id)}>
              <h3>{d.name}</h3>
              <p>{d.summary}</p>
              <p className="xsmall" style={{ marginTop: 8 }}>{drugsForDisease(d.id).length} drugs, {d.targetIds.length} targets</p>
            </Link>
          ))}
        </div>
      )}
      {kind === 'target' && (
        <div className="grid">
          {targetList.map((t) => (
            <Link key={t.id} className="card" to={hrefFor('target', t.id)}>
              <h3>{t.symbol}</h3>
              <p className="xsmall faint" style={{ marginBottom: 6 }}>{t.name}</p>
              <p>{t.summary}</p>
              <p className="xsmall" style={{ marginTop: 8 }}>{plural(drugsForTarget(t.id).length, 'drug')} act{drugsForTarget(t.id).length === 1 ? 's' : ''} here</p>
            </Link>
          ))}
        </div>
      )}
      {kind === 'pathway' && (
        <div className="grid">
          {pathwayList.map((p) => (
            <Link key={p.id} className="card" to={hrefFor('pathway', p.id)}>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
