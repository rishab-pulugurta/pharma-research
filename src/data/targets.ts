import type { Pathway, Target } from './types'

export const targetList: Target[] = [
  {
    id: 'glp1r',
    symbol: 'GLP-1R',
    name: 'Glucagon-like peptide-1 receptor',
    gene: 'GLP1R',
    family: 'Class B G protein-coupled receptor',
    summary: 'Receptor for the gut hormone GLP-1, released after meals.',
    biology:
      'When GLP-1 binds, the receptor couples mainly to Gαs, which raises cAMP. In pancreatic β-cells this amplifies insulin release, but only when glucose is high. In the hindbrain and hypothalamus, receptor activation reduces appetite. It also slows gastric emptying and suppresses glucagon.',
    tissues: ['Pancreatic β-cells', 'Hypothalamus and hindbrain', 'Stomach and gut', 'Heart', 'Kidney'],
    whyTarget:
      'Native GLP-1 lasts only minutes. Engineered agonists that last days lower glucose with little hypoglycemia risk and produce sustained weight loss through central appetite effects. Cardiovascular benefit is now shown in outcome trials.',
    tradeoffs: [
      'Nausea, vomiting and diarrhea are dose-dependent and the main reason people stop treatment.',
      'Weight lost includes some lean mass. How much this matters clinically is still being studied.',
      'Rodent thyroid C-cell tumors led to a boxed warning in the US; human relevance is not established.',
      'Weight tends to return after stopping therapy.',
    ],
    pathwayIds: ['incretin-camp'],
    sourceIds: ['pub-glp1-physiology', 'nejm-step1', 'nejm-select'],
  },
  {
    id: 'gipr',
    symbol: 'GIPR',
    name: 'Gastric inhibitory polypeptide receptor',
    gene: 'GIPR',
    family: 'Class B G protein-coupled receptor',
    summary: 'Receptor for GIP, the other major incretin hormone.',
    biology:
      'GIPR also signals through Gαs and cAMP. It is expressed on β-cells, adipocytes and some brain regions. Its effect on body weight is contested: both agonists (as in tirzepatide) and antagonist antibodies (as in maridebart cafraglutide) have been associated with greater weight loss when combined with GLP-1R agonism.',
    tissues: ['Pancreatic β-cells', 'Adipose tissue', 'Brain', 'Bone'],
    whyTarget:
      'Adding GIPR activity to GLP-1R agonism produced larger weight and glucose effects in clinical trials. Proposed explanations include better GI tolerability, adipose-tissue effects and receptor desensitization.',
    tradeoffs: [
      'The direction of benefit (agonism vs antagonism) is not settled. Mechanistic claims should be read as hypotheses.',
      'Chronic agonism may desensitize the receptor, so it may act like functional antagonism.',
    ],
    pathwayIds: ['incretin-camp'],
    geneticEvidence: 'Human genetic studies associate some GIPR loss-of-function variants with lower BMI. This is one reason antagonism is pursued.',
    sourceIds: ['pub-gipr-paradox', 'nejm-surmount1'],
  },
  {
    id: 'gcgr',
    symbol: 'GCGR',
    name: 'Glucagon receptor',
    gene: 'GCGR',
    family: 'Class B G protein-coupled receptor',
    summary: 'Liver-predominant receptor for glucagon.',
    biology:
      'Glucagon raises hepatic glucose output, promotes hepatic fat oxidation and amino-acid turnover, and may increase energy expenditure. Taken alone it raises blood glucose. Paired with GLP-1R agonism, the incretin effect is intended to offset that rise.',
    tissues: ['Liver', 'Kidney', 'Adipose tissue (low)', 'Heart'],
    whyTarget:
      'Co-agonists aim to add liver-fat reduction and energy expenditure on top of appetite suppression. This makes them attractive for MASH as well as obesity.',
    tradeoffs: [
      'Can raise heart rate and blood glucose. The balance between GCGR and GLP-1R potency is critical.',
      'Energy-expenditure gains in humans are less certain than in rodents.',
    ],
    pathwayIds: ['incretin-camp'],
    sourceIds: ['pub-glucagon-review', 'nejm-reta-p2'],
  },
  {
    id: 'amyr',
    symbol: 'AMYR',
    name: 'Amylin receptors (CALCR + RAMP1/2/3)',
    gene: 'CALCR / RAMP1–3',
    family: 'Class B GPCR heterodimers',
    summary: 'Receptors for amylin, co-secreted with insulin by β-cells.',
    biology:
      'Amylin receptors form when the calcitonin receptor pairs with a RAMP accessory protein. Signaling in the area postrema and hypothalamus promotes satiety, slows gastric emptying and suppresses glucagon.',
    tissues: ['Area postrema', 'Hypothalamus', 'Bone (calcitonin receptor)'],
    whyTarget:
      'Amylin acts through a satiety pathway that only partly overlaps with GLP-1. Combining the two produced additive weight loss in trials.',
    tradeoffs: ['Nausea is additive with GLP-1R agonism.', 'Many analogs also activate the calcitonin receptor; long-term relevance is under study.'],
    pathwayIds: [],
    sourceIds: ['pub-amylin-review', 'nejm-redefine1'],
  },
  {
    id: 'pcsk9',
    symbol: 'PCSK9',
    name: 'Proprotein convertase subtilisin/kexin type 9',
    gene: 'PCSK9',
    family: 'Secreted serine protease (non-enzymatic role)',
    summary: 'A liver-secreted protein that sends LDL receptors to be destroyed.',
    biology:
      'PCSK9 binds the LDL receptor on hepatocytes. Instead of recycling to the cell surface, the receptor–PCSK9 complex is routed to lysosomes and degraded. Fewer receptors means less LDL cleared from blood.',
    tissues: ['Liver (primary source)', 'Intestine', 'Kidney'],
    whyTarget:
      'People with natural PCSK9 loss-of-function variants have lifelong low LDL-C and fewer coronary events. That genetic evidence makes PCSK9 one of the best-validated drug targets in cardiology.',
    tradeoffs: [
      'Outcome benefit has been shown for antibodies. For siRNA, oral and gene-editing approaches, LDL lowering is shown but outcome trials were pending as of the last verification.',
      'Permanent gene editing removes the option to stop therapy.',
    ],
    pathwayIds: ['ldlr-recycling'],
    geneticEvidence: 'Loss-of-function variants are linked to roughly 15–28% lower LDL-C and up to ~88% fewer coronary events in the original ARIC analyses.',
    sourceIds: ['pub-pcsk9-genetics', 'nejm-fourier'],
  },
  {
    id: 'sglt2',
    symbol: 'SGLT2',
    name: 'Sodium–glucose cotransporter 2',
    gene: 'SLC5A2',
    family: 'Solute carrier transporter',
    summary: 'Transporter in the kidney’s proximal tubule that reabsorbs most filtered glucose.',
    biology:
      'SGLT2 reclaims roughly 90% of filtered glucose along with sodium. Blocking it sends glucose and sodium into the urine. This lowers blood glucose without depending on insulin, and changes kidney hemodynamics.',
    tissues: ['Kidney proximal tubule'],
    whyTarget:
      'Blocking it lowers glucose regardless of insulin, and has shown heart-failure and kidney benefits in outcome trials, including in people without diabetes.',
    tradeoffs: ['Genital mycotic infections.', 'Rare euglycemic ketoacidosis.', 'Why the drug protects the heart and kidneys is debated beyond glycosuria.'],
    pathwayIds: [],
    geneticEvidence: 'Familial renal glycosuria, caused by SLC5A2 variants, is largely benign. This supported the target’s safety.',
    sourceIds: ['pub-sglt2-review', 'nejm-emparegoutcome'],
  },
  {
    id: 'thrb',
    symbol: 'THR-β',
    name: 'Thyroid hormone receptor beta',
    gene: 'THRB',
    family: 'Nuclear hormone receptor',
    summary: 'The thyroid hormone receptor isoform that predominates in the liver.',
    biology:
      'THR-β is a ligand-activated transcription factor. In hepatocytes it increases fatty-acid β-oxidation, mitochondrial biogenesis and LDL receptor expression, which lowers liver fat and atherogenic lipids.',
    tissues: ['Liver'],
    whyTarget:
      'Selective THR-β agonists aim to capture the liver benefits of thyroid hormone while avoiding THR-α effects on the heart and bone.',
    tradeoffs: ['Isoform selectivity is relative, not absolute.', 'Long-term outcome benefit (cirrhosis, liver events) was still being studied at last verification.'],
    pathwayIds: [],
    sourceIds: ['pub-thrb-review', 'nejm-maestro'],
  },
]

export const pathwayList: Pathway[] = [
  {
    id: 'incretin-camp',
    name: 'Incretin receptor → cAMP signaling',
    summary:
      'GLP-1, GIP and glucagon receptors are class B GPCRs. They share a core intracellular pathway but produce different effects depending on the tissue.',
    steps: [
      { label: 'Ligand binding', detail: 'A peptide hormone or agonist binds the receptor’s extracellular domain and transmembrane core.', confidence: 'established' },
      { label: 'Gαs coupling', detail: 'The activated receptor engages the stimulatory G protein Gαs.', confidence: 'established' },
      { label: 'Adenylyl cyclase → cAMP', detail: 'Gαs activates adenylyl cyclase, raising intracellular cAMP.', confidence: 'established' },
      { label: 'PKA and Epac2', detail: 'cAMP activates protein kinase A and Epac2, the effectors that amplify insulin granule exocytosis in β-cells.', confidence: 'established' },
      { label: 'β-arrestin recruitment', detail: 'Receptors also recruit β-arrestins, which drive internalization. Biased agonists that favor cAMP over β-arrestin are proposed to sustain signaling.', confidence: 'inferred' },
      { label: 'Tissue response', detail: 'Insulin secretion (β-cell), satiety signaling (neurons), glucose output and fat oxidation (hepatocyte, via GCGR).', confidence: 'clinical' },
    ],
    targetIds: ['glp1r', 'gipr', 'gcgr'],
    caveat:
      'Simplified. Receptors also couple to Gαq and other pathways, and how the brain mediates weight loss in humans is only partly mapped.',
    sourceIds: ['pub-glp1-physiology', 'pub-glucagon-review'],
  },
  {
    id: 'ldlr-recycling',
    name: 'LDL receptor recycling',
    summary: 'How the liver clears LDL from blood, and how PCSK9 limits that clearance.',
    steps: [
      { label: 'LDL binds LDLR', detail: 'Circulating LDL particles bind LDL receptors on the hepatocyte surface.', confidence: 'established' },
      { label: 'Endocytosis', detail: 'The receptor–LDL complex is internalized in clathrin-coated pits.', confidence: 'established' },
      { label: 'Endosomal release', detail: 'At acidic pH, LDL dissociates and is sent to lysosomes; the free receptor recycles to the surface.', confidence: 'established' },
      { label: 'PCSK9 diversion', detail: 'If PCSK9 is bound, the receptor cannot release and is degraded with its cargo.', confidence: 'established' },
      { label: 'Net LDL-C level', detail: 'Fewer surface receptors means higher plasma LDL-C. Blocking PCSK9 reverses this.', confidence: 'clinical' },
    ],
    targetIds: ['pcsk9'],
    caveat: 'Statins also raise PCSK9 expression, which partly limits their own effect. This explains why the combination is additive.',
    sourceIds: ['pub-pcsk9-genetics', 'nejm-fourier'],
  },
]

export const targets: Record<string, Target> = Object.fromEntries(targetList.map((t) => [t.id, t]))
export const pathways: Record<string, Pathway> = Object.fromEntries(pathwayList.map((p) => [p.id, p]))
