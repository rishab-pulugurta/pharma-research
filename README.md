# PharmAtlas

Explore the science, evidence, and development of every drug.

An interactive research explorer that connects companies, drugs, mechanisms, diseases, clinical trials and regulatory decisions. The first release is scoped to **metabolic, obesity and lipid therapeutics**, as the PRD recommends for the MVP.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## What's in it

| Module (PRD) | Where |
|---|---|
| A. Company & pipeline explorer | `/companies/:id`: pipeline chart and table, filters (disease, phase, modality, target, status, including discontinued), sorting, pipeline-vs-pipeline comparison |
| B. Drug profile & mechanism explorer | `/drugs/:id`: interactive Drug → Target → Cell → Body map with molecular, cellular and physiological depth, evidence-strength line styles, clickable nodes showing "other drugs acting here", PubChem 2D/3D structures for small molecules, modality schematics for biologics |
| C. Disease & therapeutic landscape | `/diseases/:id`: biology, epidemiology, standard of care with labeled guidelines, landscape grouped by target, modality or phase, biomarkers, failed approaches |
| D. Competitive comparison | `/compare?d=a,b&mode=mechanism\|clinical\|development`: head-to-head trial detection and an automatic list of reasons the numbers aren't comparable (timepoints, estimands, comparators, sources). It never ranks drugs on cross-trial numbers. |
| E. Clinical trial & evidence explorer | `/trials/:NCT`: three layers (summary, detailed arm-level results, original sources), surrogate vs patient-important labels, absolute vs relative effects, safety, **live ClinicalTrials.gov status**. Any NCT number works, including uncurated ones. |
| F. Regulatory intelligence | `/regulatory` and each drug's regulatory section: FDA, EMA and NMPA status, eligible populations, warnings, timelines, designations |
| Cross-platform discovery | Alias-aware universal search (codes, brands, generics, NCT IDs), relationship map (`/map`), "Connected" rail on every profile, question shortcuts |
| Personal workspace (P2) | Follow, collections, notes and a personalized update feed (`/workspace`), stored in the browser |

## Chat ("Ask about …")

Every company, drug, trial, target and disease page has a chat panel powered by Google Gemini's free tier, with Google Search grounding. It answers from the page's own data first.

1. Get a free key at https://aistudio.google.com/apikey (no credit card needed).
2. Create `.env.local` in the project folder with `GEMINI_API_KEY=your-key`. It's git-ignored and only read by the dev server, so it never reaches the browser.
3. Restart `npm run dev`.

The default model is `gemini-2.5-flash`. If its free daily quota runs out, the server falls back to `gemini-2.5-flash-lite`. To pick a different model, set `GEMINI_MODEL` in `.env.local`. Free-tier limits change often, so check them in Google AI Studio.

## Data and trust

- Curated data lives in `src/data/*.ts`. Each profile carries its own "last verified" date. The base snapshot was checked through June 2026. Profiles with major later events (orforglipron and enlicitide approvals, TRIUMPH-1, SYNCHRONIZE-1, REDEFINE 4, VESALIUS-CV, CagriSema filing) were re-verified in **October 2026**.
- Every claim links to a source tagged by evidence type: peer-reviewed, regulatory, registry, company disclosure, guideline or preclinical. Journal DOIs and NCT IDs were verified against Crossref and ClinicalTrials.gov.
- Missing results are shown as missing, never as negative.
- Trial pages compare the curated status with the live registry and flag any difference.

## Structure

```
src/data/        curated entities (companies, drugs, diseases, targets, trials, sources, updates, mechanism nodes)
src/lib/         graph relations, search, local storage, live registry client
src/components/  mechanism explorer, result chart, pipeline chart, relationship map, shared bits
src/pages/       one page per entity type plus compare, regulatory, updates, workspace, map, about
```

To add a drug, add an entry to `src/data/drugs.ts`. Its mechanism graph uses node IDs from `src/data/mechNodes.ts`, and new trials go in `src/data/trials.ts`. Pages, search, the map and comparisons pick it up automatically.

PharmAtlas is a research and educational tool. It is not medical advice.
