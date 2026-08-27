"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  getCompanies,
  getDeals,
  countActiveBucketFilters,
} from "@/lib/dealscope-data"
import { prefetchCompanyDetails } from "@/lib/company-details"
import {
  type ScreenFilters,
  type FilterChip,
  makeScreen,
  runScreen,
  countScreen,
  removeChip as removeChipFrom,
} from "@/lib/screener"
import { parseQuery, screenAfterClearedSearch, screenFromTypedQuery } from "@/lib/query-parser"
import { scrollToTop } from "@/components/smooth-scroll"
import { encodeUrlState, decodeUrlState } from "@/lib/url-state"
import { type ExampleScreen, EXAMPLE_SCREENS } from "@/lib/example-screens"

type View = "landing" | "results" | "detail"

// Pure opacity, very short, enter and exit simultaneous.
//
// History of the jank here:
//   * `mode="wait"` sequenced exit+enter (~0.9s dead air).
//   * y-translate on a 60-row results tree forced full-page layout every frame.
//   * `mode="popLayout"` still remounted whole subtrees and re-ran every
//     staggered child animation on every back navigation.
// Opacity-only on the compositor, both sides overlapping for ~120ms, is what
// "instant but not a hard cut" feels like. Child views must not re-introduce
// y/x drift of their own on mount (see landing/results/tear-sheet).
const viewTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, position: "relative" as const },
  // Absolute on exit so the outgoing and incoming views can crossfade in the
  // same frame without stacking two full page heights (the "jump" that made
  // back-from-tear-sheet feel broken even when opacity was short).
  exit: { opacity: 0, position: "absolute" as const, left: 0, right: 0, top: 0 },
  transition: { duration: 0.12, ease: "easeOut" as const },
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
  const searchParams = useSearchParams()

  // ---------------------------------------------------------------------------
  // State & URL Synchronization Architecture:
  // - View, ticker, and committedScreen are held in local state for instant,
  //   synchronous UI rendering on any click or keyboard action.
  // - Same-view screen edits (sector/industry/buckets) update state and push
  //   canonical URL state via window.history.replaceState.
  // - Real view transitions (landing <-> results <-> detail) update state and
  //   push history entries via window.history.pushState.
  // - Next.js router Link clicks and browser Back/Forward (popstate) trigger
  //   effects that synchronize local state directly from the URL.
  // ---------------------------------------------------------------------------
  const [view, setView] = useState<View>(() => {
    const d = decodeUrlState(searchParams)
    const co = d.ticker ? companies.find((c) => c.ticker === d.ticker) ?? null : null
    return d.view === "detail" && !co ? "results" : d.view
  })
  const [tickerParam, setTickerParam] = useState<string | null>(() => {
    const d = decodeUrlState(searchParams)
    const co = d.ticker ? companies.find((c) => c.ticker === d.ticker) ?? null : null
    return co ? d.ticker : null
  })
  const [committedScreen, setCommittedScreen] = useState<ScreenFilters>(() => decodeUrlState(searchParams).screen)
  const [rawText, setRawText] = useState(() => decodeUrlState(searchParams).screen.text)
  const [debouncedText, setDebouncedText] = useState(() => decodeUrlState(searchParams).screen.text)

  const selectedCompany: Company | null = useMemo(
    () => (tickerParam ? companies.find((c) => c.ticker === tickerParam) ?? null : null),
    [tickerParam],
  )

  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    prefetchCompanyDetails()
  }, [])

  // Sync state when searchParams changes (e.g. clicking header logo link, external link, or Next.js Link)
  useEffect(() => {
    const decoded = decodeUrlState(searchParams)
    const co = decoded.ticker ? companies.find((c) => c.ticker === decoded.ticker) ?? null : null
    const nextView = decoded.view === "detail" && !co ? "results" : decoded.view
    const nextTicker = co ? decoded.ticker : null
    setView(nextView)
    setTickerParam(nextTicker)
    setCommittedScreen(decoded.screen)
    setRawText(decoded.screen.text)
    setDebouncedText(decoded.screen.text)
  }, [searchParams])

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search)
      const decoded = decodeUrlState(sp)
      const co = decoded.ticker ? companies.find((c) => c.ticker === decoded.ticker) ?? null : null
      const nextView = decoded.view === "detail" && !co ? "results" : decoded.view
      const nextTicker = co ? decoded.ticker : null
      setView(nextView)
      setTickerParam(nextTicker)
      setCommittedScreen(decoded.screen)
      setRawText(decoded.screen.text)
      setDebouncedText(decoded.screen.text)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Debounce typed text
  useEffect(() => {
    const t = setTimeout(() => setDebouncedText(rawText), 120)
    return () => clearTimeout(t)
  }, [rawText])

  const parsed = useMemo(() => parseQuery(debouncedText), [debouncedText])

  const computeScreen = useCallback(
    (text: string) => screenFromTypedQuery(text, committedScreen),
    [committedScreen],
  )
  const screen = useMemo(() => computeScreen(debouncedText), [computeScreen, debouncedText])

  const { results, matchCount } = useMemo(() => runScreen(companies, screen, weights), [screen, weights])

  // Same-view screen edits (sector pills, industry chips, bucket filters, chip removal)
  const updateScreen = useCallback(
    (next: ScreenFilters) => {
      setCommittedScreen(next)
      const qs = encodeUrlState({ view, ticker: tickerParam, screen: next })
      const url = qs ? `/?${qs}` : "/"
      if (typeof window !== "undefined" && window.location.search !== (qs ? `?${qs}` : "")) {
        window.history.replaceState(null, "", url)
      }
    },
    [view, tickerParam],
  )

  // Real view transitions (landing <-> results <-> detail)
  const navigate = useCallback(
    (params: { view?: View; ticker?: string | null; screen?: ScreenFilters }) => {
      const nextView = params.view ?? view
      const nextTicker = params.ticker !== undefined ? params.ticker : tickerParam
      const nextScreen = params.screen ?? screen

      setView(nextView)
      setTickerParam(nextTicker)
      setCommittedScreen(nextScreen)
      if (params.screen) {
        setRawText(params.screen.text)
        setDebouncedText(params.screen.text)
      }

      const qs = encodeUrlState({
        view: nextView,
        ticker: nextTicker,
        screen: nextScreen,
      })
      const url = qs ? `/?${qs}` : "/"
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", url)
      }
      requestAnimationFrame(scrollToTop)
    },
    [view, tickerParam, screen],
  )

  const materialize = useCallback(
    (next: ScreenFilters) => {
      const cleaned = { ...next, text: "" }
      setRawText("")
      setDebouncedText("")
      updateScreen(cleaned)
    },
    [updateScreen],
  )

  const handleQueryChange = useCallback(
    (q: string) => {
      setRawText(q)
      if (!q.trim()) {
        setDebouncedText("")
        const kept = screenAfterClearedSearch(committedScreen)
        if (tickerParam) {
          navigate({ view: "results", ticker: null, screen: kept })
        } else {
          updateScreen(kept)
        }
      }
    },
    [tickerParam, navigate, updateScreen, committedScreen],
  )

  const toggleSector = useCallback(
    (sector: string) => {
      const sectorsNext = screen.sectors.includes(sector)
        ? screen.sectors.filter((s) => s !== sector)
        : [...screen.sectors, sector]
      materialize({ ...screen, sectors: sectorsNext })
    },
    [screen, materialize],
  )

  const handleRemoveChip = useCallback(
    (chip: FilterChip) => materialize(removeChipFrom(screen, chip)),
    [materialize, screen],
  )

  const handleClearAll = useCallback(() => {
    setRawText("")
    setDebouncedText("")
    const empty = makeScreen()
    if (view === "detail" || tickerParam) {
      navigate({ view: "results", ticker: null, screen: empty })
    } else {
      updateScreen(empty)
    }
  }, [view, tickerParam, navigate, updateScreen])

  const handleBucketsChange = useCallback(
    (buckets: BucketFilters) => materialize({ ...screen, buckets, industries: buckets.industry }),
    [screen, materialize],
  )

  const handleRun = useCallback(
    () => navigate({ view: "results", screen: computeScreen(rawText) }),
    [navigate, computeScreen, rawText],
  )

  const handleApplyScreen = useCallback(
    (example: ExampleScreen) => {
      const next = parseQuery(example.query).filters
      setRawText(example.query)
      setDebouncedText(example.query)
      navigate({ view: "results", screen: next })
    },
    [navigate],
  )

  const handleSelectCompany = useCallback(
    (company: Company) => navigate({ view: "detail", ticker: company.ticker }),
    [navigate],
  )
  const handleBackToResults = useCallback(() => navigate({ view: "results", ticker: null }), [navigate])
  const handleBackToLanding = useCallback(() => {
    setRawText("")
    setDebouncedText("")
    navigate({ view: "landing", ticker: null, screen: makeScreen() })
  }, [navigate])

  const activeFilterCount = countActiveBucketFilters(screen.buckets)
  const queryText = rawText

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <AnimatePresence initial={false}>
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
                onSubmitQuery={handleRun}
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
                onSelectCompany={handleSelectCompany}
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
        onApply={() => {
          setFiltersOpen(false)
          if (view === "landing") {
            handleRun()
          }
        }}
        matchCount={matchCount}
        industryGroups={industryGroups}
      />
    </main>
  )
}
