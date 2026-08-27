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
  const industryGroupsCount = industryGroups.reduce((acc, g) => acc + g.industries.length, 0)

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

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* HERO SECTION: Phone-First Responsive Command Module              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 py-12 sm:py-16 border-b border-border/40 bg-background">
        <AnimatedNoise opacity={0.02} />

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-1.5 border border-accent/30 bg-accent/5 px-2.5 py-1 mb-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.2em] text-accent max-w-full"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse shadow-[0_0_6px_var(--accent)]" />
            <span className="truncate">FREE LISTED-INDIA COMPS &amp; M&amp;A SCREENER</span>
          </motion.div>

          {/* Wordmark */}
          <h1 className="font-[family-name:var(--font-bebas)] text-5xl sm:text-7xl md:text-8xl tracking-tight text-foreground select-none leading-none">
            DEALSCOPE
          </h1>

          {/* Pitch / Subtitle */}
          <p className="mt-2.5 sm:mt-3 font-sans text-sm sm:text-base md:text-lg text-foreground/90 font-medium tracking-tight max-w-xl text-balance px-2">
            Every NSE-listed company, scored within its sector the way a deal team screens targets.
          </p>

          {/* Search Module (Constrained to max-w-xl to eliminate dead space) */}
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
              hideIdleCount={true}
              trailing={
                <button
                  type="button"
                  onClick={onRun}
                  className="group inline-flex h-full w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-7 font-mono text-xs uppercase tracking-widest leading-none bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors duration-200 cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  <span>Screen ↵</span>
                  <BitmapChevron className="transition-transform duration-300 ease-in-out group-hover:rotate-45" />
                </button>
              }
            />
          </motion.div>

          {/* Action Row: Primary Filter Button + Secondary Universe Trigger */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full max-w-xl">
            <button
              onClick={onOpenFilters}
              className="group inline-flex items-center justify-center gap-2.5 border border-border/80 bg-card/60 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer min-h-[42px]"
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
                className="group inline-flex items-center justify-center gap-1.5 py-2 font-mono text-xs text-foreground hover:text-accent transition-colors duration-150 cursor-pointer"
              >
                <span className="text-accent font-semibold">{matchingCount.toLocaleString("en-IN")}</span>
                <span className="text-muted-foreground">matching targets</span>
                <span className="text-foreground group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            ) : (
              <button
                onClick={onRun}
                className="group inline-flex items-center justify-center gap-1.5 py-2 font-mono text-xs text-muted-foreground/90 hover:text-foreground underline-offset-4 hover:underline transition-colors duration-150 cursor-pointer"
              >
                <span>View all listed companies</span>
                <span className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">→</span>
              </button>
            )}
          </div>

          {/* Quick Multi-Select Sector Pills (Option A: Left-Aligned Wrap in max-w-xl) */}
          <div className="mt-6 w-full max-w-xl pt-4 border-t border-border/40 text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Filter by sector:
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

            <div className="flex flex-wrap justify-start items-center gap-1.5 sm:gap-2">
              {sectors.map((sector) => {
                const active = selectedSectors.includes(sector.name)
                return (
                  <button
                    key={sector.name}
                    onClick={() => onToggleSector(sector.name)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center justify-between gap-1.5 border px-2 sm:px-2.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer min-h-[32px] sm:min-h-[34px] max-w-full",
                      active
                        ? "border-accent bg-accent/15 text-accent font-semibold shadow-xs"
                        : "border-border/60 bg-card/30 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <span className="truncate">{sector.name}</span>
                    <span
                      className={cn(
                        "font-mono text-[8px] sm:text-[9px] tabular-nums px-1 py-px shrink-0",
                        active ? "bg-accent/20 text-accent font-bold" : "text-muted-foreground/70",
                      )}
                    >
                      {sector.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Telemetry Ribbon */}
          <div className="mt-6 sm:mt-8 w-full max-w-xl border-t border-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="uppercase tracking-wider text-muted-foreground/70 text-[9px] sm:text-[10px]">Coverage:</span>
              <span className="text-foreground font-medium">All NSE Equities</span>
            </div>
            <span className="hidden sm:inline text-border">·</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="uppercase tracking-wider text-muted-foreground/70 text-[9px] sm:text-[10px]">Taxonomy:</span>
              <span className="text-foreground font-medium">{sectors.length} Sectors · {industryGroupsCount} Groups</span>
            </div>
            <span className="hidden sm:inline text-border">·</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="uppercase tracking-wider text-muted-foreground/70 text-[9px] sm:text-[10px]">Deals:</span>
              <span className="text-accent font-medium">{dealCount.toLocaleString("en-IN")} Precedent Deals</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CHAPTER 01: Why Sector-Relative                                  */}
      {/* ---------------------------------------------------------------- */}
      <section id="chapter-01" className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 border-b border-border/40 bg-background scroll-mt-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="01" label="SECTOR NORMALIZATION" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              A 20% MARGIN MEANS NOTHING UNTIL YOU KNOW THE SECTOR.
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Percentile scoring against direct operating peers
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 font-sans text-sm sm:text-base md:text-lg leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                Software prints fat margins. A good factory does not. Ranking every NSE name on one raw list hides the factory and crowns the software company.
              </p>
            </RevealItem>
            <RevealItem delay={0.06}>
              <p className="text-muted-foreground">
                DealScope scores each name against its own sector. An 85 means 85th percentile among peers, not among all of India.
              </p>
            </RevealItem>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CHAPTER 02: Four Factors                                         */}
      {/* ---------------------------------------------------------------- */}
      <section id="chapter-02" className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 border-b border-border/40 bg-background scroll-mt-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="02" label="SCORING ARCHITECTURE" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              FOUR NUMBERS. THEN A SCORE.
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Equal default weights with dynamic missing-data handling
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            <p className="font-sans text-sm sm:text-base md:text-lg leading-relaxed text-foreground/90">
              Growth. EBITDA margin. ROCE. Debt. Each is a percentile inside the sector. Equal weights unless you move the sliders. If a number is missing, it is dropped. It is not scored as zero. Banks do not get a debt score.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Revenue growth", factor: "01", desc: "Top-line growth trajectory relative to sector peers." },
                { title: "EBITDA margin", factor: "02", desc: "Operating profitability before non-cash and capital costs." },
                { title: "ROCE", factor: "03", desc: "Operating profit generated per rupee of capital employed." },
                { title: "Debt health", factor: "04", desc: "Net Debt to EBITDA ratio. Lower debt scores higher. Banks excluded." },
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
      {/* CHAPTER 03: Screens                                              */}
      {/* ---------------------------------------------------------------- */}
      <section id="chapter-03" className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 border-b border-border/40 bg-background scroll-mt-14">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="03" label="PRESET SCREENS" />
          <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
            START WITH A THESIS. NOT A BLANK GRID.
          </h2>
          <p className="mt-2 sm:mt-3 max-w-2xl font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Eight live screens. Click one. The list is the real universe, not a canned shortlist.
          </p>

          <div className="mt-6 sm:mt-8">
            <ExampleScreens screens={screens} onApply={onApplyScreen} variant="cards" />
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40 pt-6">
            <span className="font-mono text-xs text-muted-foreground">
              Click any screen to execute instantly, or build custom criteria above
            </span>
            <button
              onClick={onRun}
              className="inline-flex items-center justify-center gap-2 border border-border/80 bg-card/80 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer min-h-[40px]"
            >
              <span>View All Listed Companies</span>
              <BitmapChevron className="transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CHAPTER 04: Taxonomy                                             */}
      {/* ---------------------------------------------------------------- */}
      <section id="chapter-04" className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 border-b border-border/40 bg-background scroll-mt-14">
        <div className="max-w-5xl mx-auto">
          <SectionLabel index="04" label="TAXONOMY &amp; COVERAGE" />
          <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
            {sectors.length} SECTORS. {industryGroupsCount} GROUPS.
          </h2>
          <p className="mt-2 sm:mt-3 max-w-2xl font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A port and a packaging mill are not peers. Every listed name sits in one sector and one industry group. Unclassified names stay visible and unscored against a fake peer set.
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

      {/* ---------------------------------------------------------------- */}
      {/* CHAPTER 05: Deals                                                */}
      {/* ---------------------------------------------------------------- */}
      <section id="chapter-05" className="relative px-4 sm:px-6 md:px-12 py-12 sm:py-16 bg-background scroll-mt-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionLabel index="05" label="PRECEDENT TRANSACTIONS" />
            <h2 className="mt-3 sm:mt-4 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl md:text-5xl tracking-tight text-balance text-foreground">
              {dealCount.toLocaleString("en-IN")} INDIAN DEALS. KEPT NEXT TO THE TAPE, NOT MIXED INTO IT.
            </h2>
            <p className="mt-2 sm:mt-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Historical M&amp;A transaction benchmarks (2006 to 2025)
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 font-sans text-sm sm:text-base md:text-lg leading-relaxed text-foreground/90">
            <RevealItem>
              <p>
                Tear sheets show listed trading multiples and historical deals in two different tables. Trading multiples are the public tape. Deals are what buyers paid. We do not blend them into one fake number. We do not invent multiples.
              </p>
            </RevealItem>
            <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs text-muted-foreground border border-border/60 bg-card/30 p-3 sm:p-4">
              <div>
                <span className="text-foreground font-semibold">{sectors.length}</span> sectors
              </div>
              <span className="text-border">·</span>
              <div>
                <span className="text-foreground font-semibold">Public</span> disclosures only
              </div>
              <span className="text-border">·</span>
              <div>
                <span className="text-accent font-semibold">0</span> imputed multiples
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 sm:py-10 px-4 sm:px-6 md:px-12 bg-background font-mono text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <span>DEALSCOPE · Listed India comps</span>
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
