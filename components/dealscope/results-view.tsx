"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ScoreRing } from "@/components/dealscope/score-ring"
import { SectorIndustryFilter } from "@/components/dealscope/sector-industry-filter"
import { ScreenBar } from "@/components/dealscope/screen-bar"
import { ExampleScreens } from "@/components/dealscope/example-screens"
import { OwnershipBadge } from "@/components/dealscope/ownership-badges"
import {
  type ScreenFilters,
  type FilterChip,
  passReasons,
} from "@/lib/screener"
import { type ExampleScreen } from "@/lib/example-screens"
import { cn } from "@/lib/utils"
import {
  type Company,
  type Sector,
  type Weights,
  type BucketFilters,
  type IndustryGroup,
  computeScore,
  countActiveBucketFilters,
} from "@/lib/dealscope-data"
import { buildCompsCsv, compsCsvFilename, downloadCompsCsv } from "@/lib/export-comps-csv"

interface ResultsViewProps {
  results: Company[]
  query: string
  onQueryChange: (q: string) => void
  /** Commit the typed query (Enter). Without this the refine box updated the
   *  list as you typed but pressing Enter did nothing and the URL never
   *  captured the query, so refreshing or sharing lost it. */
  onSubmitQuery: () => void
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  weights: Weights
  filters: BucketFilters
  onFiltersChange: (filters: BucketFilters) => void
  industryGroups: IndustryGroup[]
  unclassifiedCount: number
  screen: ScreenFilters
  matchCount: number
  totalCount: number
  onRemoveChip: (chip: FilterChip) => void
  onClearAll: () => void
  recognised: boolean
  screens: { screen: ExampleScreen; count: number }[]
  onApplyScreen: (screen: ExampleScreen) => void
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
  onSubmitQuery,
  selectedSectors,
  onToggleSector,
  weights,
  filters,
  onFiltersChange,
  industryGroups,
  unclassifiedCount,
  screen,
  matchCount,
  totalCount,
  onRemoveChip,
  onClearAll,
  recognised,
  screens,
  onApplyScreen,
  onSelectCompany,
  onOpenWeights,
  onOpenFilters,
  onBack,
  sectors,
}: ResultsViewProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleResults = showAll ? results : results.slice(0, RENDER_CAP)
  const activeFilters = countActiveBucketFilters(filters)

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

  const handleExportCsv = () => {
    if (results.length === 0) return
    const csv = buildCompsCsv(results, weights)
    const filename = compsCsvFilename({
      resultCount: results.length,
      universeCount: totalCount,
      query,
      sectors: selectedSectors,
    })
    downloadCompsCsv(filename, csv)
  }

  return (
    <section className="relative min-h-screen pl-6 md:pl-28 pr-6 md:pr-12 py-16 md:py-24">
      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          RESULTS
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          {/* Eyebrow label doubles as the back control (onClick={onBack}
              unchanged) -- restyled to match the SectionLabel pattern used
              elsewhere on the site (e.g. "01 / What This Does") instead of
              the old muted "← Entry State" back-link treatment. */}
          <button
            onClick={onBack}
            className="font-mono text-xs uppercase tracking-[0.3em] text-accent hover:text-foreground transition-colors duration-200"
          >
            Entry State / Screened Set
          </button>
          <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl md:text-7xl tracking-tight text-balance">
            {results.length.toLocaleString("en-IN")}{" "}
            {results.length === 1 ? "company matches" : "companies match"}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            ranked by composite score · missing factors shown as — · unclassified names are not scored
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          <button
            onClick={onOpenFilters}
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Filters" as="span" duration={0.5} />
            {activeFilters > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground font-mono text-xs leading-none">
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

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={results.length === 0}
            aria-label="Export current screened companies as CSV"
            className="group inline-flex min-h-11 items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
          >
            <ScrambleTextOnHover text="Export Comps (CSV)" as="span" duration={0.5} />
          </button>
        </div>
      </div>

      {/* Screening bar: natural-language query, active-filter chips, live count */}
      <div className="mb-8 max-w-3xl">
        <ScreenBar
          query={query}
          onQueryChange={onQueryChange}
          onSubmit={onSubmitQuery}
          filters={screen}
          onRemoveChip={onRemoveChip}
          onClearAll={onClearAll}
          matchCount={matchCount}
          totalCount={totalCount}
          recognised={recognised}
          size="sm"
          placeholder="Refine — name, ticker, or a screen like “roce over 20 low debt”"
        />
      </div>

      {/* Example screens, compact on this view */}
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Example Screens
        </span>
        <div className="mt-3">
          <ExampleScreens screens={screens} onApply={onApplyScreen} variant="pills" />
        </div>
      </div>

      {/* Sector + industry filter -- both levels visible together, no click
          on a sector pill required to see what industries exist under it. */}
      <div className="mb-12">
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

      {/* Results list */}
      {results.length === 0 ? (
        <div className="border border-border/40 p-16 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            No companies match every condition
          </p>
          <p className="mt-3 mx-auto max-w-sm font-mono text-[11px] leading-relaxed text-muted-foreground">
            Conditions combine with AND, so each one narrows the set further. Remove a chip above to
            widen the screen, or clear it and start again.
          </p>
          {/* Previously this offered "Loosen range filters (N)" and only when a
              BUCKET filter was set -- so a natural-language query that returned
              nothing gave the user an empty page with no action at all, which
              is the most common way to hit zero results now. Clear-all is
              always offered whenever anything is active, from either surface. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-2 border border-accent/60 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/10 transition-all duration-200"
            >
              Clear all conditions
            </button>
            {activeFilters > 0 && (
              <button
                onClick={onOpenFilters}
                className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
              >
                Adjust filters ({activeFilters})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {visibleResults.map((company, index) => (
            <ResultRow
              key={company.ticker}
              company={company}
              index={index}
              weights={weights}
              reasons={passReasons(company, screen)}
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
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
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
  reasons,
  onSelect,
}: {
  company: Company
  index: number
  weights: Weights
  reasons: ReturnType<typeof passReasons>
  onSelect: () => void
}) {
  const score = computeScore(company.factors, weights)

  return (
    <motion.article
      // Opacity only, no y-drift, no stagger past the first few rows. A y
      // translate on 60 rows forces layout work every frame; a staggered
      // entrance on every re-screen made successive searches feel laggy.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, 6) * 0.015, duration: 0.15, ease: "easeOut" }}
    >
      <button
        onClick={onSelect}
        className="group w-full text-left border-t border-border/40 last:border-b hover:bg-accent/5 transition-colors duration-300 py-6 px-2 md:px-4 flex items-center gap-4 md:gap-8"
      >
        {/* Index */}
        <span className="hidden md:block font-mono text-xs text-muted-foreground w-8 shrink-0">
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
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {company.ticker}
            </span>
            <OwnershipBadge
              holding={company.raw.promoterHolding}
              pledge={company.raw.promoterPledge}
              className="self-center"
            />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
            {company.sector}
          </span>

          {/* Why this company passed -- one chip per active constraint it
              satisfied. Derived only from constraints that are actually
              applied, so a chip is always a true statement about why this row
              is in this list, never a generic compliment. */}
          {reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <span
                  key={r.label}
                  className={cn(
                    "inline-flex items-center border px-2 py-1 font-mono text-xs uppercase tracking-wider",
                    r.tone === "good"
                      ? "border-accent/40 text-accent/90"
                      : "border-border/60 text-muted-foreground",
                  )}
                >
                  {r.label}
                </span>
              ))}
            </div>
          )}

          {/* Phone/tablet: metrics sat behind `hidden lg:grid` so a 768px
              row was name + ring only. Keep the desktop 4-up, and show the
              same four figures under the name below lg. */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 lg:hidden">
            <Metric label="Revenue" value={company.metrics.revenue} />
            <Metric label="Margin" value={company.metrics.ebitdaMargin} />
            <Metric label="ROCE" value={company.metrics.roce} />
            <Metric label="Debt" value={company.metrics.totalDebt} />
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden lg:grid grid-cols-4 gap-8 shrink-0">
          <Metric label="Revenue" value={company.metrics.revenue} />
          <Metric label="Margin" value={company.metrics.ebitdaMargin} />
          <Metric label="ROCE" value={company.metrics.roce} />
          <Metric label="Debt" value={company.metrics.totalDebt} />
        </div>

        {/* Chevron */}
        <BitmapChevron className="shrink-0 text-muted-foreground group-hover:text-accent transition-all duration-[400ms] group-hover:rotate-45" />
      </button>
    </motion.article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 lg:w-24">
      <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="block mt-1 font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}
