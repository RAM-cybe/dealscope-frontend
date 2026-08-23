/**
 * Locked 30-column comps CSV: missing stays empty, zeros stay zeros,
 * export follows the on-screen result set and weights.
 *
 * Run: npx tsx lib/__tests__/export-csv.test.ts
 */

import { computeScore, DEFAULT_WEIGHTS, getCompanies, getDeals, type Company, type Weights } from "../dealscope-data"
import { COMPS_CSV_HEADERS, buildCompsCsv, compsCsvFilename } from "../export-comps-csv"

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

function emptyRaw(): Company["raw"] {
  return {
    marketCap: null,
    revenue: null,
    ebitda: null,
    netIncome: null,
    peRatio: null,
    priceToBook: null,
    revenueGrowth: null,
    ebitdaMargin: null,
    roce: null,
    roe: null,
    totalDebt: null,
    debtToEquity: null,
    currentRatio: null,
    freeCashFlow: null,
    promoterHolding: null,
    promoterPledge: null,
    beta: null,
    evEbitdaLow: null,
    evEbitdaHigh: null,
  }
}

function sampleCompany(overrides: Omit<Partial<Company>, "raw"> & { raw?: Partial<Company["raw"]> } = {}): Company {
  const { raw, ...rest } = overrides
  return {
    name: "Sample Ltd",
    ticker: "SAMP",
    sector: "Financial Services",
    sectorKey: "Financial Services",
    industry: "Banks - Regional",
    sectorRaw: "Financial Services",
    factors: { revenueGrowth: 80, ebitdaMargin: 40, roce: 20, debtLevel: null },
    asOfDate: "2026-07-11",
    metrics: { revenue: "N/A", revenueGrowth: "N/A", ebitdaMargin: "N/A", roce: "N/A", totalDebt: "N/A" },
    financials: {
      marketCap: "N/A",
      marketCapAsOf: "2026-08-23",
      peRatio: "N/A",
      priceToBook: "N/A",
      roe: "N/A",
      debtToEquity: "N/A",
      currentRatio: "N/A",
      freeCashFlow: "N/A",
      promoterHolding: "N/A",
      promoterPledge: "N/A",
      beta: "N/A",
    },
    valuation: { evEbitda: "N/A", peImplied: "N/A", note: "" },
    about: null,
    hasAbout: false,
    whyThisScore: null,
    hasWhyThisScore: false,
    ...rest,
    raw: { ...emptyRaw(), ...(raw ?? {}) },
  }
}

const BOM_CHAR = "\uFEFF"

console.log("=== Schema is the locked 30 columns ===")
check("exactly 30 headers", COMPS_CSV_HEADERS.length === 30, `n=${COMPS_CSV_HEADERS.length}`)
check("column 21 is Promoter Holding (%)", COMPS_CSV_HEADERS[20] === "Promoter Holding (%)")
check("column 22 is Promoter Pledge (%)", COMPS_CSV_HEADERS[21] === "Promoter Pledge (%)")
check("column 29 is Price As Of Date", COMPS_CSV_HEADERS[28] === "Price As Of Date")
check("column 30 is Fundamentals As Of Date", COMPS_CSV_HEADERS[29] === "Fundamentals As Of Date")

console.log("\n=== Missing holding is empty; a real zero is 0.0 ===")
{
  const missing = sampleCompany({ ticker: "MISS", raw: { promoterHolding: null, marketCap: 100 } })
  const zero = sampleCompany({ ticker: "ZERO", raw: { promoterHolding: 0, marketCap: 100 } })
  const csv = buildCompsCsv([missing, zero], DEFAULT_WEIGHTS)
  check("UTF-8 BOM is present", csv.startsWith(BOM_CHAR))
  const lines = csv.replace(BOM_CHAR, "").trim().split(/\r?\n/)
  check("header plus two data rows", lines.length === 3, `n=${lines.length}`)
  const headerCols = lines[0].split(",")
  const holdingIdx = headerCols.indexOf("Promoter Holding (%)")
  check("holding column exists", holdingIdx === 20)
  const missCols = lines[1].split(",")
  const zeroCols = lines[2].split(",")
  check("missing holding cell is empty", missCols[holdingIdx] === "", `got '${missCols[holdingIdx]}'`)
  check("zero holding cell is 0.0", zeroCols[holdingIdx] === "0.0", `got '${zeroCols[holdingIdx]}'`)
  check("missing is not fabricated as 0", missCols[holdingIdx] !== "0.0")
}

console.log("\n=== Composite score follows the current weights ===")
{
  const company = sampleCompany({
    factors: { revenueGrowth: 80, ebitdaMargin: 40, roce: 20, debtLevel: null },
  })
  const equal = computeScore(company.factors, DEFAULT_WEIGHTS)
  const csv = buildCompsCsv([company], DEFAULT_WEIGHTS)
  const cols = csv.replace(BOM_CHAR, "").trim().split(/\r?\n/)[1].split(",")
  check("score column matches computeScore", cols[4] === Number(equal).toFixed(1), `csv=${cols[4]} score=${equal}`)
  const growthHeavy: Weights = { revenueGrowth: 100, ebitdaMargin: 0, roce: 0, debtLevel: 0 }
  const heavyScore = computeScore(company.factors, growthHeavy)
  const heavyCsv = buildCompsCsv([company], growthHeavy)
  const heavyCols = heavyCsv.replace(BOM_CHAR, "").trim().split(/\r?\n/)[1].split(",")
  check("reweighted score is written", heavyCols[4] === Number(heavyScore).toFixed(1), `csv=${heavyCols[4]}`)
  check("equal and growth-heavy scores differ", cols[4] !== heavyCols[4])
}

console.log("\n=== Text with commas is quoted; dates stay ISO ===")
{
  const company = sampleCompany({
    name: "Foo, Bar Ltd",
    sector: "Telecom, Media & Entertainment",
    asOfDate: "2026-07-11",
    financials: {
      marketCap: "N/A",
      marketCapAsOf: "2026-08-23",
      peRatio: "N/A",
      priceToBook: "N/A",
      roe: "N/A",
      debtToEquity: "N/A",
      currentRatio: "N/A",
      freeCashFlow: "N/A",
      promoterHolding: "N/A",
      promoterPledge: "N/A",
      beta: "N/A",
    },
  })
  const csv = buildCompsCsv([company], DEFAULT_WEIGHTS)
  check("name is quoted", csv.includes('"Foo, Bar Ltd"'))
  check("sector is quoted", csv.includes('"Telecom, Media & Entertainment"'))
  check("price date is ISO", csv.includes("2026-08-23"))
  check("fundamentals date is ISO", csv.includes("2026-07-11"))
}

console.log("\n=== Filename pattern ===")
{
  const date = "2026-08-23"
  check(
    "full universe is All_Listed",
    compsCsvFilename({ resultCount: 2381, universeCount: 2381, query: "", sectors: [], pricesAsOf: date }) ===
      "DealScope_All_Listed_Comps_20260823.csv",
  )
  check(
    "one sector uses the sector slug",
    compsCsvFilename({
      resultCount: 100,
      universeCount: 2381,
      query: "",
      sectors: ["Financial Services"],
      pricesAsOf: date,
    }) === "DealScope_Comps_Financial_Services_20260823.csv",
  )
  check(
    "query wins over sector",
    compsCsvFilename({
      resultCount: 12,
      universeCount: 2381,
      query: "high roce low debt",
      sectors: ["Financial Services"],
      pricesAsOf: date,
    }) === "DealScope_Comps_high_roce_low_debt_20260823.csv",
  )
  check(
    "multi-sector screen without query",
    compsCsvFilename({
      resultCount: 50,
      universeCount: 2381,
      query: "",
      sectors: ["Financial Services", "Chemicals"],
      pricesAsOf: date,
    }) === "DealScope_Comps_Screened_20260823.csv",
  )
}

console.log("\n=== Live payload after Build 1 copy ===")
{
  const { companies } = getCompanies()
  const deals = getDeals()
  const holdingPresent = companies.filter((c) => c.raw.promoterHolding != null)
  const holdingMissing = companies.filter((c) => c.raw.promoterHolding == null)
  const missingAsZero = companies.filter((c) => c.raw.promoterHolding == null && c.financials.promoterHolding !== "N/A")
  check("universe is 2381", companies.length === 2381, `n=${companies.length}`)
  check("promoter holding populated on 2260 names", holdingPresent.length === 2260, `n=${holdingPresent.length}`)
  check("promoter holding missing on 121 names", holdingMissing.length === 121, `n=${holdingMissing.length}`)
  check("missing holding displays as N/A, not 0%", missingAsZero.length === 0, `n=${missingAsZero.length}`)
  const andhra = companies.find((c) => c.ticker === "ANDHRSUGAR")
  check("ANDHRSUGAR keeps a real 0% holding", andhra?.raw.promoterHolding === 0)
  const vacant = companies.find((c) => c.ticker === "3PLAND")
  check("3PLAND holding stays null", vacant?.raw.promoterHolding == null)
  const unclassifiedDeals = deals.filter((d) => d.sector_v2 === "Unclassified")
  check("no unclassified deals remain", unclassifiedDeals.length === 0, `n=${unclassifiedDeals.length}`)
  const hdfc = deals.find((d) => d.target.includes("Housing Development Finance"))
  check("HDFC merger is Financial Services", hdfc?.sector_v2 === "Financial Services", `got ${hdfc?.sector_v2}`)
  const adpushup = deals.find((d) => d.target === "AdPushup")
  check("AdPushup is Technology & IT Services", adpushup?.sector_v2 === "Technology & IT Services")
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.log(`${failures} FAILED`)
  process.exit(1)
}
