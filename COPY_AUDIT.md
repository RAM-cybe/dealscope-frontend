# 📋 DealScope Copy Audit: Comprehensive Language & Anti-Slop Inventory

**Target Product:** DealScope (`dealscope-screener.vercel.app`)  
**Scope:** Complete user-facing copy, microcopy, metadata, and data labels across all pages  
**Auditor:** DealScope Copy Audit & Anti-AI-Slop Team

---

## 1. Executive Summary

DealScope's core analytical engine is strong: 13-sector percentile scoring, Net Debt / EBITDA leverage logic, winsorized trading multiple valuation bands, and promoter pledge telemetry across 2,381 NSE-listed equities. 

However, the previous website language suffered from four pervasive copy defects:
1. **Em Dash Epidemic (`—`):** Dozens of em dashes scattered across page titles, subtitles, explainer footnotes, and fallback states.
2. **AI Slop & Inflated Prestige:** Decorative phrases like `"Institutional M&A & Equity Workbench"`, `"Deterministic Math"`, `"Interactive Sector Quartile Atlas"`, and `"Cap Table & Float Telemetry"`.
3. **Finance Inaccuracies in Microcopy:** EBITDA margin described erroneously as "core cash conversion efficiency" (EBITDA is operating profitability before non-cash and capital costs, not cash conversion).
4. **Repetitive & Brochure-Style Comparisons:** The landing page repeated the exact same paragraph in two places, and the About page used a red/green SaaS comparison box that falsely claimed competitors "quietly substitute missing data with zeros".

---

## 2. Page-by-Page Inventory of Wording Problems

### A. Global Layout & Header (`app/layout.tsx`, `components/dealscope/data-freshness.tsx`, `components/dealscope/stale-data-banner.tsx`, `app/opengraph-image.tsx`)

| File & Location | Current Problematic Copy | Issue / AI-Slop Pattern | Recommended Human Rewrite |
| :--- | :--- | :--- | :--- |
| `app/layout.tsx:26` | `DealScope — Every NSE-listed company, ranked the way a deal team would.` | Em dash `—` used as punctuation divider. | `DealScope: Sector-relative comps and screening for 2,381 NSE companies.` |
| `app/layout.tsx:28` | `Screen 2,381 NSE-listed Indian companies for acquisition fit...` | Functional, but slightly generic. | `Screen 2,381 NSE-listed Indian companies by sector-relative operating percentiles and peer trading multiples. Free, no account required.` |
| `app/opengraph-image.tsx:9` | `alt = "DealScope — Every NSE-listed company..."` | Em dash `—`. | `alt = "DealScope: Sector-relative comps and screening for 2,381 NSE companies."` |
| `components/dealscope/loading-screen.tsx:73` | `Compiling screened universe` | Slightly robotic loader text. | `Loading 2,381 NSE equities...` |
| `components/dealscope/data-freshness.tsx:6` | `if (!iso) return "—"` | Em dash fallback. | `if (!iso) return "N/A"` |

---

### B. Homepage / Landing View (`components/dealscope/landing-view.tsx`)

| Element | Current Copy | Issue / AI-Slop Pattern | Recommended Human Rewrite |
| :--- | :--- | :--- | :--- |
| **Hero Badge** | `Institutional M&A & Equity Workbench` | Inflated "Institutional" buzzword. | `FREE LISTED-INDIA COMPS & M&A SCREENER` |
| **Hero Subtitle** | `Every NSE-listed company, ranked the way a deal team would.` | Subjective claim; misses the sector-relative mechanism. | `Every NSE-listed company, scored within its sector the way a deal team screens targets.` |
| **Search Placeholder** | `Search 2,381 NSE companies (e.g. "TCS", "Tata Motors") or screen...` | Trailing ellipsis `"or screen..."` is vague. | `Search 2,381 NSE companies or thesis (e.g. "TATA MOTORS", "high margin pharma", "low debt mid cap")...` |
| **Primary Buttons** | `Quantitative Filters` / `View All 2,381 Equities` | Good structure, but filtered counter says generic "Matches". | `Quantitative Filters` / `View [N] Matching Companies` (when filtered) / `View All 2,381 Equities` (when open) |
| **Quick Sector Label** | `Filter by Sector (multi-select):` | Clunky form developer syntax. | `FILTER BY SECTOR` |
| **Telemetry Ribbon** | `Coverage 2,381 Equities • Valuation ₹4.6T Market Cap • M&A Database 727 Comps` | "₹4.6T" mixes INR and Western T ambiguously. | `2,381 NSE Equities • 727 Precedent Deals • 13 Sectors · 124 Industries` |
| **Section 01 Header** | `01 / The Quantitative Problem`<br>`WHY SECTOR-RELATIVE`<br>`Empirical Percentile Scoring vs Raw Cross-Sector Screening` | Academic over-labeling. | `01 / SECTOR NORMALIZATION`<br>`WHY SECTOR-RELATIVE SCORING MATTERS`<br>`Empirical percentile distributions vs raw cross-sector screening` |
| **Section 01 Body** | `...actual operational peers — never artificially inflated by industry tailwinds or penalized by capital intensity.` | Em dash `—` + repeated verbatim in Section 04. | `DealScope evaluates each company strictly against its direct sector cohort. A score of 85 means the business sits in the 85th percentile of its actual operating peers. Performance is measured against sector reality, never inflated by industry tailwinds or penalized by asset intensity.` |
| **Section 02 Header** | `02 / Deterministic Math`<br>`THE 4-FACTOR ENGINE`<br>`0–100 Sector ECDF Percentile Decomposition` | Jargon overload ("Deterministic Math", "ECDF Percentile Decomposition"). | `02 / SCORING ARCHITECTURE`<br>`THE 4-FACTOR OPERATING ENGINE`<br>`0 to 100 sector percentile ranks combined with dynamic re-weighting` |
| **Section 02 Factor 2** | `Core cash conversion efficiency from operating revenues.` | **Finance error:** EBITDA margin is operating profitability before non-cash and capital costs, NOT cash conversion. | `Operating profitability and cost discipline relative to sector peer distributions.` |
| **Section 02 Factor 4** | `Balance sheet safety; lower leverage receives higher scores.` | Vague. | `Net Debt to EBITDA leverage score. Lower debt scores higher. Financial Services exempted.` |
| **Section 03** | `03 / Instant Playbooks`<br>`CURATED SCREENING STRATEGIES`<br>`View Full Directory` | "Directory" sounds like a phone book. "Instant Playbooks" is trendy AI-slop. | `03 / PRESET SCREENS`<br>`COMMON DEAL THESES`<br>`View Full Universe (2,381)` |
| **Section 04** | `04 / Taxonomy & Coverage`<br>`13 SECTORS · 124 INDUSTRY GROUPS` | Repeats Section 01 text. | `04 / INDUSTRY TAXONOMY`<br>`13 SECTORS · 124 INDUSTRY GROUPS`<br>`Explain why broad single-bucket screening fails.` |
| **Section 05** | `05 / Transaction Benchmarks`<br>`727 REAL M&A DEALS` | "Real M&A Deals" sounds defensive. | `05 / TRANSACTION BENCHMARKS`<br>`727 PRECEDENT M&A DEALS (2006–2025)` |
| **Footer** | `DEALSCOPE · Quantitative Equity & M&A Intelligence` | Puffed-up "Intelligence". | `DEALSCOPE · Listed India M&A and Comps Workbench` |

---

### C. Results View & Filter Microcopy (`components/dealscope/results-view.tsx`, `components/dealscope/filters-panel.tsx`, `components/dealscope/weights-panel.tsx`, `components/dealscope/screen-bar.tsx`)

| File & Location | Current Copy | Issue / AI-Slop Pattern | Recommended Human Rewrite |
| :--- | :--- | :--- | :--- |
| `results-view.tsx:134` | `Entry State / Screened Set` | Reads like a software developer's React state name. | `← Back to Overview` or `Screened Universe` |
| `results-view.tsx:141` | `ranked by composite score · missing factors shown as — · unclassified names are not scored` | Em dash `—`. | `Ranked by sector composite score. Missing metrics are excluded from weighting. Unclassified tickers are not scored.` |
| `results-view.tsx:193` | `placeholder="Refine — name, ticker, or a screen like “roce over 20 low debt”"` | Em dash `—`. | `placeholder="Refine by name, ticker, or screen (e.g. 'roce over 20 low debt')"` |
| `results-view.tsx:226` | `No companies match every condition` | Slightly passive. | `No companies match all active filters` |
| `filters-panel.tsx:101` | `Screening Constraints`<br>`QUANTITATIVE FILTERS` | Puffed-up "Constraints". | `FILTER UNIVERSE`<br>`FINANCIAL & OPERATING FILTERS` |
| `filters-panel.tsx:122` | `Constrain the screened set by fundamental financials — size, valuation, quality, growth, and risk.` | Em dash `—`. | `Filter the universe by fundamental metrics across size, valuation, operating quality, growth, and leverage.` |
| `weights-panel.tsx:23` | `Control Variables`<br>`FACTOR WEIGHTS` | Puffed-up "Control Variables". | `MODEL WEIGHTS`<br>`FACTOR ALLOCATION` |
| `weights-panel.tsx:47` | `Weights are normalized — relative proportions determine the composite. Missing factors are dropped, not treated as zero; the remaining factors are re-weighted.` | Em dash `—`. | `Weights are normalized: relative proportions determine the composite score. Missing metrics are dropped rather than penalized as zero, and surviving factors are dynamically re-weighted.` |
| `sector-industry-filter.tsx:193` | `Unclassified ({unclassifiedCount}) — no industry data available for these companies. Confirmed gap in the upstream data source, not a guess. They are not scored against a fake peer group.` | Em dash `—` + defensive tone ("not a guess"). | `Unclassified ({unclassifiedCount}): sector data is unavailable for these entities. Searchable by ticker, but excluded from peer percentile scoring to prevent misleading rankings.` |

---

### D. Tear Sheet View (`components/dealscope/tear-sheet-view.tsx`, `lib/dealscope-data.ts`)

| File & Location | Current Copy | Issue / AI-Slop Pattern | Recommended Human Rewrite |
| :--- | :--- | :--- | :--- |
| `tear-sheet-view.tsx:140` | `Unclassified — not scored` | Em dash `—`. | `Unclassified: not scored` |
| `tear-sheet-view.tsx:175` | `Each score below is ranked 0–100 against direct peers in {company.sector} — a 90 means outperforming ~90% of sector companies. Missing factors (—) are excluded from weighting.` | Two em dashes `—`. | `Each factor is ranked 0 to 100 against direct peers in {company.sector}. A score of 90 means the company outperforms 90% of sector peers. Missing metrics are excluded from weighting.` |
| `lib/dealscope-data.ts:879` | `explainer: "Capital efficiency (EBIT / Capital Employed) — returns generated on deployed capital."` | Em dash `—`. | `explainer: "Capital efficiency (EBIT / Capital Employed): operating earnings generated per rupee of capital employed."` |
| `tear-sheet-view.tsx:336` | `— Company overview pending synthesis. Financial metrics and factor rankings above are live.` | Em dash `—` + AI jargon ("pending synthesis"). | `Company profile is currently being compiled. Financial metrics and sector factor rankings above are live.` |
| `tear-sheet-view.tsx:372` | `— Score rationale pending synthesis. Factor decomposition reflects direct sector-relative percentiles.` | Em dash `—` + "pending synthesis". | `Score breakdown is derived directly from the sector percentile rankings above.` |
| `tear-sheet-view.tsx:413` | `Reflects core operating enterprise value.` | Fake-depth "-ing" phrase. | `Enterprise value derived from sector median trading multiples.` |
| `tear-sheet-view.tsx:546` | `Historical M&A — {comparableCount} in sector of 727 precedent deals (2006–2025)` | Em dash `—`. | `Historical M&A: {comparableCount} in {company.sector} (727 deals total, 2006 to 2025)` |

---

### E. About & Methodology Page (`app/about/page.tsx`, `components/about/about-nav.tsx`, `components/about/sector-quartile-explorer.tsx`)

| File & Location | Current Copy | Issue / AI-Slop Pattern | Recommended Human Rewrite |
| :--- | :--- | :--- | :--- |
| `app/about/page.tsx:10` | `title: "About & Methodology — DealScope"` | Em dash `—`. | `title: "About & Methodology: DealScope"` |
| `app/about/page.tsx:51` | `An open, login-free acquisition screening workbench for NSE-listed Indian companies. Evaluates 2,381 equities against empirical sector distributions and anchors indicative trading multiple valuation ranges.` | Good content, but can be crisper. | `An open, login-free M&A and comps workbench for NSE-listed Indian companies. Benchmarks 2,381 equities against empirical 13-sector distributions and provides indicative trading multiple valuation ranges.` |
| `app/about/page.tsx:65` | `Conceived and coded to make Indian public company comps and screening transparent, sector-relative, and accessible.` | Academic-sounding ("Conceived and coded"). | `Built solo by Ram to provide transparent, sector-relative comps and screening for Indian public markets.` |
| `components/about/about-nav.tsx:78` | `href="mailto:vpram2007@gmail.com"` | **Wrong email address** (must be `ramsuthakaran.vp@gmail.com`). | `href="mailto:ramsuthakaran.vp@gmail.com"` |
| `app/about/page.tsx:140-178` | Comparison box with red X and green checks claiming competitors "Quietly substitute missing data with zeros or averages" | Cheap SaaS template + factual inaccuracy about Screener.in. | Replace with a professional **Positioning & Analytical Scope** comparison table separating bottom-up stock screeners from top-down M&A triage workbenches. |
| `app/about/page.tsx:175` | `Zero data imputation: missing metrics stay missing (`—`).` | Em dash `—`. | `Zero data imputation: missing metrics stay missing (shown as N/A).` |
| `app/about/page.tsx:308` | `If Net Income ≤ 0, P/E range is shown as unavailable (`—`).` | Em dash `—`. | `If Net Income ≤ 0, P/E range is marked as N/A.` |
| `app/about/page.tsx:352` | `Pledge Alert: Over 85% of NSE companies have 0.0% pledge. An amber warning chip appears when pledge exceeds 10.0%.` | Clear, keep factually accurate. | `Pledge Telemetry: Over 85% of NSE-listed companies have zero promoter pledge. An amber alert chip appears when pledged holdings exceed 10.0%.` |

---

## 3. Inventory of Every Em Dash (`—`) Found

1. `app/layout.tsx:26` (`SITE_TITLE`)
2. `app/opengraph-image.tsx:9` (`alt`)
3. `app/about/page.tsx:10` (`metadata.title`)
4. `app/about/page.tsx:175` (`missing (`—`)`)
5. `app/about/page.tsx:308` (`unavailable (`—`)`)
6. `components/dealscope/landing-view.tsx:254` (`operational peers — never`)
7. `components/dealscope/results-view.tsx:141` (`missing factors shown as —`)
8. `components/dealscope/results-view.tsx:193` (`placeholder="Refine — name..."`)
9. `components/dealscope/filters-panel.tsx:122` (`fundamental financials — size...`)
10. `components/dealscope/weights-panel.tsx:106` (`Weights are normalized — relative...`)
11. `components/dealscope/sector-industry-filter.tsx:193` (`Unclassified ({unclassifiedCount}) — no industry data...`)
12. `components/dealscope/tear-sheet-view.tsx:140` (`Unclassified — not scored`)
13. `components/dealscope/tear-sheet-view.tsx:175` (`company.sector} — a 90 means...`)
14. `components/dealscope/tear-sheet-view.tsx:336` (`— Company overview pending...`)
15. `components/dealscope/tear-sheet-view.tsx:372` (`— Score rationale pending...`)
16. `components/dealscope/tear-sheet-view.tsx:546` (`Historical M&A — {count}...`)
17. `lib/dealscope-data.ts:879` (`Capital efficiency (EBIT / Capital Employed) — returns...`)

*Action:* Replace all 17 public/UI occurrences with colons, periods, commas, or parentheses.

---

## 4. What to Keep, Cut, and Rewrite

### What to KEEP:
- The core tagline spirit: `"Every NSE-listed company, scored within its sector the way a deal team screens targets."`
- The factual telemetry: `2,381 companies`, `13 sectors`, `124 industries`, `727 deals`, `As of 26 Aug 2026 / 11 Jul 2026`.
- The mathematical formulas and transparent percentile methodology.
- The dark terminal aesthetic with amber accents.
- Simple, honest builder attribution: `Built by Ram` with LinkedIn and `ramsuthakaran.vp@gmail.com`.

### What to CUT:
- Generic vanity labels: `"Institutional"`, `"Intelligence"`, `"Deterministic Math"`, `"Quantitative Dossier"`, `"Control Variables"`.
- The red-X / green-check comparison box on `/about`.
- The incorrect statement that EBITDA is cash conversion.
- All 17 em dashes across the UI.

### What to REWRITE:
- Hero badge and supporting copy to focus on sector-relative operating scores, peer multiples, and CSV export.
- Results view header and empty states to be concise and helpful.
- About page comparison to respectfully acknowledge Screener.in while clearly defining DealScope's top-down M&A triage niche.
- Fallback states on company tear sheets from "pending synthesis" to clean, natural language.
