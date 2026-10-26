/**
 * Plain-language explanations for every node in the mechanism maps: what the thing is, and what it
 * normally does in the body. The drug-specific part (what this drug changes) comes from the map's
 * edges, so each entry is written once and reused by every drug that reaches that step.
 */
export interface GlossaryEntry {
  /** What it is, for someone meeting the term for the first time. */
  what: string
  /** What it normally does in a healthy body. */
  normal: string
  /** Optional: how it goes wrong in disease, when that matters for the mechanism. */
  disease?: string
  /** Optional: a compact analogy, used only where it genuinely helps. */
  analogy?: string
}

export const glossary: Record<string, GlossaryEntry> = {
  // ---------- Molecular targets ----------
  glp1r: {
    what: 'A receptor protein that sits in the outer membrane of certain cells and is switched on by GLP-1, a hormone released by L-cells in the gut lining within minutes of eating. It belongs to the G protein-coupled receptor (GPCR) family, the largest family of drug targets.',
    normal: 'Tells the body food has arrived. It boosts insulin release from the pancreas only when blood glucose is high, lowers glucagon, slows stomach emptying, and signals fullness to the brain. Natural GLP-1 is broken down by the enzyme DPP-4 within about two minutes, so its signal is brief.',
    disease: 'In type 2 diabetes the "incretin effect" (the extra insulin released after a meal compared with the same glucose given intravenously) is blunted. Drugs that activate GLP-1R for days restore and amplify the signal.',
    analogy: 'A doorbell on the cell surface that only GLP-1 (or a drug shaped like it) can press.',
  },
  gipr: {
    what: 'The receptor for GIP (glucose-dependent insulinotropic polypeptide), the other main gut "incretin" hormone, released by K-cells in the upper small intestine after meals. Like GLP-1R, it is a class B GPCR.',
    normal: 'Amplifies insulin release after eating and acts on fat tissue, where it helps store dietary fat. It is also found in parts of the brain involved in appetite and nausea.',
    disease: 'In type 2 diabetes, β-cells respond poorly to GIP. Whether drugs should switch GIPR on (tirzepatide) or block it (maridebart cafraglutide) is still debated, because both approaches have produced weight loss alongside GLP-1R activation.',
  },
  gcgr: {
    what: 'The receptor for glucagon, a hormone made by α-cells in the pancreas. It is found mostly on liver cells, with smaller amounts in kidney, heart and fat tissue.',
    normal: 'Keeps blood glucose from falling between meals and overnight: it tells the liver to release stored glucose (glycogen breakdown) and make new glucose (gluconeogenesis). It also increases the liver\'s burning of fat and its processing of amino acids.',
    disease: 'Glucagon is inappropriately high in type 2 diabetes, which pushes glucose up. Co-agonist drugs deliberately add some glucagon activity to burn liver fat, relying on their GLP-1 activity to keep glucose in check.',
  },
  amyr: {
    what: 'A family of receptors formed when the calcitonin receptor pairs with one of three RAMP "helper" proteins. Together they respond to amylin, a hormone released from pancreatic β-cells alongside insulin.',
    normal: 'Amylin works with insulin after a meal: through the brainstem (area postrema) it promotes fullness, slows stomach emptying and suppresses glucagon, which smooths out the rise in blood glucose.',
    disease: 'People with diabetes make little amylin. Amylin analogs (pramlintide, cagrilintide) restore that signal, and add to GLP-1 effects because they work through partly separate brain circuits.',
  },
  pcsk9: {
    what: 'PCSK9 (proprotein convertase subtilisin/kexin type 9) is a protein made mainly by the liver and released into the blood.',
    normal: 'Controls how many LDL receptors the liver keeps. PCSK9 latches onto an LDL receptor, and when the receptor is pulled into the cell, PCSK9 diverts it to the lysosome to be destroyed instead of letting it return to the surface.',
    disease: 'Gain-of-function PCSK9 mutations cause familial hypercholesterolemia. People with loss-of-function variants have lifelong low LDL cholesterol and far fewer heart attacks, which is why PCSK9 became such a validated drug target.',
    analogy: 'A tag that marks LDL receptors for the shredder.',
  },
  pcsk9_mrna: {
    what: 'The messenger RNA copy of the PCSK9 gene: the working instructions a liver cell reads to build PCSK9 protein.',
    normal: 'Each gene is transcribed into mRNA, which ribosomes translate into protein. mRNA is short-lived, so cells keep making it to keep producing the protein.',
    disease: 'Destroying this mRNA stops PCSK9 production at the source, without touching the gene itself.',
  },
  pcsk9_gene: {
    what: 'The PCSK9 gene in the DNA of liver cells, the permanent master copy of the instructions for making PCSK9.',
    normal: 'Transcribed continuously in hepatocytes to supply PCSK9. Because liver cells live for a long time and pass their DNA to daughter cells, a change made here persists.',
    disease: 'A precise single-letter edit can disrupt the gene for good, which mimics the protective natural variants seen in some people.',
  },
  sglt2: {
    what: 'Sodium–glucose cotransporter 2, a transporter protein in the first segment of the kidney tubule (the proximal tubule).',
    normal: 'The kidney filters about 180 g of glucose a day out of the blood. SGLT2 pulls about 90% of it back in, coupled to sodium, so glucose isn\'t lost in urine.',
    disease: 'In diabetes, SGLT2 activity rises and holds onto even more glucose, which keeps blood glucose high.',
  },
  thrb: {
    what: 'Thyroid hormone receptor β, a receptor inside the cell nucleus that is switched on by thyroid hormone (T3). The β form dominates in the liver; the α form dominates in the heart and bone.',
    normal: 'Acts as a switch for genes: when thyroid hormone binds, it turns on programs for burning fat in mitochondria, building new mitochondria, and clearing cholesterol.',
    disease: 'In fatty liver disease, the liver behaves as if it has too little thyroid hormone signaling. A liver-selective THR-β agonist restores those fat-burning programs without overstimulating the heart.',
  },

  // ---------- Cellular steps ----------
  camp: {
    what: 'The signaling cascade inside the cell that a GPCR triggers. Gαs is a G protein that, once activated by the receptor, switches on adenylyl cyclase, an enzyme that makes cyclic AMP (cAMP). cAMP is a "second messenger" that relays the signal inside the cell.',
    normal: 'cAMP activates protein kinase A (PKA) and Epac2, which change how the cell behaves, for example by priming insulin granules for release in β-cells. Many hormones (adrenaline, glucagon, GLP-1) use this same relay.',
    analogy: 'The receptor rings the doorbell, and cAMP is the message passed through the house to each room that needs to act.',
  },
  beta_insulin: {
    what: 'β-cells are the insulin-producing cells clustered in the pancreatic islets. They sense blood glucose directly.',
    normal: 'When glucose rises after a meal, β-cells release insulin, which tells muscle, fat and liver to take up and store glucose. Incretin signals (GLP-1, GIP) amplify this release, but only while glucose is elevated, which is why these drugs rarely cause low blood sugar on their own.',
    disease: 'In type 2 diabetes β-cells are overworked and gradually fail, and their response to incretins weakens.',
  },
  alpha_glucagon: {
    what: 'α-cells are the glucagon-producing cells in the same pancreatic islets as β-cells.',
    normal: 'They release glucagon when glucose is low, prompting the liver to release glucose. After a meal, glucagon should fall.',
    disease: 'In type 2 diabetes glucagon stays high after meals and pushes glucose up further. GLP-1R activation lowers it, partly through local signals from neighboring β- and δ-cells.',
  },
  neurons_satiety: {
    what: 'Groups of nerve cells that control hunger and fullness. Key ones sit in the hypothalamus (arcuate nucleus: POMC and AgRP neurons) and in the brainstem (area postrema and nucleus tractus solitarius, the hindbrain\'s "meal-ending" centers).',
    normal: 'They combine signals from gut hormones, the vagus nerve and fat-derived leptin to decide when to start and stop eating. The area postrema also detects toxins and can trigger nausea.',
    disease: 'With obesity, these circuits tend to defend a higher body weight. Long-acting incretin drugs act on these neurons to reduce hunger and food cravings. Activation of the area postrema helps explain why nausea is their most common side effect.',
  },
  gastric: {
    what: 'The rate at which the stomach passes food into the small intestine.',
    normal: 'Regulated by nerves and gut hormones so nutrients arrive at a pace the intestine can handle. Slower emptying flattens the glucose spike after a meal and prolongs fullness.',
    disease: 'GLP-1 and amylin drugs slow emptying, most strongly in the first weeks. It contributes to early nausea and fullness, and is why anesthesia teams ask about these drugs before surgery.',
  },
  adipocyte: {
    what: 'Adipocytes are fat cells, which store energy as triglyceride and release hormones such as leptin and adiponectin.',
    normal: 'Healthy fat tissue safely stores excess fat after meals and releases it as fuel between meals. GIP is thought to help fat tissue take up and buffer dietary fat.',
    disease: 'When fat tissue is overloaded, fat spills into the liver, muscle and pancreas ("ectopic fat"), driving insulin resistance. How much GIPR drugs improve fat storage in humans is still being studied.',
  },
  hepatocyte_gcg: {
    what: 'Hepatocytes are the main working cells of the liver. Here, "glucagon signaling" means their response when glucagon receptors are activated.',
    normal: 'Glucagon tells hepatocytes to release glucose, burn fatty acids (β-oxidation) and break down amino acids. This is the body\'s fasting mode.',
    disease: 'Turning this on deliberately helps clear excess liver fat, but it also raises glucose output, so it has to be balanced by GLP-1 activity.',
  },
  energy: {
    what: 'Energy expenditure is the number of calories the body burns: basal metabolism plus physical activity plus the energy used to digest food.',
    normal: 'Typically falls when people lose weight, which is one reason weight is regained.',
    disease: 'Glucagon raises energy expenditure in animal studies. In humans the effect appears smaller and less consistent, so it is treated as a plausible but unproven contributor.',
  },
  ldlr_saved: {
    what: 'LDL receptors are proteins on the surface of liver cells that grab LDL particles (the main carriers of cholesterol in blood) and pull them inside.',
    normal: 'After unloading LDL inside the cell, a receptor normally returns to the surface and can be reused about 100 times. More receptors on the surface means more LDL cleared from the blood.',
    disease: 'PCSK9 cuts this recycling short. Blocking, silencing or editing PCSK9 lets receptors keep recycling, so the liver pulls far more LDL out of the blood.',
  },
  risc: {
    what: 'RISC (RNA-induced silencing complex) is the cell\'s own machinery for silencing genes using small RNA guides. Its core enzyme, Argonaute-2, cuts matching mRNA.',
    normal: 'Cells use RISC with naturally made microRNAs to fine-tune which proteins they produce.',
    disease: 'An siRNA drug loads into RISC and guides it to PCSK9 mRNA. Each loaded complex can destroy many mRNA copies, which is why one dose lasts for months.',
  },
  base_edit: {
    what: 'Base editing is a form of gene editing that changes a single DNA letter (for example A to G) without cutting both strands of the DNA. The editor is a modified CRISPR protein fused to an enzyme that chemically converts one base.',
    normal: 'Not a natural process. The editor is delivered as mRNA plus a guide RNA inside lipid nanoparticles, works for a few days and is then cleared, but the edit it made remains.',
    disease: 'For PCSK9, the edit disrupts a splice site so the gene can no longer make working protein, a permanent knockdown from one infusion.',
  },
  tubule: {
    what: 'The renal tubule is the long tube in each kidney nephron that processes the fluid filtered out of the blood, reclaiming what the body needs.',
    normal: 'Reabsorbs nearly all filtered glucose, most sodium and most water, so only waste and excess end up in urine.',
    disease: 'Blocking SGLT2 leaves glucose and some sodium in the tubule, so they are passed in the urine.',
  },
  tgf: {
    what: 'Tubuloglomerular feedback is a kidney safety loop: cells called the macula densa sense how much sodium reaches them and adjust blood flow into the filter (glomerulus).',
    normal: 'Keeps each nephron\'s filtration rate steady and protects the filter from high pressure.',
    disease: 'In diabetes, extra sodium reabsorption upstream fools this loop, so the kidney over-filters (hyperfiltration), which damages it over time. More sodium reaching the macula densa resets the loop and lowers filter pressure, one leading explanation for kidney protection with SGLT2 inhibitors.',
  },
  thrb_tx: {
    what: 'Thyroid-hormone-responsive genes in liver cells: genes for fat-burning enzymes, mitochondria and the LDL receptor that switch on when THR-β is activated.',
    normal: 'Normal thyroid hormone keeps liver fat metabolism running and helps clear cholesterol.',
    disease: 'Re-activating these programs reduces liver fat and LDL cholesterol, the basis of resmetirom\'s effect in MASH.',
  },

  // ---------- Physiological effects ----------
  appetite: {
    what: 'Hunger (the drive to start eating) and satiety (the signal to stop and stay full).',
    normal: 'Balanced moment to moment by gut hormones, stomach stretch and brain circuits, and over the long term by leptin from fat.',
    disease: 'Reducing appetite and "food noise" is the main way incretin drugs cause weight loss: people eat less without consciously restricting as much.',
  },
  weight: {
    what: 'Change in body weight, usually reported in trials as percent change from starting weight at a fixed time point.',
    normal: 'Body weight is defended around a set range by appetite and metabolism.',
    disease: 'Losing 5–10% improves blood pressure, glucose and joint pain, and larger losses improve more conditions. Weight is a surrogate endpoint: improvements in heart attacks or survival must be shown separately.',
  },
  glycemia: {
    what: 'Blood glucose control, measured day to day with glucose readings and over about three months with HbA1c (the percentage of hemoglobin carrying glucose).',
    normal: 'Kept roughly between 4 and 7 mmol/L (70–130 mg/dL) by the balance of insulin and glucagon.',
    disease: 'Lower HbA1c reduces the risk of eye, kidney and nerve complications in diabetes. HbA1c is the standard surrogate endpoint for diabetes drugs.',
  },
  liverfat: {
    what: 'Fat built up inside liver cells (steatosis), and in MASH the inflammation and scarring (fibrosis) that follow.',
    normal: 'A healthy liver holds only a little fat.',
    disease: 'Liver fat is measured by MRI (PDFF) or biopsy. MASH resolution and fibrosis improvement on biopsy are the endpoints regulators accept for accelerated approval.',
  },
  ldl: {
    what: 'Low-density lipoprotein cholesterol (LDL-C), the cholesterol carried in LDL particles, which can lodge in artery walls and build plaque.',
    normal: 'Some LDL is needed to deliver cholesterol to tissues. Levels depend largely on how many LDL receptors the liver has.',
    disease: 'Lowering LDL-C reduces heart attacks and strokes in proportion to how much and for how long it is lowered, which makes it one of the most trusted surrogate endpoints in medicine.',
  },
  cv_events: {
    what: 'Major adverse cardiovascular events (MACE): heart attack, stroke and cardiovascular death, the outcomes that matter most to patients.',
    normal: 'Driven by plaque build-up, blood pressure, inflammation and clotting.',
    disease: 'Proving a drug reduces MACE takes large, multi-year outcome trials, so for newer drugs this link is often still inferred from surrogate endpoints.',
  },
  glycosuria: {
    what: 'Glycosuria is glucose in the urine; natriuresis is extra sodium in the urine.',
    normal: 'Healthy kidneys let almost no glucose into the urine.',
    disease: 'With SGLT2 inhibitors, 60–80 g of glucose a day leaves in urine (about 250–300 calories), lowering blood glucose and causing a mild diuretic effect that lowers blood pressure and fluid load.',
  },
  cardiorenal: {
    what: 'Protection of the heart and kidneys: fewer hospitalizations for heart failure and slower loss of kidney function.',
    normal: 'Heart and kidney function are tightly linked through blood pressure, fluid and sodium balance.',
    disease: 'SGLT2 inhibitors reduced heart-failure hospitalizations and kidney decline even in people without diabetes. Proposed reasons include lower fluid load, restored tubuloglomerular feedback, and shifts in heart and kidney fuel use, but the full mechanism is debated.',
  },
  gi_ae: {
    what: 'Gastrointestinal side effects: nausea, vomiting, diarrhea and constipation.',
    normal: 'The gut and brainstem use nausea to protect against overeating and toxins.',
    disease: 'The most common reason people stop incretin drugs. Mostly mild and concentrated during dose escalation, which is why doses are increased slowly over weeks.',
  },
  heart_rate: {
    what: 'An increase in resting heart rate, typically a few beats per minute.',
    normal: 'GLP-1 and glucagon receptors on the heart\'s pacemaker region and the nervous system can speed the heart.',
    disease: 'Seen across GLP-1 drugs and more with glucagon co-agonists. Whether long-term small increases matter for cardiovascular risk is still being studied.',
  },
  glucose_rise: {
    what: 'A tendency for blood glucose to rise, caused by glucagon receptor activation.',
    normal: 'This is glucagon\'s job between meals: keeping glucose from dropping too low.',
    disease: 'For co-agonists, the drug\'s GLP-1 activity has to outweigh this glucose-raising effect. The balance between the two receptors is a central design choice.',
  },
  infection: {
    what: 'Fungal (yeast) infections of the genital area.',
    normal: 'Normally kept in check because urine contains almost no sugar.',
    disease: 'Glucose in the urine feeds yeast, so these infections are the most common side effect of SGLT2 inhibitors. Good hygiene reduces the risk.',
  },
  irreversible: {
    what: 'Permanence: the change to the DNA cannot be switched off or reversed once made.',
    normal: 'Most drugs wear off as they are cleared from the body.',
    disease: 'A one-time treatment avoids lifelong daily pills or injections, but any unwanted effect (including rare off-target edits) would also be permanent, so these programs need long safety follow-up.',
  },
}
