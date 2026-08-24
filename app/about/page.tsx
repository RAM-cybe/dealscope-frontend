import type { Metadata } from "next"
import Link from "next/link"
import { Linkedin, Mail, ArrowUpRight, Check, X, FileSpreadsheet, ShieldCheck, Database, Layers, Scale, TrendingUp, AlertTriangle, Terminal, Cpu, Sparkles } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"
import { FUNDAMENTALS_AS_OF, FUNDAMENTALS_AS_OF_MAX, PRICES_AS_OF, formatAsOfDate } from "@/components/dealscope/data-freshness"
import datasetMeta from "@/data/dataset-meta.json"
import { COMPS_CSV_HEADERS } from "@/lib/export-comps-csv"
import { SectorQuartileExplorer } from "@/components/about/sector-quartile-explorer"
import { AboutNav } from "@/components/about/about-nav"

export const metadata: Metadata = {
  title: "About & Methodology — DealScope",
  description:
    "How DealScope screens 2,381 NSE-listed companies for acquisition fit: sector-relative percentile scoring, listed-peer trading multiple valuation bands, and data governance.",
}

function SectionHeader({
  id,
  index,
  label,
  subtitle,
}: {
  id?: string
  index: string
  label: string
  subtitle?: string
}) {
  return (
    <div id={id} className="scroll-mt-20 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-border/40 pb-3 mb-6">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent font-bold">
          {index}
        </span>
        <span className="font-mono text-xs text-border">/</span>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-foreground font-semibold">
          {label}
        </h2>
      </div>
      {subtitle && (
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
          {subtitle}
        </span>
      )}
    </div>
  )
}

export default function AboutPage() {
  return (
    <section className="relative min-h-screen px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-20 bg-background text-foreground">
      <AnimatedNoise opacity={0.02} />

      {/* Main Container - Centered, Balanced, Full Width */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top Breadcrumb */}
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1.5"
        >
          ← Return to Screener
        </Link>

        {/* Master Header Block */}
        <div className="mt-8 pb-8 border-b border-border/40">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent block font-medium">
            Quantitative Dossier // Revision 2026.08 // Public Research
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.92] tracking-tight text-foreground">
            About DealScope
          </h1>
          <p className="mt-4 font-sans text-base md:text-lg leading-relaxed text-foreground/90 text-pretty">
            A free, login-free acquisition screening workbench that evaluates 2,381 NSE-listed Indian companies
            against empirical sector distributions and anchors indicative trading multiple valuation ranges.
          </p>

          {/* Builder Hero Identity Card */}
          <div className="mt-8 border border-accent/40 bg-card/35 p-5 md:p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 pointer-events-none -mr-8 -mt-8 rounded-full blur-2xl" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
                    Solo-Engineered Quantitative Workbench
                  </span>
                </div>
                <h2 className="mt-1 font-sans text-xl md:text-2xl font-bold text-foreground">
                  Ramsuthakaran VP (Ram)
                </h2>
                <span className="font-mono text-xs text-muted-foreground block mt-0.5">
                  Quantitative Finance &amp; Software Engineering
                </span>
              </div>

              {/* Direct 1-Click Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 border border-accent/60 bg-accent/10 hover:bg-accent/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-accent font-semibold transition-all duration-200"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Connect on LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="mailto:vpram2007@gmail.com"
                  className="group inline-flex items-center gap-2 border border-border/60 bg-background/80 hover:border-accent hover:text-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-all duration-200"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Direct</span>
                </a>
              </div>
            </div>

            {/* Manifesto Statement & Credential Badges */}
            <div className="mt-4 space-y-3">
              <p className="font-sans text-xs md:text-sm leading-relaxed text-foreground/85 text-pretty">
                I engineered DealScope from first principles to solve a systemic flaw in emerging market screening:
                the distortion caused by ranking companies on flat, cross-sector metrics. Built end-to-end as an
                independent research project—from automated daily exchange pipelines to client-side percentile algorithms.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                <span className="border border-border/60 bg-background/60 px-2.5 py-1 text-foreground/80">
                  ACCA Professional Accounting Foundation (IFRS)
                </span>
                <span className="border border-border/60 bg-background/60 px-2.5 py-1 text-foreground/80">
                  Deterministic Python ETL Pipeline
                </span>
                <span className="border border-border/60 bg-background/60 px-2.5 py-1 text-foreground/80">
                  Zero-Imputation Mathematical Rigor
                </span>
                <span className="border border-border/60 bg-background/60 px-2.5 py-1 text-foreground/80">
                  Sub-Millisecond Static Next.js Runtime
                </span>
              </div>
            </div>
          </div>

          {/* Live Universe HUD Telemetry Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 font-mono text-xs">
            <div className="border border-border/40 bg-card/20 p-3.5">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Universe Scope</span>
              <span className="text-foreground font-semibold text-sm mt-0.5 block tabular-nums">
                {datasetMeta.universe_size.toLocaleString("en-IN")} NSE Equities
              </span>
            </div>
            <div className="border border-border/40 bg-card/20 p-3.5">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Sector Taxonomy</span>
              <span className="text-foreground font-semibold text-sm mt-0.5 block">
                13 Core Sectors
              </span>
            </div>
            <div className="border border-border/40 bg-card/20 p-3.5">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Precedent M&amp;A Archive</span>
              <span className="text-accent font-semibold text-sm mt-0.5 block tabular-nums">
                {datasetMeta.deal_count.toLocaleString("en-IN")} Transactions
              </span>
            </div>
            <div className="border border-border/40 bg-card/20 p-3.5">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Daily Price Refresh</span>
              <span className="text-foreground font-semibold text-sm mt-0.5 block">
                {PRICES_AS_OF}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Top Chapter Navigation HUD */}
        <AboutNav />

        {/* Master 7-Chapter Dossier Body */}
        <div className="space-y-16 md:space-y-24 mt-8">
          
          {/* ========================================================================= */}
          {/* CHAPTER 01 / MISSION & POSITIONING */}
          {/* ========================================================================= */}
          <section id="01-mission">
            <SectionHeader
              index="01"
              label="Mission & Positioning"
              subtitle="The $4.6T market screening blindspot"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                Identifying acquisition candidates across a market the size of the National Stock
                Exchange of India is primarily a triage problem. Generic public market screeners rank
                equities on absolute numbers (e.g. market-wide EBITDA margin &gt; 15% or ROCE &gt; 15%).
                This introduces a fatal <strong className="text-foreground font-semibold">large-cap and capital-light bias</strong>:
                it systematically flatters tech and software services while penalizing heavy industrials,
                manufacturing, and cyclical leaders whose margins are structurally lower but elite within their cohort.
              </p>
              <p>
                The gap is not data availability—it is that raw financial metrics are not directly
                comparable across industries. A screen that ignores sector distribution produces a list nobody
                in corporate development or private equity can act on.
              </p>
            </div>

            {/* Exhibit 1.1: 2-Column Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8">
              {/* Generic Screeners */}
              <div className="border border-border/40 bg-card/15 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Generic Retail Screeners
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border/60 text-muted-foreground/80">
                      Absolute Ranks
                    </span>
                  </div>
                  <ul className="space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>Flat market cutoffs penalize cyclical, capital-intensive manufacturing.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>Systematically flatters large caps and asset-light software firms.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>Stops at raw screening with no indicative valuation bounds.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>Quietly zeroes out or imputes averages for missing balance sheet data.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-3 border-t border-border/20 font-mono text-[11px] text-muted-foreground/60">
                  Cross-sector absolute ranking creates false positives.
                </div>
              </div>

              {/* DealScope Workbench */}
              <div className="border border-accent/40 bg-card/30 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                      DealScope Workbench
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-accent/40 bg-accent/10 text-accent font-medium">
                      Sector-Relative
                    </span>
                  </div>
                  <ul className="space-y-3 font-mono text-xs text-foreground/90 leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Scores companies strictly against their 13-sector peer distribution.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Empirical percentile ranks (0–100) isolate true operational outperformers.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Attaches indicative EV/EBITDA and P/E listed-peer multiple valuation bands.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Strict zero-imputation policy: missing data stays missing, never treated as zero.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-3 border-t border-border/20 font-mono text-[11px] text-accent/90">
                  Percentiles computed across full universe, independent of active filter subsets.
                </div>
              </div>
            </div>

            {/* Exhibit 1.2: Scope Boundaries Matrix */}
            <div className="border border-border/40 bg-card/20 p-5 sm:p-6 my-6 font-mono text-xs">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold block mb-4 pb-2 border-b border-border/30">
                Institutional Scope Boundaries
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-accent uppercase tracking-wider font-semibold block mb-2">What DealScope Is</span>
                  <ul className="space-y-2 text-foreground/85 leading-relaxed">
                    <li>• A quantitative screening workbench ranking NSE-listed equities within 13 sectors.</li>
                    <li>• An indicative relative-valuation anchor based on listed trading multiples.</li>
                    <li>• A 100% free, login-free, open quantitative research project.</li>
                    <li>• A client-side engine providing instant, reproducible mathematical scores.</li>
                  </ul>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold block mb-2">What DealScope Is Not</span>
                  <ul className="space-y-2 text-muted-foreground/80 leading-relaxed">
                    <li>• Not a SEBI-registered Investment Adviser or Research Analyst.</li>
                    <li>• Not a provider of buy, sell, or hold recommendations or stock price targets.</li>
                    <li>• Not an M&amp;A advisory service issuing definitive fairness opinions.</li>
                    <li>• Not a generative AI model inventing financial numbers or estimating values.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 02 / UNIVERSE, TAXONOMY & FRESHNESS */}
          {/* ========================================================================= */}
          <section id="02-universe" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="02"
              label="Universe & Coverage"
              subtitle="Taxonomy v2, refresh cadence & quarantine protocols"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                DealScope tracks <strong className="text-foreground font-semibold">{datasetMeta.universe_size.toLocaleString("en-IN")} NSE-listed companies</strong>.
                The coverage universe is organized under a deterministic 13-sector standard taxonomy (`sector_v2`) mapped
                across 123 granular industry sub-classifications with audited overrides for diversified conglomerates.
              </p>
              <p>
                Share prices and market capitalisations update daily (<strong className="text-foreground font-semibold">{PRICES_AS_OF}</strong>).
                Fundamental financial statements—including revenue, EBITDA, margins, ROCE, and debt—reflect trailing reported quarterly and annual filings (<strong className="text-foreground font-semibold">{FUNDAMENTALS_AS_OF}</strong> for {datasetMeta.fundamentals_as_of_counts["2026-07-11"]?.toLocaleString("en-IN") || "2,046"} companies, and {formatAsOfDate(FUNDAMENTALS_AS_OF_MAX)} for {datasetMeta.fundamentals_as_of_counts["2026-07-21"]?.toLocaleString("en-IN") || "335"} companies).
              </p>
            </div>

            {/* Exhibit 2.1: Data Provenance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 font-mono text-xs">
              <div className="border border-border/40 bg-card/25 p-4">
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Prices &amp; Market Cap</span>
                <span className="text-foreground font-semibold text-base mt-1 block">{PRICES_AS_OF}</span>
                <span className="text-muted-foreground/70 text-[11px] mt-1 block">Refreshed daily after market close</span>
              </div>
              <div className="border border-border/40 bg-card/25 p-4">
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Reported Fundamentals</span>
                <span className="text-foreground font-semibold text-base mt-1 block">{FUNDAMENTALS_AS_OF}</span>
                <span className="text-muted-foreground/70 text-[11px] mt-1 block">Audited quarterly &amp; annual filings</span>
              </div>
              <div className="border border-border/40 bg-card/25 p-4">
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Currency Integrity Guard</span>
                <span className="text-accent font-semibold text-base mt-1 block">INR Standardization</span>
                <span className="text-muted-foreground/70 text-[11px] mt-1 block">Foreign ADR mismatches safely isolated</span>
              </div>
            </div>

            {/* The Quarantine Protocol */}
            <div className="border border-border/40 bg-secondary/30 p-5 font-mono text-xs my-6">
              <div className="flex items-center gap-2 text-foreground font-semibold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
                <span>The Quarantine Protocol ({datasetMeta.unclassified_count} Unclassified Companies)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {datasetMeta.unclassified_count} companies have no verified sector classification from primary data feeds.
                They remain fully indexed and searchable by ticker, but are strictly quarantined: they receive{" "}
                <strong className="text-foreground font-medium">no composite score, no fake peer group, and no listed-peer valuation range</strong>.
                DealScope never assigns unverified guesses to inflate coverage.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 03 / THE 4-FACTOR SCORING ENGINE */}
          {/* ========================================================================= */}
          <section id="03-scoring" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="03"
              label="Scoring Engine"
              subtitle="Four-factor composite & dynamic FIG reweighting"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                Each company receives an empirical percentile rank within its sector distribution on four core factors:
                top-line expansion, operating profitability, capital efficiency, and leverage health.
                These percentiles combine into a single <strong className="text-foreground font-semibold">0–100 composite score</strong>,
                dynamically normalized across whichever factors are populated.
              </p>
            </div>

            {/* Formula Banner */}
            <div className="border border-border/40 bg-card/25 p-5 my-6 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/30">
                <span className="uppercase tracking-wider text-muted-foreground font-medium">
                  Composite Score Mathematical Formulation
                </span>
                <span className="text-accent border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] uppercase font-semibold">
                  Dynamic Re-weighting
                </span>
              </div>
              <div className="pt-3.5 space-y-2">
                <div className="text-foreground text-sm font-semibold tracking-wide">
                  Composite Score = Σ(wᵢ · Percentileᵢ) / Σ(w_available)
                </div>
                <p className="text-muted-foreground/70 text-[11px] leading-relaxed">
                  Requires a minimum of 2 populated factors. If a factor is missing (`null`), its weight is omitted from both numerator and denominator—never treated as zero.
                </p>
              </div>
            </div>

            {/* Exhibit 3.1: 4-Factor Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
              {/* 01 / Revenue Growth */}
              <div className="border border-border/40 bg-card/20 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between border-b border-border/30 pb-2.5">
                    <span className="text-foreground font-semibold uppercase tracking-wider">01 / Revenue Growth</span>
                    <span className="text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 text-[10px] uppercase font-medium">
                      w = 25%
                    </span>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    <span className="text-foreground font-medium">Formula: </span>
                    <code className="bg-background/80 px-1.5 py-0.5 border border-border/40 text-accent">
                      Pctl_sector(YoY Revenue Growth %)
                    </code>
                  </div>
                  <p className="mt-2.5 text-muted-foreground/80 leading-relaxed">
                    Measures trailing twelve-month top-line revenue velocity against sector operating peers.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/20">
                  <div className="flex justify-between text-[10px] text-muted-foreground/70 mb-1.5">
                    <span>0 (Sector Min)</span>
                    <span className="text-accent">P50 (Median)</span>
                    <span>100 (Sector Top)</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/40 relative">
                    <div className="absolute left-1/2 -top-1 bottom-0 w-0.5 h-3.5 bg-muted-foreground/40 -translate-x-1/2" />
                    <div className="h-full bg-accent w-[75%]" />
                  </div>
                </div>
              </div>

              {/* 02 / EBITDA Margin */}
              <div className="border border-border/40 bg-card/20 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between border-b border-border/30 pb-2.5">
                    <span className="text-foreground font-semibold uppercase tracking-wider">02 / EBITDA Margin</span>
                    <span className="text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 text-[10px] uppercase font-medium">
                      w = 25%
                    </span>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    <span className="text-foreground font-medium">Formula: </span>
                    <code className="bg-background/80 px-1.5 py-0.5 border border-border/40 text-accent">
                      Pctl_sector(EBITDA / Revenue)
                    </code>
                  </div>
                  <p className="mt-2.5 text-muted-foreground/80 leading-relaxed">
                    Operating cash profitability relative to sector baseline, neutralizing cross-industry cost disparities.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/20">
                  <div className="flex justify-between text-[10px] text-muted-foreground/70 mb-1.5">
                    <span>0 (Sector Min)</span>
                    <span className="text-accent">P50 (Median)</span>
                    <span>100 (Sector Top)</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/40 relative">
                    <div className="absolute left-1/2 -top-1 bottom-0 w-0.5 h-3.5 bg-muted-foreground/40 -translate-x-1/2" />
                    <div className="h-full bg-accent w-[82%]" />
                  </div>
                </div>
              </div>

              {/* 03 / ROCE */}
              <div className="border border-border/40 bg-card/20 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between border-b border-border/30 pb-2.5">
                    <span className="text-foreground font-semibold uppercase tracking-wider">03 / ROCE</span>
                    <span className="text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 text-[10px] uppercase font-medium">
                      w = 25%
                    </span>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    <span className="text-foreground font-medium">Formula: </span>
                    <code className="bg-background/80 px-1.5 py-0.5 border border-border/40 text-accent">
                      Pctl_sector(EBIT / Capital Employed)
                    </code>
                  </div>
                  <p className="mt-2.5 text-muted-foreground/80 leading-relaxed">
                    Capital allocation efficiency: operating earnings generated per unit of capital deployed.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/20">
                  <div className="flex justify-between text-[10px] text-muted-foreground/70 mb-1.5">
                    <span>0 (Sector Min)</span>
                    <span className="text-accent">P50 (Median)</span>
                    <span>100 (Sector Top)</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/40 relative">
                    <div className="absolute left-1/2 -top-1 bottom-0 w-0.5 h-3.5 bg-muted-foreground/40 -translate-x-1/2" />
                    <div className="h-full bg-accent w-[68%]" />
                  </div>
                </div>
              </div>

              {/* 04 / Leverage (Inverted) */}
              <div className="border border-border/40 bg-card/20 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between border-b border-border/30 pb-2.5">
                    <span className="text-foreground font-semibold uppercase tracking-wider">04 / Leverage (Inverted)</span>
                    <span className="text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 text-[10px] uppercase font-medium">
                      w = 25%
                    </span>
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    <span className="text-foreground font-medium">Formula: </span>
                    <code className="bg-background/80 px-1.5 py-0.5 border border-border/40 text-accent">
                      100 - Pctl_sector(Net Debt / EBITDA)
                    </code>
                  </div>
                  <p className="mt-2.5 text-muted-foreground/80 leading-relaxed">
                    Lower leverage scores higher. Falls back to Debt/Equity when EBITDA ≤ 0.
                  </p>
                  <div className="mt-2 text-[11px] text-accent/90 bg-accent/5 border border-accent/20 p-2">
                    <strong className="text-foreground font-semibold">FIG Exemption:</strong> Financial Services are excluded from leverage; remaining 3 factors re-weighted to 33.3% each.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border/20">
                  <div className="flex justify-between text-[10px] text-muted-foreground/70 mb-1.5">
                    <span>0 (High Debt)</span>
                    <span className="text-accent">P50 (Median)</span>
                    <span>100 (Debt-Free)</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/40 relative">
                    <div className="absolute left-1/2 -top-1 bottom-0 w-0.5 h-3.5 bg-muted-foreground/40 -translate-x-1/2" />
                    <div className="h-full bg-accent w-[90%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Exhibit 3.2: Interactive Sector Quartile Atlas */}
            <SectorQuartileExplorer />
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 04 / VALUATION METHODOLOGY */}
          {/* ========================================================================= */}
          <section id="04-valuation" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="04"
              label="Valuation Methodology"
              subtitle="Listed-peer trading multiples vs precedent M&A deal context"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                DealScope attaches an indicative valuation range to every qualifying company. The engine uses
                <strong className="text-foreground font-semibold"> listed-peer trading multiples</strong> (the 25th to 75th percentile
                EV/EBITDA and P/E of other listed companies in the same 13-sector peer group) applied mechanically
                to the company&apos;s own reported earnings.
              </p>
              <p>
                These ranges represent liquid market valuation bounds, not a Discounted Cash Flow (DCF) projection,
                and not a precedent transaction control valuation.
              </p>
            </div>

            {/* Exhibit 4.1: EV to Equity Step-Down Bridge */}
            <div className="border border-border/40 bg-card/25 p-6 my-6 font-mono text-xs">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold block mb-4 pb-2 border-b border-border/30">
                Enterprise Value to Equity Value Multiples Bridge
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EV/EBITDA Bridge */}
                <div className="border border-border/30 bg-background/50 p-4">
                  <div className="flex justify-between items-baseline pb-2 border-b border-border/20">
                    <span className="text-muted-foreground uppercase font-medium">EV / EBITDA Multiples Bridge</span>
                    <span className="text-accent font-semibold">Enterprise Level</span>
                  </div>
                  <div className="mt-3 space-y-2 text-foreground/85 leading-relaxed">
                    <div>1. <span className="text-accent">TTM EBITDA</span> × [Sector P25–P75 EV/EBITDA] = <span className="text-foreground font-semibold">Implied EV Range</span></div>
                    <div>2. <span className="text-foreground font-semibold">Implied EV</span> − Total Debt + Cash = <span className="text-accent font-semibold">Implied Equity Value</span></div>
                    <div className="text-[11px] text-muted-foreground/70 pt-2 border-t border-border/20">
                      <strong className="text-foreground">Debt Overhang Rule:</strong> If Total Debt &gt; Implied EV, equity value is floored at ₹0 with the tag `[DEBT OVERHANG]`.
                    </div>
                  </div>
                </div>

                {/* P/E Bridge */}
                <div className="border border-border/30 bg-background/50 p-4">
                  <div className="flex justify-between items-baseline pb-2 border-b border-border/20">
                    <span className="text-muted-foreground uppercase font-medium">Trailing P / E Multiple</span>
                    <span className="text-foreground font-semibold">Equity Level</span>
                  </div>
                  <div className="mt-3 space-y-2 text-foreground/85 leading-relaxed">
                    <div>1. <span className="text-accent">TTM Net Income</span> × [Sector P25–P75 Trailing P/E] = <span className="text-foreground font-semibold">Implied Equity Range</span></div>
                    <div>2. Direct market capitalization multiple (no debt deduction required).</div>
                    <div className="text-[11px] text-muted-foreground/70 pt-2 border-t border-border/20">
                      <strong className="text-foreground">Negative Earnings Rule:</strong> If Net Income ≤ 0, P/E implied range is flagged `— / unavailable`.
                    </div>
                  </div>
                </div>
              </div>

              {/* Precedent Deals Role */}
              <div className="mt-5 p-3.5 border border-border/30 bg-secondary/20 text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Precedent Deals Separation:</strong> The separate comps table lists{" "}
                <strong className="text-foreground">{datasetMeta.deal_count} historical Indian M&amp;A transactions</strong> (2006–2025).
                These deals serve strictly as qualitative transaction context and <strong className="text-foreground">do not feed</strong> the automated trading multiple formulas.
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 05 / CAP TABLE & FLOAT TELEMETRY */}
          {/* ========================================================================= */}
          <section id="05-governance" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="05"
              label="Cap Table & Float Telemetry"
              subtitle="Promoter holding, pledge thresholds & liquidity telemetry"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                In acquisition screening, ownership structure determines whether a target is actionable.
                DealScope surfaces promoter shareholding, promoter encumbrances (pledges), and estimated free float
                as purely factual telemetry with zero subjective judgment labels.
              </p>
            </div>

            {/* Exhibit 5.1: 3-Tone Stacked Capital Ownership Visual */}
            <div className="border border-border/40 bg-card/25 p-5 sm:p-6 my-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-5">
                <span className="uppercase tracking-wider text-foreground font-semibold">
                  Cap Table Telemetry Architecture
                </span>
                <span className="text-accent uppercase tracking-wider text-[10px] font-medium">
                  Factual Classification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div>
                  <span className="text-muted-foreground uppercase text-[10px] block">Promoter Holding</span>
                  <p className="mt-1 font-mono text-2xl md:text-3xl font-semibold text-foreground tabular-nums">
                    62.4%
                  </p>
                  <span className="text-muted-foreground/70 text-[11px] block mt-1">
                    Promoter &amp; insider equity
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[10px] block">Promoter Pledge</span>
                  <p className="mt-1 font-mono text-2xl md:text-3xl font-semibold text-foreground tabular-nums">
                    0.0%
                  </p>
                  <span className="text-muted-foreground/70 text-[11px] block mt-1">
                    Unencumbered collateral
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[10px] block">Free Float (Est.)</span>
                  <p className="mt-1 font-mono text-2xl md:text-3xl font-semibold text-foreground tabular-nums">
                    37.6%
                  </p>
                  <span className="text-muted-foreground/70 text-[11px] block mt-1">
                    Institutional &amp; public float
                  </span>
                </div>
              </div>

              {/* 2-tone distribution bar */}
              <div className="pt-4 border-t border-border/20">
                <div className="h-2.5 w-full bg-border/40 flex overflow-hidden">
                  <div className="bg-accent h-full w-[62.4%]" />
                  <div className="bg-foreground/25 h-full w-[37.6%]" />
                </div>
                <div className="mt-2.5 flex justify-between text-[11px] text-muted-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-accent inline-block" /> Promoter Stake (62.4%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-foreground/25 inline-block" /> Public Float (37.6%)
                  </span>
                </div>
              </div>

              {/* Pledge Alert Threshold Note */}
              <div className="mt-4 pt-3 border-t border-border/20 text-[11px] text-muted-foreground/80 leading-relaxed">
                <strong className="text-foreground">Tri-Tier Pledge Threshold:</strong> Over 85% of NSE companies maintain 0.0% pledge.
                DealScope highlights pledge with an amber border chip only when encumbrance exceeds <strong className="text-foreground">10.0%</strong> (`ELEVATED_PLEDGE_PCT`).
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 06 / ARCHITECTURE & CSV EXPORT */}
          {/* ========================================================================= */}
          <section id="06-architecture" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="06"
              label="Architecture & CSV Export"
              subtitle="Static Next.js runtime & 30-column CSV data dictionary"
            />
            <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty">
              <p>
                Nothing on this platform is hand-typed. An automated Python data pipeline handles ingestion,
                sector percentile ranking, and scheduled refreshes, outputting pre-computed static JSON artifacts.
                The interface is a static Next.js application—no database, no server cold-starts, and no account requirements.
              </p>
              <p>
                Screened company sets can be exported as a locked <strong className="text-foreground font-semibold">30-column Comps CSV</strong> formatted
                with raw unformatted numbers for direct ingestion into Excel financial models and Monday pipeline decks.
              </p>
            </div>

            {/* Exhibit 6.1: 30-Column CSV Schema Table */}
            <div className="border border-border/40 bg-card/25 p-5 my-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                <span className="uppercase tracking-wider text-foreground font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-accent" />
                  30-Column Comps CSV Data Dictionary
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  UTF-8 BOM Encoded
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-muted-foreground text-[10px] uppercase tracking-wider pb-2">
                      <th className="py-2 pr-4 font-normal">#</th>
                      <th className="py-2 pr-4 font-normal">Column Header</th>
                      <th className="py-2 font-normal">Data Role / Format</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-[11px]">
                    {COMPS_CSV_HEADERS.map((header, idx) => (
                      <tr key={header} className="hover:bg-accent/[0.02]">
                        <td className="py-1.5 pr-4 text-muted-foreground/60 tabular-nums">{(idx + 1).toString().padStart(2, "0")}</td>
                        <td className="py-1.5 pr-4 text-foreground font-medium">{header}</td>
                        <td className="py-1.5 text-muted-foreground/80">
                          {header.includes("INR Cr")
                            ? "Raw ₹ Crores (unformatted float for Excel)"
                            : header.includes("Percentile")
                            ? "0.0–100.0 Sector percentile rank"
                            : header.includes("Date")
                            ? "YYYY-MM-DD audit timestamp"
                            : header.includes("(%)")
                            ? "Percentage float"
                            : header.includes("Ratio") || header.includes("Beta")
                            ? "Numerical multiple / ratio"
                            : "Standardized text identifier"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CHAPTER 07 / INTEGRITY & DISCLAIMERS */}
          {/* ========================================================================= */}
          <section id="07-integrity" className="pt-12 md:pt-16 border-t border-border/30">
            <SectionHeader
              index="07"
              label="Integrity & Disclaimers"
              subtitle="10 Integrity guardrails & statutory non-advisory compliance"
            />

            {/* Exhibit 7.1: The 10 Integrity Guardrails Checklist */}
            <div className="border border-border/40 bg-card/25 p-5 sm:p-6 my-6 font-mono text-xs">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold block mb-4 pb-2 border-b border-border/30 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                The 10 Integrity Guardrails
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-foreground/85">
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">01.</span>
                  <span><strong className="text-foreground">Zero Imputation:</strong> Gaps stay null; never filled with fake averages or zeros.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">02.</span>
                  <span><strong className="text-foreground">Missing Data Invariant:</strong> Nulls never silently fail continuous range filters.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">03.</span>
                  <span><strong className="text-foreground">Population Floor:</strong> Minimum 2 populated factors required for composite score.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">04.</span>
                  <span><strong className="text-foreground">Transparent Null States:</strong> Negative earnings valuation explicitly flagged.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">05.</span>
                  <span><strong className="text-foreground">Currency Isolation:</strong> Foreign ADR reporting symbols safely blanked.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">06.</span>
                  <span><strong className="text-foreground">FIG Leverage Exemption:</strong> Bank operating deposits excluded from debt penalty.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">07.</span>
                  <span><strong className="text-foreground">Dual-Pool Leverage:</strong> Net Debt/EBITDA vs D/E ranked in separate pools.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">08.</span>
                  <span><strong className="text-foreground">Interquartile Bounds:</strong> P25–P75 multiple bands filter out outlier distortion.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">09.</span>
                  <span><strong className="text-foreground">Composition-Order Contract:</strong> Scores computed on full universe before display filters.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-bold">10.</span>
                  <span><strong className="text-foreground">Continuous Automated QA:</strong> Python test suite validates invariant checks on build.</span>
                </div>
              </div>
            </div>

            {/* Statutory Non-Advisory Legal Notice */}
            <div className="space-y-3 font-sans text-xs md:text-sm leading-relaxed text-muted-foreground/80 text-pretty">
              <p>
                DealScope is an independent quantitative research and engineering project. It is not investment advice,
                not a recommendation to buy, sell, or hold any security, and not a substitute for professional accounting,
                tax, or legal diligence. Scores and valuation ranges are deterministic mathematical outputs of published empirical
                distributions, not subjective judgments about any company&apos;s prospects.
              </p>
              <p>
                DealScope is not registered as an Investment Adviser under SEBI (Investment Advisers) Regulations, 2013,
                nor as a Research Analyst under SEBI (Research Analysts) Regulations, 2014. Every score and valuation range shown
                is identical for all visitors—generated automatically from public data with zero human curation or bias toward any company.
              </p>
              <p>
                Data is sourced from public exchange filings and third-party feeds and may contain delays, reporting errors, or omissions.
                Always verify figures independently against official regulatory filings before acting on any information presented here.
              </p>
            </div>

            {/* Epilogue Builder Manifesto & Sign-Off Hub */}
            <div className="mt-12 pt-8 border-t border-border/40 bg-card/20 p-6 md:p-8 border border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent block font-medium">
                    Builder Sign-Off &amp; Direct Outreach
                  </span>
                  <h3 className="font-sans text-lg md:text-xl font-bold text-foreground mt-1">
                    Engineered by Ramsuthakaran VP
                  </h3>
                  <p className="font-sans text-xs md:text-sm text-muted-foreground/90 mt-1 max-w-xl">
                    Whether you are a corporate development lead, private equity associate, or looking to collaborate on
                    quantitative financial intelligence, my inbox and network are always open.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 border border-border/60 hover:border-accent px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:text-accent transition-all duration-200"
                  >
                    <Linkedin className="w-3.5 h-3.5" aria-hidden="true" />
                    LinkedIn Profile
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                  </a>
                  <a
                    href="mailto:vpram2007@gmail.com"
                    className="group inline-flex items-center gap-2.5 border border-border/60 hover:border-accent px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:text-accent transition-all duration-200"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    Email (vpram2007)
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </section>
  )
}
