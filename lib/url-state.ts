// ---------------------------------------------------------------------------
// ScreenFilters <-> URL search params.
//
// Before this, only `q` and `sectors` reached the URL. Everything else a user
// could build -- numeric constraints from typed queries or chip edits, and the
// bucket-drawer selections -- lived purely in React state. Three consequences,
// all confirmed on the live site:
//
//   1. Removing a chip cleared the query text in state but left the old `q=`
//      in the URL, so refreshing restored the screen the user had just edited
//      away.
//   2. A screen built entirely from the filters drawer had an empty URL, so
//      sharing that link sent the recipient to an unfiltered universe.
//   3. Back/forward moved `q` and `sectors` but silently kept the numeric and
//      bucket state from the page you were leaving.
//
// A screener whose links don't reproduce what you were looking at isn't
// shareable, and sharing is the point of a public tool. So the whole screen
// is encoded, in a form that stays readable in the address bar:
//
//   ?view=results&q=pharma&sectors=Technology&ind=Steel
//     &num=roce:18..,revenue:500..3000,totalDebt:..41
//     &bands=roce:excellent,marketCap:mid|large
//
// Encoding rules: `min..max` with either side omissible, `|` separates the
// values of a multi-select bucket, `,` separates entries. Decoding is total --
// anything malformed is skipped rather than thrown, because a hand-edited or
// truncated URL must degrade to a wider screen, never to a crash.
// ---------------------------------------------------------------------------

import {
  type ScreenFilters,
  type NumericFieldKey,
  type NumericConstraint,
  NUMERIC_FIELD_KEYS,
  makeScreen,
} from "@/lib/screener"
import { type BucketFilters, DEFAULT_BUCKET_FILTERS, BUCKET_FIELDS } from "@/lib/dealscope-data"

const NUMERIC_KEY_SET = new Set<string>(NUMERIC_FIELD_KEYS)
const MULTI_BUCKET_KEYS = new Set(["marketCap", "promoterPledge"])
const BUCKET_KEYS = new Set(BUCKET_FIELDS.map((f) => f.key as string))

function encodeNumeric(numeric: ScreenFilters["numeric"]): string {
  const parts: string[] = []
  for (const key of NUMERIC_FIELD_KEYS) {
    const c = numeric[key]
    if (!c || (c.min == null && c.max == null)) continue
    parts.push(`${key}:${c.min ?? ""}..${c.max ?? ""}`)
  }
  return parts.join(",")
}

function decodeNumeric(raw: string): Partial<Record<NumericFieldKey, NumericConstraint>> {
  const out: Partial<Record<NumericFieldKey, NumericConstraint>> = {}
  if (!raw) return out
  for (const entry of raw.split(",")) {
    const [key, range] = entry.split(":")
    if (!key || !range || !NUMERIC_KEY_SET.has(key)) continue
    const [lo, hi] = range.split("..")
    const c: NumericConstraint = {}
    const min = Number(lo)
    const max = Number(hi)
    if (lo !== "" && lo != null && Number.isFinite(min)) c.min = min
    if (hi !== "" && hi != null && Number.isFinite(max)) c.max = max
    if (c.min != null || c.max != null) out[key as NumericFieldKey] = c
  }
  return out
}

function encodeBands(buckets: BucketFilters): string {
  const parts: string[] = []
  for (const [key, sel] of Object.entries(buckets)) {
    if (key === "industry") continue // carried in `ind`, not here
    if (Array.isArray(sel)) {
      if (sel.length > 0) parts.push(`${key}:${sel.join("|")}`)
    } else if (typeof sel === "string" && sel) {
      parts.push(`${key}:${sel}`)
    }
  }
  return parts.join(",")
}

function decodeBands(raw: string, industries: string[]): BucketFilters {
  const out: BucketFilters = { ...DEFAULT_BUCKET_FILTERS, industry: industries }
  if (!raw) return out
  for (const entry of raw.split(",")) {
    const [key, value] = entry.split(":")
    if (!key || !value || !BUCKET_KEYS.has(key)) continue
    if (MULTI_BUCKET_KEYS.has(key)) {
      ;(out as unknown as Record<string, string[]>)[key] = value.split("|").filter(Boolean)
    } else {
      ;(out as unknown as Record<string, string>)[key] = value
    }
  }
  return out
}

const LIST_SEP = "~"

/** Sector and industry names contain commas ("Metals, Mining & Materials") and
 *  ampersands, so a comma-joined list would corrupt them on the way back. `~`
 *  never appears in either vocabulary. */
function encodeList(values: string[]): string {
  return values.join(LIST_SEP)
}
function decodeList(raw: string): string[] {
  return raw ? raw.split(LIST_SEP).filter(Boolean) : []
}

export interface UrlState {
  view: "landing" | "results" | "detail"
  ticker: string | null
  screen: ScreenFilters
}

/** Serialize to a stable, comparable query string. Key order is fixed so two
 *  equal screens always produce byte-identical strings -- that's what lets the
 *  caller cheaply detect "the URL already matches, don't write it again" and
 *  avoid a replace/read feedback loop. */
export function encodeUrlState(state: UrlState): string {
  const sp = new URLSearchParams()
  if (state.view !== "landing") sp.set("view", state.view === "detail" ? "results" : state.view)
  const s = state.screen
  if (s.text.trim()) sp.set("q", s.text.trim())
  if (s.sectors.length) sp.set("sectors", encodeList(s.sectors))
  if (s.industries.length) sp.set("ind", encodeList(s.industries))
  const num = encodeNumeric(s.numeric)
  if (num) sp.set("num", num)
  const bands = encodeBands(s.buckets)
  if (bands) sp.set("bands", bands)
  if (state.ticker) sp.set("ticker", state.ticker)
  return sp.toString()
}

/** Total inverse of encodeUrlState. Never throws. */
export function decodeUrlState(sp: URLSearchParams): UrlState {
  const ticker = sp.get("ticker")
  const industries = decodeList(sp.get("ind") ?? "")
  const screen = makeScreen({
    text: sp.get("q") ?? "",
    sectors: decodeList(sp.get("sectors") ?? ""),
    industries,
    numeric: decodeNumeric(sp.get("num") ?? ""),
    buckets: decodeBands(sp.get("bands") ?? "", industries),
  })
  return {
    view: ticker ? "detail" : sp.get("view") === "results" ? "results" : "landing",
    ticker,
    screen,
  }
}
