import { useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kindLabel } from '../lib/graph'
import { nctPattern, search } from '../lib/search'

export function SearchBox({ big = false, autoFocus = false }: { big?: boolean; autoFocus?: boolean }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState(-1)
  const nav = useNavigate()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const hits = useMemo(() => search(q), [q])
  const nct = nctPattern.test(q.trim()) && !hits.some((h) => h.id.toLowerCase() === q.trim().toLowerCase())
  const options = [
    ...hits.map((h) => ({ href: h.href, kind: kindLabel[h.kind], title: h.title, sub: h.matched.startsWith('acts on') ? `${h.subtitle}, ${h.matched}` : h.matched && !h.title.toLowerCase().includes(h.matched) ? `Matched “${h.matched}”, ${h.subtitle}` : h.subtitle })),
    ...(nct ? [{ href: `/trials/${q.trim().toUpperCase()}`, kind: 'Registry', title: q.trim().toUpperCase(), sub: 'Look up this trial live in ClinicalTrials.gov' }] : []),
    ...(!nct && q.trim().length >= 3 && !hits.some((h) => h.kind === 'company' && h.score >= 70)
      ? [{ href: `/companies/live/${encodeURIComponent(q.trim())}`, kind: 'Live lookup', title: `Look up “${q.trim()}” as a company`, sub: 'Pipeline from ClinicalTrials.gov and approvals from Drugs@FDA, fetched live' }]
      : []),
  ]

  const go = (href: string) => {
    setOpen(false)
    setQ('')
    inputRef.current?.blur()
    nav(href)
  }

  return (
    <div className={`searchbox${big ? ' big' : ''}`} role="search">
      <svg className="glass" width={big ? 20 : 16} height={big ? 20 : 16} viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      <input
        ref={inputRef}
        type="search"
        autoFocus={autoFocus}
        value={q}
        placeholder={big ? 'Search Lilly, retatrutide, GLP-1R, obesity, NCT04184622…' : 'Search drugs, targets, trials…'}
        aria-label="Search PharmAtlas"
        role="combobox"
        aria-expanded={open && q.length > 0}
        aria-controls={listId}
        aria-activedescendant={options[sel] ? `${listId}-${sel}` : undefined}
        onChange={(e) => { setQ(e.target.value); setSel(-1); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, options.length - 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
          if (e.key === 'Enter' && options.length) go(options[Math.max(sel, 0)].href)
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && q.trim() && (
        <ul className="results" id={listId} role="listbox">
          {options.map((o, i) => (
            <li key={o.href} role="presentation">
              <a id={`${listId}-${i}`} role="option" aria-selected={i === sel} href={o.href} onMouseDown={(e) => { e.preventDefault(); go(o.href) }}>
                <span className="r-kind">{o.kind}</span>
                <span><span className="r-title">{o.title}</span><span className="r-sub">{o.sub}</span></span>
              </a>
            </li>
          ))}
          {!options.length && q.trim().length < 3 && <li className="empty">Nothing matches “{q}”. Try a generic name, research code (e.g. LY3437943), brand, target or NCT number.</li>}
        </ul>
      )}
    </div>
  )
}
