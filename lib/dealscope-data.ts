import companiesData from "@/data/companies.json"
import dealsData from "@/data/deals.json"
import newsData from "@/data/news.json"

export interface Weights {
  revenueGrowth: number
  ebitdaMargin: number
  roce: number
  debtLevel: number
}

export const DEFAULT_WEIGHTS: Weights = {
  revenueGrowth: 25,
  ebitdaMargin: 25,
  roce: 25,
  debtLevel: 25,
}

// ---------------------------------------------------------------------------
// Range filters -- separate from weights. Weights control ranking; these
// control which companies show up at all. Filtering is done on the same four
// sector-relative factor scores (0-100) shown as score rings in results, so a
// filter reads directly off the numbers the user already sees. debtLevel is
// "higher = healthier (lower debt)", consistent with the factor everywhere.
// ---------------------------------------------------------------------------

export interface FactorRange {
  min: number
  max: number
}

export interface RangeFilters {
  revenueGrowth: FactorRange
  ebitdaMargin: FactorRange
  roce: FactorRange
  debtLevel: FactorRange
}

export const DEFAULT_RANGE_FILTERS: RangeFilters = {
  revenueGrowth: { min: 0, max: 100 },
  ebitdaMargin: { min: 0, max: 100 },
  roce: { min: 0, max: 100 },
  debtLevel: { min: 0, max: 100 },
}

// A range is "active" only when it actually narrows the 0-100 span.
export function isRangeActive(r: FactorRange): boolean {
  return r.min > 0 || r.max < 100
}

export function countActiveRangeFilters(f: RangeFilters): number {
  return (Object.keys(f) as (keyof RangeFilters)[]).reduce(
    (n, key) => n + (isRangeActive(f[key]) ? 1 : 0),
    0,
  )
}

function passesRangeFilters(company: Company, filters: RangeFilters): boolean {
  return (Object.keys(filters) as (keyof RangeFilters)[]).every((key) => {
    const { min, max } = filters[key]
    const v = company.factors[key]
    return v >= min && v <= max
  })
}

export interface ComparableDeal {
  target: string
  acquirer: string
  year: string
  value: string
}

export interface Company {
  name: string
  ticker: string
  sector: string // display name, e.g. "Industrials & Auto"
  sectorKey: string // raw EY-bucket key used to match comparable deals, e.g. "Industrials and Auto"
  /* Factor scores, 0-100, sector-relative. debtLevel: higher = healthier (lower debt) */
  factors: Weights
  metrics: {
    revenue: string // TTM revenue
    revenueGrowth: string
    ebitdaMargin: string
    roce: string
    totalDebt: string
  }
  valuation: {
    evEbitda: string
    peImplied: string
    note: string
  }
  rationale: string
  hasRationale: boolean
}

export interface Sector {
  name: string
  count: number
}

// ---------------------------------------------------------------------------
// Formatting helpers -- raw values from data/companies.json are plain rupees
// / plain percentages; these turn them into the display strings the UI uses
// ("₹1,234 Cr", "12.9%", etc).
// ---------------------------------------------------------------------------

function isNum(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v)
}

function formatCr(value: number | null | undefined): string {
  if (!isNum(value)) return "N/A"
  return `₹${Math.round(value / 1e7).toLocaleString("en-IN")} Cr`
}

function formatPct(value: number | null | undefined): string {
  if (!isNum(value)) return "N/A"
  return `${value.toFixed(1)}%`
}

function formatFactor(value: number | null | undefined): number {
  if (!isNum(value)) return 0
  return Math.round(value)
}

function formatRange(low: number | null | undefined, high: number | null | undefined): string {
  if (!isNum(low) || !isNum(high)) return "N/A"
  return `${formatCr(low)} – ${formatCr(high)}`
}

// ---------------------------------------------------------------------------
// Raw record shapes -- match data/companies.json and data/deals.json exactly
// (produced by export_for_frontend.py from the real scoring/valuation engine)
// ---------------------------------------------------------------------------

interface CompanyRecord {
  ticker: string
  name: string
  sector: string
  sector_display: string
  revenue: number | null
  ebitda: number | null
  ebitda_margin_pct: number | null
  revenue_growth_pct: number | null
  roce_pct: number | null
  total_debt: number | null
  market_cap: number | null
  net_income: number | null
  factor_revenue_growth: number | null
  factor_ebitda_margin: number | null
  factor_roce: number | null
  factor_debt_level: number | null
  ev_ebitda_low: number | null
  ev_ebitda_high: number | null
  pe_implied_low: number | null
  pe_implied_high: number | null
  valuation_note: string | null
  as_of_date: string
  rationale: string | null
}

export interface DealRow {
  target: string
  acquirer: string
  sector_raw: string
  ey_bucket: string
  deal_type: string
  deal_value_usdm: number | null
  stake_pct: number | null
  report_year: number
}

function mapCompanyRecord(r: CompanyRecord): Company {
  return {
    name: r.name,
    ticker: r.ticker,
    sector: r.sector_display,
    sectorKey: r.sector,
    factors: {
      revenueGrowth: formatFactor(r.factor_revenue_growth),
      ebitdaMargin: formatFactor(r.factor_ebitda_margin),
      roce: formatFactor(r.factor_roce),
      debtLevel: formatFactor(r.factor_debt_level),
    },
    metrics: {
      revenue: formatCr(r.revenue),
      revenueGrowth: formatPct(r.revenue_growth_pct),
      ebitdaMargin: formatPct(r.ebitda_margin_pct),
      roce: formatPct(r.roce_pct),
      totalDebt: formatCr(r.total_debt),
    },
    valuation: {
      evEbitda: formatRange(r.ev_ebitda_low, r.ev_ebitda_high),
      peImplied: formatRange(r.pe_implied_low, r.pe_implied_high),
      note: r.valuation_note ?? "",
    },
    rationale: r.rationale ?? "AI rationale has not been generated for this company yet.",
    hasRationale: Boolean(r.rationale),
  }
}

// ---------------------------------------------------------------------------
// Data access -- everything is a bundled local JSON file, no network call,
// no database, no account. Computed once and memoized module-side since the
// underlying data never changes at runtime.
// ---------------------------------------------------------------------------

const ALL_COMPANIES: Company[] = (companiesData as CompanyRecord[]).map(mapCompanyRecord)
const ALL_DEALS: DealRow[] = dealsData as DealRow[]

const ALL_SECTORS: Sector[] = (() => {
  const counts = new Map<string, number>()
  for (const c of ALL_COMPANIES) {
    counts.set(c.sector, (counts.get(c.sector) ?? 0) + 1)
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})()

const DATA_AS_OF: string = (companiesData as CompanyRecord[])[0]?.as_of_date ?? ""

export function getCompanies(): { companies: Company[]; sectors: Sector[]; dataAsOf: string } {
  return { companies: ALL_COMPANIES, sectors: ALL_SECTORS, dataAsOf: DATA_AS_OF }
}

export function getDeals(): DealRow[] {
  return ALL_DEALS
}

// ---------------------------------------------------------------------------
// Company news / filings -- read from data/news.json. The file is optional and
// may arrive in either shape, so the loader tolerates both:
//   { "TICKER": { filings, bseNotices, news }, ... }   (object keyed by ticker)
//   [ { ticker, filings, bseNotices, news }, ... ]     (array of entries)
// Any missing section resolves to an empty array so the UI shows honest empty
// states rather than crashing.
// ---------------------------------------------------------------------------

export interface NseFiling {
  category: string
  date: string
  link: string
}

export interface BseNotice {
  title: string
  date: string
  link: string
}

export interface NewsItem {
  headline: string
  source: string
  date: string
  link: string
}

export interface CompanyNews {
  filings: NseFiling[]
  bseNotices: BseNotice[]
  news: NewsItem[]
}

const EMPTY_NEWS: CompanyNews = { filings: [], bseNotices: [], news: [] }

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function normalizeNewsEntry(raw: unknown): CompanyNews {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    filings: toArray<NseFiling>(r.filings),
    bseNotices: toArray<BseNotice>(r.bseNotices),
    news: toArray<NewsItem>(r.news),
  }
}

const NEWS_BY_TICKER: Map<string, CompanyNews> = (() => {
  const map = new Map<string, CompanyNews>()
  const raw = newsData as unknown

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const ticker = (entry as { ticker?: string })?.ticker
      if (ticker) map.set(ticker, normalizeNewsEntry(entry))
    }
  } else if (raw && typeof raw === "object") {
    for (const [ticker, entry] of Object.entries(raw as Record<string, unknown>)) {
      map.set(ticker, normalizeNewsEntry(entry))
    }
  }

  return map
})()

export function getNewsForTicker(ticker: string): CompanyNews {
  return NEWS_BY_TICKER.get(ticker) ?? EMPTY_NEWS
}

export function comparablesForSector(sectorKey: string, deals: DealRow[]): ComparableDeal[] {
  return deals
    .filter((d) => d.ey_bucket === sectorKey)
    .sort((a, b) => (b.report_year ?? 0) - (a.report_year ?? 0))
    .slice(0, 5)
    .map((d) => ({
      target: d.target,
      acquirer: d.acquirer,
      year: d.report_year ? String(d.report_year) : "N/A",
      value: isNum(d.deal_value_usdm) ? `US$${d.deal_value_usdm.toLocaleString("en-IN")}m` : "N/A",
    }))
}

// ---------------------------------------------------------------------------
// Scoring / search -- pure client-side math, unchanged. Operates on whatever
// company list is passed in (the full bundled set).
// ---------------------------------------------------------------------------

export function computeScore(factors: Weights, weights: Weights): number {
  const total = weights.revenueGrowth + weights.ebitdaMargin + weights.roce + weights.debtLevel
  if (total === 0) return 0
  const raw =
    factors.revenueGrowth * weights.revenueGrowth +
    factors.ebitdaMargin * weights.ebitdaMargin +
    factors.roce * weights.roce +
    factors.debtLevel * weights.debtLevel
  return Math.round(raw / total)
}

export function sectorAverage(companies: Company[], sector: string, weights: Weights): number {
  const peers = companies.filter((c) => c.sector === sector)
  if (peers.length === 0) return 0
  const sum = peers.reduce((acc, c) => acc + computeScore(c.factors, weights), 0)
  return Math.round(sum / peers.length)
}

export const FACTOR_LABELS: {
  key: keyof Weights
  label: string
  metricKey: keyof Company["metrics"]
  explainer: string
}[] = [
  {
    key: "revenueGrowth",
    label: "Revenue Growth",
    metricKey: "revenueGrowth",
    explainer: "How fast sales are growing compared to other companies in the same sector.",
  },
  {
    key: "ebitdaMargin",
    label: "EBITDA Margin",
    metricKey: "ebitdaMargin",
    explainer:
      "Operating profit kept from every ₹100 of revenue, before interest, tax, depreciation and amortization.",
  },
  {
    key: "roce",
    label: "ROCE",
    metricKey: "roce",
    explainer:
      "How efficiently the company turns capital invested in the business into profit — higher is better.",
  },
  {
    key: "debtLevel",
    label: "Debt Level",
    metricKey: "totalDebt",
    explainer: "Total borrowed money on the books — lower debt scores higher.",
  },
]

export interface SearchOutcome {
  results: Company[]
  /**
   * True when a non-empty free-text query matched nothing and we fell back to
   * the base set. The UI uses this (together with queryHasNumericIntent) to warn
   * that free text only searches name / ticker / sector -- not numeric fields.
   */
  queryFellBack: boolean
}

export function searchCompaniesDetailed(
  companies: Company[],
  query: string,
  sectors: string[],
  weights: Weights,
  filters?: RangeFilters,
): SearchOutcome {
  const q = query.trim().toLowerCase()

  // Hard constraints first: sector chips + range filters define the base set.
  // A query then searches WITHIN that base, and a no-match query falls back to
  // the base -- never back to the full universe, so range filters always hold.
  let base = companies
  if (sectors.length > 0) {
    base = base.filter((c) => sectors.includes(c.sector))
  }
  if (filters) {
    base = base.filter((c) => passesRangeFilters(c, filters))
  }

  let results = base
  let queryFellBack = false
  if (q.length > 0) {
    const tokens = q.split(/\s+/)
    const matched = base.filter((c) => {
      const haystack = `${c.name} ${c.ticker} ${c.sector}`.toLowerCase()
      return tokens.some((t) => haystack.includes(t))
    })
    if (matched.length === 0) {
      results = base
      queryFellBack = true
    } else {
      results = matched
    }
  }

  const sorted = [...results].sort(
    (a, b) => computeScore(b.factors, weights) - computeScore(a.factors, weights),
  )
  return { results: sorted, queryFellBack }
}

export function searchCompanies(
  companies: Company[],
  query: string,
  sectors: string[],
  weights: Weights,
  filters?: RangeFilters,
): Company[] {
  return searchCompaniesDetailed(companies, query, sectors, weights, filters).results
}

// The free-text box does substring matching on name / ticker / sector only --
// it has no numeric parsing. These flags let the UI point such queries at the
// Range Filters panel instead of leaving the user to wonder why a numeric query
// returned a broad, unfiltered-looking set.
//
// Comparison / unit words ("above", "over", "crores", ">") are a *strong*
// signal of numeric intent: they almost never appear in company names, so we
// trust them even when substring noise produced matches (e.g. "IT company
// revenue above 500 crores" still substring-matches ~1900 names via "it").
// Bare digits are a *weak* signal -- tickers and names carry them ("3M India",
// "360 One", "5paisa") -- so a digit-only query only warrants the hint when it
// actually matched nothing and fell back to the base set.
const COMPARISON_INTENT_RE =
  /\b(above|over|below|under|greater|less|least|more|between|minimum|maximum|crore|crores|lakh)\b|[<>]/i
const DIGIT_RE = /\d/

export function queryHasComparisonIntent(query: string): boolean {
  return COMPARISON_INTENT_RE.test(query)
}

export function queryHasNumericIntent(query: string): boolean {
  return DIGIT_RE.test(query) || COMPARISON_INTENT_RE.test(query)
}

// ---------------------------------------------------------------------------
// Example scenarios -- unlike a plain text query, each sets a sector AND real
// range filters, then runs, demonstrating that the filters actually narrow the
// set. Counts are computed live from the same passesRangeFilters() used by
// search, so a card's number always equals what the results page will show.
// ---------------------------------------------------------------------------

export interface ExampleScenario {
  id: string
  label: string
  description: string
  sector: string // matches Company.sector (display name)
  filters: RangeFilters
}

function makeFilters(part: Partial<RangeFilters>): RangeFilters {
  return {
    revenueGrowth: part.revenueGrowth ?? { ...DEFAULT_RANGE_FILTERS.revenueGrowth },
    ebitdaMargin: part.ebitdaMargin ?? { ...DEFAULT_RANGE_FILTERS.ebitdaMargin },
    roce: part.roce ?? { ...DEFAULT_RANGE_FILTERS.roce },
    debtLevel: part.debtLevel ?? { ...DEFAULT_RANGE_FILTERS.debtLevel },
  }
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: "pharma-quality",
    label: "Pharma · high ROCE · low debt",
    description: "Lifesciences names in the top tier on capital returns and balance-sheet strength.",
    sector: "Lifesciences",
    filters: makeFilters({ roce: { min: 60, max: 100 }, debtLevel: { min: 60, max: 100 } }),
  },
  {
    id: "tech-growth",
    label: "Tech · high growth · low leverage",
    description: "Technology compounding revenue without loading up on debt.",
    sector: "Technology",
    filters: makeFilters({ revenueGrowth: { min: 60, max: 100 }, debtLevel: { min: 60, max: 100 } }),
  },
  {
    id: "financials-returns",
    label: "Financials · rich margins · strong returns",
    description: "Financial Services with sector-leading EBITDA margin and ROCE.",
    sector: "Financial Services",
    filters: makeFilters({ ebitdaMargin: { min: 60, max: 100 }, roce: { min: 50, max: 100 } }),
  },
]

export function countScenario(companies: Company[], scenario: ExampleScenario): number {
  return companies.filter(
    (c) => c.sector === scenario.sector && passesRangeFilters(c, scenario.filters),
  ).length
}
