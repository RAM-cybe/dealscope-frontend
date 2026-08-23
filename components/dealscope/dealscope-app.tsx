"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
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
  // --- URL <-> screen, single source of truth --------------------------------
  //
  // The URL is the only authoritative store for view/ticker/screen -- it is
  // never duplicated into React state, so there is nothing to reconcile.
  // `urlScreen` below is a plain derivation (useMemo), not state: read the
  // params, decode them, done. The only local state is the raw text of the
  // search input (see `rawText`), which has to be local so every keystroke
  // paints instantly; everything else a click can change (sector, chips,
  // buckets) is written straight to the URL through `updateScreen`/`navigate`.
  //
  // Two functions write the URL and nothing else does:
  //   * `navigate()` -- router.push(), for real view transitions.
  //   * `updateScreen()` -- router.replace(), for same-view screen edits.
  // Both stamp the string they wrote into `lastWrittenUrl` (a ref, so it can
  // never read stale mid-render) before calling the router. A separate effect
  // watches for the URL changing to something that ISN'T what we last wrote --
  // that means it came from outside (fresh load, shared link, back/forward) --
  // and only then resyncs the local text field.
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlString = searchParams.toString()

  const decoded = useMemo(() => decodeUrlState(searchParams), [urlString])
  const selectedCompany: Company | null = useMemo(
    () => (decoded.ticker ? companies.find((c) => c.ticker === decoded.ticker) ?? null : null),
    [decoded.ticker],
  )
  // A ticker that is not in the universe must not leave a blank tear-sheet
  // view, and must not stay in the address bar.
  const view = decoded.view === "detail" && !selectedCompany ? "results" : decoded.view
  const tickerParam = selectedCompany ? decoded.ticker : null
  const urlScreen = decoded.screen

  const [rawText, setRawText] = useState(urlScreen.text)
  const [debouncedText, setDebouncedText] = useState(urlScreen.text)
  const lastWrittenUrl = useRef(urlString)

  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS })
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    prefetchCompanyDetails()
  }, [])

  // Rewrite leftover or legacy params (view=results&ticker=, unknown keys,
  // a ticker that is not in the universe) to the canonical form. replace(),
  // not push(), so a dirty shared link does not add a history entry.
  useEffect(() => {
    const next = encodeUrlState({ view, ticker: tickerParam, screen: urlScreen })
    if (next === urlString) return
    lastWrittenUrl.current = next
    router.replace(next ? `/?${next}` : "/", { scroll: false })
  }, [view, tickerParam, urlScreen, urlString, router])

  useEffect(() => {
    if (urlString === lastWrittenUrl.current) return
    lastWrittenUrl.current = urlString
    setRawText(urlScreen.text)
    setDebouncedText(urlScreen.text)
  }, [urlString, urlScreen.text])

  // Debounce only the expensive part. The input stays bound to `rawText` so
  // typing always feels instant; only the re-parse + re-screen of 2,381
  // companies waits ~120ms.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedText(rawText), 120)
    return () => clearTimeout(t)
  }, [rawText])

  const parsed = useMemo(() => parseQuery(debouncedText), [debouncedText])

  // The screen actually driving the UI right now. If the box reads exactly
  // what's already committed (fresh load, or after a sector/chip/bucket edit
  // reset it), the committed screen stands untouched -- re-parsing it would
  // throw away sectors/numeric constraints that came from those other
  // controls, not from text. Only once typed text diverges from the
  // committed baseline does it take over, replacing the query-owned half of
  // the screen (sectors/industries/numeric/text) while the buckets drawer,
  // a separate surface, survives untouched.
  //
  // `buckets.industry` is a mirror of `industries`, not an independent drawer
  // band -- decodeUrlState seeds both from the same `ind=` param. Carrying the
  // whole buckets object through unchanged therefore left the PREVIOUS query's
  // industry applied as a hidden filter that intersected with the new one: on
  // a results page screened to logistics, typing "pharma high margin low debt"
  // produced a correct-looking set of chips and zero companies, with nothing
  // on screen explaining why. Industry moves with the query; the genuine
  // drawer bands (market cap, ROCE, ...) still survive typing.
  const computeScreen = useCallback(
    (text: string) => screenFromTypedQuery(text, urlScreen),
    [urlScreen],
  )
  const screen = useMemo(() => computeScreen(debouncedText), [computeScreen, debouncedText])

  const { results, matchCount } = useMemo(() => runScreen(companies, screen, weights), [screen, weights])

  // Same-view screen edits: sector pill, chip removal, clear all, buckets
  // drawer. Each is a direct click handler calling this synchronously --
  // never an effect -- so it can never race a navigate() triggered by the
  // same interaction (e.g. hitting Enter right as typing settles). replace(),
  // not push(), so refining a screen doesn't bury the back button under one
  // entry per click -- back still steps between the views you actually
  // navigated. Typed text is deliberately NOT auto-committed here while you
  // type; it only reaches the URL when you submit (Run/Enter), which is what
  // `navigate()` does, so there is exactly one writer per keystroke-adjacent
  // action instead of two racing to land last.
  const updateScreen = useCallback(
    (next: ScreenFilters) => {
      const qs = encodeUrlState({ view, ticker: tickerParam, screen: next })
      if (qs === urlString) return
      lastWrittenUrl.current = qs
      router.replace(qs ? `/?${qs}` : "/", { scroll: false })
    },
    [view, tickerParam, urlString, router],
  )

  // Real view transitions. The single writer of router.push() -- never paired
  // with a state write, so there is exactly one thing that can move the app
  // from one view to another. The scroll reset is deliberately NOT in this
  // synchronous block: it's deferred a frame so it never fires in the same
  // tick as the state/URL write that triggers the AnimatePresence swap.
  const navigate = useCallback(
    (params: { view?: View; ticker?: string | null; screen?: ScreenFilters }) => {
      const qs = encodeUrlState({
        view: params.view ?? view,
        ticker: params.ticker ?? null,
        screen: params.screen ?? screen,
      })
      lastWrittenUrl.current = qs
      router.push(qs ? `/?${qs}` : "/", { scroll: false })
      // Deferred one frame so it never runs in the same tick as the URL write
      // that triggers the AnimatePresence swap, and routed through Lenis --
      // a native window.scrollTo leaves Lenis mid-animation at the old offset,
      // and it drags the page back on its next tick. See scrollToTop().
      requestAnimationFrame(scrollToTop)
    },
    [router, view, screen],
  )

  /**
   * Apply a screen built by a visual control (chip removal, sector pill,
   * filters drawer) and drop the query text.
   *
   * A chip can originate either from typed text or from a visual control, and
   * there is no way to partially un-type a sentence -- so rather than trying,
   * the screen is materialised into the URL that represents it exactly and
   * the now-inaccurate query text is cleared. What you see (chips) therefore
   * always equals what is applied, which is the property that makes a
   * natural-language box trustworthy at all.
   *
   * On the landing page this is a view change, not a same-page tweak:
   * staying on landing wrote the sector into the URL, Next/Lenis jumped
   * scroll to the top, and the user had to scroll back down to click Run.
   * Confirmed live (Telecom chip at scrollY 670 → 0, still on landing).
   * Selecting a sector from home now opens the filtered results instead.
   */
  const materialize = useCallback(
    (next: ScreenFilters) => {
      const cleaned = { ...next, text: "" }
      setRawText("")
      setDebouncedText("")
      if (view === "landing") {
        navigate({ view: "results", ticker: null, screen: cleaned })
        return
      }
      updateScreen(cleaned)
    },
    [view, navigate, updateScreen],
  )

  // Emptying the search box is a full reset, not a residual-text edit.
  // Without this, deleting "FMCG high margin under 5000 Cr" character by
  // character left the last-committed URL screen (chips, num=, sectors=)
  // sitting under an empty input -- live count and chips out of sync with
  // what the user just erased.
  const handleQueryChange = useCallback(
    (q: string) => {
      setRawText(q)
      if (!q.trim()) {
        setDebouncedText("")
        const kept = screenAfterClearedSearch(urlScreen)
        if (tickerParam) {
          navigate({ view: "results", ticker: null, screen: kept })
        } else {
          updateScreen(kept)
        }
      }
    },
    [tickerParam, navigate, updateScreen, urlScreen],
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

  // Full wipe: chips, live count, URL params, local text. Zero residual.
  // Detail view drops back to clean results so the user is never stranded
  // on a tear sheet whose screen no longer exists.
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

  // The drawer owns `buckets`; `industry` inside it is mirrored onto the
  // screen's own industries list so both entry points agree.
  const handleBucketsChange = useCallback(
    (buckets: BucketFilters) => materialize({ ...screen, buckets, industries: buckets.industry }),
    [screen, materialize],
  )

  // Reads `rawText` directly rather than the debounced `screen`, so hitting
  // Run/Enter immediately after typing always submits exactly what's in the
  // box -- never a stale pre-debounce value.
  const handleRun = useCallback(
    () => navigate({ view: "results", screen: computeScreen(rawText) }),
    [navigate, computeScreen, rawText],
  )

  // Applying an example screen is literally "type this query and run it" --
  // same parser, same screener, no private code path.
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
