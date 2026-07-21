"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LandingView } from "@/components/dealscope/landing-view"
import { ResultsView } from "@/components/dealscope/results-view"
import { TearSheetView } from "@/components/dealscope/tear-sheet-view"
import { WeightsPanel } from "@/components/dealscope/weights-panel"
import { FiltersPanel } from "@/components/dealscope/filters-panel"
import {
  type Company,
  type Weights,
  type BucketFilters,
  type ExampleScenario,
  DEFAULT_WEIGHTS,
  DEFAULT_BUCKET_FILTERS,
  EXAMPLE_SCENARIOS,
  getCompanies,
  getDeals,
  searchCompaniesDetailed,
  queryHasNumericIntent,
  queryHasComparisonIntent,
  countActiveBucketFilters,
  countScenario,
  computeScore,
} from "@/lib/dealscope-data"

type View = "landing" | "results" | "detail"

const viewTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] as const },
}

// Data is a bundled local JSON file (no network, no database) -- read once
// at module load, same on localhost and once deployed.
const { companies, sectors, industries } = getCompanies()
const deals = getDeals()

// Scenario counts depend only on the (immutable) company set, so compute once.
const scenariosWithCounts: { scenario: ExampleScenario; count: number }[] = EXAMPLE_SCENARIOS.map(
  (scenario) => ({ scenario, count: countScenario(companies, scenario) }),
)

// Highest composite score under the default (equal) weights, for the landing
// page's live proof strip. Computed once alongside the scenario counts.
const topScoredCompany: { name: string; score: number } | null = companies.reduce<
  { name: string; score: number } | null
>((best, c) => {
  const score = computeScore(c.factors, DEFAULT_WEIGHTS)
  return !best || score > best.score ? { name: c.name, score } : best
}, null)

export function DealScopeApp() {
  // --- URL as the source of truth for which view is showing -------------------
  // Each view has its own URL, so browser back/forward and trackpad swipe work
  // like any normal site, and a results/tear-sheet URL is shareable:
  //   /                                        landing
  //   /?view=results&q=pharma&sectors=A,B      results (query + sectors restored)
  //   /?view=results&q=...&ticker=TCS          tear sheet
  // The tear-sheet URL deliberately keeps the results params, so going back from
  // a company lands on the search that produced it rather than a bare list.
  //
  // Kept as search params on the single existing route rather than splitting
  // into /results and /company/[ticker] routes: the whole company dataset
  // is one bundled client-side import, and the cross-view AnimatePresence
  // transitions are part of the design -- separate routes would remount and
  // re-parse per navigation and kill those transitions for no user-facing gain.
  const router = useRouter()
  const searchParams = useSearchParams()

  const tickerParam = searchParams.get("ticker")
  const viewParam = searchParams.get("view")
  const view: View = tickerParam ? "detail" : viewParam === "results" ? "results" : "landing"

  // Query/sector state stays local (typing must not push history on every
  // keystroke) but is seeded from the URL so a shared link restores the search.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "")
  const [selectedSectors, setSelectedSectors] = useState<string[]>(() => {
    const raw = searchParams.get("sectors")
    return raw ? raw.split(",").filter(Boolean) : []
  })
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [filters, setFilters] = useState<BucketFilters>({ ...DEFAULT_BUCKET_FILTERS })
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const selectedCompany: Company | null = useMemo(
    () => (tickerParam ? companies.find((c) => c.ticker === tickerParam) ?? null : null),
    [tickerParam],
  )

  // Back/forward can land on a URL whose q/sectors differ from local state
  // (e.g. back from a tear sheet to an older search). Re-sync so the inputs and
  // the result set always reflect the URL actually being displayed.
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
    const raw = searchParams.get("sectors")
    setSelectedSectors(raw ? raw.split(",").filter(Boolean) : [])
  }, [searchParams])

  const navigate = useCallback(
    (params: { view?: string; q?: string; sectors?: string[]; ticker?: string }) => {
      const sp = new URLSearchParams()
      if (params.view) sp.set("view", params.view)
      if (params.q) sp.set("q", params.q)
      if (params.sectors && params.sectors.length > 0) sp.set("sectors", params.sectors.join(","))
      if (params.ticker) sp.set("ticker", params.ticker)
      const qs = sp.toString()
      router.push(qs ? `/?${qs}` : "/", { scroll: false })
      window.scrollTo({ top: 0 })
    },
    [router],
  )

  const { results, queryFellBack } = useMemo(
    () => searchCompaniesDetailed(companies, query, selectedSectors, weights, filters),
    [query, selectedSectors, weights, filters],
  )

  // Show the "free text is name/ticker/sector only" hint when the query clearly
  // expects numeric filtering: strong comparison/unit words always trigger it;
  // bare digits only trigger it when the query matched nothing and fell back
  // (so "3M India" / "360 One" don't get falsely flagged).
  const showNumericHint =
    query.trim().length > 0 &&
    (queryHasComparisonIntent(query) || (queryFellBack && queryHasNumericIntent(query)))

  // Surfaced on the landing page so "Screen Companies" can show a live match
  // count before the user commits to viewing results.
  const activeFilterCount = countActiveBucketFilters(filters)

  // A search query takes priority over any active sector/bucket filters: typing
  // a company name while, say, "Financial Services" is pinned previously left
  // the result list stuck on that sector (search only ever narrowed within the
  // already-filtered base, so a query for a company outside it matched nothing
  // and silently fell back to showing the filtered set). Entering a non-empty
  // query now clears both, so search always runs against the full universe.
  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    if (q.trim().length > 0) {
      setSelectedSectors((prev) => (prev.length > 0 ? [] : prev))
      setFilters((prev) => (countActiveBucketFilters(prev) > 0 ? { ...DEFAULT_BUCKET_FILTERS } : prev))
    }
  }, [])

  const toggleSector = useCallback((sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    )
  }, [])

  const handleRun = useCallback(() => {
    navigate({ view: "results", q: query, sectors: selectedSectors })
  }, [navigate, query, selectedSectors])

  // Apply an example scenario atomically: clear any free text, pin the sector,
  // set the range filters, then jump to results. This is the live regression
  // check that the filters actually narrow the set.
  const handleApplyScenario = useCallback(
    (scenario: ExampleScenario) => {
      setQuery("")
      setSelectedSectors([scenario.sector])
      setFilters(scenario.filters)
      navigate({ view: "results", sectors: [scenario.sector] })
    },
    [navigate],
  )

  const handleSelectCompany = useCallback(
    (company: Company) => {
      navigate({ view: "results", q: query, sectors: selectedSectors, ticker: company.ticker })
    },
    [navigate, query, selectedSectors],
  )

  const handleBackToResults = useCallback(() => {
    navigate({ view: "results", q: query, sectors: selectedSectors })
  }, [navigate, query, selectedSectors])

  const handleBackToLanding = useCallback(() => {
    navigate({})
  }, [navigate])

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing" {...viewTransition}>
              <LandingView
                query={query}
                onQueryChange={handleQueryChange}
                selectedSectors={selectedSectors}
                onToggleSector={toggleSector}
                onRun={handleRun}
                onOpenFilters={() => setFiltersOpen(true)}
                activeFilterCount={activeFilterCount}
                matchingCount={results.length}
                scenarios={scenariosWithCounts}
                onApplyScenario={handleApplyScenario}
                sectors={sectors}
                topScored={topScoredCompany}
              />
            </motion.div>
          )}

          {view === "results" && (
            <motion.div key="results" {...viewTransition}>
              <ResultsView
                results={results}
                query={query}
                onQueryChange={handleQueryChange}
                selectedSectors={selectedSectors}
                onToggleSector={toggleSector}
                weights={weights}
                filters={filters}
                showNumericHint={showNumericHint}
                onSelectCompany={handleSelectCompany}
                onOpenWeights={() => setWeightsOpen(true)}
                onOpenFilters={() => setFiltersOpen(true)}
                onBack={handleBackToLanding}
                sectors={sectors}
              />
            </motion.div>
          )}

          {view === "detail" && selectedCompany && (
            <motion.div key={`detail-${selectedCompany.ticker}`} {...viewTransition}>
              <TearSheetView
                company={selectedCompany}
                weights={weights}
                onBack={handleBackToResults}
                companies={companies}
                deals={deals}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WeightsPanel
        open={weightsOpen}
        weights={weights}
        onWeightsChange={setWeights}
        onClose={() => setWeightsOpen(false)}
      />

      <FiltersPanel
        open={filtersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        industries={industries}
      />
    </main>
  )
}
