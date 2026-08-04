// ---------------------------------------------------------------------------
// The screener: a structured filter object, the function that applies it, and
// the per-company "why this passed" reasons that fall out of the same pass.
//
// ARCHITECTURE NOTE -- why this is a module and not an HTTP endpoint.
// DealScope's frontend is deliberately, entirely static: it imports
// companies.json at build time and ships with no server, no database and no
// API route (verified: zero files under app/api, zero route handlers, zero
// "use server"). Screening 2,381 in-memory records is a sub-millisecond array
// pass, so a network round-trip to a filtering endpoint would make every
// keystroke *slower* than doing the work locally, and would break the
// two-way-sync requirement (live counts have to update as the user types).
// This module IS the filtering engine -- same structured input, same ranked
// output, just called directly instead of over HTTP. If a server-side screener
// is ever genuinely needed (e.g. a public API for other clients), this file is
// already the pure, dependency-free core to lift into it: it imports only
// types and the existing scorer.
//
// The scoring engine is untouched. computeScore() still produces the
// sector-relative composite, and ranking is still by that score -- this file
// only changes which companies are *eligible*, never how they rank.
// ---------------------------------------------------------------------------

import {
  type Company,
  type Weights,
  type BucketFilters,
  DEFAULT_BUCKET_FILTERS,
  computeScore,
  passesBucketFilters,
  normalizeForSearch,
} from "@/lib/dealscope-data"

/** Inclusive lower bound, exclusive-of-nothing upper bound. Both optional, so
 *  `{min: 18}` is "at least 18" and `{min: 500, max: 3000}` is a range. */
export interface NumericConstraint {
  min?: number
  max?: number
}

/** Every numeric field the screener can constrain. Keys match `Company.raw`
 *  exactly, so applying a constraint never needs a lookup table. */
export type NumericFieldKey =
  | "marketCap"
  | "revenue"
  | "peRatio"
  | "revenueGrowth"
  | "ebitdaMargin"
  | "roce"
  | "roe"
  | "totalDebt"
  | "promoterPledge"

export const NUMERIC_FIELD_KEYS: NumericFieldKey[] = [
  "marketCap",
  "revenue",
  "peRatio",
  "revenueGrowth",
  "ebitdaMargin",
  "roce",
  "roe",
  "totalDebt",
  "promoterPledge",
]

/** Display metadata per numeric field: how to label it in a chip and how to
 *  render its value with the right unit. */
export const FIELD_META: Record<
  NumericFieldKey,
  { label: string; unit: "cr" | "pct" | "x"; higherIsBetter: boolean }
> = {
  marketCap: { label: "Market Cap", unit: "cr", higherIsBetter: true },
  revenue: { label: "Revenue", unit: "cr", higherIsBetter: true },
  peRatio: { label: "P/E", unit: "x", higherIsBetter: false },
  revenueGrowth: { label: "Revenue Growth", unit: "pct", higherIsBetter: true },
  ebitdaMargin: { label: "EBITDA Margin", unit: "pct", higherIsBetter: true },
  roce: { label: "ROCE", unit: "pct", higherIsBetter: true },
  roe: { label: "ROE", unit: "pct", higherIsBetter: true },
  totalDebt: { label: "Debt", unit: "cr", higherIsBetter: false },
  promoterPledge: { label: "Promoter Pledge", unit: "pct", higherIsBetter: false },
}

export function formatFieldValue(key: NumericFieldKey, v: number): string {
  const { unit } = FIELD_META[key]
  if (unit === "cr") return `₹${Math.round(v).toLocaleString("en-IN")} Cr`
  if (unit === "x") return `${v.toFixed(1)}x`
  return `${Number.isInteger(v) ? v : v.toFixed(1)}%`
}

/**
 * The full screening state. A superset of the existing BucketFilters rather
 * than a replacement: `buckets` is carried through untouched and evaluated by
 * the original passesBucketFilters(), so every visual band control keeps
 * working exactly as before even if the natural-language parser produces
 * nothing. That is the "never leave the system broken" guarantee -- the new
 * layer can only ever *add* constraints, never reinterpret the old ones.
 */
export interface ScreenFilters {
  /** Residual free text (company / ticker name search) after the parser has
   *  consumed everything it recognised as a constraint. */
  text: string
  /** Display sector names, e.g. "Industrials & Auto". */
  sectors: string[]
  /** Raw industry labels, e.g. "Integrated Freight & Logistics". */
  industries: string[]
  /** Continuous numeric constraints, keyed by Company.raw field. */
  numeric: Partial<Record<NumericFieldKey, NumericConstraint>>
  /** The pre-existing band/bucket selections, evaluated unchanged. */
  buckets: BucketFilters
}

export const EMPTY_SCREEN: ScreenFilters = {
  text: "",
  sectors: [],
  industries: [],
  numeric: {},
  buckets: DEFAULT_BUCKET_FILTERS,
}

/**
 * Always returns a fully independent object. Every array and nested object is
 * cloned, never shared with EMPTY_SCREEN or DEFAULT_BUCKET_FILTERS.
 *
 * This matters more than it looks: an earlier version spread `...EMPTY_SCREEN`
 * and handed back its `sectors`/`industries` array *references*, so a caller
 * doing `filters.industries.push(...)` silently mutated the module-level
 * constant. The parser does exactly that, and the result was industries
 * accumulating across unrelated queries -- a search for "consumer products"
 * inherited the previous search's "logistics". Caught by running the parser
 * over several queries in one process.
 */
export function makeScreen(part: Partial<ScreenFilters> = {}): ScreenFilters {
  return {
    text: part.text ?? "",
    sectors: [...(part.sectors ?? [])],
    industries: [...(part.industries ?? [])],
    numeric: { ...(part.numeric ?? {}) },
    buckets: {
      ...DEFAULT_BUCKET_FILTERS,
      ...(part.buckets ?? {}),
      marketCap: [...(part.buckets?.marketCap ?? [])],
      promoterPledge: [...(part.buckets?.promoterPledge ?? [])],
      industry: [...(part.buckets?.industry ?? [])],
    },
  }
}

// ---------------------------------------------------------------------------
// Applying the screen
// ---------------------------------------------------------------------------

/** A missing value never satisfies a constraint. A company with no reported
 *  ROCE is not "low ROCE" -- it's unknown, and silently treating unknown as
 *  passing would put unscreened companies in a screened list. Same rule the
 *  existing bucket filters already use. */
function satisfiesNumeric(value: number | null, c: NumericConstraint): boolean {
  if (value == null) return false
  if (c.min != null && value < c.min) return false
  if (c.max != null && value > c.max) return false
  return true
}

export function countActiveConstraints(f: ScreenFilters): number {
  let n = 0
  if (f.sectors.length > 0) n += 1
  if (f.industries.length > 0) n += 1
  n += Object.keys(f.numeric).length
  // Bucket fields the user set through the visual panel. `industry` inside
  // buckets is counted under f.industries instead, to avoid double-counting
  // the same concept from two entry points.
  const b = f.buckets
  for (const [key, sel] of Object.entries(b)) {
    if (key === "industry") continue
    if (Array.isArray(sel) ? sel.length > 0 : sel != null) n += 1
  }
  return n
}

export function isScreenEmpty(f: ScreenFilters): boolean {
  return f.text.trim().length === 0 && countActiveConstraints(f) === 0
}

/** Does one company satisfy every active constraint? Text is NOT evaluated
 *  here -- free text is a ranked relevance match handled by the search layer,
 *  not a hard gate, so that a typo narrows quality rather than emptying the
 *  list. */
export function passesScreen(company: Company, f: ScreenFilters): boolean {
  if (f.sectors.length > 0 && !f.sectors.includes(company.sector)) return false
  if (f.industries.length > 0) {
    if (company.industry === null || !f.industries.includes(company.industry)) return false
  }
  for (const key of Object.keys(f.numeric) as NumericFieldKey[]) {
    const c = f.numeric[key]
    if (c && !satisfiesNumeric(company.raw[key], c)) return false
  }
  return passesBucketFilters(company, f.buckets)
}

// ---------------------------------------------------------------------------
// "Why this company passed"
// ---------------------------------------------------------------------------

export interface PassReason {
  label: string
  /** "good" for a constraint this company clears comfortably in the favourable
   *  direction, "neutral" for a plain match (sector, a range it sits inside). */
  tone: "good" | "neutral"
}

const QUALITATIVE_LABEL: Partial<Record<NumericFieldKey, { min: string; max: string }>> = {
  roce: { min: "High ROCE", max: "Low ROCE" },
  roe: { min: "High ROE", max: "Low ROE" },
  ebitdaMargin: { min: "High Margin", max: "Thin Margin" },
  revenueGrowth: { min: "Strong Growth", max: "Low Growth" },
  totalDebt: { min: "High Debt", max: "Low Debt" },
  peRatio: { min: "Premium Valuation", max: "Cheap Valuation" },
  promoterPledge: { min: "Pledged", max: "No Pledge" },
  marketCap: { min: "Large", max: "Small" },
  revenue: { min: "High Revenue", max: "Small Revenue" },
}

/**
 * Short chips explaining which of the ACTIVE constraints this company
 * satisfied. Only ever derived from constraints that are actually applied --
 * it never invents a compliment the user didn't screen for, so a chip is
 * always a true statement about why this row is in this list.
 */
export function passReasons(company: Company, f: ScreenFilters, max = 4): PassReason[] {
  const out: PassReason[] = []

  for (const key of Object.keys(f.numeric) as NumericFieldKey[]) {
    const c = f.numeric[key]
    if (!c) continue
    const v = company.raw[key]
    if (v == null) continue
    const meta = FIELD_META[key]
    const labels = QUALITATIVE_LABEL[key]

    // A one-sided constraint in the favourable direction is the interesting
    // case -- that's the user asking for "good X", so say so. Special-case a
    // zero-pledge screen, where "No Pledge" reads better than "Low Pledge".
    if (key === "promoterPledge" && c.max != null && c.max <= 0) {
      out.push({ label: "No Pledge", tone: "good" })
      continue
    }
    if (c.min != null && c.max == null && labels) {
      out.push({ label: labels.min, tone: meta.higherIsBetter ? "good" : "neutral" })
      continue
    }
    if (c.max != null && c.min == null && labels) {
      out.push({ label: labels.max, tone: meta.higherIsBetter ? "neutral" : "good" })
      continue
    }
    // Two-sided range: state the actual value, which is more useful than a
    // vague "in range".
    out.push({ label: `${meta.label} ${formatFieldValue(key, v)}`, tone: "neutral" })
  }

  // Bucket-panel selections get a chip too, so a visually-built screen
  // explains itself the same way a typed one does.
  const b = f.buckets
  const bucketChip: [keyof BucketFilters, string][] = [
    ["roce", "ROCE"],
    ["roe", "ROE"],
    ["ebitdaMargin", "Margin"],
    ["revenueGrowth", "Growth"],
    ["debtLevel", "Debt"],
    ["peRatio", "P/E"],
  ]
  for (const [key, short] of bucketChip) {
    const sel = b[key]
    if (typeof sel === "string" && sel && !f.numeric[key as NumericFieldKey]) {
      out.push({ label: `${titleCase(sel)} ${short}`, tone: "neutral" })
    }
  }

  return out.slice(0, max)
}

function titleCase(s: string): string {
  const spaced = s.replace(/([A-Z])/g, " $1")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// ---------------------------------------------------------------------------
// Chips: one removable token per active constraint
// ---------------------------------------------------------------------------

export type ChipKind = "sector" | "industry" | "numeric" | "bucket" | "text"

export interface FilterChip {
  id: string
  kind: ChipKind
  label: string
  /** Payload identifying what to drop when the chip's × is clicked. */
  target: string
}

function describeConstraint(key: NumericFieldKey, c: NumericConstraint): string {
  const { label } = FIELD_META[key]
  const lo = c.min != null ? formatFieldValue(key, c.min) : null
  const hi = c.max != null ? formatFieldValue(key, c.max) : null
  if (lo && hi) return `${label} ${lo}–${hi}`
  if (lo) return `${label} ≥ ${lo}`
  if (hi) return `${label} ≤ ${hi}`
  return label
}

export function screenChips(f: ScreenFilters): FilterChip[] {
  const chips: FilterChip[] = []

  for (const s of f.sectors) {
    chips.push({ id: `sector:${s}`, kind: "sector", label: s, target: s })
  }
  for (const i of f.industries) {
    chips.push({ id: `industry:${i}`, kind: "industry", label: i, target: i })
  }
  for (const key of Object.keys(f.numeric) as NumericFieldKey[]) {
    const c = f.numeric[key]
    if (!c) continue
    chips.push({
      id: `numeric:${key}`,
      kind: "numeric",
      label: describeConstraint(key, c),
      target: key,
    })
  }

  const b = f.buckets
  for (const [key, sel] of Object.entries(b)) {
    if (key === "industry") continue
    const keyed = key as Exclude<keyof BucketFilters, "industry">
    if (Array.isArray(sel)) {
      for (const one of sel) {
        chips.push({
          id: `bucket:${keyed}:${one}`,
          kind: "bucket",
          label: `${titleCase(one)} ${FIELD_META[keyed as NumericFieldKey]?.label ?? titleCase(keyed)}`,
          target: `${keyed}:${one}`,
        })
      }
    } else if (typeof sel === "string" && sel) {
      chips.push({
        id: `bucket:${keyed}:${sel}`,
        kind: "bucket",
        label: `${titleCase(sel)} ${FIELD_META[keyed as NumericFieldKey]?.label ?? titleCase(keyed)}`,
        target: `${keyed}:${sel}`,
      })
    }
  }

  return chips
}

/** Remove one chip's constraint, returning a new ScreenFilters. */
export function removeChip(f: ScreenFilters, chip: FilterChip): ScreenFilters {
  switch (chip.kind) {
    case "sector":
      return { ...f, sectors: f.sectors.filter((s) => s !== chip.target) }
    case "industry":
      return {
        ...f,
        industries: f.industries.filter((i) => i !== chip.target),
        buckets: { ...f.buckets, industry: f.buckets.industry.filter((i) => i !== chip.target) },
      }
    case "numeric": {
      const numeric = { ...f.numeric }
      delete numeric[chip.target as NumericFieldKey]
      return { ...f, numeric }
    }
    case "bucket": {
      const [key, value] = chip.target.split(":") as [keyof BucketFilters, string]
      const cur = f.buckets[key]
      const next = Array.isArray(cur) ? cur.filter((v) => v !== value) : null
      return { ...f, buckets: { ...f.buckets, [key]: next } as BucketFilters }
    }
    case "text":
      return { ...f, text: "" }
    default:
      return f
  }
}

// ---------------------------------------------------------------------------
// Running a screen
// ---------------------------------------------------------------------------

export interface ScreenResult {
  results: Company[]
  /** Count of companies passing the hard constraints, before free-text
   *  relevance narrowing -- this is the number the "N companies" readout
   *  shows, so it reflects the screen rather than the typing. */
  matchCount: number
  /** True when free text matched nothing and was ignored rather than
   *  emptying the list. */
  textFellBack: boolean
}

/**
 * Apply a screen and rank the survivors.
 *
 * Order is deliberate and matches the engine's existing contract: hard
 * constraints select, then free text narrows by relevance, then
 * computeScore() ranks. Scores are always computed against the company's own
 * precomputed sector-relative factors, never recomputed against the filtered
 * subset -- filtering never feeds back into scoring.
 */
export function runScreen(
  companies: Company[],
  f: ScreenFilters,
  weights: Weights,
): ScreenResult {
  const base = companies.filter((c) => passesScreen(c, f))
  const matchCount = base.length

  const q = normalizeForSearch(f.text)
  let pool = base
  let textFellBack = false

  if (q.length > 0) {
    const tokens = q.split(" ").filter(Boolean)
    const hits = base.filter((c) => {
      const hay = `${normalizeForSearch(c.name)} ${normalizeForSearch(c.ticker)} ${normalizeForSearch(c.sector)}`
      return tokens.every((t) => hay.includes(t))
    })
    if (hits.length > 0) {
      pool = hits
    } else {
      const loose = base.filter((c) => {
        const hay = `${normalizeForSearch(c.name)} ${normalizeForSearch(c.ticker)}`
        return tokens.some((t) => t.length >= 3 && hay.includes(t))
      })
      if (loose.length > 0) {
        pool = loose
      } else {
        textFellBack = true
      }
    }
  }

  // Score once per company, then sort on the cached number. Scoring inside the
  // comparator recomputed it on every comparison -- ~26k comparisons for the
  // full universe, so ~52k computeScore calls per keystroke instead of 2,381.
  // Identical ordering, just without the redundant work on the typing path.
  const scored = pool.map((c) => ({ c, s: computeScore(c.factors, weights) }))
  scored.sort((a, b) => b.s - a.s)
  const results = scored.map((x) => x.c)
  return { results, matchCount, textFellBack }
}

/** Cheap count-only path for live badges (example-screen cards, chip counts)
 *  where the ranked list isn't needed. */
export function countScreen(companies: Company[], f: ScreenFilters): number {
  let n = 0
  for (const c of companies) if (passesScreen(c, f)) n += 1
  return n
}
