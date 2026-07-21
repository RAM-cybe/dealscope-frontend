"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ScoreRing } from "@/components/dealscope/score-ring"
import {
  type Company,
  type Sector,
  type Weights,
  type BucketFilters,
  type IndustryOption,
  computeScore,
  countActiveBucketFilters,
} from "@/lib/dealscope-data"
import { cn } from "@/lib/utils"

interface ResultsViewProps {
  results: Company[]
  query: string
  onQueryChange: (q: string) => void
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  weights: Weights
  filters: BucketFilters
  onFiltersChange: (filters: BucketFilters) => void
  industries: IndustryOption[]
  showNumericHint: boolean
  onSelectCompany: (company: Company) => void
  onOpenWeights: () => void
  onOpenFilters: () => void
  onBack: () => void
  sectors: Sector[]
}

const RENDER_CAP = 60

export function ResultsView({
  results,
  query,
  onQueryChange,
  selectedSectors,
  onToggleSector,
  weights,
  filters,
  onFiltersChange,
  industries,
  showNumericHint,
  onSelectCompany,
  onOpenWeights,
  onOpenFilters,
  onBack,
  sectors,
}: ResultsViewProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleResults = showAll ? results : results.slice(0, RENDER_CAP)
  const activeFilters = countActiveBucketFilters(filters)

  // The granular industry drill-down only makes sense once the sector chips
  // above have narrowed things to exactly one sector -- with none selected
  // it'd be all 123 industries at once (the Filters panel's typeahead
  // already covers that case), and with 2+ selected there's no single
  // unambiguous set to drill into.
  const showIndustryDrilldown = selectedSectors.length === 1
  const toggleIndustry = (name: string) => {
    const next = filters.industry.includes(name)
      ? filters.industry.filter((i) => i !== name)
      : [...filters.industry, name]
    onFiltersChange({ ...filters, industry: next })
  }

  useEffect(() => {
    setShowAll(false)
  }, [results])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.currentTarget.blur()
    }
  }

  return (
    <section className="relative min-h-screen pl-6 md:pl-28 pr-6 md:pr-12 py-16 md:py-24">
      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          RESULTS
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button
            onClick={onBack}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            ← Entry State
          </button>
          <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
            SCREENED SET
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "study" : "studies"} • ranked by composite score
          </p>
          {showNumericHint && (
            <p className="mt-3 max-w-md font-mono text-[11px] leading-relaxed text-muted-foreground/80">
              <span className="text-accent">Try Filters for numeric constraints</span> — free text
              searches name, ticker, and sector only.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={onOpenFilters}
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Filters" as="span" duration={0.5} />
            {activeFilters > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground font-mono text-[10px] leading-none">
                {activeFilters}
              </span>
            ) : (
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            )}
          </button>

          <button
            onClick={onOpenWeights}
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Adjust Weights" as="span" duration={0.5} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </button>
        </div>
      </div>

      {/* Search refine */}
      <div className="mb-8 max-w-xl">
        <div className="relative border border-border focus-within:border-accent transition-colors duration-200">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 pointer-events-none">
            Q_
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Refine query"
            aria-label="Refine search"
            className="w-full bg-transparent pl-12 pr-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Sector chips */}
      <div className={cn("flex flex-wrap gap-2", showIndustryDrilldown ? "mb-4" : "mb-12")}>
        {sectors.map((sector) => {
          const active = selectedSectors.includes(sector.name)
          return (
            <button
              key={sector.name}
              onClick={() => onToggleSector(sector.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {sector.name}
              <span className={cn("text-[9px]", active ? "text-accent/70" : "text-muted-foreground/70")}>
                {sector.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Industry drill-down -- granular (123-value) taxonomy within the one
          selected sector, second-level to the broad sector chips above.
          Indented + left-bordered to read as nested under the active sector
          rather than a second, unrelated chip row. */}
      {showIndustryDrilldown && (
        <div className="mb-12 border-l border-border/40 pl-4">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/70">
              Industry within {selectedSectors[0]}
            </span>
            {filters.industry.length > 0 && (
              <button
                onClick={() => onFiltersChange({ ...filters, industry: [] })}
                className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                Clear ({filters.industry.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.map((ind) => {
              const active = filters.industry.includes(ind.name)
              return (
                <button
                  key={ind.name}
                  onClick={() => toggleIndustry(ind.name)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-baseline gap-1.5 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-all duration-200",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border/50 text-muted-foreground/80 hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {ind.name}
                  <span className={cn("text-[8px]", active ? "text-accent/70" : "text-muted-foreground/60")}>
                    {ind.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Results list */}
      {results.length === 0 ? (
        <div className="border border-border/40 p-16 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            No studies match the current constraints
          </p>
          {activeFilters > 0 && (
            <button
              onClick={onOpenFilters}
              className="mt-6 inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              Loosen range filters ({activeFilters})
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {visibleResults.map((company, index) => (
            <ResultRow
              key={company.ticker}
              company={company}
              index={index}
              weights={weights}
              onSelect={() => onSelectCompany(company)}
            />
          ))}
        </div>
      )}

      {!showAll && results.length > RENDER_CAP && (
        <div className="mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="border border-border px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            Show all {results.length} results
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 flex items-center justify-end">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {showAll ? "Full universe shown" : `Showing top ${Math.min(RENDER_CAP, results.length)} of ${results.length}`}
        </span>
      </div>
    </section>
  )
}

function ResultRow({
  company,
  index,
  weights,
  onSelect,
}: {
  company: Company
  index: number
  weights: Weights
  onSelect: () => void
}) {
  const score = computeScore(company.factors, weights)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      // Cap the stagger so a 60-row set settles fast instead of trickling in
      // over ~3.5s, and drop the `layout` prop: with `layout`, every weight or
      // filter change re-sorted the list and animated all rows to new
      // positions at once -- the biggest scroll/interaction jank source here.
      transition={{ delay: Math.min(index, 12) * 0.035, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <button
        onClick={onSelect}
        className="group w-full text-left border-t border-border/40 last:border-b hover:bg-accent/5 transition-colors duration-300 py-6 px-2 md:px-4 flex items-center gap-4 md:gap-8"
      >
        {/* Index */}
        <span className="hidden md:block font-mono text-[10px] text-muted-foreground/70 w-8 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Score ring */}
        <ScoreRing score={score} size={56} strokeWidth={2} className="shrink-0" />

        {/* Name + sector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl md:text-3xl tracking-tight group-hover:text-accent transition-colors duration-300 text-pretty">
              {company.name}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {company.ticker}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {company.sector}
          </span>
        </div>

        {/* Metrics */}
        <div className="hidden lg:grid grid-cols-4 gap-8 shrink-0">
          <Metric label="Revenue" value={company.metrics.revenue} />
          <Metric label="Margin" value={company.metrics.ebitdaMargin} />
          <Metric label="ROCE" value={company.metrics.roce} />
          <Metric label="Debt" value={company.metrics.totalDebt} />
        </div>

        {/* Chevron */}
        <BitmapChevron className="shrink-0 text-muted-foreground/70 group-hover:text-accent transition-all duration-[400ms] group-hover:rotate-45" />
      </button>
    </motion.article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-24">
      <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</span>
      <span className="block mt-1 font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}
