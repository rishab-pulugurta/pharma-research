import { Component, useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import type { EntityKind } from '../data/types'
import { entityExists, entityName, kindPath } from '../lib/graph'
import { SearchBox } from './SearchBox'

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="empty-state" role="alert">
        <h3>This page couldn’t be displayed</h3>
        <p>Something in this view failed to load: {this.state.error.message}</p>
        <p style={{ marginTop: 12 }}><Link to="/">Go to the home page</Link></p>
      </div>
    )
  }
}

const pageTitles: Record<string, string> = {
  explore: 'Explore', companies: 'Companies', drugs: 'Drugs', diseases: 'Diseases', targets: 'Targets', trials: 'Clinical trials',
  pathways: 'Pathways', compare: 'Compare drugs', regulatory: 'Regulatory landscape', updates: 'Updates', map: 'Relationship map',
  workspace: 'Saved research', about: 'How evidence is labeled',
}
const pathKind = Object.fromEntries(Object.entries(kindPath).map(([k, v]) => [v, k])) as Record<string, EntityKind>

function titleFor(pathname: string): string {
  const [section, id] = pathname.split('/').filter(Boolean)
  if (!section) return 'PharmAtlas'
  const kind = pathKind[section]
  if (kind && id) {
    const key = kind === 'trial' ? id.toUpperCase() : id
    return `${entityExists(kind, key) ? entityName(kind, key) : key} | PharmAtlas`
  }
  return `${pageTitles[section] ?? 'Not found'} | PharmAtlas`
}

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M1.5 13h23M13 1.5c-4 3.2-4 19.8 0 23M13 1.5c4 3.2 4 19.8 0 23" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
      <circle cx="9" cy="9" r="2.6" fill="var(--stain)" />
      <circle cx="17.5" cy="15" r="2" fill="var(--stain)" />
      <path d="M9 9l8.5 6" stroke="var(--stain)" strokeWidth="1.4" />
    </svg>
  )
}

export function Layout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  useEffect(() => {
    document.title = titleFor(pathname)
  }, [pathname])
  const home = pathname === '/'
  return (
    <div className="shell">
      <a href="#main" className="visually-hidden">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="wordmark"><Mark />PharmAtlas</Link>
          {!home && <SearchBox />}
          <nav className="nav" aria-label="Primary">
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/regulatory">Regulatory</NavLink>
            <NavLink to="/updates">Updates</NavLink>
            <NavLink to="/map">Map</NavLink>
            <NavLink to="/workspace">Saved</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="main">
        <Boundary key={pathname}>
          <Outlet />
        </Boundary>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span>PharmAtlas is a research and educational tool, not medical advice. It does not recommend treatments for individuals.</span>
          <span><Link to="/about">How evidence is labeled</Link></span>
        </div>
      </footer>
    </div>
  )
}
