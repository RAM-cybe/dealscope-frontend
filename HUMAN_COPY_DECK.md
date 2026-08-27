# ✍️ DealScope Human Copy Deck: Production-Ready Text Replacements

**Product:** DealScope (`dealscope-screener.vercel.app`)  
**Purpose:** Direct, drop-in text replacements for all frontend files and components. Zero em dashes, zero AI slop, verified finance precision.

---

## 1. App Layout & Meta Tags (`app/layout.tsx` & `app/opengraph-image.tsx`)

### `app/layout.tsx`
```tsx
const SITE_TITLE = "DealScope: Sector-relative comps and screening for 2,381 NSE companies."
const SITE_DESCRIPTION =
  "Screen 2,381 NSE-listed Indian companies by sector-relative operating percentiles, peer trading multiples, and promoter pledge telemetry. Free, no account required."
```

### `app/opengraph-image.tsx`
```tsx
export const alt = "DealScope: Sector-relative comps and screening for 2,381 NSE companies."
```

---

## 2. Homepage / Landing View (`components/dealscope/landing-view.tsx`)

### Hero Block
```tsx
{/* Hero Category Badge */}
<div className="inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-1 mb-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-accent">
  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_6px_var(--accent)]" />
  FREE LISTED-INDIA COMPS &amp; M&amp;A SCREENER
</div>

{/* Hero Wordmark */}
<h1 className="font-[family-name:var(--font-bebas)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-foreground select-none leading-none">
  DEALSCOPE
</h1>

{/* Hero Subtitle */}
<p className="mt-2.5 font-sans text-sm sm:text-base md:text-lg text-foreground/90 font-medium tracking-tight max-w-2xl text-balance">
  Every NSE-listed company, scored within its sector the way a deal team screens targets.
</p>

{/* Search Omnibar Placeholder */}
placeholder='Search 2,381 NSE companies or thesis (e.g. "TATA MOTORS", "high margin pharma", "low debt mid cap")...'

{/* Action Buttons */}
<button onClick={onOpenFilters} ...>
  <SlidersHorizontal className="w-3.5 h-3.5" />
  <span>Quantitative Filters</span>
  {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
</button>

{hasActiveFilters ? (
  <button onClick={onRun} ...>
    <span>View {matchingCount.toLocaleString("en-IN")} Matching Targets</span>
    <BitmapChevron ... />
  </button>
) : (
  <button onClick={onRun} ...>
    <span>View All {totalCount.toLocaleString("en-IN")} Equities</span>
    <BitmapChevron ... />
  </button>
)}

{/* Quick Sector Filter Header */}
<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
  Filter by Sector:
</span>

{/* Telemetry Ribbon */}
<div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 font-mono text-xs text-muted-foreground">
  <div className="flex items-baseline gap-1.5">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Coverage</span>
    <span className="text-foreground font-semibold font-mono">{totalCount.toLocaleString("en-IN")} Equities</span>
  </div>
  <span className="text-border/60">•</span>
  <div className="flex items-baseline gap-1.5">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Taxonomy</span>
    <span className="text-foreground font-semibold font-mono">13 Sectors · 124 Groups</span>
  </div>
  <span className="text-border/60">•</span>
  <div className="flex items-baseline gap-1.5">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">M&amp;A Database</span>
    <span className="text-foreground font-semibold font-mono">{dealCount.toLocaleString("en-IN")} Precedent Deals</span>
  </div>
</div>
```

### Section 01: Sector Normalization
```tsx
<SectionLabel index="01" label="Sector Normalization" />
<h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
  WHY SECTOR-RELATIVE SCORING MATTERS
</h2>
<p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
  Empirical Percentile Distributions vs Raw Cross-Sector Screening
</p>

<p>
  Standard financial screeners rank companies on raw absolute numbers. That systematically distorts results: it overweights capital-light software businesses with 35% margins while hiding world-class logistics, manufacturing, or EPC companies operating efficiently at 14% margins.
</p>
<p className="text-muted-foreground">
  DealScope evaluates each company strictly against its direct sector cohort. A factor score of <strong className="text-foreground font-mono">85</strong> means the business sits in the 85th percentile of its actual operational competitors. Performance is measured against sector reality, never inflated by structural industry tailwinds or penalized by asset intensity.
</p>
```

### Section 02: The 4-Factor Operating Engine
```tsx
<SectionLabel index="02" label="Scoring Architecture" />
<h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
  THE 4-FACTOR OPERATING ENGINE
</h2>
<p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
  0 to 100 Empirical Sector Percentile Distribution
</p>

<p className="font-sans text-base sm:text-lg leading-relaxed text-foreground/90">
  Every company is assigned four sector-relative percentile factor scores. Factors combine under an equal default weighting (25% each) into a single composite score. If a metric is missing, it is dropped and the remaining factors are dynamically reweighted, never penalized as zero.
</p>

{/* Factor Cards */}
{[
  { title: "Revenue Growth", factor: "01", desc: "Top-line growth trajectory benchmarked against sector median expansion." },
  { title: "EBITDA Margin", factor: "02", desc: "Operating profitability and cost discipline relative to sector peer distributions." },
  { title: "ROCE (Return on Capital)", factor: "03", desc: "Operating profit generated per rupee of capital employed, isolating capital efficiency." },
  { title: "Debt Health (Inverted Leverage)", factor: "04", desc: "Balance sheet safety via Net Debt to EBITDA. Lower leverage scores higher. Financial Services excluded." },
]}
```

### Section 03: Common Deal Theses / Curated Screens
```tsx
<SectionLabel index="03" label="Preset Screens" />
<h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-foreground">
  COMMON DEAL THESES
</h2>
<p className="mt-3 max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
  Click any playbook below to execute a live natural-language screen across the entire 2,381 NSE-listed universe.
</p>

{/* Footer of Section 03 */}
<span className="font-mono text-xs text-muted-foreground">
  Click any playbook to execute instantly, or build custom criteria above
</span>
<button onClick={onRun} ...>
  <span>View Full Universe ({totalCount.toLocaleString("en-IN")})</span>
  <BitmapChevron ... />
</button>
```

### Section 04: Taxonomy & Coverage
```tsx
<SectionLabel index="04" label="Taxonomy & Coverage" />
<h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-foreground">
  13 SECTORS · 124 INDUSTRY GROUPS
</h2>
<p className="mt-3 max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
  Broad single-bucket screening fails when comparing port operators to packaging mills. DealScope classifies every company into 13 calibrated sector cohorts and 124 underlying industry groups.
</p>
```

### Section 05: Precedent Transactions
```tsx
<SectionLabel index="05" label="Transaction Benchmarks" />
<h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
  727 PRECEDENT M&amp;A DEALS
</h2>
<p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
  Historical Indian M&amp;A Multiples (2006 to 2025)
</p>

<p>
  Every company tear sheet connects directly to historical transactions in that sector. Compare listed trading multiples against actual deal valuations and control premiums paid in Indian acquisitions. Public trading multiples and precedent transaction comps are kept strictly separate: trading multiples benchmark current public pricing, while historical deals provide transaction context.
</p>

{/* Telemetry Strip */}
<div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-muted-foreground border border-border/60 bg-card/30 p-4">
  <div><span className="text-foreground font-semibold">13</span> Sector Taxonomies</div>
  <span className="text-border">•</span>
  <div><span className="text-foreground font-semibold">100%</span> Sourced Disclosures</div>
  <span className="text-border">•</span>
  <div><span className="text-foreground font-semibold">0</span> Imputed Multiples</div>
</div>
```

### Footer
```tsx
<footer className="border-t border-border/40 py-8 px-4 sm:px-6 md:px-12 bg-background font-mono text-xs text-muted-foreground">
  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
    <span>DEALSCOPE · Listed India M&amp;A and Comps Workbench</span>
    <div className="flex items-center gap-4">
      <Link href="/about" className="hover:text-accent transition-colors">
        Methodology &amp; Architecture
      </Link>
      <span className="text-border">•</span>
      <span>Built by Ram</span>
    </div>
  </div>
</footer>
```

---

## 3. Results View & Microcopy (`components/dealscope/results-view.tsx`, `screen-bar.tsx`, `filters-panel.tsx`, `weights-panel.tsx`)

### `components/dealscope/results-view.tsx`
```tsx
{/* Back Eyebrow */}
<button onClick={onBack} className="font-mono text-xs uppercase tracking-[0.3em] text-accent hover:text-foreground transition-colors duration-200">
  ← Back to Overview
</button>

{/* Header and Subtitle */}
<h1 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl md:text-7xl tracking-tight text-balance">
  {results.length.toLocaleString("en-IN")}{" "}
  {results.length === 1 ? "company matches" : "companies match"}
</h1>
<p className="mt-2 font-mono text-xs text-muted-foreground">
  Ranked by composite score · Missing metrics excluded from weighting · Unclassified tickers not scored
</p>

{/* Search Placeholder */}
placeholder="Refine by name, ticker, or screen (e.g. 'roce over 20 low debt')"

{/* Empty State */}
<div className="border border-border/40 p-16 text-center">
  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
    No companies match all active filters
  </p>
  <p className="mt-3 mx-auto max-w-sm font-mono text-[11px] leading-relaxed text-muted-foreground">
    Conditions combine with AND, so each condition narrows the universe. Remove a filter chip above to widen the screen, or clear all filters to reset.
  </p>
  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
    <button onClick={onClearAll} className="inline-flex items-center gap-2 border border-accent/60 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/10 transition-all duration-200">
      Clear all filters
    </button>
    {activeFilters > 0 && (
      <button onClick={onOpenFilters} className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200">
        Adjust filters ({activeFilters})
      </button>
    )}
  </div>
</div>
```

### `components/dealscope/filters-panel.tsx`
```tsx
{/* Drawer Header */}
<span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
  Screening Controls
</span>
<h2 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl tracking-tight text-foreground">
  QUANTITATIVE FILTERS
</h2>

{/* Description */}
<p className="font-mono text-xs text-muted-foreground leading-relaxed">
  Filter the screened universe by financial metrics: size, valuation, quality, growth, and leverage.
  Pills allow multiple selections; segmented controls select one. Untouched fields do not filter.
</p>
```

### `components/dealscope/weights-panel.tsx`
```tsx
{/* Drawer Header */}
<span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
  Model Weights
</span>
<h2 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl tracking-tight text-foreground">
  FACTOR WEIGHTS
</h2>

{/* Description */}
<p className="font-mono text-xs text-muted-foreground leading-relaxed">
  Adjust the relative weight of each factor. Composite scores across the screened set recalculate in real time.
</p>

{/* Normalization Footer */}
<p className="font-mono text-xs text-muted-foreground leading-relaxed">
  Weights are normalized: relative proportions determine the composite score. Missing metrics are dropped rather than treated as zero, and remaining factors are dynamically re-weighted.
</p>
```

### `components/dealscope/sector-industry-filter.tsx`
```tsx
{/* Unclassified explanation */}
<p className="border-t border-border/40 pt-4 font-mono text-xs leading-relaxed text-muted-foreground">
  Unclassified ({unclassifiedCount}): sector data is unavailable for these entities in public filings. Searchable by ticker, but excluded from peer percentile scoring to prevent misleading rankings.
</p>
```

---

## 4. Tear Sheet View (`components/dealscope/tear-sheet-view.tsx` & `lib/dealscope-data.ts`)

### `lib/dealscope-data.ts` (Factor Explanations)
```ts
export const FACTOR_LABELS = [
  {
    key: "revenueGrowth",
    label: "Revenue Growth",
    metricKey: "revenueGrowth",
    explainer: "YoY revenue growth trajectory relative to sector cohort.",
  },
  {
    key: "ebitdaMargin",
    label: "EBITDA Margin",
    metricKey: "ebitdaMargin",
    explainer: "Operating profitability (EBITDA / Revenue) before non-cash and capital costs.",
  },
  {
    key: "roce",
    label: "ROCE",
    metricKey: "roce",
    explainer: "Capital efficiency (EBIT / Capital Employed): operating profit generated per rupee of capital employed.",
  },
  {
    key: "debtLevel",
    label: "Debt Level",
    metricKey: "totalDebt",
    explainer: "Balance sheet leverage (Net Debt / EBITDA; fallback D/E). Higher score indicates lower debt burden. Excluded for Financial Services.",
  },
]
```

### `components/dealscope/tear-sheet-view.tsx`
```tsx
{/* Subtitle Under Factor Explainer */}
<p className="font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-3xl mb-8">
  {unclassified
    ? "This company has no verified sector classification, so it is not ranked against a peer group. Factor scores are shown as unavailable rather than estimated."
    : `Each factor is ranked 0 to 100 against direct peers in ${company.sector}. A score of 90 means outperforming 90% of sector companies. Missing factors are excluded from weighting.`}
</p>

{/* Executive Brief Fallback Strings */}
{hasAbout ? (
  <p className="font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
    {narrative.about}
  </p>
) : !detailsReady ? (
  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 py-4">
    Loading profile...
  </p>
) : (
  <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 py-4">
    Company profile is currently being compiled. Financial metrics and factor rankings above are live.
  </p>
)}

{hasWhyThisScore ? (
  <p className="font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
    {narrative.whyThisScore}
  </p>
) : !detailsReady ? (
  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 py-4">
    Loading rationale...
  </p>
) : (
  <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 py-4">
    Score rationale is derived directly from the sector percentile rankings above.
  </p>
)}

{/* Indicative Valuation Section */}
<SectionHeader
  index="05"
  label="Indicative Valuation Range"
  subtitle={`Derived from ${company.sector} listed peer multiples (P25 to P75)`}
/>

<p className="font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-3xl mb-6">
  Two independent estimates based on listed-peer trading multiples in {company.sector} applied to this company&apos;s reported earnings. EV/EBITDA values enterprise; P/E values equity.
</p>

{/* Section 07 Precedent Deals Subtitle */}
<SectionHeader
  index="07"
  label="Comparable Deals"
  subtitle={`Historical M&A: ${comparableCount} in sector (727 precedent deals total, 2006 to 2025)`}
/>
```

---

## 5. About & Methodology Page (`app/about/page.tsx`, `components/about/about-nav.tsx`)

### `app/about/page.tsx`
```tsx
export const metadata: Metadata = {
  title: "About & Methodology: DealScope",
  description:
    "How DealScope screens 2,381 NSE-listed companies for acquisition fit: sector-relative percentile scoring, listed-peer trading multiple valuation bands, and data governance.",
}

{/* Hero & Intro */}
<h1 className="font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,5vw,4rem)] leading-[0.92] tracking-tight text-foreground">
  About DealScope
</h1>
<p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-foreground/90 text-pretty">
  An open, login-free acquisition screening workbench for NSE-listed Indian companies.
  Evaluates 2,381 equities against empirical sector distributions and anchors indicative trading multiple valuation ranges.
</p>

{/* Built by Ram Bio Card */}
<div className="mt-5 border border-border/50 bg-card/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <span className="font-mono text-[10px] uppercase tracking-wider text-accent block font-semibold">
      Independent Project
    </span>
    <h2 className="font-sans text-base sm:text-lg font-bold text-foreground mt-0.5">
      Built by Ram
    </h2>
    <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
      Built to make Indian public company comps and screening transparent, sector-relative, and accessible.
    </p>
  </div>
  <div className="flex items-center gap-2.5 shrink-0">
    <a
      href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-border/60 bg-card/40 hover:border-accent hover:text-accent px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground font-medium transition-colors"
    >
      <Linkedin className="w-3.5 h-3.5 text-accent" />
      <span>LinkedIn</span>
      <ArrowUpRight className="w-3 h-3 opacity-60" />
    </a>
    <a
      href="mailto:ramsuthakaran.vp@gmail.com"
      className="inline-flex items-center gap-1.5 border border-border/60 bg-card/40 hover:border-accent hover:text-accent px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground font-medium transition-colors"
    >
      <Mail className="w-3.5 h-3.5 text-accent" />
      <span>Email</span>
    </a>
  </div>
</div>

{/* Section 01: Functional Positioning Matrix */}
<section id="mission">
  <SectionHeading
    title="Mission & Positioning"
    subtitle="Why sector-relative ranking matters"
  />
  <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
    <p>
      In the Indian financial ecosystem, tools are typically built for bottom-up equity research. 
      Platforms like <strong>Screener.in</strong> provide ten-year financial statements and custom ratio queries for public equity analysis.
    </p>
    <p>
      However, M&amp;A corporate development teams, private equity deal scouts, and transaction analysts face a different workflow: <strong>top-down sector triage</strong>.
      Screening across 2,381 companies using absolute market-wide cutoffs (e.g. EBITDA margin &gt; 15% or ROCE &gt; 15%) systematically distorts results, favoring asset-light software firms while penalizing capital-efficient leaders in industrials, auto ancillaries, and manufacturing where an 11% ROCE is top-decile performance.
    </p>
    <p>
      DealScope eliminates this distortion by ranking each company strictly against its true 13-sector peer group.
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 font-mono text-xs">
    <div className="border border-border/40 bg-card/15 p-4">
      <div className="text-muted-foreground uppercase font-semibold text-xs pb-2 mb-2.5 border-b border-border/20">
        Fundamental Equity Screeners
      </div>
      <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed">
        <li className="flex items-start gap-2">
          <span className="text-muted-foreground/60">•</span>
          <span>Single market-wide cutoffs cross-compare heterogeneous sectors.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-muted-foreground/60">•</span>
          <span>Outputs raw metric tables without transaction or trading valuation step-downs.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-muted-foreground/60">•</span>
          <span>Optimized for portfolio managers &amp; retail equity research.</span>
        </li>
      </ul>
    </div>

    <div className="border border-accent/40 bg-card/25 p-4">
      <div className="text-accent uppercase font-semibold text-xs pb-2 mb-2.5 border-b border-border/20">
        DealScope M&amp;A Workbench
      </div>
      <ul className="space-y-2 text-foreground/90 text-xs leading-relaxed">
        <li className="flex items-start gap-2">
          <span className="text-accent">•</span>
          <span>Percentile ranks evaluated strictly within 13 sector cohorts.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent">•</span>
          <span>Attaches liquid-peer EV/EBITDA and P/E step-down valuation bridges.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent">•</span>
          <span>Evaluates promoter pledge encumbrance, public float, and 727 deal comps.</span>
        </li>
      </ul>
    </div>
  </div>
</section>

{/* Section 04: Valuation (fixing em dash in N/A fallback) */}
<div className="text-muted-foreground text-[11px] pt-1.5 border-t border-border/20">
  If Net Income ≤ 0, P/E range is shown as unavailable (N/A).
</div>

{/* Section 05: Cap Table */}
<div className="mt-3 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
  <strong className="text-foreground">Pledge Telemetry:</strong> Over 85% of NSE companies have 0.0% pledge. An amber warning chip appears when pledge exceeds 10.0%.
</div>
```

### `components/about/about-nav.tsx`
```tsx
{/* Fix contact email link */}
<a
  href="mailto:ramsuthakaran.vp@gmail.com"
  title="Email Ram directly"
  className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors px-2 py-1 border border-border/40 hover:border-accent text-[11px] uppercase tracking-wider"
>
  <Mail className="w-3 h-3 text-accent" />
  <span>Email</span>
</a>
```
