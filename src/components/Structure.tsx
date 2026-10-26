import { useState } from 'react'
import type { Drug } from '../data/types'

/** Small molecules get a PubChem 2D depiction; biologics get a modality schematic. */
export function Structure({ drug }: { drug: Drug }) {
  const [failed, setFailed] = useState(false)
  const name = drug.structure.pubchemName
  return (
    <figure className="panel stack-s" style={{ margin: 0 }}>
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 170, background: name && !failed ? '#fff' : 'transparent', borderRadius: 6 }}>
        {name && !failed ? (
          <img
            src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/PNG?image_size=320x220`}
            alt={`2D chemical structure of ${drug.name}`}
            width={320}
            height={220}
            style={{ maxWidth: '100%', height: 'auto' }}
            onError={() => setFailed(true)}
          />
        ) : (
          <ModalityGlyph modality={drug.modality} />
        )}
      </div>
      <figcaption className="xsmall muted">
        {drug.structure.note}
        {name && (
          <>
            {' '}
            <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(name)}#section=3D-Conformer`} target="_blank" rel="noreferrer">View 3D conformer on PubChem</a>
          </>
        )}
      </figcaption>
    </figure>
  )
}

function ModalityGlyph({ modality }: { modality: Drug['modality'] }) {
  const stroke = 'var(--ink-2)'
  const accent = 'var(--stain)'
  if (modality === 'Monoclonal antibody' || modality === 'Antibody–peptide conjugate') {
    return (
      <svg width="200" height="160" viewBox="0 0 200 160" role="img" aria-label={`${modality} schematic`}>
        <path d="M100 150V88M100 88L58 40M100 88l42-48" stroke={stroke} strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M86 150V92L50 50M114 150V92l36-42" stroke="var(--rule-strong)" strokeWidth="3" fill="none" />
        {modality === 'Antibody–peptide conjugate' && (
          <g fill="none" stroke={accent} strokeWidth="3">
            <path d="M70 120q-24 0-34 -18" /><circle cx="32" cy="96" r="7" fill={accent} />
            <path d="M130 120q24 0 34 -18" /><circle cx="168" cy="96" r="7" fill={accent} />
          </g>
        )}
        <text x="100" y="14" textAnchor="middle" fontSize="11" fill="var(--ink-3)">{modality === 'Monoclonal antibody' ? 'IgG antibody' : 'Antibody + 2 GLP-1 peptides'}</text>
      </svg>
    )
  }
  if (modality === 'siRNA') {
    return (
      <svg width="240" height="110" viewBox="0 0 240 110" role="img" aria-label="siRNA duplex schematic">
        {Array.from({ length: 21 }, (_, i) => (
          <g key={i}><line x1={20 + i * 9} x2={20 + i * 9} y1={44} y2={66} stroke="var(--rule-strong)" strokeWidth="2" /></g>
        ))}
        <line x1="16" x2="206" y1="42" y2="42" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <line x1="20" x2="222" y1="68" y2="68" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <g fill={stroke}><circle cx="8" cy="30" r="5" /><circle cx="0" cy="42" r="5" /><circle cx="8" cy="54" r="5" /></g>
        <text x="120" y="20" textAnchor="middle" fontSize="11" fill="var(--ink-3)">Sense strand + GalNAc</text>
        <text x="120" y="96" textAnchor="middle" fontSize="11" fill="var(--ink-3)">Antisense (guide) strand</text>
      </svg>
    )
  }
  if (modality === 'Gene editing') {
    return (
      <svg width="200" height="150" viewBox="0 0 200 150" role="img" aria-label="Lipid nanoparticle with base editor schematic">
        <circle cx="100" cy="78" r="58" fill="none" stroke={stroke} strokeWidth="3" strokeDasharray="4 3" />
        <path d="M70 70c10-14 20 14 30 0s20 14 30 0" stroke={accent} strokeWidth="3" fill="none" />
        <path d="M76 96c8-8 16 8 24 0" stroke="var(--c-established)" strokeWidth="3" fill="none" />
        <text x="100" y="14" textAnchor="middle" fontSize="11" fill="var(--ink-3)">LNP: editor mRNA + guide RNA</text>
      </svg>
    )
  }
  // Peptides: a bead chain with a lipid tail for albumin binding.
  const beads = modality === 'Peptide combination' ? 2 : 1
  return (
    <svg width="240" height={beads === 2 ? 140 : 100} viewBox={`0 0 240 ${beads === 2 ? 140 : 100}`} role="img" aria-label={`${modality} schematic`}>
      {Array.from({ length: beads }, (_, b) => (
        <g key={b} transform={`translate(0 ${b * 52})`}>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={20 + i * 14} cy={40 + Math.sin(i / 1.6) * 10} r="6" fill={i === 7 ? accent : 'var(--surface-2)'} stroke={stroke} strokeWidth="1.4" />
          ))}
          <path d={`M118 ${36 + Math.sin(7 / 1.6) * 10}q6 -24 26 -26`} stroke={accent} strokeWidth="2.5" fill="none" strokeDasharray="3 2" />
        </g>
      ))}
      <text x="120" y={beads === 2 ? 132 : 92} textAnchor="middle" fontSize="11" fill="var(--ink-3)">Lipid chain on the highlighted residue</text>
    </svg>
  )
}
