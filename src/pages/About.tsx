import { ConfidenceTag, EvidenceTag } from '../components/bits'
import type { Confidence, EvidenceType } from '../data/types'

const ev: [EvidenceType, string][] = [
  ['peer-reviewed', 'Published in a peer-reviewed journal. The strongest level for trial results, though still subject to the trial’s design limits.'],
  ['regulatory', 'A label, assessment report or decision from the FDA, EMA or another regulator. Authoritative for approval status and approved populations.'],
  ['registry', 'A ClinicalTrials.gov record. Authoritative for design and status. Posted results are often incomplete or delayed.'],
  ['company', 'A press release or investor disclosure. Often the first public data, but unreviewed, and framed by the sponsor.'],
  ['guideline', 'A clinical practice guideline, labeled with its organization, region and year.'],
  ['preclinical', 'Cell or animal studies. Useful for mechanism, and frequently not borne out in humans.'],
]
const conf: [Confidence, string][] = [
  ['established', 'Shown directly by binding, signaling or genetic experiments.'],
  ['clinical', 'Observed in human trials of this drug or its class.'],
  ['inferred', 'Expected from related compounds or the target’s biology, but not directly shown for this drug.'],
  ['hypothetical', 'Proposed, contested, or shown only in animals.'],
]

export function About() {
  return (
    <article className="stack-l" style={{ maxWidth: 820 }}>
      <header className="ent-head">
        <div className="ent-kind">Methodology</div>
        <h1>How evidence is labeled</h1>
        <p className="lede">PharmAtlas separates biological hypotheses, preclinical findings, clinical outcomes and regulatory conclusions, and links each claim to the document it comes from.</p>
      </header>
      <section className="stack">
        <h2>Source types</h2>
        <dl className="stack">{ev.map(([t, d]) => <div key={t}><dt><EvidenceTag type={t} /></dt><dd className="small" style={{ margin: '4px 0 0' }}>{d}</dd></div>)}</dl>
      </section>
      <section className="stack">
        <h2>Mechanism confidence</h2>
        <p className="small muted">In mechanism maps, line style shows how well each link is supported, so the signal never depends on color alone.</p>
        <dl className="stack">{conf.map(([c, d]) => <div key={c}><dt><ConfidenceTag c={c} /></dt><dd className="small" style={{ margin: '4px 0 0' }}>{d}</dd></div>)}</dl>
      </section>
      <section className="stack">
        <h2>Missing is not negative</h2>
        <p className="prose">A trial without posted results, a jurisdiction without a recorded decision, or a field marked “not abstracted” means PharmAtlas does not yet hold that information. None of these is evidence of failure, rejection or harm.</p>
      </section>
      <section className="stack">
        <h2>Comparisons</h2>
        <p className="prose">PharmAtlas never ranks drugs on numbers from different trials. When a head-to-head randomized trial exists, it is shown first. Otherwise the comparison workspace lists the specific reasons the figures differ: timepoints, estimands, comparators, populations and source types.</p>
      </section>
      <section className="stack">
        <h2>Scope and freshness</h2>
        <p className="prose">This release covers metabolic, obesity and lipid therapeutics. Curated profiles show when they were last verified, and trial pages check ClinicalTrials.gov live for the current status. Content is for research and education. It is not medical advice, and it does not present investigational drugs as established care.</p>
      </section>
    </article>
  )
}
