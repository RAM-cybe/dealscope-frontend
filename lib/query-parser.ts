// ---------------------------------------------------------------------------
// Natural-language screening query -> ScreenFilters.
//
// Rule-based, deterministic, and entirely local. No LLM call, by design:
//
//  - The site is static and login-free, so there is no server to hold a
//    provider key. Calling an LLM from the browser would ship that key to
//    every visitor.
//  - Screening has to feel instantaneous (the live count updates as you type).
//    A ~1-3s provider round-trip per keystroke is not that, and the project's
//    own three-provider fallback chain exists precisely because free tiers
//    rate-limit.
//  - A screener must be reproducible. The same words should always produce
//    exactly the same filter set, and the user has to be able to SEE what was
//    understood -- which is what the chips are for. A model that silently
//    reinterprets "low debt" differently between two runs would make the
//    result list untrustworthy.
//
// The grammar below covers the query shapes real screening uses: explicit
// comparisons ("ROCE > 18", "under 2000 Cr revenue", "between 500 and 3000"),
// qualitative words resolved against real per-sector percentiles ("high
// margin", "low debt"), size classes ("mid-cap"), and sector/industry names.
// Anything it does not recognise is left in `text` and handled as an ordinary
// company/ticker search, so a query is never rejected -- worst case it
// degrades to the search behaviour that already existed.
// ---------------------------------------------------------------------------

import sectorBandsData from "@/data/sector-bands.json"
import {
  type ScreenFilters,
  type NumericConstraint,
  type NumericFieldKey,
  makeScreen,
} from "@/lib/screener"

interface Band {
  p25: number
  p50: number
  p75: number
  sample_size: number
  fallback?: boolean
}
interface SectorBandsFile {
  generated_at: string
  sectors: Record<string, Record<string, Band>>
}

const SECTOR_BANDS = sectorBandsData as unknown as SectorBandsFile
const ALL_KEY = "__all__"

/** Percentile cutpoint for a field, scoped to a sector when the query named
 *  one. This is what makes "high margin pharma" and "high margin industrials"
 *  resolve to genuinely different numbers instead of one universe-wide cutoff
 *  that is wrong for both. */
function band(field: string, sector: string | null): Band | null {
  const scoped = sector ? SECTOR_BANDS.sectors?.[sector]?.[field] : null
  const resolved = scoped ?? SECTOR_BANDS.sectors?.[ALL_KEY]?.[field] ?? null
  if (!resolved && process.env.NODE_ENV !== "production") {
    // A missing field here makes the caller drop the constraint SILENTLY --
    // the query still returns a plausible-looking list that is quietly wrong.
    // That already happened once: sector-bands.json shipped without `roe`, so
    // "high roce high roe" applied only the ROCE half. Fail loudly in dev.
    console.warn(
      `[query-parser] sector-bands.json has no "${field}" row -- any qualitative ` +
        `constraint on that field will be dropped. Add it to compute_sector_bands.py's FIELD_SPECS.`,
    )
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/** Metric aliases -> the Company.raw key they constrain. Longest phrases are
 *  matched first (see METRIC_PATTERNS) so "revenue growth" wins over
 *  "revenue". */
const METRIC_ALIASES: [string, NumericFieldKey][] = [
  ["revenue growth", "revenueGrowth"],
  ["sales growth", "revenueGrowth"],
  ["topline growth", "revenueGrowth"],
  ["growth", "revenueGrowth"],
  ["ebitda margin", "ebitdaMargin"],
  ["operating margin", "ebitdaMargin"],
  ["margin", "ebitdaMargin"],
  ["market cap", "marketCap"],
  ["market capitalisation", "marketCap"],
  ["market capitalization", "marketCap"],
  ["marketcap", "marketCap"],
  ["mcap", "marketCap"],
  // "valuation" in size language ("valuation under 2000 Cr") means market
  // cap, not P/E -- same rule as the bare-amount default. P/E still binds via
  // "pe", "p/e", "price to earnings".
  ["valuation", "marketCap"],
  ["price to earnings", "peRatio"],
  ["pe ratio", "peRatio"],
  ["p e ratio", "peRatio"],
  ["p e", "peRatio"],
  ["pe", "peRatio"],
  ["roce", "roce"],
  ["return on capital employed", "roce"],
  ["return on capital", "roce"],
  ["roe", "roe"],
  ["return on equity", "roe"],
  ["promoter pledge", "promoterPledge"],
  ["pledge", "promoterPledge"],
  ["debt", "totalDebt"],
  ["leverage", "totalDebt"],
  ["borrowings", "totalDebt"],
  ["revenue", "revenue"],
  ["sales", "revenue"],
  ["topline", "revenue"],
]

/** Sector aliases -> exact `company.sector` display name.
 *
 *  The full display names are listed first so a query containing the literal
 *  sector label is consumed whole. Without "industrials and auto" here, the
 *  shorter "industrials" alias matched, removed only that word, and left a
 *  stray "auto" behind in the residual free text -- which then narrowed the
 *  results as if the user had searched for a company named "auto".
 *  (normalizeQuery turns "&" into "and" before this runs.) */
const SECTOR_ALIASES: [string, string][] = [
  ["industrials and auto", "Industrials & Auto"],
  ["consumer products and retail", "Consumer Products"],
  ["consumer products", "Consumer Products"],
  // Longest FMCG forms first so "fast moving consumer goods" is consumed as
  // one sector token rather than matching the shorter "consumer" alias and
  // leaving "fast moving goods" as residual free text.
  ["fast moving consumer goods", "Consumer Products"],
  ["fastmoving consumer goods", "Consumer Products"],
  ["consumer staples", "Consumer Products"],
  ["consumer", "Consumer Products"],
  ["fmcgs", "Consumer Products"],
  ["fmcg", "Consumer Products"],
  ["staples", "Consumer Products"],
  ["financial services", "Financial Services"],
  ["financials", "Financial Services"],
  ["finance", "Financial Services"],
  ["banking", "Financial Services"],
  ["nbfc", "Financial Services"],
  ["industrials", "Industrials & Auto"],
  ["industrial", "Industrials & Auto"],
  ["manufacturing", "Industrials & Auto"],
  ["capital goods", "Industrials & Auto"],
  ["infrastructure", "Infrastructure"],
  ["infra", "Infrastructure"],
  ["lifesciences", "Lifesciences"],
  ["life sciences", "Lifesciences"],
  ["healthcare", "Lifesciences"],
  ["technology", "Technology"],
  ["tech", "Technology"],
  ["it services", "Technology"],
  // "IT" is how the sector is normally named in India ("IT company", "IT
  // stocks"). Matched on word boundaries, so it can't fire inside another
  // word; a bare English "it" in a screening query is not a realistic input.
  ["it", "Technology"],
  ["software", "Technology"],
]

/** Industry aliases -> [exact raw `company.industry` labels, parent sector].
 *
 *  Several aliases map to more than one label (a query for "pharma" means
 *  both drug-manufacturer buckets), so the labels are a list.
 *
 *  The third element is the sector whose percentile bands a qualitative word
 *  should resolve against when the query names ONLY an industry. Without it,
 *  "high margin pharma" would fall back to the universe-wide p75 (18.7%) when
 *  the number that actually means "high margin for a pharma company" is
 *  Lifesciences' p75 (26.7%). Each value is the dominant sector for that
 *  industry in the live dataset, checked against the data rather than
 *  assumed. */
const INDUSTRY_ALIASES: [string, string[], string][] = [
  ["logistics", ["Integrated Freight & Logistics"], "Industrials & Auto"],
  ["freight", ["Integrated Freight & Logistics"], "Industrials & Auto"],
  ["shipping", ["Marine Shipping"], "Industrials & Auto"],
  ["pharma", ["Drug Manufacturers - Specialty & Generic", "Drug Manufacturers - General"], "Lifesciences"],
  ["pharmaceutical", ["Drug Manufacturers - Specialty & Generic", "Drug Manufacturers - General"], "Lifesciences"],
  ["drug", ["Drug Manufacturers - Specialty & Generic", "Drug Manufacturers - General"], "Lifesciences"],
  ["hospital", ["Medical Care Facilities"], "Lifesciences"],
  ["diagnostics", ["Diagnostics & Research"], "Lifesciences"],
  ["bank", ["Banks - Regional"], "Financial Services"],
  ["banks", ["Banks - Regional"], "Financial Services"],
  ["insurance", [
    "Insurance - Life",
    "Insurance - Property & Casualty",
    "Insurance - Diversified",
    "Insurance - Reinsurance",
    "Insurance Brokers",
  ], "Financial Services"],
  ["chemicals", ["Specialty Chemicals", "Chemicals"], "Industrials & Auto"],
  ["chemical", ["Specialty Chemicals", "Chemicals"], "Industrials & Auto"],
  ["specialty chemicals", ["Specialty Chemicals"], "Industrials & Auto"],
  ["steel", ["Steel"], "Industrials & Auto"],
  ["cement", ["Building Materials"], "Industrials & Auto"],
  ["auto parts", ["Auto Parts"], "Industrials & Auto"],
  ["auto ancillary", ["Auto Parts"], "Industrials & Auto"],
  ["automobile", ["Auto Manufacturers"], "Industrials & Auto"],
  ["textile", ["Textile Manufacturing"], "Industrials & Auto"],
  ["textiles", ["Textile Manufacturing"], "Industrials & Auto"],
  ["real estate", ["Real Estate - Development", "Real Estate Services", "Real Estate - Diversified"], "Infrastructure"],
  ["realty", ["Real Estate - Development", "Real Estate Services", "Real Estate - Diversified"], "Infrastructure"],
  ["telecom", ["Telecom Services"], "Technology"],
  ["power", ["Utilities - Independent Power Producers", "Utilities - Regulated Electric"], "Infrastructure"],
  ["utilities", [
    "Utilities - Independent Power Producers",
    "Utilities - Regulated Electric",
    "Utilities - Regulated Gas",
    "Utilities - Regulated Water",
  ], "Infrastructure"],
  ["renewable", ["Utilities - Renewable", "Solar"], "Infrastructure"],
  ["solar", ["Solar"], "Infrastructure"],
  ["defence", ["Aerospace & Defense"], "Industrials & Auto"],
  ["defense", ["Aerospace & Defense"], "Industrials & Auto"],
  ["aerospace", ["Aerospace & Defense"], "Industrials & Auto"],
  ["it services", ["Information Technology Services"], "Technology"],
  ["hotels", ["Lodging", "Resorts & Casinos"], "Consumer Products"],
  ["hotel", ["Lodging", "Resorts & Casinos"], "Consumer Products"],
  ["airlines", ["Airlines"], "Industrials & Auto"],
  ["paints", ["Specialty Chemicals"], "Industrials & Auto"],
  ["packaging", ["Packaging & Containers"], "Industrials & Auto"],
  // FMCG industries -- when someone wants the packaged-goods slice rather
  // than the whole Consumer Products sector. The sector aliases still catch
  // a bare "FMCG"; these catch more specific phrasing.
  ["packaged foods", ["Packaged Foods"], "Consumer Products"],
  ["personal care", ["Household & Personal Products"], "Consumer Products"],
  ["household products", ["Household & Personal Products"], "Consumer Products"],
]

/** Market-cap classes, in ₹ Cr. Deliberately absolute rather than percentile:
 *  "mid-cap" has an established market meaning in Indian equities that a
 *  quartile of this particular 2,381-name universe would not reproduce. */
const SIZE_CLASSES: [string, NumericConstraint][] = [
  ["mega cap", { min: 100000 }],
  ["megacap", { min: 100000 }],
  ["large cap", { min: 20000 }],
  ["largecap", { min: 20000 }],
  ["mid cap", { min: 5000, max: 20000 }],
  ["midcap", { min: 5000, max: 20000 }],
  ["small cap", { min: 500, max: 5000 }],
  ["smallcap", { min: 500, max: 5000 }],
  ["micro cap", { max: 500 }],
  ["microcap", { max: 500 }],
]

const HIGH_WORDS = ["high", "strong", "good", "great", "excellent", "top", "best", "healthy", "rich"]
const LOW_WORDS = ["low", "weak", "poor", "minimal", "small", "little", "cheap", "light"]

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/** Lowercase, strip commas inside numbers, unify punctuation to spaces but
 *  KEEP comparison operators and decimal points, which carry meaning here
 *  (unlike dealscope-data's normalizeForSearch, which is for name matching). */
function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/(\d),(?=\d{3}\b)/g, "$1") // 2,000 -> 2000
    .replace(/&/g, " and ")
    .replace(/[><]=?/g, (m) => ` ${m} `)
    .replace(/[^a-z0-9.<>%+\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** "2000 cr" / "2000cr" / "2k crore" / "1.5 lakh cr" -> a number in ₹ Cr.
 *  Percent and ratio values pass through unscaled. */
function scaleAmount(value: number, suffix: string | undefined, field: NumericFieldKey): number {
  const isCurrency = field === "revenue" || field === "marketCap" || field === "totalDebt"
  if (!isCurrency) return value
  if (!suffix) return value
  const s = suffix.trim()
  if (s.startsWith("lakh cr") || s.startsWith("lac cr")) return value * 100000
  if (s.startsWith("cr") || s.startsWith("crore")) return value
  if (s.startsWith("k")) return value * 1000
  return value
}

const NUM = "(\\d+(?:\\.\\d+)?)"
const UNIT = "(?:\\s*(lakh\\s*cr(?:ore)?|lac\\s*cr(?:ore)?|cr(?:ore)?s?|k|%|x))?"

function mergeConstraint(
  into: Partial<Record<NumericFieldKey, NumericConstraint>>,
  key: NumericFieldKey,
  c: NumericConstraint,
) {
  const cur = into[key] ?? {}
  into[key] = {
    ...cur,
    ...(c.min != null ? { min: cur.min != null ? Math.max(cur.min, c.min) : c.min } : {}),
    ...(c.max != null ? { max: cur.max != null ? Math.min(cur.max, c.max) : c.max } : {}),
  }
}

/** Build the metric-phrase alternation once, longest-first so multi-word
 *  aliases beat their own prefixes. */
const METRIC_PATTERN = METRIC_ALIASES.map(([a]) => a.replace(/\s+/g, "\\s+"))
  .sort((a, b) => b.length - a.length)
  .join("|")

function metricFor(phrase: string): NumericFieldKey | null {
  const p = phrase.replace(/\s+/g, " ").trim()
  const hit = METRIC_ALIASES.find(([a]) => a === p)
  return hit ? hit[1] : null
}

export interface ParseResult {
  filters: ScreenFilters
  /** True when at least one real constraint was recognised -- the UI uses this
   *  to decide whether to show "screening" affordances or treat the input as
   *  a plain name search. */
  recognised: boolean
  /** Human-readable notes about what was understood, for debugging/tests. */
  matched: string[]
}

/**
 * Parse a natural-language screening query.
 *
 * Never throws and never returns null: an unparseable query yields an empty
 * screen with the original text intact, which the caller runs as an ordinary
 * name/ticker search. That is the documented fallback guarantee -- the visual
 * filters and plain search keep working no matter what is typed here.
 */
export function parseQuery(raw: string): ParseResult {
  const matched: string[] = []
  const filters = makeScreen()

  if (!raw || !raw.trim()) return { filters, recognised: false, matched }

  let q = normalizeQuery(raw)

  /** Run `note` on every match. Returning false means "I did not understand
   *  this", and the matched text is put back so a later rule still gets a
   *  chance at it. Previously every match was consumed unconditionally even
   *  when the callback bailed, which silently ate the query: in "FMCG high
   *  margin under 5000 Cr" the metric-adjacent rule matched "margin under 5000
   *  cr", produced a nonsensical margin <= 5000 constraint, and left a bare
   *  "high" behind for the name search to choke on. */
  const consume = (re: RegExp, note: (m: RegExpMatchArray) => boolean | void) => {
    q = q.replace(re, (...args) => {
      const m = args.slice(0, -2) as unknown as RegExpMatchArray
      return note(m) === false ? m[0] : " "
    })
  }

  /** Currency units may only constrain currency metrics.
   *
   *  "high margin under 5000 Cr" is not a claim that EBITDA margin is under
   *  5000% -- the "Cr" says the amount is money, so it cannot belong to a
   *  percentage or ratio metric. Rejecting the pair here (rather than
   *  producing an impossible constraint) leaves the words in place, so the
   *  qualitative rule reads "high margin" and the bare-amount rule reads
   *  "under 5000 Cr" as the size constraint the user meant. */
  const CURRENCY_FIELDS = new Set<NumericFieldKey>(["revenue", "marketCap", "totalDebt"])
  const unitFits = (unit: string | undefined, key: NumericFieldKey): boolean => {
    if (!unit) return true
    const u = unit.trim()
    const isCurrencyUnit = /^(lakh|lac)?\s*cr/.test(u) || u === "k"
    return isCurrencyUnit ? CURRENCY_FIELDS.has(key) : true
  }

  // --- 1. Sector, so later percentile lookups can be sector-scoped ---------
  let sector: string | null = null
  for (const [alias, name] of [...SECTOR_ALIASES].sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "g")
    if (re.test(q)) {
      if (!filters.sectors.includes(name)) filters.sectors.push(name)
      sector = sector ?? name
      q = q.replace(re, " ")
      matched.push(`sector:${name}`)
    }
  }

  // --- 2. Industries ------------------------------------------------------
  for (const [alias, labels, parentSector] of [...INDUSTRY_ALIASES].sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    const re = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "g")
    if (re.test(q)) {
      for (const l of labels) if (!filters.industries.includes(l)) filters.industries.push(l)
      q = q.replace(re, " ")
      matched.push(`industry:${alias}`)
      // An industry-only query ("high margin pharma") still needs a sector to
      // resolve its qualitative words against; without this it would silently
      // fall back to universe-wide percentiles that mean nothing for that
      // industry. An explicitly named sector still wins.
      sector = sector ?? parentSector
    }
  }
  // An industry is strictly narrower than its sector; keeping both would
  // double-constrain and can contradict (a pharma name whose EY bucket isn't
  // Lifesciences would vanish). Industry wins.
  if (filters.industries.length > 0 && filters.sectors.length > 0) {
    filters.sectors = []
  }

  // --- 3. Size classes ----------------------------------------------------
  for (const [alias, c] of SIZE_CLASSES) {
    const re = new RegExp(`\\b${alias.replace(/\s+/g, "[\\s-]*")}\\b`, "g")
    if (re.test(q)) {
      mergeConstraint(filters.numeric, "marketCap", c)
      q = q.replace(re, " ")
      matched.push(`size:${alias}`)
    }
  }

  // --- 4. "between X and Y" ranges ---------------------------------------
  // Two ordered patterns rather than one with an optional metric on each side.
  // A single combined regex with a trailing `(?:\s+(METRIC))?` group silently
  // ate the NEXT clause's metric: in "revenue between 500 cr and 3000 cr roce
  // over 19.3" it consumed "roce", so the ROCE constraint vanished and the
  // query quietly returned 467 companies instead of 122. Leading-metric form
  // runs first and consumes those cases, so the trailing form only ever sees
  // genuine "between X and Y <metric>" phrasing.
  consume(
    new RegExp(`(${METRIC_PATTERN})\\s+(?:of\\s+)?between\\s+${NUM}${UNIT}\\s+and\\s+${NUM}${UNIT}`, "g"),
    (m) => {
      const key = metricFor(m[1])
      if (!key) return
      const lo = scaleAmount(parseFloat(m[2]), m[3] ?? m[5], key)
      const hi = scaleAmount(parseFloat(m[4]), m[5] ?? m[3], key)
      mergeConstraint(filters.numeric, key, { min: Math.min(lo, hi), max: Math.max(lo, hi) })
      matched.push(`range:${key}`)
    },
  )
  consume(
    new RegExp(`between\\s+${NUM}${UNIT}\\s+and\\s+${NUM}${UNIT}\\s+(${METRIC_PATTERN})`, "g"),
    (m) => {
      const key = metricFor(m[5])
      if (!key) return
      const lo = scaleAmount(parseFloat(m[1]), m[2] ?? m[4], key)
      const hi = scaleAmount(parseFloat(m[3]), m[4] ?? m[2], key)
      mergeConstraint(filters.numeric, key, { min: Math.min(lo, hi), max: Math.max(lo, hi) })
      matched.push(`range:${key}`)
    },
  )

  // --- 5. Explicit comparisons -------------------------------------------
  // Metric first: "roce > 18", "revenue under 2000 cr", "pe below 20"
  const MORE = "(?:>|>=|over|above|more than|greater than|at least|minimum|min)"
  const LESS = "(?:<|<=|under|below|less than|lower than|at most|maximum|max|upto|up to)"

  consume(new RegExp(`(${METRIC_PATTERN})\\s*(?:of\\s*)?${MORE}\\s*${NUM}${UNIT}`, "g"), (m) => {
    const key = metricFor(m[1])
    if (!key || !unitFits(m[3], key)) return false
    mergeConstraint(filters.numeric, key, { min: scaleAmount(parseFloat(m[2]), m[3], key) })
    matched.push(`min:${key}`)
  })
  consume(new RegExp(`(${METRIC_PATTERN})\\s*(?:of\\s*)?${LESS}\\s*${NUM}${UNIT}`, "g"), (m) => {
    const key = metricFor(m[1])
    if (!key || !unitFits(m[3], key)) return false
    mergeConstraint(filters.numeric, key, { max: scaleAmount(parseFloat(m[2]), m[3], key) })
    matched.push(`max:${key}`)
  })

  // Comparator first: "under 2000 cr revenue", "over 20% roce"
  consume(new RegExp(`${MORE}\\s*${NUM}${UNIT}\\s*(${METRIC_PATTERN})`, "g"), (m) => {
    const key = metricFor(m[3])
    if (!key || !unitFits(m[2], key)) return false
    mergeConstraint(filters.numeric, key, { min: scaleAmount(parseFloat(m[1]), m[2], key) })
    matched.push(`min:${key}`)
  })
  consume(new RegExp(`${LESS}\\s*${NUM}${UNIT}\\s*(${METRIC_PATTERN})`, "g"), (m) => {
    const key = metricFor(m[3])
    if (!key || !unitFits(m[2], key)) return false
    mergeConstraint(filters.numeric, key, { max: scaleAmount(parseFloat(m[1]), m[2], key) })
    matched.push(`max:${key}`)
  })

  // --- 5b. Bare rupee amounts with no metric named -----------------------
  // "logistics under 2000 Cr low debt" names no metric for the 2000, so every
  // metric-specific pattern above skips it -- and the leftover number was then
  // swallowed by the residual-text filter, silently dropping a constraint the
  // user clearly intended.
  //
  // THE SIZE RULE, stated once so it is not guessed at anywhere else:
  //
  //   A rupee amount with no metric attached means REVENUE.
  //   Market cap is used only when the query says so ("market cap", "mcap",
  //   "valuation", "market capitalisation").
  //
  // Previously this defaulted to market cap, which made size language
  // non-deterministic from the user's side: "revenue under 2000 cr" bound to
  // revenue, "under 2000 cr revenue" bound to revenue, but "IT revenue company
  // under 2,000 crores" and a bare "under 2000 cr" bound to market cap -- the
  // same sentence meaning different things depending on word order. Revenue is
  // the better default for an M&A screener (it is the size measure that
  // survives a re-rating, and it is what "a 2,000 crore company" means to an
  // operator rather than an investor). Either way the choice is visible as a
  // removable chip, so a user who meant the other one can see and correct it.
  const CR_ONLY = "(?:\\s*(lakh\\s*cr(?:ore)?|lac\\s*cr(?:ore)?|cr(?:ore)?s?))"

  const bareKey: NumericFieldKey =
    /\b(?:market\s*cap|marketcap|mcap|market\s*capitali[sz]ation|valuation)\b/.test(q)
      ? "marketCap"
      : "revenue"

  // Bare "between X and Y Cr" -- the metric-bound between patterns above
  // require a metric word, so "between 500 and 3000 Cr" used to vanish.
  consume(
    new RegExp(`between\\s+${NUM}${CR_ONLY}\\s+and\\s+${NUM}${CR_ONLY}`, "g"),
    (m) => {
      const lo = scaleAmount(parseFloat(m[1]), m[2], bareKey)
      const hi = scaleAmount(parseFloat(m[3]), m[4], bareKey)
      mergeConstraint(filters.numeric, bareKey, {
        min: Math.min(lo, hi),
        max: Math.max(lo, hi),
      })
      matched.push(`bare:${bareKey}:range`)
    },
  )
  // Same without an explicit Cr on each side but with a trailing Cr: "between
  // 500 and 3000 cr".
  consume(
    new RegExp(`between\\s+${NUM}\\s+and\\s+${NUM}${CR_ONLY}`, "g"),
    (m) => {
      const unit = m[3]
      const lo = scaleAmount(parseFloat(m[1]), unit, bareKey)
      const hi = scaleAmount(parseFloat(m[2]), unit, bareKey)
      mergeConstraint(filters.numeric, bareKey, {
        min: Math.min(lo, hi),
        max: Math.max(lo, hi),
      })
      matched.push(`bare:${bareKey}:range`)
    },
  )

  consume(new RegExp(`${LESS}\\s*${NUM}${CR_ONLY}`, "g"), (m) => {
    mergeConstraint(filters.numeric, bareKey, {
      max: scaleAmount(parseFloat(m[1]), m[2], bareKey),
    })
    matched.push(`bare:${bareKey}:max`)
  })
  consume(new RegExp(`${MORE}\\s*${NUM}${CR_ONLY}`, "g"), (m) => {
    mergeConstraint(filters.numeric, bareKey, {
      min: scaleAmount(parseFloat(m[1]), m[2], bareKey),
    })
    matched.push(`bare:${bareKey}:min`)
  })

  // --- 6. "no pledge" / "zero debt" / "debt free" ------------------------
  consume(new RegExp(`\\b(?:no|zero|nil|without)\\s+(?:promoter\\s+)?pledge\\b`, "g"), () => {
    mergeConstraint(filters.numeric, "promoterPledge", { max: 0 })
    matched.push("zero:promoterPledge")
  })
  consume(new RegExp(`\\b(?:debt\\s*free|zero\\s+debt|no\\s+debt)\\b`, "g"), () => {
    mergeConstraint(filters.numeric, "totalDebt", { max: 0 })
    matched.push("zero:totalDebt")
  })

  // --- 7. Qualitative modifiers, resolved against real percentiles --------
  // "high margin", "low debt", "strong roce". A HIGH word takes the sector's
  // p75 as a floor; a LOW word takes its p25 as a ceiling. For a metric where
  // lower is better (debt, P/E, pledge) the direction inverts: "low debt"
  // still means "at most p25", but "cheap" on P/E also means "at most p25".
  const QUAL = `(?:${[...HIGH_WORDS, ...LOW_WORDS].join("|")})`
  consume(new RegExp(`\\b(${QUAL})\\s+(${METRIC_PATTERN})\\b`, "g"), (m) => {
    const word = m[1]
    const key = metricFor(m[2])
    if (!key) return

    // Promoter pledge is deliberately NOT percentile-driven. Its distribution
    // is overwhelmingly zero (most companies report no pledge at all), so
    // p25/p50/p75 all collapse to 0 and a quartile rule would be meaningless
    // -- "low pledge" would resolve to <= 0 and "high pledge" to >= 0, i.e.
    // everything. The real distinction users mean is pledged vs not, so encode
    // that directly. Same reasoning the bucket UI already uses for this field.
    if (key === "promoterPledge") {
      if (HIGH_WORDS.includes(word)) {
        mergeConstraint(filters.numeric, key, { min: 0.01 })
        matched.push("qual:high:promoterPledge")
      } else {
        mergeConstraint(filters.numeric, key, { max: 0 })
        matched.push("qual:low:promoterPledge")
      }
      return
    }

    const b = band(key, sector)
    if (!b) return
    if (HIGH_WORDS.includes(word)) {
      mergeConstraint(filters.numeric, key, { min: b.p75 })
      matched.push(`qual:high:${key}@${b.p75}`)
    } else {
      mergeConstraint(filters.numeric, key, { max: b.p25 })
      matched.push(`qual:low:${key}@${b.p25}`)
    }
  })

  // Standalone valuation adjectives, no metric word attached.
  consume(new RegExp(`\\b(?:cheap|undervalued|value)\\b`, "g"), () => {
    const b = band("peRatio", sector)
    if (b) {
      mergeConstraint(filters.numeric, "peRatio", { max: b.p25 })
      matched.push(`qual:cheap:peRatio@${b.p25}`)
    }
  })
  consume(new RegExp(`\\b(?:profitable|high\\s+quality|quality)\\b`, "g"), () => {
    const b = band("roce", sector)
    if (b) {
      mergeConstraint(filters.numeric, "roce", { min: b.p50 })
      matched.push(`qual:quality:roce@${b.p50}`)
    }
  })

  // --- 8. Whatever is left is a name/ticker search -----------------------
  //
  // Critical: incomplete screening vocabulary must NEVER become free-text
  // name tokens. Typing "high" or "growth" alone used to collapse the list
  // to the 1–2 companies whose name happens to contain that word (HIGH
  // Energy, Growth Tech, …) -- the opposite of a useful screen. Those words
  // are either consumed by a complete phrase above, or dropped here until
  // the user finishes the phrase.
  const STOPWORDS = new Set([
    "companies", "company", "stocks", "stock", "with", "and", "the", "a", "an", "in", "of",
    "that", "have", "has", "having", "for", "me", "show", "find", "list", "all", "sector",
    "sectors", "industry", "industries", "which", "are", "is", "cr", "crore", "crores", "rs",
    "under", "over", "above", "below", "between", "than", "more", "less", "at", "least",
    "most", "minimum", "maximum", "min", "max", "upto", "up", "to", "from", "by", "on",
    "or", "vs", "versus", "like", "such", "as", "very", "really", "quite", "please",
    "looking", "look", "want", "need", "get", "give", "screen", "screener", "filter",
    "filters", "only", "also", "both", "either", "any", "some", "those", "these", "this",
    "their", "its", "our", "my",
  ])

  // Qualitative adjectives and bare metric names. Alone they are unfinished
  // screens, not company-name fragments. Multi-word metric aliases are split
  // so each token is covered ("revenue", "growth", "market", "cap", …).
  const SCREEN_VOCAB = new Set<string>([
    ...HIGH_WORDS,
    ...LOW_WORDS,
    "quality",
    "profitable",
    "undervalued",
    "value",
    "mid",
    "mega",
    "large",
    "small",
    "micro",
    "cap",
    "caps",
  ])
  for (const [alias] of METRIC_ALIASES) {
    for (const tok of alias.split(/\s+/)) {
      if (tok.length > 0) SCREEN_VOCAB.add(tok)
    }
  }

  const residual = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(
      (t) =>
        t.length > 0 &&
        !STOPWORDS.has(t) &&
        !SCREEN_VOCAB.has(t) &&
        !/^[\d.<>%+-]+$/.test(t),
    )
    .join(" ")
    .trim()

  filters.text = residual
  const recognised = matched.length > 0
  return { filters, recognised, matched }
}

/**
 * Render a ScreenFilters back into a human-readable query string, for the
 * search bar's two-way sync: clicking visual controls produces text that
 * describes the current screen. Deliberately reads like something a user
 * would type, so re-parsing it reproduces the same screen.
 */
export function screenToQuery(f: ScreenFilters): string {
  const parts: string[] = []
  if (f.text.trim()) parts.push(f.text.trim())
  for (const s of f.sectors) parts.push(s.toLowerCase())
  for (const i of f.industries) parts.push(i.toLowerCase())

  const label: Record<NumericFieldKey, string> = {
    marketCap: "market cap",
    revenue: "revenue",
    peRatio: "pe",
    revenueGrowth: "revenue growth",
    ebitdaMargin: "margin",
    roce: "roce",
    roe: "roe",
    totalDebt: "debt",
    promoterPledge: "pledge",
  }
  const isCurrency = (k: NumericFieldKey) =>
    k === "revenue" || k === "marketCap" || k === "totalDebt"

  for (const key of Object.keys(f.numeric) as NumericFieldKey[]) {
    const c = f.numeric[key]
    if (!c) continue
    const unit = isCurrency(key) ? " cr" : ""
    if (c.min != null && c.max != null) {
      parts.push(`${label[key]} between ${c.min}${unit} and ${c.max}${unit}`)
    } else if (c.min != null) {
      parts.push(`${label[key]} over ${c.min}${unit}`)
    } else if (c.max != null) {
      parts.push(`${label[key]} under ${c.max}${unit}`)
    }
  }
  return parts.join(" ").trim()
}
