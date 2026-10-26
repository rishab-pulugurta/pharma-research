import { Link } from 'react-router-dom'
import { SearchBox } from '../components/SearchBox'
import { updates } from '../data/updates'
import { companyList, diseaseList, drugList, entityName, hrefFor, pathwayList, targetList, trialList } from '../lib/graph'

const entries = [
  { to: '/companies', n: companyList.length, title: 'Companies', q: 'What is this company developing?' },
  { to: '/drugs', n: drugList.length, title: 'Drugs', q: 'How does this drug work, and how promising is it?' },
  { to: '/diseases', n: diseaseList.length, title: 'Diseases', q: 'What treatments exist, and what is being developed?' },
  { to: '/targets', n: targetList.length + pathwayList.length, title: 'Targets & pathways', q: 'Which biological mechanisms are being pursued?' },
  { to: '/trials', n: trialList.length, title: 'Clinical trials', q: 'What has been tested, and what were the results?' },
  { to: '/regulatory', n: new Set(drugList.flatMap((d) => d.regulatory.map((r) => `${d.id}:${r.diseaseId}`))).size, title: 'Regulatory landscape', q: 'Which therapies are approved, and where?' },
]

const journeys = [
  { title: 'Explore a company', steps: [['Eli Lilly’s pipeline', '/companies/lilly'], ['Filter to obesity programs', '/companies/lilly?disease=obesity'], ['Retatrutide’s mechanism', '/drugs/retatrutide#mechanism'], ['Its Phase 2 results', '/trials/NCT04881760'], ['Competing programs', '/drugs/retatrutide#related']] },
  { title: 'Understand a disease', steps: [['Type 2 diabetes biology', '/diseases/t2d'], ['Current standard of care', '/diseases/t2d#care'], ['Emerging mechanisms', '/diseases/t2d#landscape'], ['Compare tirzepatide and semaglutide', '/compare?d=tirzepatide,semaglutide&mode=clinical']] },
  { title: 'Follow a target', steps: [['PCSK9 and LDL clearance', '/targets/pcsk9'], ['The LDL receptor pathway', '/pathways/ldlr-recycling'], ['Antibody vs siRNA vs gene editing', '/compare?d=evolocumab,inclisiran,verve102&mode=mechanism'], ['FOURIER outcomes', '/trials/NCT01764633']] },
  { title: 'Evaluate a trial', steps: [['SELECT design and population', '/trials/NCT03574597'], ['Primary endpoint, in absolute terms', '/trials/NCT03574597#results'], ['Adverse events', '/trials/NCT03574597#safety'], ['Original publication', '/trials/NCT03574597#sources']] },
]

const questions: [string, string][] = [
  ['Which drugs target PCSK9, and how far along are they?', '/drugs?target=pcsk9'],
  ['What oral options exist for obesity?', '/drugs?disease=obesity&route=oral'],
  ['What competitors does retatrutide have?', '/drugs/retatrutide#related'],
  ['Which programs were discontinued, and why?', '/drugs?status=discontinued'],
  ['Which approved drugs have proven cardiovascular outcome benefit?', '/compare?d=semaglutide,evolocumab,empagliflozin&mode=clinical'],
  ['Which trials have only company-reported results?', '/trials?evidence=topline%20reported'],
]

export function Home() {
  return (
    <div className="stack-l">
      <section className="home-hero">
        <h1>What is being developed, why should it work, and what does the evidence show?</h1>
        <p className="lede">PharmAtlas connects companies, molecules, mechanisms, diseases, trials and regulatory decisions into one map you can explore, with a source on every claim. The current release covers metabolic, obesity and lipid therapeutics.</p>
        <SearchBox big autoFocus />
        <div className="try">
          Try
          <Link to="/companies/lilly">Lilly</Link>
          <Link to="/drugs/retatrutide">retatrutide</Link>
          <Link to="/targets/glp1r">GLP-1R</Link>
          <Link to="/diseases/obesity">obesity</Link>
          <Link to="/trials/NCT04184622">NCT04184622</Link>
        </div>
      </section>

      <section aria-labelledby="entry-h">
        <h2 id="entry-h" className="visually-hidden">Entry points</h2>
        <div className="entry-grid">
          {entries.map((e) => (
            <Link key={e.to} to={e.to} className="entry">
              <span className="n">{e.n}</span>
              <h3>{e.title}</h3>
              <p>{e.q}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="journeys-h">
        <h2 id="journeys-h" style={{ marginBottom: 14 }}>Start with a research path</h2>
        <div className="journeys">
          {journeys.map((j) => (
            <div key={j.title} className="journey">
              <h3>{j.title}</h3>
              <ol>
                {j.steps.map(([label, to]) => <li key={to}><Link to={to}>{label}</Link></li>)}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="q-h" className="two-col">
        <div>
          <h2 id="q-h" style={{ marginBottom: 14 }}>Or ask a question</h2>
          <ul className="linklist">
            {questions.map(([q, to]) => <li key={q}><Link to={to}><span>{q}</span></Link></li>)}
          </ul>
          <p className="xsmall faint" style={{ marginTop: 10 }}>Each question opens a filtered view of the underlying entities. Free-text questions are planned for a later release.</p>
        </div>
        <div>
          <div className="spread" style={{ marginBottom: 14 }}>
            <h2>Recent developments</h2>
            <Link to="/updates" className="small">All updates</Link>
          </div>
          <ul className="feed">
            {updates.slice(0, 4).map((u) => (
              <li key={u.id} style={{ gridTemplateColumns: '80px minmax(0,1fr)' }}>
                <span className="date">{u.date}</span>
                <div className="stack-s">
                  {(() => { const e = u.entities.find((x) => x.kind === 'trial') ?? u.entities[0]; return <Link to={hrefFor(e.kind, e.id)} style={{ fontWeight: 650 }}>{u.title}</Link> })()}
                  <p className="small muted">{u.why}</p>
                  <p className="xsmall faint">Affects {u.entities.map((e) => entityName(e.kind, e.id)).join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
