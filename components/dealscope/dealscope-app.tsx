"use client"

import { useState, useMemo, useCallback } from "react"
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
  countScenario,
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
const { companies, sectors, dataAsOf } = getCompanies()
const deals = getDeals()

// Scenario counts depend only on the (immutable) company set, so compute once.
const scenariosWithCounts: { scenario: ExampleScenario; count: number }[] = EXAMPLE_SCENARIOS.map(
  (scenario) => ({ scenario, count: countScenario(companies, scenario) }),
)

export function DealScopeApp() {
  const [view, setView] = useState<View>("landing")
  const [query, setQuery] = useState("")
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [filters, setFilters] = useState<BucketFilters>({ ...DEFAULT_BUCKET_FILTERS })
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const toggleSector = useCallback((sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    )
  }, [])

  const handleRun = useCallback(() => {
    setView("results")
    window.scrollTo({ top: 0 })
  }, [])

  // Apply an example scenario atomically: clear any free text, pin the sector,
  // set the range filters, then jump to results. This is the live regression
  // check that the filters actually narrow the set.
  const handleApplyScenario = useCallback((scenario: ExampleScenario) => {
    setQuery("")
    setSelectedSectors([scenario.sector])
    setFilters(scenario.filters)
    setView("results")
    window.scrollTo({ top: 0 })
  }, [])

  const handleSelectCompany = useCallback((company: Company) => {
    setSelectedCompany(company)
    setView("detail")
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackToResults = useCallback(() => {
    setView("results")
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackToLanding = useCallback(() => {
    setView("landing")
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing" {...viewTransition}>
              <LandingView
                query={query}
                onQueryChange={setQuery}
                selectedSectors={selectedSectors}
                onToggleSector={toggleSector}
                onRun={handleRun}
                scenarios={scenariosWithCounts}
                onApplyScenario={handleApplyScenario}
                sectors={sectors}
                totalCompanies={companies.length}
                dataAsOf={dataAsOf}
              />
            </motion.div>
          )}

          {view === "results" && (
            <motion.div key="results" {...viewTransition}>
              <ResultsView
                results={results}
                query={query}
                onQueryChange={setQuery}
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
                dataAsOf={dataAsOf}
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
                dataAsOf={dataAsOf}
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
      />
    </main>
  )
}
