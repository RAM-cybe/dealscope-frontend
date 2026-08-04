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
  DEFAULT_WEIGHTS,
  DEFAULT_BUCKET_FILTERS,
  getCompanies,
  getDeals,
  countActiveBucketFilters,
} from "@/lib/dealscope-data"
import {
  type ScreenFilters,
  type FilterChip,
  makeScreen,
  runScreen,
  countScreen,
  removeChip as removeChipFrom,
} from "@/lib/screener"
import { parseQuery } from "@/lib/query-parser"
import { encodeUrlState, decodeUrlState } from "@/lib/url-state"
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

// Example-screen counts run through the SAME parser + screener the search bar
// uses, so a card can never advertise a number the results page wouldn't return.
const screensWithCounts: { screen: ExampleScreen; count: number }[] = EXAMPLE_SCREENS.map(
  (screen) => ({ screen, count: countScreen(companies, parseQuery(screen.query).filters) }),
)

const UNCLASSIFIED_COUNT = sectors.find((s) => s.name === "Unclassified")?.count ?? 0

export function DealScopeApp() {
  // --- URL <-> screen, single source of truth --------------------------------
  //
  // `screen` is the one authoritative filter state. The URL mirrors it, and
  // carries the WHOLE thing -- q, sectors, industries, numeric constraints and
  // band selections (see lib/url-state.ts). Previously only q+sectors reached
  // the URL, so a screen built by editing chips or by the filters drawer was
  // invisible to a refresh or a shared link: the recipient got a different
  // screen than the one that produced the link.
  //
  // State writes the URL and the URL writes state, so exactly one direction
  // wins per render, decided against the last string we synced:
  //   * URL differs from what we last wrote -> it came from the user (fresh
  //     load, shared link, back/forward). Decode it in.
  //   * Otherwise -> state is authoritative; re-encode and replace() only if
  //     the string actually changed.
  // encodeUrlState() emits keys in a fixed order, so "changed" is a plain
  // string compare and a steady screen re-encodes byte-identically -- no loop.
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlString = searchParams.toString()

  const [state, setState] = useState(() => {
    const decoded = decodeUrlState(searchParams)
    return { screen: decoded.screen, text: decoded.screen.text, debounced: decoded.screen.text, syncedUrl: urlString }
  })

  // Render-time reconciliation rather than an effect: an effect commits one
  // tick late, which previously left a real window where the input and the
  // results still showed the previous query (loading straight into
  // ?q=M%26MFIN could display a stale query until something forced a
  // re-render). Reconciling here means the very first paint is already correct.
  let current = state
  if (urlString !== state.syncedUrl) {
    const decoded = decodeUrlState(searchParams)
    current = { screen: decoded.screen, text: decoded.screen.text, debounced: decoded.screen.text, syncedUrl: urlString }
    setState(current)
  }

  const { screen, text: queryText, debounced: debouncedText } = current
  const tickerParam = searchParams.get("ticker")
  const view: View = tickerParam ? "detail" : searchParams.get("view") === "results" ? "results" : "landing"

  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Push the screen into the URL whenever state moved it. replace(), not
  // push(), so refining a screen doesn't bury the back button under one entry
  // per keystroke -- back still steps between the views you actually navigated.
  useEffect(() => {
    const next = encodeUrlState({ view, ticker: tickerParam, screen })
    if (next === state.syncedUrl) return
    setState((prev) => ({ ...prev, syncedUrl: next }))
    router.replace(next ? `/?${next}` : "/", { scroll: false })
  }, [screen, view, tickerParam, state.syncedUrl, router])

  // Debounce only the expensive part. The input stays bound to the raw text so
  // typing always feels instant; only the re-parse + re-screen of 2,381
  // companies waits ~120ms.
  useEffect(() => {
    const t = setTimeout(() => {
      setState((prev) => (prev.debounced === prev.text ? prev : { ...prev, debounced: prev.text }))
    }, 120)
    return () => clearTimeout(t)
  }, [queryText])

  const parsed = useMemo(() => parseQuery(debouncedText), [debouncedText])

  // Typed constraints replace the query-owned half of the screen; the filters
  // drawer owns `buckets` and survives typing, since it is a separate,
  // explicitly-operated surface.
  useEffect(() => {
    setState((prev) => {
      const next = makeScreen({ ...parsed.filters, buckets: prev.screen.buckets })
      return encodeUrlState({ view: "results", ticker: null, screen: next }) ===
        encodeUrlState({ view: "results", ticker: null, screen: prev.screen })
        ? prev
        : { ...prev, screen: next }
    })
  }, [parsed])

  const { results, matchCount } = useMemo(() => runScreen(companies, screen, weights), [screen, weights])

  const selectedCompany: Company | null = useMemo(
    () => (tickerParam ? companies.find((c) => c.ticker === tickerParam) ?? null : null),
    [tickerParam],
  )

  const navigate = useCallback(
    (params: { view?: View; ticker?: string | null; screen?: ScreenFilters }) => {
      const qs = encodeUrlState({
        view: params.view ?? view,
        ticker: params.ticker ?? null,
        screen: params.screen ?? screen,
      })
      setState((prev) => ({ ...prev, syncedUrl: qs }))
      router.push(qs ? `/?${qs}` : "/", { scroll: false })
      window.scrollTo({ top: 0 })
    },
    [router, view, screen],
  )

  /**
   * Apply a screen built by a visual control (chip removal, sector pill,
   * filters drawer) and drop the query text.
   *
   * A chip can originate either from typed text or from a visual control, and
   * there is no way to partially un-type a sentence -- so rather than trying,
   * the screen is materialised into the state that represents it exactly and
   * the now-inaccurate query string is cleared. What you see (chips) therefore
   * always equals what is applied, which is the property that makes a
   * natural-language box trustworthy at all.
   */
  const materialize = useCallback((next: ScreenFilters) => {
    setState((prev) => ({ ...prev, screen: { ...next, text: "" }, text: "", debounced: "" }))
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setState((prev) => ({ ...prev, text: q }))
  }, [])

  const toggleSector = useCallback((sector: string) => {
    setState((prev) => {
      const sectorsNext = prev.screen.sectors.includes(sector)
        ? prev.screen.sectors.filter((s) => s !== sector)
        : [...prev.screen.sectors, sector]
      return { ...prev, screen: { ...prev.screen, sectors: sectorsNext, text: "" }, text: "", debounced: "" }
    })
  }, [])

  const handleRemoveChip = useCallback(
    (chip: FilterChip) => materialize(removeChipFrom(screen, chip)),
    [materialize, screen],
  )

  const handleClearAll = useCallback(() => materialize(makeScreen()), [materialize])

  // The drawer owns `buckets`; `industry` inside it is mirrored onto the
  // screen's own industries list so both entry points agree.
  const handleBucketsChange = useCallback((buckets: BucketFilters) => {
    setState((prev) => ({
      ...prev,
      screen: { ...prev.screen, buckets, industries: buckets.industry, text: "" },
      text: "",
      debounced: "",
    }))
  }, [])

  const handleRun = useCallback(() => navigate({ view: "results" }), [navigate])

  // Applying an example screen is literally "type this query and run it" --
  // same parser, same screener, no private code path.
  const handleApplyScreen = useCallback(
    (example: ExampleScreen) => {
      const next = parseQuery(example.query).filters
      setState((prev) => ({ ...prev, screen: next, text: example.query, debounced: example.query }))
      navigate({ view: "results", screen: next })
    },
    [navigate],
  )

  const handleSelectCompany = useCallback(
    (company: Company) => navigate({ view: "detail", ticker: company.ticker }),
    [navigate],
  )
  const handleBackToResults = useCallback(() => navigate({ view: "results", ticker: null }), [navigate])
  const handleBackToLanding = useCallback(
    () => navigate({ view: "landing", ticker: null, screen: makeScreen() }),
    [navigate],
  )

  const activeFilterCount = countActiveBucketFilters(screen.buckets)

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing" {...viewTransition}>
              <LandingView
                query={queryText}
                onQueryChange={handleQueryChange}
                selectedSectors={screen.sectors}
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
                dealCount={deals.length}
                industryGroups={industryGroups}
                unclassifiedCount={UNCLASSIFIED_COUNT}
                filters={screen.buckets}
                onFiltersChange={handleBucketsChange}
              />
            </motion.div>
          )}

          {view === "results" && (
            <motion.div key="results" {...viewTransition}>
              <ResultsView
                results={results}
                query={queryText}
                onQueryChange={handleQueryChange}
                selectedSectors={screen.sectors}
                onToggleSector={toggleSector}
                weights={weights}
                filters={screen.buckets}
                onFiltersChange={handleBucketsChange}
                industryGroups={industryGroups}
                unclassifiedCount={UNCLASSIFIED_COUNT}
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
        filters={screen.buckets}
        onFiltersChange={handleBucketsChange}
        onClose={() => setFiltersOpen(false)}
        industryGroups={industryGroups}
      />
    </main>
  )
}
