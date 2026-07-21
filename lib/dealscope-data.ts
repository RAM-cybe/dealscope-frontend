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

// Real-value bucket filters. Eight financial fields, each split into buckets
// whose boundaries are grounded in the real distribution across the full
// company dataset. Two interaction styles: multi-select pills (marketCap,
// promoterPledge) store an array of selected bucket keys; single-select
// segmented controls (the rest) store one key or null.

export type BucketFieldKey =
  | "marketCap"
  | "peRatio"
  | "revenueGrowth"
  | "ebitdaMargin"
  | "roce"
  | "roe"
  | "debtLevel"
  | "promoterPledge"

export interface Bucket {
  key: string
  name: string // "Small", "Value", "Excellent"
  range: string // real-unit range, e.g. "< ₹700 Cr", "12–28%", "> 51x"
  match: (v: number) => boolean
}

export interface BucketFieldDef {
  key: BucketFieldKey
  label: string
  select: "multi" | "single"
  getValue: (c: Company) => number | null
  buckets: Bucket[]
}

export const BUCKET_FIELDS: BucketFieldDef[] = [
  {
    key: "marketCap",
    label: "Market Cap",
    select: "multi",
    getValue: (c) => c.raw.marketCap,
    buckets: [
      { key: "small", name: "Small", range: "< ₹700 Cr", match: (v) => v < 700 },
      { key: "mid", name: "Mid", range: "₹700–2,900 Cr", match: (v) => v >= 700 && v < 2900 },
      { key: "large", name: "Large", range: "₹2,900–13,000 Cr", match: (v) => v >= 2900 && v < 13000 },
      { key: "mega", name: "Mega", range: "> ₹13,000 Cr", match: (v) => v >= 13000 },
    ],
  },
  {
    key: "peRatio",
    label: "P/E Ratio",
    select: "single",
    getValue: (c) => c.raw.peRatio,
    buckets: [
      { key: "value", name: "Value", range: "< 16x", match: (v) => v < 16 },
      { key: "moderate", name: "Moderate", range: "16–29x", match: (v) => v >= 16 && v < 29 },
      { key: "growth", name: "Growth", range: "29–51x", match: (v) => v >= 29 && v < 51 },
      { key: "premium", name: "Premium", range: "> 51x", match: (v) => v >= 51 },
    ],
  },
  {
    key: "revenueGrowth",
    label: "Revenue Growth",
    select: "single",
    getValue: (c) => c.raw.revenueGrowth,
    buckets: [
      { key: "declining", name: "Declining", range: "< 0%", match: (v) => v < 0 },
      { key: "flat", name: "Flat", range: "0–12%", match: (v) => v >= 0 && v < 12 },
      { key: "growing", name: "Growing", range: "12–28%", match: (v) => v >= 12 && v < 28 },
      { key: "highGrowth", name: "High Growth", range: "> 28%", match: (v) => v >= 28 },
    ],
  },
  {
    key: "ebitdaMargin",
    label: "EBITDA Margin",
    select: "single",
    getValue: (c) => c.raw.ebitdaMargin,
    buckets: [
      { key: "thin", name: "Thin", range: "< 6%", match: (v) => v < 6 },
      { key: "moderate", name: "Moderate", range: "6–12%", match: (v) => v >= 6 && v < 12 },
      { key: "healthy", name: "Healthy", range: "12–20%", match: (v) => v >= 12 && v < 20 },
      { key: "high", name: "High", range: "> 20%", match: (v) => v >= 20 },
    ],
  },
  {
    key: "roce",
    label: "ROCE",
    select: "single",
    getValue: (c) => c.raw.roce,
    buckets: [
      { key: "weak", name: "Weak", range: "< 6%", match: (v) => v < 6 },
      { key: "average", name: "Average", range: "6–13%", match: (v) => v >= 6 && v < 13 },
      { key: "strong", name: "Strong", range: "13–19%", match: (v) => v >= 13 && v < 19 },
      { key: "excellent", name: "Excellent", range: "> 19%", match: (v) => v >= 19 },
    ],
  },
  {
    key: "roe",
    label: "ROE",
    select: "single",
    getValue: (c) => c.raw.roe,
    buckets: [
      { key: "weak", name: "Weak", range: "< 5%", match: (v) => v < 5 },
      { key: "average", name: "Average", range: "5–11%", match: (v) => v >= 5 && v < 11 },
      { key: "strong", name: "Strong", range: "11–17%", match: (v) => v >= 11 && v < 17 },
      { key: "excellent", name: "Excellent", range: "> 17%", match: (v) => v >= 17 },
    ],
  },
  {
    // Low debt reads as favorable, consistent with the "higher = healthier"
    // debtLevel factor convention -- but here we filter the real ₹ Cr figure.
    key: "debtLevel",
    label: "Debt Level",
    select: "single",
    getValue: (c) => c.raw.totalDebt,
    buckets: [
      { key: "low", name: "Low", range: "< ₹40 Cr", match: (v) => v < 40 },
      { key: "moderate", name: "Moderate", range: "₹40–210 Cr", match: (v) => v >= 40 && v < 210 },
      { key: "elevated", name: "Elevated", range: "₹210–935 Cr", match: (v) => v >= 210 && v < 935 },
      { key: "high", name: "High", range: "> ₹935 Cr", match: (v) => v >= 935 },
    ],
  },
  {
    key: "promoterPledge",
    label: "Promoter Pledge",
    select: "multi",
    getValue: (c) => c.raw.promoterPledge,
    buckets: [
      { key: "none", name: "None", range: "0%", match: (v) => v === 0 },
      { key: "low", name: "Low", range: "0–10%", match: (v) => v > 0 && v <= 10 },
      { key: "elevated", name: "Elevated", range: "> 10%", match: (v) => v > 10 },
    ],
  },
]

const BUCKET_FIELD_BY_KEY = Object.fromEntries(BUCKET_FIELDS.map((f) => [f.key, f])) as Record<
  BucketFieldKey,
  BucketFieldDef
>

export interface BucketFilters {
  marketCap: string[] // multi-select
  promoterPledge: string[] // multi-select
  revenueGrowth: string | null // single-select
  ebitdaMargin: string | null
  roce: string | null
  roe: string | null
  debtLevel: string | null
  peRatio: string | null
}

export const DEFAULT_BUCKET_FILTERS: BucketFilters = {
  marketCap: [],
  promoterPledge: [],
  revenueGrowth: null,
  ebitdaMargin: null,
  roce: null,
  roe: null,
  debtLevel: null,
  peRatio: null,
}

function isFieldActive(sel: string[] | string | null): boolean {
  return Array.isArray(sel) ? sel.length > 0 : sel !== null
}

export function countActiveBucketFilters(f: BucketFilters): number {
  return (Object.keys(f) as BucketFieldKey[]).reduce((n, key) => n + (isFieldActive(f[key]) ? 1 : 0), 0)
}

// A company passes a field's constraint if its real value falls within (any of)
// the selected bucket(s). A field with no selection never constrains. A missing
// value (null) never falls in any bucket, so such a company is simply excluded
// once that field is filtered -- it never crashes or defaults into a bucket.
function passesField(company: Company, def: BucketFieldDef, selection: string[] | string | null): boolean {
  const keys = Array.isArray(selection) ? selection : selection ? [selection] : []
  if (keys.length === 0) return true
  const v = def.getValue(company)
  if (v == null) return false
  return keys.some((k) => {
    const bucket = def.buckets.find((b) => b.key === k)
    return bucket ? bucket.match(v) : false
  })
}

export function passesBucketFilters(company: Company, filters: BucketFilters): boolean {
  return (Object.keys(filters) as BucketFieldKey[]).every((key) =>
    passesField(company, BUCKET_FIELD_BY_KEY[key], filters[key]),
  )
}

export function filterCompanies(companies: Company[], filters: BucketFilters): Company[] {
  return companies.filter((c) => passesBucketFilters(c, filters))
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
  financials: {
    marketCap: string
    marketCapAsOf: string | null
    peRatio: string
    priceToBook: string
    roe: string
    debtToEquity: string
    currentRatio: string
    freeCashFlow: string
    promoterPledge: string
    beta: string
  }
  // Unformatted numeric values for real-value bucket filtering. Currency fields
  // are in ₹ Cr, percentages are plain (e.g. 14.8), ratios are plain (e.g. 63.3).
  // null = missing, so such a company never falls inside any bucket for that field.
  raw: {
    marketCap: number | null // ₹ Cr
    peRatio: number | null
    revenueGrowth: number | null // %
    ebitdaMargin: number | null // %
    roce: number | null // %
    roe: number | null // %
    totalDebt: number | null // ₹ Cr
    promoterPledge: number | null // %
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
  // Extended fundamentals (Part 1) -- real values for every company.
  trailing_pe: number | null
  price_to_book: number | null
  return_on_equity_pct: number | null
  debt_to_equity: number | null
  current_ratio: number | null
  free_cash_flow: number | null
  promoter_pledge_pct: number | null
  beta: number | null
  market_cap_as_of: string | null
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
    financials: {
      marketCap: formatCr(r.market_cap),
      marketCapAsOf: r.market_cap_as_of,
      peRatio: r.trailing_pe != null ? r.trailing_pe.toFixed(1) + "x" : "N/A",
      priceToBook: r.price_to_book != null ? r.price_to_book.toFixed(1) + "x" : "N/A",
      roe: formatPct(r.return_on_equity_pct),
      debtToEquity: r.debt_to_equity != null ? r.debt_to_equity.toFixed(2) + "x" : "N/A",
      currentRatio: r.current_ratio != null ? r.current_ratio.toFixed(2) + "x" : "N/A",
      freeCashFlow: formatCr(r.free_cash_flow),
      promoterPledge: formatPct(r.promoter_pledge_pct),
      beta: r.beta != null ? r.beta.toFixed(2) : "N/A",
    },
    raw: {
      marketCap: isNum(r.market_cap) ? r.market_cap / 1e7 : null,
      peRatio: isNum(r.trailing_pe) ? r.trailing_pe : null,
      revenueGrowth: isNum(r.revenue_growth_pct) ? r.revenue_growth_pct : null,
      ebitdaMargin: isNum(r.ebitda_margin_pct) ? r.ebitda_margin_pct : null,
      roce: isNum(r.roce_pct) ? r.roce_pct : null,
      roe: isNum(r.return_on_equity_pct) ? r.return_on_equity_pct : null,
      totalDebt: isNum(r.total_debt) ? r.total_debt / 1e7 : null,
      promoterPledge: isNum(r.promoter_pledge_pct) ? r.promoter_pledge_pct : null,
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

// ---------------------------------------------------------------------------
// Free-text search matching. Extended 2026-07-20 from a single flat
// "does any token substring-match name+ticker+sector" pass. That original pass
// was already case-insensitive, whitespace-split and multi-field, but it was
// pure OR -- so "tata motors" returned every company matching "tata" OR
// "motors" -- had no typo tolerance, and ranked purely by composite score, so
// searching an exact ticker could bury that company far down the list.
// ---------------------------------------------------------------------------

/** Lowercase, unify "&"/"and", strip punctuation, collapse whitespace, so
 *  "M&M", "M & M" and "m and m" all normalize to the same thing. */
function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Levenshtein distance, bailing out early once it exceeds `max` (we only ever
 *  care whether a token is *within* a small distance, never the exact value). */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > max) return max + 1
    prev = curr
  }
  return prev[b.length]
}

/** Typo tolerance scaled to token length -- 1 edit for medium words, 2 for long
 *  ones, and none below 4 characters (at 3 chars or fewer, an edit-distance-1
 *  match is mostly noise: "tcs" would fuzzily match "tata", "ics", "tvs"...). */
function fuzzyTokenMatches(token: string, words: string[]): boolean {
  if (token.length < 4) return false
  const max = token.length >= 7 ? 2 : 1
  return words.some((w) => w.length >= 3 && editDistance(token, w, max) <= max)
}

/** One token against one company's text. Tokens of 1-2 characters must match a
 *  WHOLE word, not a substring: normalizing "M&M" yields the tokens ["m","and",
 *  "m"], and a bare substring test for "m" matches roughly half the universe
 *  (any name containing the letter m), which swamped the results. Longer tokens
 *  keep substring matching so "pharma" still finds "AARTIPHARM". */
function tokenMatches(token: string, haystack: string, words: string[]): boolean {
  return token.length <= 2 ? words.includes(token) : haystack.includes(token)
}

/** Relevance tier for one company against one query. Lower is better;
 *  null means no match at all. Tiers are evaluated cheapest-first. */
function matchTier(company: Company, q: string, tokens: string[]): number | null {
  const ticker = normalizeForSearch(company.ticker)
  const name = normalizeForSearch(company.name)
  const sector = normalizeForSearch(company.sector)
  const haystack = `${name} ${ticker} ${sector}`
  const words = haystack.split(" ")

  if (ticker === q) return 0 // exact ticker -- always the top hit
  if (ticker.startsWith(q) || name.startsWith(q)) return 1
  if (tokens.every((t) => tokenMatches(t, haystack, words))) return 2 // ALL tokens
  if (tokens.every((t) => tokenMatches(t, haystack, words) || fuzzyTokenMatches(t, words))) return 3

  return null
}

export function searchCompaniesDetailed(
  companies: Company[],
  query: string,
  sectors: string[],
  weights: Weights,
  filters?: BucketFilters,
): SearchOutcome {
  const q = normalizeForSearch(query)

  // Hard constraints first: sector chips + bucket filters define the base set.
  // A query then searches WITHIN that base, and a no-match query falls back to
  // the base -- never back to the full universe, so bucket filters always hold.
  let base = companies
  if (sectors.length > 0) {
    base = base.filter((c) => sectors.includes(c.sector))
  }
  if (filters) {
    base = base.filter((c) => passesBucketFilters(c, filters))
  }

  let results = base
  let queryFellBack = false
  let ranked: { company: Company; tier: number }[] | null = null

  if (q.length > 0) {
    const tokens = q.split(" ").filter(Boolean)

    // Precise pass: exact ticker / prefix / all-tokens / all-tokens-with-typos.
    const precise: { company: Company; tier: number }[] = []
    for (const c of base) {
      const tier = matchTier(c, q, tokens)
      if (tier !== null) precise.push({ company: c, tier })
    }

    if (precise.length > 0) {
      ranked = precise
    } else {
      // Looser ANY-token pass, preserving the original broad behavior for vague
      // multi-word queries that no single company matches on every token.
      const loose = base.filter((c) => {
        const haystack = normalizeForSearch(`${c.name} ${c.ticker} ${c.sector}`)
        return tokens.some((t) => haystack.includes(t))
      })
      if (loose.length > 0) {
        ranked = loose.map((company) => ({ company, tier: 4 }))
      } else {
        results = base
        queryFellBack = true
      }
    }
  }

  // Rank by match quality first, then composite score within each tier -- so an
  // exact ticker hit leads even if its score is low, while an unfiltered browse
  // (no query) stays purely score-ordered exactly as before.
  const sorted = ranked
    ? ranked
        .sort(
          (a, b) =>
            a.tier - b.tier ||
            computeScore(b.company.factors, weights) - computeScore(a.company.factors, weights),
        )
        .map((r) => r.company)
    : [...results].sort(
        (a, b) => computeScore(b.factors, weights) - computeScore(a.factors, weights),
      )

  return { results: sorted, queryFellBack }
}

export function searchCompanies(
  companies: Company[],
  query: string,
  sectors: string[],
  weights: Weights,
  filters?: BucketFilters,
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
// bucket filters, then runs, demonstrating that the filters actually narrow the
// set. Counts are computed live from the same passesBucketFilters() used by
// search, so a card's number always equals what the results page will show.
// ---------------------------------------------------------------------------

export interface ExampleScenario {
  id: string
  label: string
  description: string
  sector: string // matches Company.sector (display name)
  filters: BucketFilters
}

function makeFilters(part: Partial<BucketFilters>): BucketFilters {
  return { ...DEFAULT_BUCKET_FILTERS, ...part }
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: "pharma-quality",
    label: "Pharma · high ROCE · low debt",
    description: "Lifesciences names in the top tier on capital returns and balance-sheet strength.",
    sector: "Lifesciences",
    filters: makeFilters({ roce: "excellent", debtLevel: "low" }),
  },
  {
    id: "tech-growth",
    label: "Tech · high growth · low leverage",
    description: "Technology compounding revenue without loading up on debt.",
    sector: "Technology",
    filters: makeFilters({ revenueGrowth: "highGrowth", debtLevel: "low" }),
  },
  {
    id: "financials-returns",
    label: "Financials · rich margins · strong returns",
    description: "Financial Services with sector-leading EBITDA margin and returns.",
    sector: "Financial Services",
    filters: makeFilters({ ebitdaMargin: "high", roe: "excellent" }),
  },
]

export function countScenario(companies: Company[], scenario: ExampleScenario): number {
  return companies.filter(
    (c) => c.sector === scenario.sector && passesBucketFilters(c, scenario.filters),
  ).length
}
