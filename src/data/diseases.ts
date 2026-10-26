import type { Disease } from './types'

const list: Disease[] = [
  {
    id: 'obesity',
    name: 'Obesity',
    aliases: ['overweight', 'obese', 'chronic weight management', 'adiposity', 'weight loss', 'BMI'],
    summary:
      'A chronic, relapsing disease of excess or dysfunctional adipose tissue that raises the risk of diabetes, cardiovascular disease, some cancers, osteoarthritis and sleep apnea.',
    organs: ['Adipose tissue', 'Brain (hypothalamus, hindbrain)', 'Liver', 'Pancreas', 'Cardiovascular system', 'Joints'],
    pathophysiology:
      'Body weight is defended by circuits linking gut hormones, adipose-derived leptin and brain feeding centers. After weight loss, hunger rises and energy expenditure falls, which drives regain. Visceral and ectopic fat (liver, muscle, heart) is metabolically harmful through insulin resistance, inflammation and lipotoxicity.',
    symptoms: ['Often none early', 'Reduced mobility and joint pain', 'Breathlessness and sleep-disordered breathing', 'Complications appear as the presenting problem'],
    progression:
      'Weight usually increases over adulthood. Complications build with severity and duration. Lifestyle intervention alone typically gives 5–10% weight loss that is hard to maintain.',
    mechanisms: ['Hypothalamic energy-balance regulation', 'Incretin and gut–brain signaling', 'Adipose inflammation and insulin resistance', 'Strong polygenic heritability (~40–70%)'],
    epidemiology: {
      prevalence: 'More than 1 billion people worldwide were living with obesity in 2022, per WHO. In the US, about 40% of adults have obesity.',
      burden: 'A leading driver of type 2 diabetes, cardiovascular disease, MASLD and osteoarthritis.',
      risks: ['Genetic predisposition', 'Energy-dense food environment', 'Physical inactivity', 'Sleep deprivation', 'Certain medications (e.g., antipsychotics, glucocorticoids)'],
      subpopulations: ['Obesity with type 2 diabetes (typically less weight loss on incretins)', 'Obesity with established CVD', 'Adolescents', 'Monogenic obesity (e.g., POMC, LEPR deficiency)', 'Obesity with knee osteoarthritis or OSA'],
      sourceIds: ['gl-who-obesity', 'pub-obesity-gbd'],
    },
    standardOfCare: [
      { drugClass: 'Lifestyle intervention', examples: ['Calorie reduction', 'Physical activity', 'Behavioral therapy'], drugIds: [], role: 'Foundation for every treatment approach.' },
      { drugClass: 'GLP-1R agonists', examples: ['Semaglutide 2.4 mg', 'Liraglutide 3.0 mg'], drugIds: ['semaglutide'], role: 'First-line pharmacotherapy in recent guidelines.' },
      { drugClass: 'GIP/GLP-1R dual agonist', examples: ['Tirzepatide'], drugIds: ['tirzepatide'], role: 'The largest mean weight loss among approved drugs, and directly superior to semaglutide in SURMOUNT-5.' },
      { drugClass: 'Older agents', examples: ['Phentermine/topiramate', 'Naltrexone/bupropion', 'Orlistat'], drugIds: [], role: 'Smaller effects; used when incretins are unsuitable or unavailable.' },
      { drugClass: 'Metabolic & bariatric surgery', examples: ['Sleeve gastrectomy', 'Roux-en-Y gastric bypass'], drugIds: [], role: 'Most durable weight loss for severe obesity.' },
    ],
    guidelines: [
      { org: 'American Gastroenterological Association', region: 'US', year: '2022', title: 'Pharmacological interventions for adults with obesity', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=AGA%20clinical%20practice%20guideline%20pharmacological%20interventions%20adults%20obesity%202022' },
      { org: 'World Health Organization', region: 'Global', year: '2025', title: 'Guideline on GLP-1 therapies for obesity', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' },
    ],
    unmetNeeds: [
      'Keeping weight off after stopping therapy.',
      'Preserving lean and muscle mass during large weight loss.',
      'Oral options with injectable-level efficacy.',
      'Access and cost. Coverage remains limited in many health systems.',
      'Outcome evidence (CV, kidney, mortality) for newer mechanisms.',
    ],
    biomarkers: [
      { name: 'BMI and waist circumference', role: 'Eligibility', implication: 'Drug labels use BMI ≥30, or ≥27 with comorbidity. Lower thresholds are often proposed for Asian populations.' },
      { name: 'Type 2 diabetes status', role: 'Response modifier', implication: 'People with T2D typically lose less weight on incretins than those without.' },
      { name: 'MC4R, POMC, LEPR variants', role: 'Precision therapy', implication: 'Monogenic obesity may be treated with setmelanotide (MC4R agonist) rather than incretins.' },
      { name: 'History of medullary thyroid carcinoma or MEN 2', role: 'Exclusion', implication: 'Contraindication for GLP-1R agonists in the US label.' },
    ],
    failures: [
      { name: 'Danuglipron (Pfizer)', what: 'Oral GLP-1R agonist discontinued in 2025 after tolerability issues and a potential liver-injury case.', drugId: 'danuglipron' },
      { name: 'Lorcaserin', what: 'Serotonin 2C agonist withdrawn from the US market in 2020 after a cancer-imbalance signal.' },
      { name: 'Rimonabant', what: 'CB1 inverse agonist withdrawn in Europe (2008) for psychiatric adverse effects.' },
    ],
    targetIds: ['glp1r', 'gipr', 'gcgr', 'amyr'],
    verified: '2026-06-01',
    sourceIds: ['gl-who-obesity', 'gl-aga-obesity', 'nejm-surmount1', 'nejm-step1'],
  },
  {
    id: 't2d',
    name: 'Type 2 diabetes',
    aliases: ['T2D', 'type 2 diabetes mellitus', 'T2DM', 'diabetes', 'HbA1c', 'blood sugar'],
    summary: 'Chronic high blood glucose caused by insulin resistance together with progressive loss of β-cell function.',
    organs: ['Pancreas', 'Liver', 'Muscle', 'Adipose tissue', 'Kidney', 'Blood vessels'],
    pathophysiology:
      'Muscle, liver and fat become insulin resistant. β-cells compensate until they fail. The incretin effect is reduced, glucagon stays inappropriately high, and the kidney reabsorbs more glucose. Excess adiposity is the main driver.',
    symptoms: ['Often none', 'Thirst, frequent urination', 'Fatigue', 'Blurred vision', 'Slow wound healing'],
    progression: 'Progresses over years. Microvascular complications (retinopathy, nephropathy, neuropathy) and macrovascular disease accumulate with duration and poor glucose control.',
    mechanisms: ['Insulin resistance', 'β-cell dysfunction', 'Impaired incretin effect', 'Hyperglucagonemia', 'Increased renal glucose reabsorption'],
    epidemiology: {
      prevalence: 'About 830 million adults had diabetes in 2022 (WHO), mostly type 2.',
      burden: 'A leading cause of kidney failure, blindness, lower-limb amputation and cardiovascular disease.',
      risks: ['Obesity', 'Family history', 'Age', 'Physical inactivity', 'Gestational diabetes history', 'Ethnicity (higher in South Asian, Hispanic, Black populations)'],
      subpopulations: ['T2D with ASCVD', 'T2D with heart failure', 'T2D with CKD', 'T2D with obesity'],
      sourceIds: ['gl-who-diabetes', 'gl-ada-2026'],
    },
    standardOfCare: [
      { drugClass: 'Metformin', examples: ['Metformin'], drugIds: [], role: 'Common first-line agent.' },
      { drugClass: 'SGLT2 inhibitors', examples: ['Empagliflozin', 'Dapagliflozin'], drugIds: ['empagliflozin'], role: 'Preferred when heart failure, CKD or ASCVD is present, regardless of HbA1c.' },
      { drugClass: 'GLP-1R / dual agonists', examples: ['Semaglutide', 'Tirzepatide', 'Dulaglutide'], drugIds: ['semaglutide', 'tirzepatide'], role: 'Preferred when ASCVD or obesity is present.' },
      { drugClass: 'Insulin', examples: ['Basal insulin'], drugIds: [], role: 'For severe hyperglycemia or when other agents are not enough.' },
    ],
    guidelines: [{ org: 'American Diabetes Association', region: 'US', year: '2026', title: 'Standards of Care in Diabetes', url: 'https://diabetesjournals.org/care/issue' }],
    unmetNeeds: ['Durable β-cell preservation', 'Remission strategies', 'Adherence and access', 'Weight-centric treatment in people who respond less to incretins'],
    biomarkers: [
      { name: 'HbA1c', role: 'Diagnosis and surrogate endpoint', implication: 'The main regulatory endpoint for glucose-lowering drugs.' },
      { name: 'eGFR and albuminuria', role: 'Treatment selection', implication: 'Pushes toward SGLT2 inhibitors. Below certain eGFR thresholds, glucose lowering weakens.' },
      { name: 'Established ASCVD', role: 'Treatment selection', implication: 'Favors agents with proven cardiovascular benefit.' },
    ],
    failures: [{ name: 'Rosiglitazone', what: 'Restricted in the US (2010) over a myocardial infarction signal. Restrictions were later eased, but the episode led to mandatory cardiovascular outcome trials.' }],
    targetIds: ['glp1r', 'gipr', 'sglt2'],
    verified: '2026-06-01',
    sourceIds: ['gl-ada-2026', 'gl-who-diabetes'],
  },
  {
    id: 'hypercholesterolemia',
    name: 'Hypercholesterolemia',
    aliases: ['high LDL', 'high cholesterol', 'cholesterol', 'dyslipidemia', 'familial hypercholesterolemia', 'HeFH', 'LDL-C', 'ASCVD', 'heart attack'],
    summary: 'High blood LDL cholesterol, a direct cause of atherosclerotic cardiovascular disease.',
    organs: ['Liver', 'Arterial wall'],
    pathophysiology:
      'LDL particles enter the arterial wall, are retained and oxidized, and trigger inflammation and plaque growth. Lifetime exposure (concentration × years) determines risk. Familial hypercholesterolemia comes from LDLR, APOB or gain-of-function PCSK9 variants.',
    symptoms: ['None until a cardiovascular event', 'Tendon xanthomas in familial forms'],
    progression: 'Silent plaque build-up over decades leads to myocardial infarction, stroke and peripheral artery disease.',
    mechanisms: ['LDL receptor-mediated hepatic clearance', 'PCSK9 regulation of LDLR', 'Cholesterol synthesis (HMG-CoA reductase)'],
    epidemiology: {
      prevalence: 'Heterozygous familial hypercholesterolemia affects about 1 in 250–300 people. Elevated LDL-C is very common in adults.',
      burden: 'ASCVD is the leading cause of death worldwide.',
      risks: ['Genetics (FH)', 'Diet', 'Obesity', 'Hypothyroidism', 'Kidney disease'],
      subpopulations: ['Heterozygous FH', 'Homozygous FH', 'Established ASCVD (secondary prevention)', 'Statin-intolerant patients'],
      sourceIds: ['gl-acc-aha-chol', 'gl-esc-lipids'],
    },
    standardOfCare: [
      { drugClass: 'Statins', examples: ['Atorvastatin', 'Rosuvastatin'], drugIds: [], role: 'First line, with extensive outcome evidence.' },
      { drugClass: 'Ezetimibe', examples: ['Ezetimibe'], drugIds: [], role: 'Added when statin alone is not enough.' },
      { drugClass: 'PCSK9 monoclonal antibodies', examples: ['Evolocumab', 'Alirocumab'], drugIds: ['evolocumab'], role: 'For very-high-risk patients above LDL-C thresholds.' },
      { drugClass: 'PCSK9 siRNA', examples: ['Inclisiran'], drugIds: ['inclisiran'], role: 'Twice-yearly dosing. Outcome trial evidence was pending at last verification.' },
      { drugClass: 'Bempedoic acid', examples: ['Bempedoic acid'], drugIds: [], role: 'An option for statin intolerance (CLEAR Outcomes).' },
    ],
    guidelines: [
      { org: 'ACC/AHA multisociety', region: 'US', year: '2018', title: 'Guideline on the management of blood cholesterol', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=2018%20AHA%20ACC%20multisociety%20guideline%20management%20of%20blood%20cholesterol' },
      { org: 'ESC/EAS', region: 'Europe', year: '2019 (focused update 2025)', title: 'Guidelines for the management of dyslipidaemias', url: 'https://www.escardio.org/Guidelines' },
    ],
    unmetNeeds: ['Adherence to lifelong daily therapy', 'Reaching LDL-C goals in very-high-risk patients', 'Oral non-statin options with large effects', 'Lipoprotein(a), which current drugs do not lower'],
    biomarkers: [
      { name: 'LDL-C', role: 'Surrogate endpoint', implication: 'Each 1 mmol/L reduction lowers major vascular events by about 20–25%, consistently across mechanisms that lower LDL by upregulating LDLR.' },
      { name: 'FH genotype (LDLR, APOB, PCSK9)', role: 'Diagnosis and cascade screening', implication: 'Homozygous LDLR-null patients respond poorly to PCSK9 inhibition, because the drugs need functional receptors.' },
      { name: 'Lipoprotein(a)', role: 'Residual risk', implication: 'Not addressed by statins. Targeted therapies are in development.' },
    ],
    failures: [{ name: 'Bococizumab (Pfizer)', what: 'PCSK9 antibody discontinued in 2016. Anti-drug antibodies weakened its LDL lowering over time.' }, { name: 'CETP inhibitors (torcetrapib, dalcetrapib, evacetrapib)', what: 'Raised HDL but did not reduce events, or caused harm. A lesson in surrogate endpoints.' }],
    targetIds: ['pcsk9'],
    verified: '2026-06-01',
    sourceIds: ['gl-acc-aha-chol', 'gl-esc-lipids', 'pub-pcsk9-genetics'],
  },
  {
    id: 'mash',
    name: 'MASH',
    aliases: ['metabolic dysfunction-associated steatohepatitis', 'NASH', 'MASLD', 'fatty liver', 'nonalcoholic steatohepatitis'],
    summary: 'The inflammatory form of metabolic fatty liver disease, which can progress to fibrosis, cirrhosis and liver cancer.',
    organs: ['Liver'],
    pathophysiology:
      'Excess fatty acids reaching the liver, from adipose tissue, diet and de novo lipogenesis, overwhelm its oxidative capacity. Lipotoxic stress injures hepatocytes and activates stellate cells, which lay down fibrosis.',
    symptoms: ['Usually none', 'Fatigue', 'Right upper quadrant discomfort', 'Signs of cirrhosis in late disease'],
    progression: 'Fibrosis stage (F0–F4) is the strongest predictor of liver-related and overall mortality.',
    mechanisms: ['Hepatic lipotoxicity', 'Insulin resistance', 'Stellate-cell activation and fibrogenesis', 'PNPLA3 and TM6SF2 genetic risk'],
    epidemiology: {
      prevalence: 'MASLD affects roughly 30% of adults worldwide. A minority have MASH with significant fibrosis.',
      burden: 'A fast-growing cause of liver transplantation.',
      risks: ['Obesity', 'Type 2 diabetes', 'PNPLA3 I148M variant', 'Dyslipidemia'],
      subpopulations: ['F2–F3 noncirrhotic MASH (current approved population)', 'Compensated cirrhosis (F4), not covered by approvals at last verification'],
      sourceIds: ['gl-aasld-masld'],
    },
    standardOfCare: [
      { drugClass: 'Weight loss & lifestyle', examples: ['≥7–10% weight loss'], drugIds: [], role: 'Improves histology in proportion to weight lost.' },
      { drugClass: 'THR-β agonist', examples: ['Resmetirom'], drugIds: ['resmetirom'], role: 'First approved MASH drug (F2–F3).' },
      { drugClass: 'GLP-1R agonist', examples: ['Semaglutide'], drugIds: ['semaglutide'], role: 'FDA accelerated approval for MASH in 2025.' },
    ],
    guidelines: [{ org: 'AASLD', region: 'US', year: '2023', title: 'Practice guidance on the clinical assessment and management of MASLD', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=AASLD%20practice%20guidance%20clinical%20assessment%20management%20nonalcoholic%20fatty%20liver%20disease%202023' }],
    unmetNeeds: ['Therapies proven for cirrhosis', 'Noninvasive endpoints accepted in place of biopsy', 'Proof that histology gains translate into fewer liver events'],
    biomarkers: [
      { name: 'Liver biopsy histology', role: 'Regulatory surrogate endpoint', implication: 'Used for accelerated approval. Sampling variability is substantial.' },
      { name: 'MRI-PDFF, elastography (FibroScan), ELF score', role: 'Noninvasive assessment', implication: 'Increasingly used to select patients and monitor response.' },
      { name: 'PNPLA3 I148M', role: 'Genetic risk', implication: 'Raises disease risk. Targeted therapies are under investigation.' },
    ],
    failures: [{ name: 'Obeticholic acid', what: 'FDA issued complete response letters for NASH in 2020 and 2023 because the benefit–risk balance was uncertain.' }, { name: 'Selonsertib, elafibranor, cenicriviroc', what: 'Phase 3 MASH trials did not meet primary endpoints.' }],
    targetIds: ['thrb', 'gcgr', 'glp1r'],
    verified: '2026-06-01',
    sourceIds: ['gl-aasld-masld', 'nejm-maestro'],
  },
]

export const diseases: Record<string, Disease> = Object.fromEntries(list.map((d) => [d.id, d]))
export const diseaseList = list

/** Indications referenced by programs that are outside the curated disease set. */
export const externalDiseaseLabels: Record<string, string> = {
  osa: 'Obstructive sleep apnea',
  alzheimers: 'Alzheimer’s disease',
  ascvd: 'Atherosclerotic cardiovascular disease',
}
