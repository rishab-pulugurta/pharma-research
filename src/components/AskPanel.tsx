import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import type { EntityKind } from '../data/types'

interface Turn {
  role: 'user' | 'assistant'
  text: string
  sources?: { url: string; title: string }[]
  error?: string
}

/** Inline markdown: **bold**, *italic*, `code`, [link](url). Built as React nodes, never raw HTML. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>)
    else if (t.startsWith('`')) out.push(<code key={i++}>{t.slice(1, -1)}</code>)
    else if (t.startsWith('[')) out.push(<a key={i++} href={m[2]} target="_blank" rel="noreferrer">{t.slice(1, t.indexOf(']'))}</a>)
    else out.push(<em key={i++}>{t.slice(1, -1)}</em>)
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  const lines = text.replace(/\r/g, '').split('\n')
  let list: { ordered: boolean; items: string[] } | null = null
  let para: string[] = []
  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>)
    para = []
  }
  const flushList = () => {
    if (list) {
      const items = list.items.map((it, k) => <li key={k}>{inline(it)}</li>)
      blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>)
    }
    list = null
  }
  for (const line of lines) {
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line)
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (h) { flushPara(); flushList(); blocks.push(<h4 key={blocks.length}>{inline(h[2])}</h4>) }
    else if (ul || ol) {
      flushPara()
      const ordered = Boolean(ol)
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] } }
      list.items.push((ul ?? ol)![1])
    } else if (!line.trim()) { flushPara(); flushList() }
    else { flushList(); para.push(line.trim()) }
  }
  flushPara()
  flushList()
  return <div className="md">{blocks.map((b, k) => <Fragment key={k}>{b}</Fragment>)}</div>
}

export function AskPanel({ title, scope, buildContext, suggestions }: {
  title: string
  scope: { kind: EntityKind; id: string }
  buildContext: () => string | Promise<string>
  suggestions: string[]
}) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const convId = useRef(crypto.randomUUID())
  const abort = useRef<AbortController | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLTextAreaElement>(null)

  // A new page means a new conversation with that page's context.
  useEffect(() => {
    setTurns([])
    convId.current = crypto.randomUUID()
    return () => abort.current?.abort()
  }, [scope.kind, scope.id])

  useEffect(() => {
    if (turns.length) end.current?.scrollIntoView({ block: 'nearest' })
  }, [turns])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || busy) return
    setInput('')
    setBusy(true)
    setStatus(turns.length ? 'Thinking…' : 'Gathering this page’s data…')
    setTurns((t) => [...t, { role: 'user', text: q }, { role: 'assistant', text: '' }])
    const patch = (fn: (t: Turn) => Turn) => setTurns((all) => [...all.slice(0, -1), fn(all[all.length - 1])])
    try {
      const context = turns.length === 0 ? await buildContext() : undefined
      setStatus('Thinking…')
      abort.current = new AbortController()
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId.current, question: q, context }),
        signal: abort.current.signal,
      })
      if (!res.ok || !res.body) throw new Error(`The assistant is unavailable (${res.status}). Is the dev server running?`)
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        let idx
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx)
          buf = buf.slice(idx + 2)
          const ev = /^event: (.*)$/m.exec(chunk)?.[1]
          const data = JSON.parse(/^data: (.*)$/m.exec(chunk)?.[1] ?? '{}')
          if (ev === 'text') { setStatus(''); patch((t) => ({ ...t, text: t.text + data.delta })) }
          else if (ev === 'status') setStatus(data.message)
          else if (ev === 'sources') patch((t) => ({ ...t, sources: data.items }))
          else if (ev === 'error') patch((t) => ({ ...t, error: data.message }))
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') patch((t) => ({ ...t, error: (e as Error).message }))
    } finally {
      setBusy(false)
      setStatus('')
    }
  }

  return (
    <div className="ask">
      <div className="ask-head">
        <h2>{title}</h2>
        {turns.length > 0 && !busy && (
          <button className="btn ghost small" onClick={() => { setTurns([]); convId.current = crypto.randomUUID(); box.current?.focus() }}>New conversation</button>
        )}
      </div>
      <p className="xsmall faint">Answers come from Google Gemini (free tier), using this page’s sourced data first and live lookups in ClinicalTrials.gov, FDA records and PubMed when they need something newer. They’re for learning, not medical advice, and can be wrong, so check the linked sources.</p>
      {turns.length === 0 && (
        <div className="try" style={{ marginTop: 10 }}>
          {suggestions.map((s) => <button key={s} className="ask-suggest" onClick={() => void ask(s)}>{s}</button>)}
        </div>
      )}
      {turns.length > 0 && (
        <div className="ask-log" aria-live="polite">
          {turns.map((t, i) => (
            <div key={i} className={`ask-turn ${t.role}`}>
              {t.role === 'user' ? <p>{t.text}</p> : (
                <>
                  {t.text && <Markdown text={t.text} />}
                  {i === turns.length - 1 && busy && <p className="xsmall faint" role="status">{status || 'Writing…'}</p>}
                  {t.error && <p className="callout small">{t.error}</p>}
                  {t.sources && t.sources.length > 0 && (
                    <div className="ask-sources">
                      <span className="xsmall faint">Sources looked up</span>
                      <ol>{t.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ol>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={end} />
        </div>
      )}
      <form className="ask-form" onSubmit={(e) => { e.preventDefault(); void ask(input) }}>
        <textarea
          ref={box}
          aria-label={title}
          value={input}
          placeholder="Ask a question about this page…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(input) } }}
          rows={2}
        />
        {busy ? (
          <button type="button" className="btn" onClick={() => abort.current?.abort()}>Stop</button>
        ) : (
          <button type="submit" className="btn primary" disabled={!input.trim()}>Ask</button>
        )}
      </form>
    </div>
  )
}
