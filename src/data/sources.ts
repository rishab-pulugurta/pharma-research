import type { Source } from './types'

const doi = (d: string) => `https://doi.org/${d}`
const ct = (nct: string) => `https://clinicaltrials.gov/study/${nct}`
const pubmed = (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`
const dailymed = (q: string) =>
  `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(q)}`
const epar = (slug: string) => `https://www.ema.europa.eu/en/medicines/human/EPAR/${slug}`

const list: Source[] = [
  // Peer-reviewed publications (DOIs checked against Crossref)
  { id: 'nejm-surmount1', title: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2206038'), date: '2022-07-21' },
  { id: 'nejm-step1', title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2032183'), date: '2021-03-18' },
  { id: 'nejm-select', title: 'Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2307563'), date: '2023-12-14' },
  { id: 'nejm-reta-p2', title: 'Triple–Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2301972'), date: '2023-08-10' },
  { id: 'nejm-fourier', title: 'Evolocumab and Clinical Outcomes in Patients with Cardiovascular Disease (FOURIER)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa1615664'), date: '2017-05-04' },
  { id: 'nejm-emparegoutcome', title: 'Empagliflozin, Cardiovascular Outcomes, and Mortality in Type 2 Diabetes (EMPA-REG OUTCOME)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa1504720'), date: '2015-11-26' },
  { id: 'nejm-surpass2', title: 'Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2107519'), date: '2021-08-05' },
  { id: 'nejm-orion1011', title: 'Two Phase 3 Trials of Inclisiran in Patients with Elevated LDL Cholesterol (ORION-10/11)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa1912387'), date: '2020-04-16' },
  { id: 'nejm-maestro', title: 'A Phase 3, Randomized, Controlled Trial of Resmetirom in NASH with Liver Fibrosis (MAESTRO-NASH)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2309000'), date: '2024-02-08' },
  { id: 'nejm-surmount5', title: 'Tirzepatide as Compared with Semaglutide for the Treatment of Obesity (SURMOUNT-5)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2416394'), date: '2025-07-03' },
  { id: 'nejm-redefine1', title: 'Coadministered Cagrilintide and Semaglutide in Adults with Overweight or Obesity (REDEFINE 1)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2502081'), date: '2025-08-14' },
  { id: 'nejm-oasis4', title: 'Oral Semaglutide at a Dose of 25 mg in Adults with Overweight or Obesity (OASIS 4)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2500969'), date: '2025-09-18' },
  { id: 'nejm-synergy-nash', title: 'Tirzepatide for Metabolic Dysfunction–Associated Steatohepatitis with Liver Fibrosis (SYNERGY-NASH)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2401943'), date: '2024-07-25' },
  { id: 'nejm-attain1', title: 'Orforglipron, an Oral Small-Molecule GLP-1 Receptor Agonist for Obesity Treatment (ATTAIN-1)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2511774'), date: '2025-09-16' },
  { id: 'nejm-achieve1', title: 'Orforglipron, an Oral Small-Molecule GLP-1 Receptor Agonist, in Early Type 2 Diabetes (ACHIEVE-1)', publisher: 'N Engl J Med', type: 'peer-reviewed', url: doi('10.1056/NEJMoa2505669'), date: '2025-09-18' },
  { id: 'pub-survo-p2', title: 'Survodutide in adults with overweight or obesity: phase 2 dose-finding trial', publisher: 'Lancet Diabetes Endocrinol (PubMed search)', type: 'peer-reviewed', url: pubmed('survodutide obesity phase 2 le Roux'), date: '2024' },
  { id: 'pub-survo-mash', title: 'Survodutide for MASH with fibrosis: phase 2 trial', publisher: 'N Engl J Med (PubMed search)', type: 'peer-reviewed', url: pubmed('survodutide MASH fibrosis phase 2 Sanyal'), date: '2024' },
  { id: 'pub-maritide-p2', title: 'Maridebart cafraglutide in adults with obesity: phase 2 trial', publisher: 'N Engl J Med (PubMed search)', type: 'peer-reviewed', url: pubmed('maridebart cafraglutide obesity phase 2'), date: '2025' },
  { id: 'pub-danu-p2', title: 'Efficacy and safety of danuglipron (PF-06882961) in adults with obesity', publisher: 'Diabetes Obes Metab (PubMed search)', type: 'peer-reviewed', url: pubmed('danuglipron PF-06882961 obesity randomized'), date: '2025' },
  { id: 'pub-glp1-physiology', title: 'Review literature on GLP-1 receptor signaling and physiology', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('GLP-1 receptor signaling physiology review Drucker'), date: '—' },
  { id: 'pub-gipr-paradox', title: 'Review literature on GIP receptor agonism vs antagonism for obesity', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('GIP receptor agonism antagonism obesity paradox review'), date: '—' },
  { id: 'pub-pcsk9-genetics', title: 'PCSK9 loss-of-function variants, low LDL and reduced coronary heart disease (Cohen et al.)', publisher: 'N Engl J Med (PubMed search)', type: 'peer-reviewed', url: pubmed('Cohen sequence variations PCSK9 low LDL protection coronary heart disease 2006'), date: '2006' },
  { id: 'pub-glucagon-review', title: 'Review literature on glucagon receptor biology and co-agonists', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('glucagon receptor co-agonist energy expenditure review'), date: '—' },
  { id: 'pub-amylin-review', title: 'Review literature on amylin receptor pharmacology and cagrilintide', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('amylin receptor cagrilintide pharmacology review'), date: '—' },
  { id: 'pub-sglt2-review', title: 'Review literature on SGLT2 inhibitor mechanisms of cardiorenal protection', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('SGLT2 inhibitors mechanisms cardiorenal protection review'), date: '—' },
  { id: 'pub-thrb-review', title: 'Review literature on hepatic THR-β agonism in MASH', publisher: 'PubMed search', type: 'peer-reviewed', url: pubmed('thyroid hormone receptor beta agonist MASH review'), date: '—' },
  { id: 'pub-obesity-gbd', title: 'Global burden of overweight and obesity (GBD collaborators)', publisher: 'Lancet (PubMed search)', type: 'peer-reviewed', url: pubmed('GBD adult overweight obesity prevalence forecast Lancet 2025'), date: '2025' },

  // Registries
  ...[
    'NCT04184622', 'NCT03548935', 'NCT03574597', 'NCT05822830', 'NCT04881760', 'NCT05929066',
    'NCT05931367', 'NCT05869903', 'NCT05567796', 'NCT01764633', 'NCT03399370', 'NCT03987919',
    'NCT01131676', 'NCT04667377', 'NCT05669599', 'NCT04707313', 'NCT03900429', 'NCT05952856',
    'NCT06164730', 'NCT06068946', 'NCT05564117', 'NCT05607680', 'NCT06858839', 'NCT05971940',
    'NCT06008756', 'NCT06066515', 'NCT06131437', 'NCT03872401',
  ].map((nct) => ({
    id: `ct-${nct}`,
    title: `ClinicalTrials.gov record ${nct}`,
    publisher: 'ClinicalTrials.gov',
    type: 'registry' as const,
    url: ct(nct),
    date: 'live',
  })),

  // Regulatory documents
  { id: 'fda-zepbound', title: 'Zepbound (tirzepatide) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('zepbound'), date: '2023-11-08' },
  { id: 'fda-mounjaro', title: 'Mounjaro (tirzepatide) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('mounjaro'), date: '2022-05-13' },
  { id: 'ema-mounjaro', title: 'Mounjaro European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('mounjaro'), date: '2022-09-15' },
  { id: 'fda-wegovy', title: 'Wegovy (semaglutide) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('wegovy'), date: '2021-06-04' },
  { id: 'fda-ozempic', title: 'Ozempic (semaglutide) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('ozempic'), date: '2017-12-05' },
  { id: 'ema-wegovy', title: 'Wegovy European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('wegovy'), date: '2022-01-06' },
  { id: 'fda-repatha', title: 'Repatha (evolocumab) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('repatha'), date: '2015-08-27' },
  { id: 'ema-repatha', title: 'Repatha European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('repatha'), date: '2015-07-17' },
  { id: 'fda-leqvio', title: 'Leqvio (inclisiran) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('leqvio'), date: '2021-12-22' },
  { id: 'ema-leqvio', title: 'Leqvio European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('leqvio'), date: '2020-12-09' },
  { id: 'fda-jardiance', title: 'Jardiance (empagliflozin) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('jardiance'), date: '2014-08-01' },
  { id: 'ema-jardiance', title: 'Jardiance European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('jardiance'), date: '2014-05-22' },
  { id: 'fda-rezdiffra', title: 'Rezdiffra (resmetirom) US prescribing information', publisher: 'FDA via DailyMed', type: 'regulatory', url: dailymed('rezdiffra'), date: '2024-03-14' },
  { id: 'ema-rezdiffra', title: 'Rezdiffra European public assessment report', publisher: 'European Medicines Agency', type: 'regulatory', url: epar('rezdiffra'), date: '2025' },

  // Company disclosures
  { id: 'lilly-news', title: 'Eli Lilly press releases (newsroom)', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases', date: '—' },
  { id: 'lilly-attain1', title: 'Lilly topline release: orforglipron ATTAIN-1 Phase 3 results in obesity', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases', date: '2025-08-07' },
  { id: 'lilly-triumph4', title: 'Lilly topline release: retatrutide TRIUMPH-4 Phase 3 results', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases', date: '2025-12' },
  { id: 'lilly-verve', title: 'Lilly completes acquisition of Verve Therapeutics', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases', date: '2025-07' },
  { id: 'novo-news', title: 'Novo Nordisk company announcements', publisher: 'Novo Nordisk', type: 'company', url: 'https://www.novonordisk.com/news-and-media/news-and-ir-materials.html', date: '—' },
  { id: 'amgen-news', title: 'Amgen press releases', publisher: 'Amgen', type: 'company', url: 'https://www.amgen.com/newsroom/press-releases', date: '—' },
  { id: 'pfizer-danu', title: 'Pfizer discontinues development of danuglipron', publisher: 'Pfizer', type: 'company', url: 'https://www.pfizer.com/newsroom/press-releases', date: '2025-04-14' },
  { id: 'pfizer-news', title: 'Pfizer press releases', publisher: 'Pfizer', type: 'company', url: 'https://www.pfizer.com/newsroom/press-releases', date: '—' },
  { id: 'bi-news', title: 'Boehringer Ingelheim press releases', publisher: 'Boehringer Ingelheim', type: 'company', url: 'https://www.boehringer-ingelheim.com/media/press-releases', date: '—' },
  { id: 'merck-news', title: 'Merck press releases (enlicitide)', publisher: 'Merck & Co.', type: 'company', url: 'https://www.merck.com/media/news/', date: '—' },
  { id: 'viking-venture', title: 'Viking Therapeutics: VK2735 VENTURE Phase 2 topline results', publisher: 'Viking Therapeutics', type: 'company', url: 'https://ir.vikingtherapeutics.com/press-releases', date: '2024-02-27' },
  { id: 'verve-heart2', title: 'Verve Therapeutics: initial Heart-2 data for VERVE-102', publisher: 'Verve Therapeutics', type: 'company', url: 'https://www.vervetx.com/', date: '2025-04' },
  { id: 'innovent-news', title: 'Innovent Biologics announcements (mazdutide)', publisher: 'Innovent Biologics', type: 'company', url: 'https://www.innoventbio.com/', date: '—' },
  { id: 'madrigal-news', title: 'Madrigal Pharmaceuticals press releases', publisher: 'Madrigal Pharmaceuticals', type: 'company', url: 'https://ir.madrigalpharma.com/news-releases', date: '—' },
  { id: 'novartis-news', title: 'Novartis media releases', publisher: 'Novartis', type: 'company', url: 'https://www.novartis.com/news/news-archive', date: '—' },
  { id: 'zealand-news', title: 'Zealand Pharma company announcements', publisher: 'Zealand Pharma', type: 'company', url: 'https://www.zealandpharma.com/media/', date: '—' },

  { id: 'lilly-foundayo', title: 'FDA approves Lilly’s Foundayo (orforglipron) for chronic weight management', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases/news-release-details/fda-approves-lillys-foundayotm-orforglipron-only-glp-1-pill', date: '2026-04-01' },
  { id: 'lilly-triumph1', title: 'Lilly topline release: retatrutide TRIUMPH-1 Phase 3 results in obesity', publisher: 'Eli Lilly and Company', type: 'company', url: 'https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-powerful-weight-loss', date: '2026-05-21' },
  { id: 'novo-redefine4', title: 'CagriSema demonstrated 23% weight loss in head-to-head REDEFINE 4; primary endpoint not achieved', publisher: 'Novo Nordisk', type: 'company', url: 'https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=916501', date: '2026-02-23' },
  { id: 'pub-synchronize1', title: 'Survodutide in adults with obesity or overweight (SYNCHRONIZE-1)', publisher: 'N Engl J Med (PubMed search)', type: 'peer-reviewed', url: pubmed('survodutide SYNCHRONIZE-1 obesity'), date: '2026-06-07' },
  { id: 'pub-vesalius', title: 'Evolocumab in Patients without a Previous Myocardial Infarction or Stroke (VESALIUS-CV)', publisher: 'N Engl J Med (PubMed)', type: 'peer-reviewed', url: 'https://pubmed.ncbi.nlm.nih.gov/41211925/', date: '2025-11-08' },
  { id: 'news-vesalius', title: 'Evolocumab wins for primary prevention in VESALIUS-CV', publisher: 'TCTMD', type: 'news', url: 'https://www.tctmd.com/news/evolocumab-wins-primary-prevention-vesalius-cv', date: '2025-11' },
  { id: 'news-enlicitide', title: 'FDA approves enlicitide, an oral PCSK9 inhibitor, for LDL lowering', publisher: 'TCTMD', type: 'news', url: 'https://www.tctmd.com/news/fda-approves-enlicitide-oral-pcsk9-inhibitor-ldl-lowering', date: '2026-07-16' },
  { id: 'news-orforglipron', title: 'FDA approves Foundayo, an oral GLP-1, for adults with obesity', publisher: 'Healio', type: 'news', url: 'https://www.healio.com/news/endocrinology/20260401/fda-approves-orforglipron-an-oral-glp1-for-adults-with-obesity', date: '2026-04-01' },
  { id: 'news-synchronize1', title: 'SYNCHRONIZE-1: survodutide led to significant weight loss in adults with obesity (journal scan)', publisher: 'American College of Cardiology', type: 'news', url: 'https://www.acc.org/latest-in-cardiology/journal-scans/2026/06/15/17/15/synchronize-1', date: '2026-06-15' },

  { id: 'sec-veradermics', title: 'Veradermics, Inc. Form 10-Q (Q2 2026)', publisher: 'SEC EDGAR', type: 'regulatory', url: 'https://www.sec.gov/Archives/edgar/data/0001827635/000182763526000030/mane-20260630.htm', date: '2026' },
  { id: 'news-veradermics-ipo', title: 'Veradermics upsizes IPO and prices at $17', publisher: 'IPOScoop', type: 'news', url: 'https://www.iposcoop.com/the-ipo-buzz-veradermics-mane-upsizes-ipo-prices-it-at-17-1-above-range/', date: '2026-02-04' },
  { id: 'news-newlimit-c', title: 'NewLimit raises $435 million Series C to bring aging reprogramming medicine to human trials', publisher: 'Pulse 2.0', type: 'news', url: 'https://pulse2.com/newlimit-raises-435-million-series-c-to-bring-aging-reprogramming-medicine-to-human-trials/amp/', date: '2026-06' },
  { id: 'news-newlimit-b', title: 'Kleiner Perkins leads $130M round in NewLimit', publisher: 'Fortune', type: 'news', url: 'https://fortune.com/article/kleiner-perkins-leads-130m-round-in-coinbase-founders-anti-aging-startup-newlimit', date: '2025-05' },
  { id: 'news-insilico-ipo', title: 'Insilico Medicine debuts on HKEX as first AI-driven biotech under Chapter 8.05', publisher: 'Nasdaq', type: 'news', url: 'https://www.nasdaq.com/articles/insilico-medicine-debuts-hkex-first-ai-driven-biotech-under-chapter-805', date: '2025-12' },
  { id: 'news-colossal-c', title: 'Colossal Biosciences raises $200M at a $10.2B valuation', publisher: 'TechCrunch', type: 'news', url: 'https://techcrunch.com/2025/01/15/colossal-biosciences-raises-200m-at-10-2b-valuation-to-bring-back-woolly-mammoths', date: '2025-01-15' },
  { id: 'news-colossal-talks', title: 'Colossal Biosciences reportedly in talks to raise at a $20B–$30B valuation', publisher: 'TechCrunch', type: 'news', url: 'https://techcrunch.com/2026/07/20/colossal-biosciences-reportedly-in-talks-to-raise-new-capital-at-20b-30b-valuation/', date: '2026-07-20' },
  { id: 'summit-bla', title: 'Summit Therapeutics announces FDA acceptance of BLA for ivonescimab in EGFRm NSCLC', publisher: 'Summit Therapeutics (Business Wire)', type: 'company', url: 'https://businesswire.com/news/home/20260129109846/en/Summit-Therapeutics-Announces-U.S.-FDA-Acceptance-of-Biologics-License-Application-BLA-Seeking-Approval-for-Ivonescimab-in-Combination-with-Chemotherapy-in-Treatment-of-Patients-with-EGFRm-NSCLC-Post-TKI-Therapy', date: '2026-01-29' },

  { id: 'news-warhound-tc', title: 'Warhound raises $200M to engineer war dogs and arm them with Anduril gear', publisher: 'TechCrunch', type: 'news', url: 'https://techcrunch.com/2026/10/22/ben-lamm-raises-200m-for-warhound-to-engineer-war-dogs-and-arm-them-with-anduril-gear/', date: '2026-10-22' },
  { id: 'news-warhound-forbes', title: 'Billionaires Palmer Luckey and Ben Lamm spin up startup to genetically engineer military dogs', publisher: 'Forbes', type: 'news', url: 'https://www.forbes.com/sites/amyfeldman/2026/10/22/the-woolly-mammoth-billionaires-new-startup-is-genetically-engineering-war-dogs-for-the-military/', date: '2026-10-22' },
  { id: 'news-warhound-engadget', title: 'A startup called Warhound is genetically engineering dogs for the military', publisher: 'Engadget', type: 'news', url: 'https://www.engadget.com/2295033/warhound-genetically-engineering-dogs-military/', date: '2026-10' },
  { id: 'news-chai-c', title: 'Chai Discovery raises $400 million to advance AI-designed drug discovery', publisher: 'The Pharma Letter', type: 'news', url: 'https://www.thepharmaletter.com/pharma-news/chai-discovery-raises-400-million-to-advance-ai-designed-drug-discovery', date: '2026-07-14' },
  { id: 'pre-chai2', title: 'Zero-shot antibody design in a 24-well plate (Chai-2)', publisher: 'bioRxiv preprint (not peer reviewed)', type: 'preclinical', url: 'https://www.biorxiv.org/content/10.1101/2025.07.05.663018', date: '2025-07' },
  { id: 'anew-site', title: 'Anew Labs company website and news', publisher: 'Anew Labs', type: 'company', url: 'https://anewbt.com/', date: '2026' },
  { id: 'news-anew', title: 'Unfamiliar newcomer in the AI pharmaceutical industry (Anew Labs)', publisher: '36Kr', type: 'news', url: 'https://eu.36kr.com/en/p/4022199830187911', date: '2026' },

  // Guidelines
  { id: 'gl-ada-2026', title: 'ADA Standards of Care in Diabetes', publisher: 'American Diabetes Association', type: 'guideline', url: 'https://diabetesjournals.org/care/issue', date: 'annual' },
  { id: 'gl-acc-aha-chol', title: 'AHA/ACC multisociety guideline on the management of blood cholesterol', publisher: 'ACC/AHA', type: 'guideline', url: pubmed('2018 AHA ACC multisociety guideline management of blood cholesterol'), date: '2018' },
  { id: 'gl-esc-lipids', title: 'ESC/EAS guidelines for the management of dyslipidaemias', publisher: 'ESC/EAS', type: 'guideline', url: 'https://www.escardio.org/Guidelines', date: '2019, focused update 2025' },
  { id: 'gl-aasld-masld', title: 'AASLD practice guidance on MASLD', publisher: 'AASLD', type: 'guideline', url: pubmed('AASLD practice guidance clinical assessment management nonalcoholic fatty liver disease 2023'), date: '2023' },
  { id: 'gl-who-obesity', title: 'WHO fact sheet: obesity and overweight', publisher: 'World Health Organization', type: 'guideline', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight', date: '2024' },
  { id: 'gl-who-diabetes', title: 'WHO fact sheet: diabetes', publisher: 'World Health Organization', type: 'guideline', url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes', date: '2024' },
  { id: 'gl-aga-obesity', title: 'AGA clinical practice guideline on pharmacological interventions for adults with obesity', publisher: 'American Gastroenterological Association', type: 'guideline', url: pubmed('AGA clinical practice guideline pharmacological interventions adults obesity 2022'), date: '2022' },
]

export const sources: Record<string, Source> = Object.fromEntries(list.map((s) => [s.id, s]))
