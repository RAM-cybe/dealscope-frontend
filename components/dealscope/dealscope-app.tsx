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
  type QuerySyncState,
  DEFAULT_WEIGHTS,
  DEFAULT_BUCKET_FILTERS,
  getCompanies,
  getDeals,
  countActiveBucketFilters,
  computeScore,
  reconcileQuerySyncState,
} from "@/lib/dealscope-data"
import {
  type ScreenFilters,
  type FilterChip,
  type NumericFieldKey,
  type NumericConstraint,
  makeScreen,
  runScreen,
  countScreen,
  removeChip as removeChipFrom,
} from "@/lib/screener"
import { parseQuery } from "@/lib/query-parser"
import { type ExampleScreen, EXAMPLE_SCREENS } from "@/lib/example-screens"

type View = "landing" | "results" | "detail"

const viewTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] as const },
}

// Data is a bundled local JSON file (no network, no database) -- read once
// at module load, same on localhost and once deployed.
const { companies, sectors, industryGroups } = getCompanies()
const deals = getDeals()

// Example-screen counts depend only on the (immutable) company set, so they
// are computed once at module load -- but through the SAME parser + screener
// the search bar uses, so a card can never advertise a number the results
// page wouldn't return.
const screensWithCounts: { screen: ExampleScreen; count: number }[] = EXAMPLE_SCREENS.map(
  (screen) => ({ screen, count: countScreen(companies, parseQuery(screen.query).filters) }),
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

  // The URL's own q/sectors, recomputed fresh every render -- never stale,
  // never dependent on an effect having already fired.
  const urlQuery = searchParams.get("q") ?? ""
  const urlSectorsRaw = searchParams.get("sectors") ?? ""

  // query/debouncedQuery/selectedSectors are local (typing can't push
  // history on every keystroke), seeded from the URL so a shared link
  // restores the search -- but held in one object with syncedQuery/
  // syncedSectorsRaw so they can only ever be replaced together, atomically,
  // by reconcileQuerySyncState() below. See that function's doc comment for
  // why this is a render-time check rather than a useEffect: a previous
  // useEffect-based version of this left a real window where the input and
  // the search results still reflected whatever query was active before the
  // URL changed (confirmed concretely -- loading straight into a URL with
  // q=M%26MFIN could show a stale query from earlier in the session).
  const [syncState, setSyncState] = useState<QuerySyncState>(() => ({
    query: urlQuery,
    debouncedQuery: urlQuery,
    selectedSectors: urlSectorsRaw ? urlSectorsRaw.split(",").filter(Boolean) : [],
    syncedQuery: urlQuery,
    syncedSectorsRaw: urlSectorsRaw,
  }))
  const reconciled = reconcileQuerySyncState(syncState, urlQuery, urlSectorsRaw)
  if (reconciled !== syncState) {
    setSyncState(reconciled)
  }
  const { query, debouncedQuery, selectedSectors } = reconciled

  const setQuery = useCallback((q: string) => {
    setSyncState((prev) => ({ ...prev, query: q }))
  }, [])
  const setSelectedSectors = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setSyncState((prev) => ({
      ...prev,
      selectedSectors: typeof updater === "function" ? updater(prev.selectedSectors) : updater,
    }))
  }, [])

  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [filters, setFilters] = useState<BucketFilters>({ ...DEFAULT_BUCKET_FILTERS })
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const selectedCompany: Company | null = useMemo(
    () => (tickerParam ? companies.find((c) => c.ticker === tickerParam) ?? null : null),
    [tickerParam],
  )

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

  // Debounced so re-searching the full 2,046-company set doesn't run
  // synchronously on every keystroke -- the input itself stays bound to the
  // raw, un-debounced `query` state and updates instantly either way; only
  // the (expensive) recompute of results lags by this ~120ms, which reads as
  // normal debounce behavior, not lag. Only fires for actual typing: an
  // external URL-driven change is applied immediately above, not through
  // this timer.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSyncState((prev) => (prev.debouncedQuery === query ? prev : { ...prev, debouncedQuery: query }))
    }, 120)
    return () => clearTimeout(timer)
  }, [query])

  // --- The screen -------------------------------------------------------
  // `manualNumeric` holds continuous constraints that came from editing chips
  // rather than from the query text. Sector/industry/bucket state already has
  // homes (selectedSectors, filters.industry, filters), so this is the only
  // new piece of state the screener needs.
  const [manualNumeric, setManualNumeric] = useState<Partial<Record<NumericFieldKey, NumericConstraint>>>({})

  const parsed = useMemo(() => parseQuery(debouncedQuery), [debouncedQuery])

  // The canonical screen, assembled from both entry points every render.
  // Typed constraints and visually-selected ones are unioned rather than one
  // overriding the other, so a query and a sector pill compose instead of
  // fighting. The bucket drawer is passed through untouched and still
  // evaluated by the original passesBucketFilters(), which is what keeps the
  // visual filters working even if the parser understands nothing.
  const screen: ScreenFilters = useMemo(() => {
    const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]))
    return makeScreen({
      text: parsed.filters.text,
      sectors: union(parsed.filters.sectors, selectedSectors),
      industries: union(parsed.filters.industries, filters.industry),
      numeric: { ...parsed.filters.numeric, ...manualNumeric },
      buckets: filters,
    })
  }, [parsed, selectedSectors, filters, manualNumeric])

  const { results, matchCount } = useMemo(
    () => runScreen(companies, screen, weights),
    [screen, weights],
  )

  /**
   * Write the current screen back into the visual controls and drop the query
   * text.
   *
   * Every chip edit goes through this. A chip can originate either from typed
   * text or from a visual control, and there is no way to "partially un-type"
   * a sentence -- so instead of trying, the screen is materialised into the
   * visual state that can represent it exactly, and the now-inaccurate query
   * string is cleared. The result is that what you see (chips) always equals
   * what is applied, which is the property that makes the natural-language box
   * trustworthy.
   */
  const materialize = useCallback((next: ScreenFilters) => {
    setSelectedSectors(next.sectors)
    setManualNumeric(next.numeric)
    setFilters({ ...next.buckets, industry: next.industries })
    setQuery("")
  }, [])

  // Companies with no industry at all (89, a confirmed upstream data-source
  // gap). Surfaced only inside the industry panel now, rather than sitting on
  // the page permanently.
  const unclassifiedCount = useMemo(
    () => sectors.find((s) => s.name === "Unclassified")?.count ?? 0,
    [],
  )

  // The old "free text only searches name/ticker/sector" hint is gone: numeric
  // queries are now first-class, so the condition it warned about no longer
  // exists. `parsed.recognised` replaces it as the signal the UI surfaces.

  // Surfaced on the landing page so "Screen Companies" can show a live match
  // count before the user commits to viewing results.
  const activeFilterCount = countActiveBucketFilters(filters)

  // Typing no longer wipes the visual filters. It used to have to: free text
  // could only ever narrow within an already-filtered base, so a name query
  // while a sector was pinned silently returned nothing useful. Now the query
  // contributes its own constraints to the same screen, so the two compose --
  // and every constraint from either source is visible as a chip, which is
  // what makes composing them safe rather than confusing.
  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
  }, [])

  // The industry breakdown is now always visible regardless of how many
  // sectors are selected (see SectorIndustryFilter), with its own always-
  // reachable "Clear" control -- unlike the old single-sector-gated
  // drill-down, changing sector selection no longer needs to silently drop
  // an industry filter, since there's never a point where it becomes
  // invisible or uncontrollable.
  const toggleSector = useCallback((sector: string) => {
    setSelectedSectors((prev) => (prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]))
  }, [])

  const handleRemoveChip = useCallback(
    (chip: FilterChip) => materialize(removeChipFrom(screen, chip)),
    [materialize, screen],
  )

  const handleClearAll = useCallback(() => {
    setSelectedSectors([])
    setManualNumeric({})
    setFilters({ ...DEFAULT_BUCKET_FILTERS })
    setQuery("")
  }, [])

  const handleRun = useCallback(() => {
    navigate({ view: "results", q: query, sectors: selectedSectors })
  }, [navigate, query, selectedSectors])

  // Applying an example screen is literally "type this query and run it" --
  // same parser, same screener, no private code path. That's what keeps the
  // examples honest: if a parsing rule regresses, the example screens visibly
  // break with it instead of quietly continuing to work via a shortcut.
  const handleApplyScreen = useCallback(
    (example: ExampleScreen) => {
      setSelectedSectors([])
      setManualNumeric({})
      setFilters({ ...DEFAULT_BUCKET_FILTERS })
      setQuery(example.query)
      setSyncState((prev) => ({ ...prev, query: example.query, debouncedQuery: example.query }))
      navigate({ view: "results", q: example.query })
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
                matchingCount={matchCount}
                totalCount={companies.length}
                screen={screen}
                onRemoveChip={handleRemoveChip}
                onClearAll={handleClearAll}
                recognised={parsed.recognised}
                screens={screensWithCounts}
                onApplyScreen={handleApplyScreen}
                sectors={sectors}
                topScored={topScoredCompany}
                industryGroups={industryGroups}
                unclassifiedCount={unclassifiedCount}
                filters={filters}
                onFiltersChange={setFilters}
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
                onFiltersChange={setFilters}
                industryGroups={industryGroups}
                unclassifiedCount={unclassifiedCount}
                screen={screen}
                matchCount={matchCount}
                totalCount={companies.length}
                onRemoveChip={handleRemoveChip}
                onClearAll={handleClearAll}
                recognised={parsed.recognised}
                screens={screensWithCounts}
                onApplyScreen={handleApplyScreen}
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
        industryGroups={industryGroups}
      />
    </main>
  )
}
