import companiesData from "@/data/companies.json"
import dealsData from "@/data/deals.json"
import newsData from "@/data/news.json"
import filterBandsData from "@/data/filter-bands.json"

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

// ---------------------------------------------------------------------------
// Bucket edges for 7 of the 8 fields below are data-driven, read from
// data/filter-bands.json (winsorized p25/p50/p75 across the live company
// universe, written by the backend's compute_filter_bands.py -- see that
// script for the winsorization/rounding methodology). Bundled at build time,
// same static-import pattern as companies.json/deals.json -- no runtime
// fetch. Tier names/count and the field's label/select-mode stay hardcoded
// here (filter-bands.json only supplies the 3 numeric cutpoints + tier
// *keys*); only the numeric edges move when the underlying data does.
//
// promoterPledge is the one exception, left fully hardcoded: its real
// distribution is zero-heavy (most companies report no pledge at all), so
// filter-bands.json's own p25/p50/p75 for it collapse to 0/0/0 -- a
// confirmed, disclosed non-fit for percentile tiering (see the field's
// `note` in the JSON), not an oversight. The existing 3-tier None/Low/
// Elevated categorical split is a real distinction the data supports;
// wiring it to degenerate quartiles would not be.
// ---------------------------------------------------------------------------

interface FilterBandField {
  frontend_key: string
  unit: string
  tiers: string[]
  p25: number
  p50: number
  p75: number
  sample_size: number
  note?: string
}

interface FilterBandsFile {
  generated_at: string
  universe_size: number
  winsorize_percentiles: number[]
  fields: Record<string, FilterBandField>
}

const FILTER_BANDS = filterBandsData as FilterBandsFile

/** "highGrowth" -> "High Growth"; "small" -> "Small". Tier keys in
 *  filter-bands.json are the same camelCase strings as the old hardcoded
 *  bucket keys, just without a separate display name alongside them. */
function tierDisplayName(tierKey: string): string {
  const spaced = tierKey.replace(/([A-Z])/g, " $1")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// Bound (single-sided "< X" / "> X") and range (two-sided "X–Y") formatters
// are separate on purpose: the existing bucket convention puts the unit
// suffix once, at the end of a two-sided range ("₹700–2,900 Cr", "16–29x"),
// not on each side ("₹700 Cr–₹2,900 Cr") -- matching that exactly, not just
// "close enough", since it's copied verbatim from the previous hardcoded
// strings this replaces.
const crFormat = {
  bound: (v: number) => `₹${Math.round(v).toLocaleString("en-IN")} Cr`,
  range: (lo: number, hi: number) => `₹${Math.round(lo).toLocaleString("en-IN")}–${Math.round(hi).toLocaleString("en-IN")} Cr`,
}
const ratioFormat = {
  bound: (v: number) => `${v.toFixed(1)}x`,
  range: (lo: number, hi: number) => `${lo.toFixed(1)}–${hi.toFixed(1)}x`,
}
const pctFormat = {
  bound: (v: number) => `${v.toFixed(1)}%`,
  range: (lo: number, hi: number) => `${lo.toFixed(1)}–${hi.toFixed(1)}%`,
}

interface DataDrivenFieldSpec {
  key: Exclude<BucketFieldKey, "promoterPledge">
  label: string
  select: "multi" | "single"
  getValue: (c: Company) => number | null
  backendKey: string // key into FILTER_BANDS.fields
  format: { bound: (v: number) => string; range: (lo: number, hi: number) => string }
}

const DATA_DRIVEN_FIELD_SPECS: DataDrivenFieldSpec[] = [
  { key: "marketCap", label: "Market Cap", select: "multi", getValue: (c) => c.raw.marketCap, backendKey: "market_cap", format: crFormat },
  { key: "peRatio", label: "P/E Ratio", select: "single", getValue: (c) => c.raw.peRatio, backendKey: "trailing_pe", format: ratioFormat },
  { key: "revenueGrowth", label: "Revenue Growth", select: "single", getValue: (c) => c.raw.revenueGrowth, backendKey: "revenue_growth_pct", format: pctFormat },
  { key: "ebitdaMargin", label: "EBITDA Margin", select: "single", getValue: (c) => c.raw.ebitdaMargin, backendKey: "ebitda_margin_pct", format: pctFormat },
  { key: "roce", label: "ROCE", select: "single", getValue: (c) => c.raw.roce, backendKey: "return_on_capital_employed_pct", format: pctFormat },
  { key: "roe", label: "ROE", select: "single", getValue: (c) => c.raw.roe, backendKey: "return_on_equity_pct", format: pctFormat },
  {
    // Low debt reads as favorable, consistent with the "higher = healthier"
    // debtLevel factor convention -- but here we filter the real ₹ Cr figure.
    key: "debtLevel",
    label: "Debt Level",
    select: "single",
    getValue: (c) => c.raw.totalDebt,
    backendKey: "total_debt",
    format: crFormat,
  },
]

/** 4 half-open bands from 3 ascending cutpoints: [< c0], [c0, c1), [c1, c2),
 *  [c2, ∞) -- same boundary convention (upper-exclusive except the last
 *  band) as the previous hardcoded buckets. */
function buildDataDrivenBuckets(spec: DataDrivenFieldSpec, band: FilterBandField): Bucket[] {
  const cuts = [band.p25, band.p50, band.p75]
  return band.tiers.map((tierKey, i) => {
    const lo = i === 0 ? null : cuts[i - 1]
    const hi = i === band.tiers.length - 1 ? null : cuts[i]
    const range =
      lo === null ? `< ${spec.format.bound(hi as number)}` : hi === null ? `> ${spec.format.bound(lo)}` : spec.format.range(lo, hi)
    return {
      key: tierKey,
      name: tierDisplayName(tierKey),
      range,
      match: (v: number) => (lo === null || v >= lo) && (hi === null || v < hi),
    }
  })
}

function buildDataDrivenField(spec: DataDrivenFieldSpec): BucketFieldDef {
  const band = FILTER_BANDS.fields[spec.backendKey]
  if (!band) {
    // filter-bands.json is generated alongside companies.json by the same
    // backend export -- a missing field means that export broke, not a
    // recoverable runtime state. Warn loudly in dev, degrade to "no buckets"
    // (field never constrains) rather than crash the whole app.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`filter-bands.json has no entry for "${spec.backendKey}" -- ${spec.key} filter will not constrain anything.`)
    }
    return { key: spec.key, label: spec.label, select: spec.select, getValue: spec.getValue, buckets: [] }
  }
  if (process.env.NODE_ENV !== "production" && !(band.p25 < band.p50 && band.p50 < band.p75)) {
    console.warn(
      `filter-bands.json field "${spec.backendKey}" has non-ascending cutpoints ` +
        `(p25=${band.p25}, p50=${band.p50}, p75=${band.p75}) -- buckets may overlap or be empty.`,
    )
  }
  return {
    key: spec.key,
    label: spec.label,
    select: spec.select,
    getValue: spec.getValue,
    buckets: buildDataDrivenBuckets(spec, band),
  }
}

export const BUCKET_FIELDS: BucketFieldDef[] = [
  ...DATA_DRIVEN_FIELD_SPECS.map(buildDataDrivenField),
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
  // Exact-match multi-select over the ~123 raw industry labels -- doesn't fit
  // BUCKET_FIELDS' numeric-range abstraction (Bucket.match(v: number)), so
  // it's handled as its own field rather than forced into that shape.
  industry: string[]
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
  industry: [],
}

function isFieldActive(sel: string[] | string | null): boolean {
  return Array.isArray(sel) ? sel.length > 0 : sel !== null
}

export function countActiveBucketFilters(f: BucketFilters): number {
  const numericCount = BUCKET_FIELDS.reduce((n, def) => n + (isFieldActive(f[def.key]) ? 1 : 0), 0)
  return numericCount + (f.industry.length > 0 ? 1 : 0)
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
  const passesNumeric = BUCKET_FIELDS.every((def) => passesField(company, def, filters[def.key]))
  const passesIndustry =
    filters.industry.length === 0 || (company.industry !== null && filters.industry.includes(company.industry))
  return passesNumeric && passesIndustry
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
  // Granular yfinance-sourced fields, alongside the 6-bucket EY sector above.
  // null for the ~74/2,046 companies missing them upstream.
  industry: string | null // e.g. "Specialty Chemicals" (one of 123 distinct values)
  sectorRaw: string | null // Yahoo's own 11-value sector taxonomy, e.g. "Basic Materials"
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
  // Factual "what this company does" -- null until the AI content batch has
  // processed this company. No fallback-to-something-else here: unlike
  // whyThisScore below, there's no older field to fall back to for this one.
  about: string | null
  hasAbout: boolean
  // The score explanation shown under "Why This Score". Prefers the new
  // why_this_score field; falls back to the older single-field `rationale`
  // for companies processed before the about/why_this_score split (or not
  // yet reprocessed) so real, already-generated content never reads as
  // "awaiting generation" just because it's sitting under the old field
  // name. null only when neither exists.
  whyThisScore: string | null
  hasWhyThisScore: boolean
}

export interface Sector {
  name: string
  count: number
}

export interface IndustryOption {
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

// Guards the JSON trust boundary for the AI-content fields specifically.
// export_for_frontend.py's cache reader was, until recently, still assigning
// the *whole* {rationale, about, why_this_score} cache-entry object as the
// value of the old single `rationale` key for any company already
// reprocessed under the new two-field schema -- so `r.rationale` in real
// exported data was an object, not a string, for a large share of
// companies. TypeScript's `string | null` on CompanyRecord only describes
// the intent, not what's actually in the JSON at runtime; rendering that
// object directly in JSX crashed the whole tear sheet with "Objects are not
// valid as a React child". Treat anything that isn't actually a non-empty
// string as absent -- safe regardless of what shape a future data hiccup
// takes, not just this one.
function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
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
  industry: string | null
  sector_raw: string | null
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
  about: string | null
  why_this_score: string | null
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
    industry: r.industry ?? null,
    sectorRaw: r.sector_raw ?? null,
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
    about: asString(r.about),
    hasAbout: Boolean(asString(r.about)),
    whyThisScore: asString(r.why_this_score) ?? asString(r.rationale),
    hasWhyThisScore: Boolean(asString(r.why_this_score) ?? asString(r.rationale)),
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

// Sorted by count so the typeahead's default (pre-search) list leads with the
// most common industries; alphabetical within a tie for stable ordering.
const ALL_INDUSTRIES: IndustryOption[] = (() => {
  const counts = new Map<string, number>()
  for (const c of ALL_COMPANIES) {
    if (c.industry) counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1)
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
})()

const DATA_AS_OF: string = (companiesData as CompanyRecord[])[0]?.as_of_date ?? ""

/** Industry breakdown scoped to a set of broad sectors -- the results page's
 *  drill-down (sector chip -> its granular industries). Deliberately takes
 *  the FULL company list, not an already industry-filtered one: this counts
 *  what's available to narrow into, so selecting one industry can't shrink
 *  the very list used to offer the others. Global (no sectors given) falls
 *  back to the same counts as getCompanies().industries. */
export function getIndustriesForSectors(companies: Company[], sectorNames: string[]): IndustryOption[] {
  const scoped = sectorNames.length > 0 ? companies.filter((c) => sectorNames.includes(c.sector)) : companies
  const counts = new Map<string, number>()
  for (const c of scoped) {
    if (c.industry) counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1)
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
}

export interface IndustryGroup {
  sector: string
  industries: IndustryOption[]
}

/** Full industry breakdown grouped under its parent sector, industries sorted
 *  by count descending within each group -- powers both the always-visible
 *  sector/industry filter (results + landing pages) and the Filters panel's
 *  grouped industry search, so there's one grouping source instead of two.
 *  Groups are ordered the same as `sectors` (count descending, matching the
 *  sector pills everywhere else). Sectors with zero industries (currently
 *  just "Unclassified" -- its companies have no industry data by definition)
 *  are omitted rather than rendered as an empty group. `sectorNames` scopes
 *  which sectors get a group at all (empty = every sector), independent of
 *  the sector-level company counts, same convention as getIndustriesForSectors. */
export function getIndustryGroups(companies: Company[], sectorNames: string[] = []): IndustryGroup[] {
  const scopedSectors = sectorNames.length > 0 ? ALL_SECTORS.filter((s) => sectorNames.includes(s.name)) : ALL_SECTORS
  return scopedSectors
    .map((sector) => ({ sector: sector.name, industries: getIndustriesForSectors(companies, [sector.name]) }))
    .filter((group) => group.industries.length > 0)
}

const ALL_INDUSTRY_GROUPS: IndustryGroup[] = getIndustryGroups(ALL_COMPANIES)

export function getCompanies(): {
  companies: Company[]
  sectors: Sector[]
  industries: IndustryOption[]
  industryGroups: IndustryGroup[]
  dataAsOf: string
} {
  return {
    companies: ALL_COMPANIES,
    sectors: ALL_SECTORS,
    industries: ALL_INDUSTRIES,
    industryGroups: ALL_INDUSTRY_GROUPS,
    dataAsOf: DATA_AS_OF,
  }
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
export function normalizeForSearch(value: string): string {
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

/** One token against one company's text.
 *
 *  Length 1 must match a WHOLE word, not a substring or prefix: normalizing
 *  "M&M" yields the tokens ["m","and","m"], and a bare substring test for "m"
 *  matches roughly half the universe (any name containing the letter m, most
 *  commonly via "Limited"), which swamped the results.
 *
 *  Length 2 matches a word PREFIX rather than requiring the whole word --
 *  typing the first two letters of a name ("re", "ta", "hd"...) is completely
 *  ordinary short/partial input, and the old whole-word-only rule rejected it
 *  outright (e.g. "re" matched nothing in "Reliance", since "reliance" is
 *  never its own whole word). Still anchored to a word boundary, so it can't
 *  regress to the length-1 bug -- "m" as a *prefix* would still match "Motors"
 *  etc. and stays restricted to length 1 for that reason.
 *
 *  Length 3+ keeps substring matching so "pharma" still finds "AARTIPHARM"
 *  and "reli" still finds "Reliance" mid-word matches, not just prefixes. */
function tokenMatches(token: string, haystack: string, words: string[]): boolean {
  if (token.length === 1) return words.includes(token)
  if (token.length === 2) return words.some((w) => w.startsWith(token))
  return haystack.includes(token)
}

// ---------------------------------------------------------------------------
// Per-company search index -- ticker/name/sector normalized once at module
// load instead of on every matchTier() call. Search runs against the full
// universe on every keystroke (see the debounce in dealscope-app.tsx for the
// other half of the fix), so re-running normalizeForSearch's regex chain for
// every company on every call was pure repeated work: name/ticker/sector
// never change at runtime, only the query does.
//
// Job A's granular `industry` field (123 values) was tried here too, folded
// into the same haystack -- reverted after it produced a real false positive:
// "M&M" (tokens ["m","and","m"]) started also matching G.M. Breweries, whose
// industry label "Beverages - Wineries & Distilleries" normalizes to include
// the word "and" via its own "&", combined with the lone "m" in "G.M.".
// Ampersands are common in Yahoo's industry labels, so this wasn't a one-off
// -- any "X & Y"-shaped query risked spurious matches against unrelated
// companies via their industry text. Not worth it: industry wasn't the
// diagnosed cause of any of the four reported problems, so left out.
// ---------------------------------------------------------------------------

interface SearchIndexEntry {
  ticker: string
  name: string
  haystack: string
  words: string[]
}

function buildSearchEntry(company: Company): SearchIndexEntry {
  const ticker = normalizeForSearch(company.ticker)
  const name = normalizeForSearch(company.name)
  const sector = normalizeForSearch(company.sector)
  const haystack = `${name} ${ticker} ${sector}`
  return { ticker, name, haystack, words: haystack.split(" ").filter(Boolean) }
}

const SEARCH_INDEX = new WeakMap<Company, SearchIndexEntry>()
for (const company of ALL_COMPANIES) {
  SEARCH_INDEX.set(company, buildSearchEntry(company))
}

function getSearchEntry(company: Company): SearchIndexEntry {
  const cached = SEARCH_INDEX.get(company)
  if (cached) return cached
  // Defensive fallback, not expected to fire in practice -- every Company
  // that exists is constructed once in mapCompanyRecord() and indexed below
  // right after, so this only matters if that invariant ever changes.
  const entry = buildSearchEntry(company)
  SEARCH_INDEX.set(company, entry)
  return entry
}

/** Relevance tier for one company against one query. Lower is better;
 *  null means no match at all. Tiers are evaluated cheapest-first. */
function matchTier(company: Company, q: string, tokens: string[]): number | null {
  const { ticker, name, haystack, words } = getSearchEntry(company)

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
        const { haystack } = getSearchEntry(c)
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

  // Rank by match quality first. Within a tier, a shorter name is a *tighter*
  // textual match for the same query -- e.g. for "reli", tier-1 name-prefix
  // hits include both "Reliance Power" and "Reliance Industrial
  // Infrastructure Ltd"; without this, composite score alone (unrelated to
  // how well the text matches) could rank either one first, so the obvious
  // "closest" match wasn't reliably on top. Composite score remains the
  // final tiebreaker for same-tier, same-length ties, and the sole ordering
  // for an unfiltered browse (no query) exactly as before.
  const sorted = ranked
    ? ranked
        .sort(
          (a, b) =>
            a.tier - b.tier ||
            a.company.name.length - b.company.name.length ||
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

// ---------------------------------------------------------------------------
// URL <-> local-state reconciliation for the query/sector search box.
//
// query/selectedSectors are local React state (typing can't push browser
// history on every keystroke), seeded from the URL on mount so a shared link
// restores the search. But the same component instance can later see a
// DIFFERENT URL without remounting -- back/forward, a restored tab, any
// navigation that reuses it -- and local state has to notice and reset.
//
// This used to happen in a useEffect keyed on the URL's search params. An
// effect commits one tick after the render that first saw the new URL, which
// left a real window where the input and the search results still reflected
// whatever query was active before the URL changed. Confirmed concretely:
// loading straight into a URL with q=M%26MFIN could show a stale query from
// earlier in the session (input box and results both reflecting it,
// consistent with each other but not with the URL) until something else
// happened to trigger another render.
//
// Pulled out as a pure function specifically so this reconciliation decision
// -- given the URL's current q/sectors and what was last synced, what (if
// anything) should local state become -- is unit-testable without a browser
// or a React render. The component calls this directly in its render body
// (React's documented pattern for adjusting state when an external value
// changes), not in an effect, so it reconciles synchronously in the same
// render/commit as the URL change. debouncedQuery is set alongside query,
// bypassing the typing-debounce timer entirely: an external URL jump isn't a
// keystroke, so there's no reason to smooth it the way rapid typing needs.
// ---------------------------------------------------------------------------

export interface QuerySyncState {
  query: string
  debouncedQuery: string
  selectedSectors: string[]
  syncedQuery: string
  syncedSectorsRaw: string
}

/** Returns `prev` unchanged (same reference) if the URL hasn't moved past
 *  what was last synced -- so calling this on every render is a no-op until
 *  the URL genuinely changes, and never fights with local typing (typing
 *  only ever changes `query`/`debouncedQuery` directly, never `syncedQuery`,
 *  so it can never look like a URL change to this function). */
export function reconcileQuerySyncState(
  prev: QuerySyncState,
  urlQuery: string,
  urlSectorsRaw: string,
): QuerySyncState {
  if (urlQuery === prev.syncedQuery && urlSectorsRaw === prev.syncedSectorsRaw) {
    return prev
  }
  const urlSectors = urlSectorsRaw ? urlSectorsRaw.split(",").filter(Boolean) : []
  return {
    query: urlQuery,
    debouncedQuery: urlQuery,
    selectedSectors: urlSectors,
    syncedQuery: urlQuery,
    syncedSectorsRaw: urlSectorsRaw,
  }
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
