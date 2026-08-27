import type { Metadata } from "next"
import Link from "next/link"
import { Linkedin, Mail, ArrowUpRight } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"
import { FUNDAMENTALS_AS_OF, PRICES_AS_OF } from "@/components/dealscope/data-freshness"
import datasetMeta from "@/data/dataset-meta.json"

export const metadata: Metadata = {
  title: "About & Methodology: DealScope",
  description:
    "How DealScope screens NSE-listed companies for acquisition fit: sector-relative percentile scoring, listed-peer trading multiple valuation bands, and data governance.",
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border/40 pb-2 mb-4">
      <h2 className="font-mono text-sm sm:text-base uppercase tracking-wider text-foreground font-semibold">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default function AboutPage() {
  return (
    <section className="relative min-h-screen px-4 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16 bg-background text-foreground">
      <AnimatedNoise opacity={0.02} />

      {/* Main Centered Container */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          ← Return to Screener
        </Link>

        {/* 1. Hero & Short Intro */}
        <div className="mt-6 pb-6 border-b border-border/40">
          <h1 className="font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,5vw,4rem)] leading-[0.92] tracking-tight text-foreground">
            About DealScope
          </h1>
          <p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-foreground/90 text-pretty">
            An open, login-free acquisition screening workbench for NSE-listed Indian companies.
            Ranks companies within their sector peer distributions and anchors indicative trading multiple valuation ranges.
          </p>

          {/* 2. Built by Ram + LinkedIn + Email */}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0">
              <a
                href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 border border-border/60 bg-card/40 hover:border-accent hover:text-accent px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground font-medium transition-colors min-h-[44px] sm:min-h-0"
              >
                <Linkedin className="w-3.5 h-3.5 text-accent" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="mailto:ramsuthakaran.vp@gmail.com"
                className="inline-flex items-center justify-center gap-1.5 border border-border/60 bg-card/40 hover:border-accent hover:text-accent px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-foreground font-medium transition-colors min-h-[44px] sm:min-h-0"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Clean 3-Stat Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 font-mono text-xs">
            <div className="border border-border/30 bg-card/15 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Prices as of</span>
              <span className="text-foreground font-bold text-sm sm:text-base mt-0.5 block">
                {PRICES_AS_OF}
              </span>
            </div>
            <div className="border border-border/30 bg-card/15 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Fundamentals as of</span>
              <span className="text-foreground font-bold text-sm sm:text-base mt-0.5 block">
                {FUNDAMENTALS_AS_OF}
              </span>
            </div>
            <div className="border border-border/30 bg-card/15 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Precedent Deals</span>
              <span className="text-accent font-bold text-sm sm:text-base mt-0.5 block tabular-nums">
                {datasetMeta.deal_count.toLocaleString("en-IN")} Indian Deals
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-10 md:space-y-12 mt-8">

          {/* 1. Mission & Positioning */}
          <section id="mission">
            <SectionHeading
              title="01 / Mission & Positioning"
              subtitle="Why sector-relative ranking matters"
            />
            <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
              <p>
                In India, most screening tools are designed for general equity research with flat market-wide cutoffs (such as EBITDA margin &gt; 15% or ROCE &gt; 15%). That cross-compares unrelated business models: it favors asset-light software firms while penalizing capital-efficient manufacturers where an 11% ROCE is top-tier.
              </p>
              <p>
                DealScope solves this by scoring every company strictly against its operating sector peers. An 85 score means 85th percentile within that sector cohort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 font-mono text-xs">
              <div className="border border-border/40 bg-card/15 p-4 flex flex-col justify-between">
                <div>
                  <div className="text-muted-foreground uppercase font-semibold text-xs pb-2 mb-2.5 border-b border-border/20">
                    General Equity Screeners
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Single market-wide cutoffs cross-compare unrelated sectors.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Raw metric tables without sector-relative peer context.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      <span>Optimized for portfolio managers and retail research.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border border-accent/40 bg-card/25 p-4 flex flex-col justify-between">
                <div>
                  <div className="text-accent uppercase font-semibold text-xs pb-2 mb-2.5 border-b border-border/20">
                    DealScope M&amp;A Workbench
                  </div>
                  <ul className="space-y-2 text-foreground/90 text-xs leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Percentile ranks evaluated strictly within sector cohorts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Attaches listed-peer EV/EBITDA and P/E valuation bands.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Zero missing-data imputation: missing metrics are skipped, not zeroed.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Universe & Coverage */}
          <section id="universe" className="pt-8 border-t border-border/30">
            <SectionHeading
              title="02 / Universe & Coverage"
              subtitle="All active NSE-listed companies across 13 operating sectors"
            />
            <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
              <p>
                DealScope covers all active NSE-listed equities.
                Market capitalization and share prices refresh daily after market close (<strong className="text-foreground font-semibold">{PRICES_AS_OF}</strong>).
                Fundamentals reflect trailing quarterly and annual filings (<strong className="text-foreground font-semibold">{FUNDAMENTALS_AS_OF}</strong>).
              </p>
              <div className="border border-border/30 bg-card/15 p-3 mt-3.5 font-mono text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Note on {datasetMeta.unclassified_count} Unclassified Companies: </span>
                Entities without a verified primary sector remain searchable by ticker, but receive no synthetic score or fake peer valuation.
              </div>
            </div>
          </section>

          {/* 3. Scoring Engine + Formulas */}
          <section id="scoring" className="pt-8 border-t border-border/30">
            <SectionHeading
              title="03 / Scoring Engine"
              subtitle="0 to 100 sector-relative composite score"
            />
            <div className="space-y-2.5 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
              <p>
                Every company is ranked on four fundamental factors against its sector peer distribution.
                Percentiles (0 to 100) are combined into a weighted composite score:
              </p>
            </div>

            {/* Formula Block */}
            <div className="border border-border/40 bg-card/25 p-3.5 sm:p-4 my-3.5 font-mono">
              <div className="text-foreground font-semibold text-sm sm:text-base tracking-wide">
                Composite Score = Σ(wᵢ × Percentileᵢ) / Σ(w_available)
              </div>
              <p className="text-muted-foreground/85 text-[11px] sm:text-xs mt-1">
                Requires minimum 2 populated factors. Weights default to 25% each.
              </p>
            </div>

            {/* 4 Factor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3.5 font-mono">
              <div className="border border-border/30 bg-card/15 p-3">
                <div className="flex justify-between items-baseline text-foreground font-semibold text-xs sm:text-sm mb-0.5">
                  <span>01 / Revenue Growth</span>
                  <span className="text-accent text-[10px]">w = 25%</span>
                </div>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                  YoY sales growth relative to sector peers.
                </p>
              </div>

              <div className="border border-border/30 bg-card/15 p-3">
                <div className="flex justify-between items-baseline text-foreground font-semibold text-xs sm:text-sm mb-0.5">
                  <span>02 / EBITDA Margin</span>
                  <span className="text-accent text-[10px]">w = 25%</span>
                </div>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                  Operating profitability (EBITDA / Revenue).
                </p>
              </div>

              <div className="border border-border/30 bg-card/15 p-3">
                <div className="flex justify-between items-baseline text-foreground font-semibold text-xs sm:text-sm mb-0.5">
                  <span>03 / ROCE</span>
                  <span className="text-accent text-[10px]">w = 25%</span>
                </div>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                  Return on Capital Employed (EBIT / Capital Employed).
                </p>
              </div>

              <div className="border border-border/30 bg-card/15 p-3">
                <div className="flex justify-between items-baseline text-foreground font-semibold text-xs sm:text-sm mb-0.5">
                  <span>04 / Debt Health</span>
                  <span className="text-accent text-[10px]">w = 25%</span>
                </div>
                <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
                  Net Debt / EBITDA (lower debt = higher score). Financial Services exempted.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Valuation Methodology */}
          <section id="valuation" className="pt-8 border-t border-border/30">
            <SectionHeading
              title="04 / Valuation Methodology"
              subtitle="Indicative trading multiple ranges"
            />
            <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
              <p>
                DealScope attaches an indicative valuation range derived from the 25th to 75th percentile
                trading multiples of listed peers in the same sector applied to the company&apos;s earnings:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3.5 font-mono text-xs">
              <div className="border border-border/30 bg-card/20 p-3.5 sm:p-4">
                <div className="text-accent uppercase font-semibold text-xs mb-2">
                  EV / EBITDA Bridge
                </div>
                <div className="space-y-1.5 text-foreground/90 leading-relaxed">
                  <div>• Implied EV = EBITDA × [Sector P25–P75 EV/EBITDA]</div>
                  <div>• Implied Equity = Implied EV − Total Debt + Cash</div>
                  <div className="text-muted-foreground text-[11px] pt-1.5 border-t border-border/20">
                    If Debt &gt; EV, equity value is floored at ₹0 (debt overhang).
                  </div>
                </div>
              </div>

              <div className="border border-border/30 bg-card/20 p-3.5 sm:p-4">
                <div className="text-foreground uppercase font-semibold text-xs mb-2">
                  Trailing P / E Multiple
                </div>
                <div className="space-y-1.5 text-foreground/90 leading-relaxed">
                  <div>• Implied Equity = Net Income × [Sector P25–P75 P/E]</div>
                  <div>• Direct equity value multiple (requires Net Income &gt; 0).</div>
                  <div className="text-muted-foreground text-[11px] pt-1.5 border-t border-border/20">
                    If Net Income ≤ 0, P/E range is shown as unavailable (N/A).
                  </div>
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-muted-foreground leading-relaxed mt-2.5">
              <strong className="text-foreground font-semibold">Precedent Deals:</strong> {datasetMeta.deal_count} historical Indian M&amp;A transactions (2006 to 2025) are provided strictly as deal context and do not alter listed trading multiples.
            </p>
          </section>

          {/* 5. Cap Table & Float */}
          <section id="governance" className="pt-8 border-t border-border/30">
            <SectionHeading
              title="05 / Cap Table & Float"
              subtitle="Promoter holding, encumbrances and public float"
            />
            <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
              <p>
                Ownership structure determines deal feasibility. DealScope reports promoter ownership,
                promoter encumbrances (pledges), and estimated free float directly from regulatory filings.
              </p>
            </div>

            <div className="border border-border/30 bg-card/20 p-4 sm:p-5 my-4 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-2">
                Illustrative Example
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3.5">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Promoter Stake</span>
                  <span className="text-foreground text-lg sm:text-xl font-bold mt-0.5 block">62.4%</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Promoter Pledge</span>
                  <span className="text-foreground text-lg sm:text-xl font-bold mt-0.5 block">0.0%</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Free Float</span>
                  <span className="text-foreground text-lg sm:text-xl font-bold mt-0.5 block">37.6%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-border/40 flex overflow-hidden">
                <div className="bg-accent h-full w-[62.4%]" />
                <div className="bg-foreground/25 h-full w-[37.6%]" />
              </div>
              <div className="mt-3 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Pledge Telemetry:</strong> Over 85% of NSE companies have 0.0% pledge. An amber warning chip appears when pledge exceeds 10.0%.
              </div>
            </div>
          </section>

          {/* 6. Disclaimer */}
          <section id="disclaimer" className="pt-8 border-t border-border/30">
            <SectionHeading title="06 / Disclaimer" />
            <div className="space-y-2.5 font-sans text-xs sm:text-sm text-muted-foreground/85 leading-relaxed text-pretty">
              <p>
                DealScope is an independent quantitative screening tool. It is not SEBI-registered investment advice,
                not a recommendation to buy or sell securities, and not an M&amp;A advisory fairness opinion.
                All calculations are automated from public filings. Always verify numbers independently.
              </p>
            </div>
          </section>

          {/* Simple Close: Built by Ram · LinkedIn · Email */}
          <div className="pt-8 pb-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="text-muted-foreground">
              Built by <span className="text-foreground font-semibold">Ram</span> · Listed India comps
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 uppercase text-xs font-medium"
              >
                <Linkedin className="w-3.5 h-3.5 text-accent" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
              </a>
              <span className="text-border">·</span>
              <a
                href="mailto:ramsuthakaran.vp@gmail.com"
                className="text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 uppercase text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>Email</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
