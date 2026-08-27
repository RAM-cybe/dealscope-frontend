"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { SlidersHorizontal, ArrowRight, Sparkles } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { SectorIndustryFilter } from "@/components/dealscope/sector-industry-filter"
import type { Sector, IndustryGroup, BucketFilters } from "@/lib/dealscope-data"
import { ScreenBar } from "@/components/dealscope/screen-bar"
import { ExampleScreens } from "@/components/dealscope/example-screens"
import type { ScreenFilters, FilterChip } from "@/lib/screener"
import type { ExampleScreen } from "@/lib/example-screens"
import { cn } from "@/lib/utils"

interface LandingViewProps {
  query: string
  onQueryChange: (q: string) => void
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  onRun: () => void
  onOpenFilters: () => void
  activeFilterCount: number
  matchingCount: number
  totalCount: number
  screen: ScreenFilters
  onRemoveChip: (chip: FilterChip) => void
  onClearAll: () => void
  recognised: boolean
  screens: { screen: ExampleScreen; count: number }[]
  onApplyScreen: (screen: ExampleScreen) => void
  sectors: Sector[]
  dealCount: number
  industryGroups: IndustryGroup[]
  unclassifiedCount: number
  filters: BucketFilters
  onFiltersChange: (filters: BucketFilters) => void
}

export function LandingView({
  query,
  onQueryChange,
  selectedSectors,
  onToggleSector,
  onRun,
  onOpenFilters,
  activeFilterCount,
  matchingCount,
  totalCount,
  screen,
  onRemoveChip,
  onClearAll,
  recognised,
  screens,
  onApplyScreen,
  sectors,
  dealCount,
  industryGroups,
  unclassifiedCount,
  filters,
  onFiltersChange,
}: LandingViewProps) {
  const toggleIndustry = (name: string) => {
    const next = filters.industry.includes(name)
      ? filters.industry.filter((i) => i !== name)
      : [...filters.industry, name]
    onFiltersChange({ ...filters, industry: next })
  }

  const hasActiveFilters =
    activeFilterCount > 0 ||
    selectedSectors.length > 0 ||
    filters.industry.length > 0 ||
    matchingCount !== totalCount

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* HERO SECTION: Above-The-Fold Compact Command Center             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 pt-8 pb-12 md:pt-12 md:pb-16 border-b border-border/40">
        <AnimatedNoise opacity={0.02} />

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-1 mb-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_6px_var(--accent)]" />
            FREE LISTED-INDIA COMPS &amp; M&amp;A SCREENER
          </motion.div>

          {/* Wordmark */}
          <h1 className="font-[family-name:var(--font-bebas)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-foreground select-none leading-none">
            DEALSCOPE
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 font-sans text-sm sm:text-base md:text-lg text-foreground/90 font-medium tracking-tight max-w-2xl text-balance">
            Every NSE-listed company, scored within its sector the way a deal team screens targets.
          </p>

          {/* Search Omnibar */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mt-6 w-full max-w-2xl text-left"
          >
            <ScreenBar
              query={query}
              onQueryChange={onQueryChange}
              onSubmit={onRun}
              filters={screen}
              onRemoveChip={onRemoveChip}
              onClearAll={onClearAll}
              matchCount={matchingCount}
              totalCount={totalCount}
              recognised={recognised}
              placeholder="Search 2,381 NSE companies or thesis (e.g. &quot;TATA MOTORS&quot;, &quot;high margin pharma&quot;, &quot;low debt mid cap&quot;)..."
              trailing={
                <button
                  type="button"
                  onClick={onRun}
                  className="group inline-flex h-full w-full sm:w-auto items-center justify-center gap-2 px-7 font-mono text-xs uppercase tracking-widest leading-none bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors duration-200 cursor-pointer"
                >
                  <span>Screen ↵</span>
                  <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
                </button>
              }
            />
          </motion.div>

          {/* Direct Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl">
            <button
              onClick={onOpenFilters}
              className="group inline-flex items-center justify-center gap-2.5 border border-border/80 bg-card/60 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Quantitative Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground font-mono text-[10px] leading-none font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasActiveFilters ? (
              <button
                onClick={onRun}
                className="group inline-flex items-center justify-center gap-2 border border-accent bg-accent text-accent-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold hover:bg-accent/90 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <span>View {matchingCount.toLocaleString("en-IN")} Matching Targets</span>
                <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
              </button>
            ) : (
              <button
                onClick={onRun}
                className="group inline-flex items-center justify-center gap-2 border border-border/60 bg-card/30 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 cursor-pointer"
              >
                <span>View All {totalCount.toLocaleString("en-IN")} Equities</span>
                <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
              </button>
            )}
          </div>

          {/* Quick Multi-Select Sector Pills */}
          <div className="mt-5 w-full max-w-3xl pt-4 border-t border-border/40">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Filter by Sector:
              </span>
              {selectedSectors.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline cursor-pointer"
                >
                  Clear ({selectedSectors.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {sectors.map((sector) => {
                const active = selectedSectors.includes(sector.name)
                return (
                  <button
                    key={sector.name}
                    onClick={() => onToggleSector(sector.name)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-baseline gap-1.5 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                      active
                        ? "border-accent bg-accent text-accent-foreground font-bold shadow-xs"
                        : "border-border/60 bg-card/30 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <span>{sector.name}</span>
                    <span className={cn("text-[10px]", active ? "text-accent-foreground/80 font-normal" : "text-muted-foreground/70")}>
                      {sector.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live Telemetry Ribbon */}
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
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 01: Core Methodology — Why Sector-Relative Ranking        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-4 sm:px-6 md:px-12 py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="01" label="Sector Normalization" />
            <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
              WHY SECTOR-RELATIVE SCORING MATTERS
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Empirical Percentile Distributions vs Raw Cross-Sector Screening
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5 font-sans text-base sm:text-lg leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                Standard financial screeners rank companies on raw absolute figures. That systematically distorts results: it overweights capital-light software businesses with 35% margins while hiding world-class logistics, manufacturing, or EPC companies operating efficiently at 14% margins.
              </p>
            </RevealItem>
            <RevealItem delay={0.06}>
              <p className="text-muted-foreground">
                DealScope evaluates each company strictly against its direct sector cohort. A factor score of <strong className="text-foreground font-mono">85</strong> means the business sits in the 85th percentile of its actual operational competitors. Performance is measured against sector reality, never inflated by structural industry tailwinds or penalized by asset intensity.
              </p>
            </RevealItem>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 02: The 4-Factor Scoring Engine Architecture             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-4 sm:px-6 md:px-12 py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="02" label="Scoring Architecture" />
            <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
              THE 4-FACTOR OPERATING ENGINE
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              0 to 100 Empirical Sector Percentile Distribution
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <p className="font-sans text-base sm:text-lg leading-relaxed text-foreground/90">
              Before adjusting any sliders, every company is assigned four sector-relative percentile factor scores. Factors combine under an equal default weighting (25% each) into a single composite score. If a metric is missing, it is dropped and the remaining factors are dynamically reweighted, never penalized as zero.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Revenue Growth", factor: "01", desc: "Top-line growth trajectory benchmarked against sector median expansion." },
                { title: "EBITDA Margin", factor: "02", desc: "Operating profitability and cost discipline relative to sector peer distributions." },
                { title: "ROCE (Return on Capital)", factor: "03", desc: "Operating profit generated per rupee of capital employed, isolating capital efficiency." },
                { title: "Debt Health (Inverted Leverage)", factor: "04", desc: "Balance sheet safety via Net Debt to EBITDA. Lower leverage scores higher. Financial Services excluded." },
              ].map((f) => (
                <div key={f.title} className="border border-border/60 bg-card/40 p-4 flex flex-col gap-1.5 transition-colors hover:border-accent/50">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-accent font-semibold">{f.title}</span>
                    <span className="text-muted-foreground/60 text-[10px]">FACTOR {f.factor}</span>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 03: Curated Screening Strategies                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-4 sm:px-6 md:px-12 py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="03" label="Preset Screens" />
          <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-foreground">
            COMMON DEAL THESES
          </h2>
          <p className="mt-3 max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
            Click any strategy below to execute a live natural-language screen across the entire 2,381 NSE-listed universe.
          </p>

          <div className="mt-8">
            <ExampleScreens screens={screens} onApply={onApplyScreen} variant="cards" />
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
            <span className="font-mono text-xs text-muted-foreground">
              Click any playbook to execute instantly, or build custom criteria above
            </span>
            <button
              onClick={onRun}
              className="inline-flex items-center gap-2 border border-border/80 bg-card/80 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer"
            >
              <span>View Full Universe ({totalCount.toLocaleString("en-IN")})</span>
              <BitmapChevron className="transition-transform duration-[300ms] group-hover:rotate-45" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 04: Taxonomy & Industry Explorer                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-4 sm:px-6 md:px-12 py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="04" label="Taxonomy & Coverage" />
          <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-foreground">
            13 SECTORS · 124 INDUSTRY GROUPS
          </h2>
          <p className="mt-3 max-w-2xl font-sans text-sm text-muted-foreground leading-relaxed">
            Broad single-bucket screening fails when comparing port operators to packaging mills. DealScope classifies every company into 13 calibrated sector cohorts and 124 underlying industry groups.
          </p>

          <div className="mt-8 border border-border/60 bg-card/20 p-6 md:p-8">
            <SectorIndustryFilter
              sectors={sectors}
              selectedSectors={selectedSectors}
              onToggleSector={onToggleSector}
              industryGroups={industryGroups}
              unclassifiedCount={unclassifiedCount}
              selectedIndustries={filters.industry}
              onToggleIndustry={toggleIndustry}
              onClearIndustries={() => onFiltersChange({ ...filters, industry: [] })}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION 05: Institutional M&A Comps Database                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-4 sm:px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="05" label="Transaction Benchmarks" />
            <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-balance text-foreground">
              727 PRECEDENT M&amp;A DEALS
            </h2>
            <p className="mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Historical Indian M&amp;A Multiples (2006 to 2025)
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5 font-sans text-base sm:text-lg leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                Every company tear sheet connects directly to historical transactions in that sector. Compare listed trading multiples against actual deal valuations and control premiums paid in Indian acquisitions. Public trading multiples and precedent transaction comps are kept strictly separate: trading multiples benchmark current public pricing, while historical deals provide transaction context.
              </p>
            </RevealItem>
            <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-muted-foreground border border-border/60 bg-card/30 p-4">
              <div><span className="text-foreground font-semibold">13</span> Sector Taxonomies</div>
              <span className="text-border">•</span>
              <div><span className="text-foreground font-semibold">100%</span> Sourced Disclosures</div>
              <span className="text-border">•</span>
              <div><span className="text-foreground font-semibold">0</span> Imputed Multiples</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
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
    </>
  )
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent font-semibold">
      {index} / {label}
    </span>
  )
}

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(delay, 0.1), duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
