"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
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
    query.trim().length > 0 ||
    matchingCount !== totalCount

  const sectorCount = sectors.length
  const groupCount = industryGroups.length

  return (
    <>
      <section className="relative flex flex-col justify-center items-center px-4 sm:px-6 md:px-10 lg:px-16 pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 border-b border-border/40">
        <AnimatedNoise opacity={0.02} />

        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-1 mb-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_6px_var(--accent)]" />
            FREE LISTED-INDIA COMPS &amp; M&amp;A SCREENER
          </motion.div>

          <h1 className="font-[family-name:var(--font-bebas)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-foreground select-none leading-none">
            DEALSCOPE
          </h1>

          <p className="mt-2.5 sm:mt-3 font-sans text-sm sm:text-base md:text-lg text-foreground/90 font-medium tracking-tight max-w-2xl text-balance px-2">
            Every NSE-listed company, scored within its sector the way a deal team screens targets.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mt-6 w-full max-w-xl text-left"
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
              placeholder="Search company or ticker"
              hideIdleCount
              trailing={
                <button
                  type="button"
                  onClick={onRun}
                  className="group inline-flex h-full w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-7 font-mono text-xs uppercase tracking-widest leading-none bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors duration-200 cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  <span>Screen</span>
                  <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
                </button>
              }
            />
          </motion.div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xl">
            <button
              onClick={onOpenFilters}
              className="group inline-flex items-center justify-center gap-2.5 border border-border/80 bg-card/60 px-4 py-2.5 sm:py-3 font-mono text-xs uppercase tracking-wider text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer min-h-[42px]"
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
                className="group inline-flex items-center justify-center gap-2 border border-accent bg-accent text-accent-foreground px-5 py-2.5 sm:py-3 font-mono text-xs uppercase tracking-wider font-bold hover:bg-accent/90 transition-all duration-200 cursor-pointer shadow-xs min-h-[42px]"
              >
                <span>View {matchingCount.toLocaleString("en-IN")} matching</span>
                <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
              </button>
            ) : (
              <button
                onClick={onRun}
                className="group inline-flex items-center justify-center gap-2 border border-border/60 bg-card/30 px-4 py-2.5 sm:py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 cursor-pointer min-h-[42px]"
              >
                <span>View all listed companies</span>
                <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45" />
              </button>
            )}
          </div>

          <div className="mt-6 w-full pt-4 border-t border-border/40 text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Filter by sector
              </span>
              {selectedSectors.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-accent hover:underline cursor-pointer"
                >
                  Clear ({selectedSectors.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {sectors.map((sector) => {
                const active = selectedSectors.includes(sector.name)
                return (
                  <button
                    key={sector.name}
                    onClick={() => onToggleSector(sector.name)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer min-h-[36px]",
                      active
                        ? "border-accent bg-accent/15 text-accent font-semibold shadow-xs"
                        : "border-border/60 bg-card/30 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <span>{sector.name}</span>
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
                        active ? "text-accent font-bold" : "text-muted-foreground/70",
                      )}
                    >
                      {sector.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 w-full grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs text-muted-foreground">
            <div className="border border-border/30 bg-card/20 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Coverage</span>
              <span className="text-foreground font-semibold font-mono">All NSE equities</span>
            </div>
            <div className="border border-border/30 bg-card/20 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Taxonomy</span>
              <span className="text-foreground font-semibold font-mono">
                {sectorCount} sectors · {groupCount} groups
              </span>
            </div>
            <div className="border border-border/30 bg-card/20 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">M&amp;A set</span>
              <span className="text-accent font-semibold font-mono">
                {dealCount.toLocaleString("en-IN")} deals
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 sm:px-6 md:px-12 py-14 sm:py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="01" label="Sector scoring" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              SCORED AGAINST ITS OWN SECTOR
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Same metric. Different industry. Different meaning.
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 font-sans text-sm sm:text-base leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                A raw all-India rank overweights capital-light software and hides a good manufacturer running at a lower margin. That is a screening error, not a feature.
              </p>
            </RevealItem>
            <RevealItem delay={0.06}>
              <p className="text-muted-foreground">
                A factor score of <strong className="text-foreground font-mono">85</strong> means the company sits in the 85th percentile of its sector cohort. Missing metrics stay missing. They are not scored as zero.
              </p>
            </RevealItem>
          </div>
        </div>
      </section>

      <section className="relative px-4 sm:px-6 md:px-12 py-14 sm:py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="02" label="Four factors" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              FOUR FACTORS. ONE COMPOSITE.
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Sector percentile, 0 to 100
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            <p className="font-sans text-sm sm:text-base leading-relaxed text-foreground/90">
              Each company gets four sector-relative scores. Default weights are equal. If a factor is missing, the rest are reweighted. Banks skip the leverage factor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Revenue growth", factor: "01", desc: "Top-line change versus the sector median, not versus all of India." },
                { title: "EBITDA margin", factor: "02", desc: "Operating profitability against the sector distribution." },
                { title: "ROCE", factor: "03", desc: "Operating profit per rupee of capital employed." },
                { title: "Debt health", factor: "04", desc: "Net debt / EBITDA, inverted. Lower leverage scores higher. Financials excluded." },
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

      <section className="relative px-4 sm:px-6 md:px-12 py-14 sm:py-20 border-b border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="03" label="Preset screens" />
          <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
            READY-MADE SCREENS
          </h2>
          <p className="mt-2 sm:mt-3 max-w-2xl font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Click a thesis to run it across the listed universe. Or type your own screen above.
          </p>

          <div className="mt-6 sm:mt-8">
            <ExampleScreens screens={screens} onApply={onApplyScreen} variant="cards" />
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40 pt-6">
            <span className="font-mono text-xs text-muted-foreground">
              Screens run live. Nothing is cached as a static shortlist.
            </span>
            <button
              onClick={onRun}
              className="inline-flex items-center justify-center gap-2 border border-border/80 bg-card/80 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer min-h-[40px]"
            >
              <span>View all listed companies</span>
              <BitmapChevron className="transition-transform duration-[300ms] group-hover:rotate-45" />
            </button>
          </div>
        </div>
      </section>

      <section className="relative px-4 sm:px-6 md:px-12 py-14 sm:py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="04" label="Taxonomy" />
          <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
            {sectorCount} SECTORS · {groupCount} INDUSTRY GROUPS
          </h2>
          <p className="mt-2 sm:mt-3 max-w-2xl font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Port operators and packaging mills should not share a peer set. Every listed name sits in one sector cohort and one industry group.
          </p>

          <div className="mt-6 sm:mt-8 border border-border/60 bg-card/20 p-4 sm:p-6 md:p-8">
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

      <section className="relative px-4 sm:px-6 md:px-12 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="05" label="Precedent deals" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              {dealCount.toLocaleString("en-IN")} PRECEDENT DEALS
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Indian M&amp;A, 2006 to 2025
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 font-sans text-sm sm:text-base leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                Tear sheets keep listed trading multiples and historical deal comps in separate tables. Trading multiples describe current public pricing. The deal table is context, not a valuation model.
              </p>
            </RevealItem>
            <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs text-muted-foreground border border-border/60 bg-card/30 p-3 sm:p-4">
              <div>
                <span className="text-foreground font-semibold">{sectorCount}</span> sectors
              </div>
              <span className="text-border">·</span>
              <div>
                <span className="text-foreground font-semibold">Public</span> disclosures only
              </div>
              <span className="text-border">·</span>
              <div>
                <span className="text-foreground font-semibold">0</span> imputed multiples
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-6 sm:py-8 px-4 sm:px-6 md:px-12 bg-background font-mono text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <span>DEALSCOPE · Listed India M&amp;A and comps workbench</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/about" className="hover:text-accent transition-colors">
              Methodology
            </Link>
            <span className="text-border">·</span>
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
