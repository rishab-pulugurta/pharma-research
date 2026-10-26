import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updates } from '../data/updates'
import { entityExists, entityName, hrefFor, kindLabel } from '../lib/graph'
import { createCollection, deleteCollection, isWatched, toggleInCollection, toggleWatch, useStore } from '../lib/store'
import { UpdateFeed } from './Updates'
import { localDate } from '../lib/format'

export function Workspace() {
  const s = useStore()
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const feed = updates.filter((u) => u.entities.some((e) => isWatched(s, e)))
  return (
    <div>
      <header className="ent-head">
        <div className="ent-kind">Your research</div>
        <h1>Saved research</h1>
        <p className="lede">What you follow, your collections and your notes. Everything here is stored in this browser only.</p>
      </header>
      <div className="layout">
        <div className="stack-l">
          <section className="stack">
            <h2>Developments in what you follow</h2>
            <UpdateFeed items={feed} />
          </section>

          <section className="stack">
            <h2>Collections</h2>
            <form className="row" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { createCollection(name.trim()); setName('') } }}>
              <input id="new-collection" type="text" aria-label="Collection name" placeholder="e.g. Next-generation obesity therapeutics" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
              <button className="btn" type="submit">Create collection</button>
            </form>
            {s.collections.length === 0 && <p className="muted small">No collections yet. Use “Save to collection” on any profile, or create one here.</p>}
            {s.collections.map((c) => (
              <div key={c.id} className="panel stack-s">
                <div className="spread">
                  <h3>{c.name}</h3>
                  {confirming === c.id ? (
                    <span className="row" style={{ gap: 6 }}>
                      <span className="xsmall muted">Delete “{c.name}”?</span>
                      <button className="btn small" onClick={() => { deleteCollection(c.id); setConfirming(null); document.getElementById('new-collection')?.focus() }}>Delete</button>
                      <button className="btn ghost small" autoFocus onClick={() => { setConfirming(null); requestAnimationFrame(() => (document.querySelector(`[data-del="${c.id}"]`) as HTMLElement | null)?.focus()) }}>Keep</button>
                    </span>
                  ) : (
                    <button className="btn ghost small" data-del={c.id} onClick={() => setConfirming(c.id)}>Delete collection</button>
                  )}
                </div>
                {c.items.length === 0 ? <p className="small muted">Empty. Open any profile and choose “Save to collection”.</p> : (
                  <ul className="linklist">
                    {c.items.filter((i) => entityExists(i.kind, i.id)).map((i) => (
                      <li key={i.kind + i.id} className="spread">
                        <Link to={hrefFor(i.kind, i.id)} style={{ flex: 1 }}><span>{entityName(i.kind, i.id)}</span><span className="rel">{kindLabel[i.kind]}</span></Link>
                        <button className="btn ghost small" onClick={() => toggleInCollection(c.id, i)} aria-label={`Remove ${entityName(i.kind, i.id)} from ${c.name}`}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
                {c.items.filter((i) => i.kind === 'drug').length >= 2 && (
                  <Link className="small" to={`/compare?d=${c.items.filter((i) => i.kind === 'drug').slice(0, 4).map((i) => i.id).join(',')}`}>Compare the drugs in this collection</Link>
                )}
              </div>
            ))}
          </section>

          <section className="stack">
            <h2>Notes</h2>
            {s.notes.length === 0 ? <p className="muted small">Notes you add on profiles appear here, linked back to the evidence.</p> : (
              <ul className="stack-s" style={{ listStyle: 'none', padding: 0 }}>
                {s.notes.map((n) => (
                  <li key={n.ref.kind + n.ref.id} className="panel tight">
                    <div className="spread"><Link to={hrefFor(n.ref.kind, n.ref.id)} style={{ fontWeight: 650 }}>{entityName(n.ref.kind, n.ref.id)}</Link><span className="xsmall faint">{localDate(n.updated)}</span></div>
                    <p className="prose small" style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="rail">
          <div>
            <h3>Following</h3>
            {s.watch.length === 0 ? <p className="small muted">Use “Follow” on any profile.</p> : (
              <ul className="linklist">
                {s.watch.map((w) => (
                  <li key={w.kind + w.id} className="spread">
                    <Link to={hrefFor(w.kind, w.id)} style={{ flex: 1 }}><span>{entityName(w.kind, w.id)}</span><span className="rel">{kindLabel[w.kind]}</span></Link>
                    <button className="btn ghost small" onClick={() => toggleWatch(w)} aria-label={`Unfollow ${entityName(w.kind, w.id)}`}>Unfollow</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
