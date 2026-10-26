import type { EntityKind } from './types'

export type MechLayer = 'drug' | 'target' | 'cell' | 'physio'

export interface MechNode {
  label: string
  layer: MechLayer
  detail: string
  link?: { kind: EntityKind; id: string }
  tradeoff?: boolean
}

/**
 * Shared vocabulary of mechanism nodes. Drug mechanism graphs reference these ids,
 * so the same biology (e.g. "β-cell insulin secretion") is described once and
 * can be cross-referenced across every drug that reaches it.
 */
export const mechNodes: Record<string, MechNode> = {
  // Targets
  glp1r: { label: 'GLP-1R', layer: 'target', detail: 'Glucagon-like peptide-1 receptor, a class B GPCR.', link: { kind: 'target', id: 'glp1r' } },
  gipr: { label: 'GIPR', layer: 'target', detail: 'GIP receptor, the second incretin receptor.', link: { kind: 'target', id: 'gipr' } },
  gcgr: { label: 'GCGR', layer: 'target', detail: 'Glucagon receptor, predominantly in the liver.', link: { kind: 'target', id: 'gcgr' } },
  amyr: { label: 'Amylin receptors', layer: 'target', detail: 'Calcitonin receptor paired with RAMP1–3.', link: { kind: 'target', id: 'amyr' } },
  pcsk9: { label: 'PCSK9 protein', layer: 'target', detail: 'Circulating protein that sends LDL receptors to be degraded.', link: { kind: 'target', id: 'pcsk9' } },
  pcsk9_mrna: { label: 'PCSK9 mRNA', layer: 'target', detail: 'Hepatocyte messenger RNA encoding PCSK9. siRNA guides the RISC complex to cleave it.', link: { kind: 'target', id: 'pcsk9' } },
  pcsk9_gene: { label: 'PCSK9 gene (DNA)', layer: 'target', detail: 'A single-base edit in hepatocyte DNA permanently disrupts PCSK9 production.', link: { kind: 'target', id: 'pcsk9' } },
  sglt2: { label: 'SGLT2', layer: 'target', detail: 'Sodium–glucose cotransporter in the proximal tubule.', link: { kind: 'target', id: 'sglt2' } },
  thrb: { label: 'THR-β', layer: 'target', detail: 'Liver-predominant thyroid hormone receptor isoform.', link: { kind: 'target', id: 'thrb' } },

  // Cellular
  camp: { label: 'Gαs → cAMP ↑', layer: 'cell', detail: 'The receptor activates Gαs and adenylyl cyclase, raising cAMP and activating PKA and Epac2.', link: { kind: 'pathway', id: 'incretin-camp' } },
  beta_insulin: { label: 'β-cell: glucose-dependent insulin release', layer: 'cell', detail: 'cAMP amplifies insulin granule exocytosis only when glucose is elevated, which limits hypoglycemia risk.' },
  alpha_glucagon: { label: 'α-cell: glucagon suppressed', layer: 'cell', detail: 'Glucagon secretion falls in the fed state, reducing hepatic glucose output.' },
  neurons_satiety: { label: 'Hypothalamic & hindbrain satiety neurons', layer: 'cell', detail: 'Receptor-expressing neurons in the arcuate nucleus, area postrema and nucleus tractus solitarius change feeding signals.' },
  gastric: { label: 'Slowed gastric emptying', layer: 'cell', detail: 'Mostly a vagal effect. Prominent early in treatment and partly attenuates with chronic dosing.' },
  adipocyte: { label: 'Adipocyte lipid handling', layer: 'cell', detail: 'GIPR signaling in adipose tissue may improve lipid buffering. Evidence in humans is limited.' },
  hepatocyte_gcg: { label: 'Hepatocyte: fat oxidation, glucose output', layer: 'cell', detail: 'Glucagon signaling increases fatty-acid oxidation and amino-acid turnover, and on its own raises glucose output.' },
  energy: { label: 'Energy expenditure ↑', layer: 'cell', detail: 'Glucagon may increase energy expenditure. Clear in rodents, smaller and less consistent in humans.' },
  ldlr_saved: { label: 'More LDL receptors recycled', layer: 'cell', detail: 'Without PCSK9, receptors return to the hepatocyte surface after releasing LDL.', link: { kind: 'pathway', id: 'ldlr-recycling' } },
  risc: { label: 'RISC cleaves PCSK9 mRNA', layer: 'cell', detail: 'GalNAc-conjugated siRNA enters hepatocytes and loads the RNA-induced silencing complex, which cleaves PCSK9 transcripts for months.' },
  base_edit: { label: 'Base editor installs A→G change', layer: 'cell', detail: 'A lipid nanoparticle delivers base-editor mRNA and guide RNA to hepatocytes. The edit disrupts a splice site and permanently stops PCSK9 production.' },
  tubule: { label: 'Tubular glucose & Na⁺ reabsorption ↓', layer: 'cell', detail: 'Blocking SGLT2 leaves glucose and sodium in the tubule fluid.' },
  tgf: { label: 'Tubuloglomerular feedback restored', layer: 'cell', detail: 'More sodium reaching the macula densa constricts the afferent arteriole and lowers glomerular hyperfiltration.' },
  thrb_tx: { label: 'Hepatic THR-β gene programs', layer: 'cell', detail: 'Transcription of genes for fatty-acid oxidation, mitochondrial biogenesis and LDLR increases.' },

  // Physiological
  appetite: { label: 'Appetite & food intake ↓', layer: 'physio', detail: 'Reduced hunger and earlier fullness. Thought to be the main driver of weight loss.' },
  weight: { label: 'Body-weight reduction', layer: 'physio', detail: 'Measured in trials as % change from baseline; varies by dose, population and estimand.', link: { kind: 'disease', id: 'obesity' } },
  glycemia: { label: 'Lower glucose / HbA1c', layer: 'physio', detail: 'A surrogate endpoint for diabetes control.', link: { kind: 'disease', id: 't2d' } },
  liverfat: { label: 'Liver fat ↓, MASH resolution', layer: 'physio', detail: 'Assessed by MRI-PDFF or biopsy histology.', link: { kind: 'disease', id: 'mash' } },
  ldl: { label: 'Plasma LDL-C ↓', layer: 'physio', detail: 'A well-validated surrogate for atherosclerotic risk.', link: { kind: 'disease', id: 'hypercholesterolemia' } },
  cv_events: { label: 'Fewer major CV events', layer: 'physio', detail: 'A patient-important outcome. Shown only in dedicated outcome trials.' },
  glycosuria: { label: 'Glycosuria & natriuresis', layer: 'physio', detail: 'About 60–80 g/day of urinary glucose loss, plus mild diuresis.' },
  cardiorenal: { label: 'Heart-failure & kidney protection', layer: 'physio', detail: 'Shown in outcome trials. The mechanism is debated: hemodynamic, metabolic and anti-inflammatory hypotheses.' },
  gi_ae: { label: 'Nausea, vomiting, diarrhea', layer: 'physio', detail: 'Dose-related GI effects. Most common early in treatment and during dose escalation.', tradeoff: true },
  heart_rate: { label: 'Heart rate ↑', layer: 'physio', detail: 'Small, dose-dependent increases seen with GLP-1R and especially glucagon co-agonists.', tradeoff: true },
  glucose_rise: { label: 'Hyperglycemia risk (GCGR)', layer: 'physio', detail: 'Glucagon alone raises glucose. Co-agonists depend on GLP-1R activity to counter it.', tradeoff: true },
  infection: { label: 'Genital mycotic infection', layer: 'physio', detail: 'A known class effect of glycosuria.', tradeoff: true },
  irreversible: { label: 'Effect is permanent', layer: 'physio', detail: 'There is no off-switch. Long-term safety depends on edit specificity and delivery.', tradeoff: true },
}
