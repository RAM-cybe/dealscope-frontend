"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import type { Sector, ExampleScenario } from "@/lib/dealscope-data"
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
  scenarios: { scenario: ExampleScenario; count: number }[]
  onApplyScenario: (scenario: ExampleScenario) => void
  sectors: Sector[]
  totalCompanies: number
  dataAsOf: string
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
  totalCompanies,
  dataAsOf,
}: LandingViewProps) {
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
          Controlled Studies in M&amp;A Discovery
        </h2>

        <p className="mt-8 max-w-lg font-mono text-sm text-muted-foreground leading-relaxed">
          DealScope screens all {totalCompanies.toLocaleString("en-IN")} NSE-listed companies for
          acquisition attractiveness, scoring each on sector-relative fundamentals and attaching an
          indicative valuation range. Adjust the factor weights, filter the universe, and open any name
          for a full tear sheet. Free and public — no account, no paywall.
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
              <span>of {totalCompanies.toLocaleString("en-IN")} match — view results</span>
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </button>
          ) : (
            <span className="font-mono text-xs text-muted-foreground leading-relaxed">
              Filter all {totalCompanies.toLocaleString("en-IN")} companies by market cap, valuation,
              growth, quality and risk — no search required.
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
          <div className="mt-6 flex flex-wrap gap-2">
            {sectors.map((sector) => {
              const active = selectedSectors.includes(sector.name)
              return (
                <button
                  key={sector.name}
                  onClick={() => onToggleSector(sector.name)}
                  aria-pressed={active}
                  className={cn(
                    "group inline-flex items-baseline gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  <span>{sector.name}</span>
                  <span className={cn("text-[9px]", active ? "text-accent/70" : "text-muted-foreground/70")}>
                    {sector.count}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer data line */}
      <div className="absolute bottom-8 left-6 md:left-28 right-6 md:right-12 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          Data as of {dataAsOf} • {totalCompanies.toLocaleString("en-IN")} Companies
        </span>
        <div className="hidden md:block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          v.01 / Public Instrument
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* What this is                                                     */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionLabel index="01" label="What This Is" />
          <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-6xl tracking-tight text-balance">
            A SCREENING INSTRUMENT
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/85 text-pretty">
          <RevealItem>
            <p>
              DealScope runs across the entire NSE-listed universe and ranks companies on
              sector-relative fundamentals — revenue growth, EBITDA margin, ROCE, and leverage —
              rather than the raw numbers that flatter large caps and punish everything cyclical.
              You set the factor weights; it re-ranks {totalCompanies.toLocaleString("en-IN")}{" "}
              companies instantly.
            </p>
          </RevealItem>
          <RevealItem delay={0.08}>
            <p className="text-muted-foreground">
              For any name it surfaces an indicative valuation range benchmarked off precedent
              M&amp;A in the same sector, and a one-page tear sheet with the factor decomposition,
              comparable deals, and the latest filings behind it. It is the read a corp-dev desk
              starts with before it opens a model — not advice, and not a black box.
            </p>
          </RevealItem>
          <RevealItem delay={0.16}>
            <p className="text-muted-foreground">
              Screening for acquisition targets within financial services might mean constraining the
              universe to companies scoring above the sector median on capital efficiency while keeping
              leverage low — narrowing 220 names to a short, ranked list in seconds, each with a
              transparent factor breakdown, an AI-drafted rationale, and an indicative valuation range
              against recent comparable transactions.
            </p>
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
            That equal-weight, sector-relative composite is the default ranking of all{" "}
            {totalCompanies.toLocaleString("en-IN")} companies. From there you re-weight the factors
            to reflect your own thesis, or apply min/max range filters to cut the universe down — the
            ranking recomputes as you go.
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
    {/* Methodology / data provenance                                    */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionLabel index="03" label="Methodology & Provenance" />
          <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-5xl tracking-tight text-balance">
            SECTOR-RELATIVE, FULLY TRANSPARENT
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-base md:text-lg leading-relaxed text-foreground/85 text-pretty">
          <p>
            Each factor is a percentile rank within a company&apos;s own EY sector bucket, so a 62 in
            Industrials and a 62 in Pharma are read against different peer sets. The composite never
            rewards a company simply for sitting in a structurally high-margin industry.
          </p>
          <p>
            Valuation ranges are anchored to precedent M&amp;A in the same bucket, adjusted for growth
            and leverage differentials. Fundamentals cover {totalCompanies.toLocaleString("en-IN")}{" "}
            NSE-listed companies as of <span className="text-accent">{dataAsOf}</span>, and every score
            on a tear sheet exposes the inputs behind it. None of it is investment advice.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-px bg-border/40 border border-border/40">
            <Stat value={totalCompanies.toLocaleString("en-IN")} label="Companies" />
            <Stat value="4" label="Weighted Factors" />
            <Stat value={dataAsOf} label="Data As Of" />
          </div>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- */}
    {/* Example scenarios -- each sets a sector + real range filters and  */}
    {/* runs live, showing the actual filtered count.                     */}
    {/* ---------------------------------------------------------------- */}
    <section className="relative pl-6 md:pl-28 pr-6 md:pr-12 py-24 border-t border-border/40">
      <SectionLabel index="04" label="Example Scenarios" />
      <h2 className="mt-6 font-[family-name:var(--font-bebas)] text-4xl md:text-5xl tracking-tight max-w-2xl text-balance">
        SCREEN ON REAL CONSTRAINTS
      </h2>
      <p className="mt-6 max-w-lg font-mono text-xs text-muted-foreground leading-relaxed">
        Each scenario pins a sector and applies range filters on the scored factors, then runs. The
        count is live — it is exactly what the results page will return.
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

      {/* Closing data line */}
      <div className="mt-24 pt-8 border-t border-border/40 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          Data as of {dataAsOf}
        </span>
        <button
          onClick={onRun}
          className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
        >
          <ScrambleTextOnHover text="Screen All" as="span" duration={0.4} />
          <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
        </button>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-background p-5">
      <span className="block font-[family-name:var(--font-bebas)] text-2xl md:text-3xl tracking-tight text-foreground leading-none">
        {value}
      </span>
      <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </span>
    </div>
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
