"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { SectorIndustryFilter } from "@/components/dealscope/sector-industry-filter"
import type { Sector, ExampleScenario, IndustryGroup, BucketFilters } from "@/lib/dealscope-data"

interface TopScored {
  name: string
  score: number
}

interface LandingViewProps {
  query: string
  onQueryChange: (q: string) => void
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  onRun: () => void
  onOpenFilters: () => void
  activeFilterCount: number
  matchingCount: number
  scenarios: { scenario: ExampleScenario; count: number }[]
  onApplyScenario: (scenario: ExampleScenario) => void
  sectors: Sector[]
  topScored: TopScored | null
  industryGroups: IndustryGroup[]
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
  scenarios,
  onApplyScenario,
  sectors,
  topScored,
  industryGroups,
  filters,
  onFiltersChange,
}: LandingViewProps) {
  const toggleIndustry = (name: string) => {
    const next = filters.industry.includes(name)
      ? filters.industry.filter((i) => i !== name)
      : [...filters.industry, name]
    onFiltersChange({ ...filters, industry: next })
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      onRun()
    }
  }

  return (
    <>
    <section className="relative min-h-screen flex flex-col justify-center pl-6 md:pl-28 pr-6 md:pr-12 py-24">
      <AnimatedNoise opacity={0.03} />

      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          SCREEN
        </span>
      </div>

      <div className="flex-1 w-full max-w-6xl flex flex-col justify-center">
        <SplitFlapAudioProvider>
          <div className="relative">
            <SplitFlapText text="DEALSCOPE" speed={80} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[family-name:var(--font-bebas)] text-muted-foreground text-[clamp(1rem,3vw,2rem)] mt-4 tracking-wide">
          Screens India&apos;s listed companies for acquisition fit.
        </h2>

        {/* Live proof strip -- reads straight off the bundled dataset (same
            source as the rest of the page) rather than being hardcoded, so it
            can never drift out of sync with the actual data. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          {topScored && (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Top Scored Today
              </span>
              <span className="font-mono text-xs text-foreground">
                {topScored.name} — {topScored.score}/100
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Sectors
            </span>
            <span className="font-mono text-xs text-foreground">{sectors.length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Updated
            </span>
            <span className="font-mono text-xs text-foreground">Daily</span>
          </div>
        </motion.div>

        <p className="mt-8 max-w-lg font-mono text-sm text-muted-foreground leading-relaxed">
          DealScope screens the NSE-listed universe for acquisition attractiveness, scoring each
          company on sector-relative fundamentals and attaching an indicative valuation range. Adjust
          the factor weights, filter the universe, and open any name for a full tear sheet. Free and
          public — no account, no paywall.
        </p>

        {/* Search + Run */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="mt-12 flex flex-col sm:flex-row items-stretch gap-0 max-w-2xl"
        >
          <div className="relative flex-1 border border-foreground/20 focus-within:border-accent transition-colors duration-200">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 pointer-events-none hidden sm:block">
              Q_
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Company, ticker, or plain-language query"
              aria-label="Search companies"
              className="w-full bg-transparent px-4 sm:pl-12 py-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          <button
            onClick={onRun}
            className="group inline-flex items-center justify-center gap-3 border border-foreground/20 sm:border-l-0 px-8 py-4 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Run" as="span" duration={0.4} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </button>
        </motion.div>

        {/* Screen Companies -- filters as a primary, first-class entry point.
            Previously the filter panel was only reachable from the results
            view, i.e. only after you'd already searched; screening the universe
            by real financials is the product's main feature, so it gets its own
            call to action right beside the search bar, with a live match count
            so the effect of a filter is visible before committing to results. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
          className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl"
        >
          <button
            onClick={onOpenFilters}
            className="group inline-flex items-center gap-3 border border-accent/60 bg-accent/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/10 hover:border-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Screen Companies" as="span" duration={0.5} />
            {activeFilterCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground font-mono text-[10px] leading-none">
                {activeFilterCount}
              </span>
            ) : (
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            )}
          </button>

          {activeFilterCount > 0 ? (
            <button
              onClick={onRun}
              className="group inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              <span className="text-foreground">{matchingCount.toLocaleString("en-IN")}</span>
              <span>match — view results</span>
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </button>
          ) : (
            <span className="font-mono text-xs text-muted-foreground leading-relaxed">
              Filter the NSE-listed universe by market cap, valuation, growth, quality and risk — no
              search required.
            </span>
          )}
        </motion.div>

        {/* Sector filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
          className="mt-16"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Filter by Sector</span>
          <div className="mt-6">
            <SectorIndustryFilter
              sectors={sectors}
              selectedSectors={selectedSectors}
              onToggleSector={onToggleSector}
              industryGroups={industryGroups}
              selectedIndustries={filters.industry}
              onToggleIndustry={toggleIndustry}
              onClearIndustries={() => onFiltersChange({ ...filters, industry: [] })}
            />
          </div>
        </motion.div>
      </div>

      {/* Footer data line */}
      <div className="absolute bottom-8 left-6 md:left-28 right-6 md:right-12 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          Screening the NSE-listed universe
        </span>
        <div className="hidden md:block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Not investment advice. Built by RAM —{" "}
          <Link href="/about" className="text-foreground hover:text-accent transition-colors duration-200">
            About
          </Link>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* What this is                                                     */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionLabel index="01" label="What This Does" />
          <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-6xl tracking-tight text-balance">
            WHAT THIS DOES
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/85 text-pretty">
          <RevealItem>
            <p>
              DealScope scores every company on the NSE against its own sector — revenue growth,
              margins, capital efficiency, debt — so a logistics company is compared to other logistics
              companies, not to a bank. A score of 80 means the same thing everywhere: top of its
              actual peer group, not flattered by sitting in a high-margin industry.
            </p>
          </RevealItem>
          <RevealItem delay={0.08}>
            <p className="text-muted-foreground">
              Open any company and you get a full tear sheet — real financials, the scoring breakdown,
              comparable deals that actually happened, and an estimated valuation range built off
              precedent transactions in that sector.
            </p>
          </RevealItem>
          <RevealItem delay={0.16}>
            <p className="text-muted-foreground">Set your own filters, or start from one of the screens below.</p>
          </RevealItem>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* How it works -- the default screener, documented                 */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionLabel index="02" label="How It Works" />
          <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-5xl tracking-tight text-balance">
            THE DEFAULT SCREEN
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-base md:text-lg leading-relaxed text-foreground/85 text-pretty">
          <p>
            Before you touch a single control, every company is scored on four sector-relative
            factors — Revenue Growth, EBITDA Margin, ROCE, and Debt Level. Each factor is ranked
            0–100 against the company&apos;s own sector peers, and the four combine, equally weighted,
            into the composite score shown on every tear sheet.
          </p>
          <p className="text-muted-foreground">
            That equal-weight, sector-relative composite is the default ranking of the entire
            NSE-listed universe. From there you re-weight the factors to reflect your own thesis, or
            apply min/max range filters to cut the universe down — the ranking recomputes as you go.
          </p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/40 border border-border/40">
            {["Revenue Growth", "EBITDA Margin", "ROCE", "Debt Level"].map((f, i) => (
              <div key={f} className="bg-background p-5 flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                  Factor 0{i + 1}
                </span>
                <span className="font-mono text-xs text-foreground leading-relaxed">{f}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70">
                  0–100 · equal weight
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* Example scenarios -- each sets a sector + real range filters and  */}
    {/* runs live, showing the actual filtered count.                     */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <SectionLabel index="03" label="Example Scenarios" />
      <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-5xl tracking-tight max-w-2xl text-balance">
        START FROM A SCREEN
      </h2>
      <p className="mt-6 max-w-lg font-mono text-xs text-muted-foreground leading-relaxed">
        Each screen pins a sector and applies real constraints on the scored factors, then runs. The
        count you see is live — it&apos;s exactly what the results page returns.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40 border border-border/40">
        {scenarios.map(({ scenario, count }, i) => (
          <RevealItem key={scenario.id} delay={i * 0.08}>
            <button
              onClick={() => onApplyScenario(scenario)}
              className="group bg-background h-full w-full text-left p-8 flex flex-col gap-5 hover:bg-accent/5 transition-colors duration-300"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-[family-name:var(--font-bebas)] text-3xl md:text-4xl tracking-tight leading-none text-accent">
                  {count}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  {count === 1 ? "match" : "matches"}
                </span>
              </div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground leading-relaxed">
                {scenario.label}
              </h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed flex-1">
                {scenario.description}
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors duration-200">
                Run scenario
                <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
              </span>
            </button>
          </RevealItem>
        ))}
      </div>

      {/* Closing action */}
      <div className="mt-24 pt-8 border-t border-border/40 flex items-center justify-end">
        <button
          onClick={onRun}
          className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
        >
          <ScrambleTextOnHover text="Screen All" as="span" duration={0.4} />
          <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
        </button>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* Why sector-relative                                              */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionLabel index="04" label="Why It Matters" />
          <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-6xl tracking-tight text-balance">
            WHY SECTOR-RELATIVE
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/85 text-pretty">
          <RevealItem>
            <p className="text-muted-foreground">
              Most screeners rank companies on raw numbers. That flatters large caps and buries
              anything cyclical or capital-intensive. DealScope ranks within sector instead, so the
              comparison is always apples to apples.
            </p>
          </RevealItem>
        </div>
      </div>
    </section>
    </>
  )
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
      {index} / {label}
    </span>
  )
}

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
