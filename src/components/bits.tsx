import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sources } from '../data/sources'
import type { Confidence, EntityKind, EvidenceType, ProgramStatus } from '../data/types'
import { entityExists, entityName, hrefFor, kindLabel, neighbors } from '../lib/graph'
import { localDate } from '../lib/format'
import { createCollection, isWatched, noteFor, saveNote, toggleInCollection, toggleWatch, useStore } from '../lib/store'

export const evidenceLabel: Record<EvidenceType, string> = {
  'peer-reviewed': 'Peer-reviewed',
  regulatory: 'Regulatory',
  registry: 'Registry',
  company: 'Company disclosure',
  guideline: 'Guideline',
  preclinical: 'Preclinical',
  news: 'Medical news',
}

export function EvidenceTag({ type }: { type: EvidenceType }) {
  return <span className={`ev ${type}`}>{evidenceLabel[type]}</span>
}

/** Inline citation: one evidence tag per source, each linking to the original document. */
export function Cite({ ids }: { ids: string[] }) {
  const list = ids.map((id) => sources[id]).filter(Boolean)
  if (!list.length) return null
  return (
    <span className="cite">
      {list.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noreferrer" title={`${s.title} (${s.publisher}, ${s.date})`}>
          <EvidenceTag type={s.type} />
        </a>
      ))}
    </span>
  )
}

export function SourceList({ ids }: { ids: string[] }) {
  const list = [...new Set(ids)].map((id) => sources[id]).filter(Boolean)
  return (
    <ul className="sources">
      {list.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
          <span className="row xsmall muted" style={{ gap: 8 }}>
            <EvidenceTag type={s.type} />
            {s.publisher}
            {s.date !== '—' && s.date !== 'live' ? `, ${s.date}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

export const confidenceLabel: Record<Confidence, string> = {
  established: 'Experimentally established',
  clinical: 'Supported by clinical evidence',
  inferred: 'Inferred from related compounds',
  hypothetical: 'Hypothesized',
}

export function ConfidenceSwatch({ c }: { c: Confidence }) {
  return (
    <svg width="28" height="8" aria-hidden="true">
      <line x1="1" y1="4" x2="27" y2="4" className={`medge ${c}`} />
    </svg>
  )
}

export function ConfidenceTag({ c }: { c: Confidence }) {
  return (
    <span className="conf">
      <ConfidenceSwatch c={c} />
      {confidenceLabel[c]}
    </span>
  )
}

export function ConfidenceLegend() {
  return (
    <div className="legend" aria-label="Evidence strength legend">
      {(['established', 'clinical', 'inferred', 'hypothetical'] as Confidence[]).map((c) => (
        <ConfidenceTag key={c} c={c} />
      ))}
    </div>
  )
}

const statusText: Record<ProgramStatus, string> = {
  active: 'Investigational',
  approved: 'Approved',
  discontinued: 'Discontinued',
  suspended: 'Suspended',
  partnered: 'Partnered',
}

export function StatusChip({ status, scope }: { status: ProgramStatus | 'investigational'; scope?: string }) {
  const s = status === 'investigational' ? 'active' : status
  const glyph = s === 'approved' ? '✓' : s === 'discontinued' ? '×' : s === 'suspended' ? '‖' : '◇'
  return (
    <span className={`chip ${s}`}>
      <span aria-hidden="true">{glyph}</span>
      {statusText[s]}{s === 'approved' && scope ? ` (${scope})` : ''}
    </span>
  )
}

export function Verified({ date }: { date: string }) {
  return (
    <span className="verified" title="Date the curated facts on this page were last checked against their sources">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" /><path d="M3.5 6.2 5.2 7.8 8.5 4.4" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
      Last verified {date}
    </span>
  )
}

export function EntityLink({ kind, id, children }: { kind: EntityKind; id: string; children?: React.ReactNode }) {
  if (!entityExists(kind, id)) return <span>{children ?? entityName(kind, id)}</span>
  return <Link to={hrefFor(kind, id)}>{children ?? entityName(kind, id)}</Link>
}

export function WatchButton({ kind, id }: { kind: EntityKind; id: string }) {
  const s = useStore()
  const on = isWatched(s, { kind, id })
  return (
    <button className="btn" aria-pressed={on} onClick={() => toggleWatch({ kind, id })}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
      {on ? 'Following' : 'Follow'}
    </button>
  )
}

export function SaveToCollection({ kind, id }: { kind: EntityKind; id: string }) {
  const s = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const ref = { kind, id }
  const savedIn = s.collections.filter((c) => c.items.some((i) => i.kind === kind && i.id === id)).length
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        box.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div style={{ position: 'relative' }} ref={box}>
      <button className="btn" aria-expanded={open} aria-pressed={savedIn > 0} onClick={() => setOpen(!open)}>
        {savedIn > 0 ? `Saved in ${savedIn} ${savedIn === 1 ? 'collection' : 'collections'}` : 'Save to collection'}
      </button>
      {open && (
        <div className="panel tight stack-s" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20, width: 260, boxShadow: 'var(--shadow-pop)' }}>
          {s.collections.length === 0 && <p className="small muted">No collections yet. Name one to start.</p>}
          {s.collections.map((c) => (
            <label key={c.id} className="row small" style={{ gap: 8 }}>
              <input type="checkbox" checked={c.items.some((i) => i.kind === kind && i.id === id)} onChange={() => toggleInCollection(c.id, ref)} />
              {c.name}
            </label>
          ))}
          <form
            className="row"
            style={{ gap: 6 }}
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) {
                createCollection(name.trim(), ref)
                setName('')
              }
            }}
          >
            <input type="text" aria-label="New collection name" placeholder="New collection" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
            <button className="btn small" type="submit">Create</button>
          </form>
        </div>
      )}
    </div>
  )
}

export function EntityActions({ kind, id }: { kind: EntityKind; id: string }) {
  return (
    <div className="ent-actions">
      <WatchButton kind={kind} id={id} />
      <SaveToCollection kind={kind} id={id} />
    </div>
  )
}

export function NotesPanel({ kind, id }: { kind: EntityKind; id: string }) {
  const s = useStore()
  const existing = noteFor(s, { kind, id })
  const [text, setText] = useState(existing?.text ?? '')
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <h3>Your notes</h3>
      <form
        className="stack-s"
        onSubmit={(e) => {
          e.preventDefault()
          saveNote({ kind, id }, text)
          setSaved(true)
        }}
      >
        <textarea aria-label={`Notes on ${entityName(kind, id)}`} value={text} placeholder="Saved in this browser only." onChange={(e) => { setText(e.target.value); setSaved(false) }} />
        <div className="row">
          <button className="btn small" type="submit">Save note</button>
          {saved && <span className="xsmall muted" role="status">Note saved</span>}
          {!saved && existing && <span className="xsmall faint">Updated {localDate(existing.updated)}</span>}
        </div>
      </form>
    </div>
  )
}

const kindOrder: EntityKind[] = ['disease', 'target', 'drug', 'company', 'trial', 'pathway']

export function ConnectedRail({ kind, id }: { kind: EntityKind; id: string }) {
  const ns = neighbors(kind, id)
  if (!ns.length) return null
  return (
    <div>
      <div className="spread" style={{ marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>Connected</h3>
        <Link className="xsmall" to={`/map?focus=${kind}:${id}`}>Open in map</Link>
      </div>
      {kindOrder.map((k) => {
        const group = ns.filter((n) => n.kind === k)
        if (!group.length) return null
        return (
          <div key={k}>
            <div className="group-label">{k === 'company' ? 'Companies' : `${kindLabel[k]}s`}</div>
            <ul className="linklist">
              {group.map((n) => (
                <li key={n.id}>
                  <Link to={hrefFor(n.kind, n.id)}>
                    <span>{entityName(n.kind, n.id)}</span>
                    <span className="rel">{n.relation}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export function Facts({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="facts">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SubNav({ items }: { items: [string, string][] }) {
  return (
    <nav className="subnav" aria-label="On this page">
      {items.map(([href, label]) => (
        <a key={href} href={`#${href}`}>{label}</a>
      ))}
    </nav>
  )
}

export function NotFound({ what }: { what: string }) {
  return (
    <div className="empty-state">
      <h3>{what} isn’t in PharmAtlas yet</h3>
      <p>The current release covers metabolic, obesity and lipid therapeutics. Try searching for a related drug, target or disease.</p>
      <p style={{ marginTop: 12 }}><Link to="/explore">Browse everything in the atlas</Link></p>
    </div>
  )
}
