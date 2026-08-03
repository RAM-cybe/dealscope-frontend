/**
 * Parser regression suite.
 *
 * Runnable with no test framework installed: `npx tsx lib/__tests__/query-parser.test.ts`
 * (the repo has no runner configured, and adding one was out of scope for this
 * change -- this file is deliberately self-contained so the parser's behaviour
 * is still pinned down and re-checkable rather than verified once by hand.)
 *
 * Every case here is a real bug that was caught during development or a
 * documented requirement, not a restatement of the implementation.
 */

import { parseQuery, screenToQuery } from "../query-parser"
import { countScreen, NUMERIC_FIELD_KEYS, type ScreenFilters } from "../screener"
import { getCompanies } from "../dealscope-data"

const { companies } = getCompanies()

let failures = 0
let checks = 0

function check(name: string, cond: boolean, detail = "") {
  checks += 1
  if (!cond) {
    failures += 1
    console.log(`  FAIL  ${name}${detail ? "  -- " + detail : ""}`)
  } else {
    console.log(`  ok    ${name}`)
  }
}

function num(f: ScreenFilters, k: string) {
  return (f.numeric as Record<string, { min?: number; max?: number } | undefined>)[k]
}

console.log("\n=== The four required example queries ===")

{
  const { filters, recognised } = parseQuery("logistics companies under 2000 Cr revenue with low debt")
  check("logistics: recognised", recognised)
  check("logistics: industry set", filters.industries.includes("Integrated Freight & Logistics"))
  check("logistics: revenue <= 2000 Cr", num(filters, "revenue")?.max === 2000)
  check("logistics: debt capped", (num(filters, "totalDebt")?.max ?? -1) > 0)
  check("logistics: no residual text", filters.text === "", JSON.stringify(filters.text))
}

{
  const { filters, recognised } = parseQuery("high growth pharma mid-cap ROCE > 18")
  check("pharma: recognised", recognised)
  check("pharma: both drug industries", filters.industries.length === 2)
  check("pharma: mid-cap band", num(filters, "marketCap")?.min === 5000 && num(filters, "marketCap")?.max === 20000)
  check("pharma: explicit ROCE >= 18", num(filters, "roce")?.min === 18)
  check("pharma: growth floor from Lifesciences p75, not universe", num(filters, "revenueGrowth")?.min === 27.4,
    `got ${num(filters, "revenueGrowth")?.min}`)
}

{
  const { filters, recognised } = parseQuery("consumer products high margin no promoter pledge")
  check("consumer: recognised", recognised)
  check("consumer: sector set", filters.sectors.includes("Consumer Products"))
  check("consumer: zero pledge", num(filters, "promoterPledge")?.max === 0)
  check("consumer: margin floor is Consumer Products p75", num(filters, "ebitdaMargin")?.min === 17.4,
    `got ${num(filters, "ebitdaMargin")?.min}`)
}

{
  const { filters, recognised } = parseQuery("industrials revenue between 500 and 3000 Cr strong ROCE")
  check("industrials: recognised", recognised)
  check("industrials: sector set", filters.sectors.includes("Industrials & Auto"))
  check("industrials: revenue range", num(filters, "revenue")?.min === 500 && num(filters, "revenue")?.max === 3000)
  check("industrials: ROCE floor present", (num(filters, "roce")?.min ?? 0) > 0)
}

console.log("\n=== Regressions ===")

{
  // Was: parseQuery mutated module-level EMPTY_SCREEN arrays, so industries
  // accumulated across unrelated calls.
  parseQuery("logistics companies")
  const { filters } = parseQuery("consumer products high margin")
  check("no state leak between calls", filters.industries.length === 0,
    `leaked: ${JSON.stringify(filters.industries)}`)
}

{
  // Was: the combined between-regex's optional trailing metric ate the next
  // clause's metric, dropping the ROCE constraint entirely.
  const { filters } = parseQuery("revenue between 500 cr and 3000 cr roce over 19.3")
  check("between-range does not swallow the next clause", num(filters, "roce")?.min === 19.3,
    `roce=${JSON.stringify(num(filters, "roce"))}`)
}

{
  // Was: "industrials" consumed, leaving a stray "auto" as free text that
  // then filtered results as if it were a company name.
  const { filters } = parseQuery("industrials & auto strong roce")
  check("full sector display name consumed whole", filters.text === "", `text=${JSON.stringify(filters.text)}`)
}

console.log("\n=== Fallback guarantee (never breaks) ===")

for (const q of ["RELIANCE", "tata motors", "zzzz nonsense query", "", "   ", "!!!"]) {
  const { filters, recognised } = parseQuery(q)
  const n = countScreen(companies, filters)
  check(`no-constraint query stays open: ${JSON.stringify(q)}`, !recognised && n === companies.length,
    `recognised=${recognised} n=${n}`)
}

console.log("\n=== Compound / unit handling ===")

{
  const { filters } = parseQuery("revenue over 1 lakh cr")
  check("lakh crore scaling", num(filters, "revenue")?.min === 100000, `got ${num(filters, "revenue")?.min}`)
}
{
  const { filters } = parseQuery("market cap over 50,000 cr")
  check("comma-separated numbers", num(filters, "marketCap")?.min === 50000, `got ${num(filters, "marketCap")?.min}`)
}
{
  const { filters } = parseQuery("debt free technology companies")
  check("debt free -> debt <= 0", num(filters, "totalDebt")?.max === 0)
  check("debt free: sector still parsed", filters.sectors.includes("Technology"))
}
{
  const { filters } = parseQuery("pe under 15 roe over 20")
  check("two independent comparisons both survive",
    num(filters, "peRatio")?.max === 15 && num(filters, "roe")?.min === 20)
}
{
  // Sector-relative thresholds must actually differ per sector, otherwise the
  // whole sector-bands artifact is pointless.
  const fin = num(parseQuery("financial services high margin").filters, "ebitdaMargin")?.min
  const life = num(parseQuery("lifesciences high margin").filters, "ebitdaMargin")?.min
  check("'high margin' is sector-relative", fin !== life && fin != null && life != null,
    `financials=${fin} lifesciences=${life}`)
}

console.log("\n=== No silent constraint drops ===")
{
  // Regression: sector-bands.json shipped without a `roe` row, so band() returned
  // null and the parser dropped the constraint without a word -- "high roce high
  // roe" silently applied only half the screen and still returned a plausible
  // count. Every field must produce a constraint for both directions.
  const WORD: Record<string, string> = {
    marketCap: "market cap", revenue: "revenue", peRatio: "pe", revenueGrowth: "growth",
    ebitdaMargin: "margin", roce: "roce", roe: "roe", totalDebt: "debt", promoterPledge: "pledge",
  }
  const dropped: string[] = []
  for (const k of NUMERIC_FIELD_KEYS) {
    for (const w of ["high", "low"]) {
      if (!num(parseQuery(`${w} ${WORD[k]}`).filters, k)) dropped.push(`${w} ${k}`)
    }
  }
  check("every numeric field resolves a qualitative word", dropped.length === 0, dropped.join(", "))
}
{
  const both = parseQuery("high roce high roe").filters
  check("compound qualitative: both halves applied",
    num(both, "roce") != null && num(both, "roe") != null, JSON.stringify(both.numeric))
}
{
  // Pledge is zero-heavy, so it is intentionally rule-based rather than
  // percentile-based -- quartiles would all be 0 and mean nothing.
  check("low pledge -> unpledged only", num(parseQuery("low pledge").filters, "promoterPledge")?.max === 0)
  check("high pledge -> pledged only", (num(parseQuery("high pledge").filters, "promoterPledge")?.min ?? 0) > 0)
}

console.log("\n=== Round-trip ===")
{
  const original = parseQuery("industrials revenue between 500 and 3000 Cr strong ROCE").filters
  const rendered = screenToQuery(original)
  const reparsed = parseQuery(rendered).filters
  check("screenToQuery -> parseQuery preserves match count",
    countScreen(companies, original) === countScreen(companies, reparsed),
    `rendered=${JSON.stringify(rendered)} ${countScreen(companies, original)} vs ${countScreen(companies, reparsed)}`)
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.log(`${failures} FAILED`)
  process.exit(1)
}
