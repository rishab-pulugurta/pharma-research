import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Cite, ConnectedRail, EntityActions, EntityLink, Facts, NotFound, NotesPanel, SourceList, StatusChip, SubNav, Verified } from '../components/bits'
import type { Drug, Program } from '../data/types'
import { plural } from '../lib/format'
import { companiesForDisease, diseases, drugsForDisease, entityName, hrefFor, phaseRank, targets, trialsForDisease } from '../lib/graph'
import { AskPanel } from '../components/AskPanel'
import { diseaseContext } from '../lib/context'

type Group = 'target' | 'modality' | 'phase'

export function DiseasePage() {
  const { id = '' } = useParams()
  const [group, setGroup] = useState<Group>('target')
  const d = diseases[id]
  if (!d) return <NotFound what={`“${id}”`} />

  const programs: { drug: Drug; p: Program }[] = drugsForDisease(d.id)
    .flatMap((drug) => drug.programs.filter((p) => p.diseaseId === d.id).map((p) => ({ drug, p })))
    .sort((a, b) => phaseRank(b.p.phase) - phaseRank(a.p.phase))
  const groups = new Map<string, typeof programs>()
  for (const row of programs) {
    const keys = group === 'target' ? row.drug.targets.map((t) => targets[t.targetId].symbol) : group === 'modality' ? [row.drug.modality] : [row.p.phase]
    for (const k of keys) groups.set(k, [...(groups.get(k) ?? []), row])
  }
  const groupList = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  const targetCounts = d.targetIds.map((t) => ({ t, n: programs.filter((r) => r.drug.targets.some((x) => x.targetId === t)).length })).sort((a, b) => b.n - a.n)
  const trials = trialsForDisease(d.id)
  const comps = companiesForDisease(d.id)

  return (
    <article>
      <header className="ent-head">
        <div className="ent-kind"><Link to="/diseases">Disease</Link></div>
        <h1>{d.name}</h1>
        <p className="lede">{d.summary}</p>
        <div className="ent-meta">
          <span className="chip approved">{plural(programs.filter((r) => r.p.status === 'approved' && !r.drug.approvalScope).length, 'approved therapy', 'approved therapies')} (US or EU)</span>
          {programs.some((r) => r.p.status === 'approved' && r.drug.approvalScope) && <span className="chip outline">{programs.filter((r) => r.p.status === 'approved' && r.drug.approvalScope).map((r) => `${r.drug.name}: ${r.drug.approvalScope}`).join(', ')}</span>}
          <span className="chip active">{programs.filter((r) => r.p.status === 'active').length} investigational</span>
          <span className="chip discontinued">{programs.filter((r) => r.p.status === 'discontinued').length + d.failures.length} failed or withdrawn</span>
          <EntityActions kind="disease" id={d.id} />
        </div>
        <div className="ent-meta" style={{ marginTop: 10 }}><Verified date={d.verified} /></div>
      </header>

      <div className="layout">
        <div className="stack-l">
          <SubNav items={[['biology', 'Biology'], ['epidemiology', 'Epidemiology'], ['care', 'Standard of care'], ['landscape', 'Development landscape'], ['biomarkers', 'Biomarkers'], ['failures', 'What has failed']]} />

          <section id="biology" className="section stack">
            <h2>Disease fundamentals</h2>
            <p className="prose">{d.pathophysiology}</p>
            <p className="prose">{d.progression}</p>
            <Facts items={[['Affected organs', d.organs.join(', ')], ['Symptoms', d.symptoms.join('; ')], ['Key mechanisms', d.mechanisms.join('; ')]]} />
          </section>

          <section id="ask" className="section">
            <AskPanel title={`Ask about ${d.name}`} scope={{ kind: 'disease', id: d.id }} buildContext={() => diseaseContext(d)} suggestions={[
              `Explain the pathophysiology of ${d.name} simply, then in more depth.`,
              `What are the main drug mechanisms being pursued for ${d.name}, and why?`,
              `What is the biggest unmet need in ${d.name} today?`,
            ]} />
          </section>

          <section id="epidemiology" className="section stack">
            <h2>Epidemiology and patient population</h2>
            <p className="prose">{d.epidemiology.prevalence} {d.epidemiology.burden}<Cite ids={d.epidemiology.sourceIds} /></p>
            <div className="two-col" style={{ gap: 24 }}>
              <div><h3 style={{ marginBottom: 6 }}>Risk factors</h3><ul className="small">{d.epidemiology.risks.map((r) => <li key={r}>{r}</li>)}</ul></div>
              <div><h3 style={{ marginBottom: 6 }}>Clinically meaningful subgroups</h3><ul className="small">{d.epidemiology.subpopulations.map((r) => <li key={r}>{r}</li>)}</ul></div>
            </div>
          </section>

          <section id="care" className="section stack">
            <h2>Current standard of care</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Treatment class</th><th>Examples</th><th>Role</th></tr></thead>
                <tbody>
                  {d.standardOfCare.map((s) => (
                    <tr key={s.drugClass}>
                      <td><strong>{s.drugClass}</strong></td>
                      <td className="small">{s.examples.map((e, i) => {
                        const match = s.drugIds.find((x) => e.toLowerCase().startsWith(x))
                        return <span key={e}>{i > 0 && ', '}{match ? <Link to={hrefFor('drug', match)}>{e}</Link> : e}</span>
                      })}</td>
                      <td className="small">{s.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>Guidelines referenced</h3>
              <ul className="sources">
                {d.guidelines.map((g) => (
                  <li key={g.title}><a href={g.url} target="_blank" rel="noreferrer">{g.title}</a><span className="xsmall muted"><span className="ev guideline">Guideline</span> {g.org}, {g.region}, {g.year}</span></li>
                ))}
              </ul>
            </div>
            <div className="callout info"><strong>Remaining unmet needs.</strong><ul className="small" style={{ marginTop: 6 }}>{d.unmetNeeds.map((u) => <li key={u}>{u}</li>)}</ul></div>
          </section>

          <section id="landscape" className="section stack">
            <div className="section-head">
              <h2>Drug development landscape</h2>
              <div className="seg" role="group" aria-label="Group programs by">
                {(['target', 'modality', 'phase'] as Group[]).map((g) => <button key={g} aria-pressed={group === g} onClick={() => setGroup(g)}>By {g}</button>)}
              </div>
            </div>
            {groupList.map(([k, rows]) => (
              <div key={k}>
                <div className="spread" style={{ marginBottom: 6 }}>
                  <h3>{k} <span className="faint small">{rows.length} {rows.length === 1 ? 'program' : 'programs'}</span></h3>
                  {new Set(rows.map((r) => r.drug.id)).size >= 2 && <Link className="btn small" to={`/compare?d=${[...new Set(rows.map((r) => r.drug.id))].slice(0, 4).join(',')}&mode=clinical&disease=${d.id}`}>Compare {Math.min(4, new Set(rows.map((r) => r.drug.id)).size)} of these</Link>}
                </div>
                <div className="table-wrap">
                  <table>
                    <tbody>
                      {rows.map(({ drug, p }) => (
                        <tr key={drug.id + p.indication}>
                          <td style={{ width: '28%' }}><Link to={hrefFor('drug', drug.id)}>{drug.name}</Link><div className="xsmall faint">{entityName('company', p.company)}</div></td>
                          <td className="small" style={{ width: '24%' }}>{drug.modality}, {drug.targets.map((t) => targets[t.targetId].symbol).join(' + ')}</td>
                          <td className="small" style={{ whiteSpace: 'nowrap' }}>{p.phase}</td>
                          <td><StatusChip status={p.status} scope={drug.approvalScope} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div className="two-col" style={{ gap: 24 }}>
              <div>
                <h3 style={{ marginBottom: 8 }}>Targets attracting the most programs</h3>
                <ul className="linklist">{targetCounts.map(({ t, n }) => <li key={t}><Link to={hrefFor('target', t)}><span>{targets[t].symbol}</span><span className="rel">{n} {n === 1 ? 'drug' : 'drugs'}</span></Link></li>)}</ul>
              </div>
              <div>
                <h3 style={{ marginBottom: 8 }}>Companies developing treatments</h3>
                <ul className="linklist">{comps.map((c) => <li key={c}><Link to={hrefFor('company', c)}><span>{entityName('company', c)}</span><span className="rel">{programs.filter((r) => r.p.company === c).length} programs</span></Link></li>)}</ul>
              </div>
            </div>
            {trials.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 8 }}>Trials in this disease</h3>
                <ul className="linklist">{trials.map((t) => <li key={t.nct}><Link to={hrefFor('trial', t.nct)}><span>{t.name}</span><span className="rel">{t.drugIds.map((x) => entityName('drug', x)).join(', ')}, {t.phase}</span></Link></li>)}</ul>
              </div>
            )}
          </section>

          <section id="biomarkers" className="section">
            <h2>Biomarkers and precision medicine</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Biomarker or characteristic</th><th>Role</th><th>What it means for treatment</th></tr></thead>
                <tbody>{d.biomarkers.map((b) => <tr key={b.name}><td><strong>{b.name}</strong></td><td className="small">{b.role}</td><td className="small">{b.implication}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="failures" className="section">
            <h2>Approaches that failed or were withdrawn</h2>
            <ul className="stack-s" style={{ listStyle: 'none', padding: 0 }}>
              {d.failures.map((f) => (
                <li key={f.name} className="panel tight">
                  <strong>{f.drugId ? <EntityLink kind="drug" id={f.drugId}>{f.name}</EntityLink> : f.name}</strong>
                  <p className="small muted">{f.what}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="rail">
          <ConnectedRail kind="disease" id={d.id} />
          <NotesPanel kind="disease" id={d.id} />
          <div><h3>Sources</h3><SourceList ids={d.sourceIds} /></div>
        </aside>
      </div>
    </article>
  )
}
