/**
 * Client-side score blend: missing factors are dropped and the rest reweighted.
 * Matches Python scoring.py — missing is never zero.
 *
 * Run: npx tsx lib/__tests__/scoring.test.ts
 * Or:  npm test
 */

import {
  computeScore,
  DEFAULT_WEIGHTS,
  getCompanies,
  MIN_POPULATED_FACTORS,
  type FactorScores,
  type Weights,
} from "../dealscope-data"

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

const equal: Weights = { revenueGrowth: 25, ebitdaMargin: 25, roce: 25, debtLevel: 25 }

console.log("=== Missing Factor 4 is reweighted, never treated as zero ===")
{
  const three: FactorScores = { revenueGrowth: 80, ebitdaMargin: 40, roce: 20, debtLevel: null }
  const got = computeScore(three, equal)
  const expected = Math.round((80 * 25 + 40 * 25 + 20 * 25) / 75)
  const ifZero = Math.round((80 * 25 + 40 * 25 + 20 * 25 + 0 * 25) / 100)
  check("3-factor blend uses the remaining weights only", got === expected, `got ${got} expected ${expected}`)
  check("null leverage is not blended in as zero", got !== ifZero, `got ${got} ifZero ${ifZero}`)
}

console.log("\n=== Equal four-factor blend ===")
{
  const four: FactorScores = { revenueGrowth: 100, ebitdaMargin: 50, roce: 0, debtLevel: 50 }
  check("four present factors average correctly", computeScore(four, equal) === 50)
}

console.log("\n=== Sparse scores stay blank ===")
{
  const one: FactorScores = { revenueGrowth: 100, ebitdaMargin: null, roce: null, debtLevel: null }
  check("one factor is not a score", computeScore(one, equal) === null)
  const two: FactorScores = { revenueGrowth: 100, ebitdaMargin: 0, roce: null, debtLevel: null }
  check("two factors still produce a score (0 is a real value)", computeScore(two, equal) === 50)
  check(`MIN_POPULATED_FACTORS is ${MIN_POPULATED_FACTORS}`, MIN_POPULATED_FACTORS === 2)
}

console.log("\n=== All weights on a missing factor cannot invent a score ===")
{
  const fsStyle: FactorScores = { revenueGrowth: 60, ebitdaMargin: 60, roce: 60, debtLevel: null }
  const onlyDebt: Weights = { revenueGrowth: 0, ebitdaMargin: 0, roce: 0, debtLevel: 25 }
  check("FS-style row with only leverage weighted is unscored, not zero", computeScore(fsStyle, onlyDebt) === null)
}

console.log("\n=== Live payload: Financial Services has no Factor 4 ===")
{
  const { companies } = getCompanies()
  const fs = companies.filter((c) => c.sectorKey === "Financial Services" || c.sector === "Financial Services")
  const fsBlank = fs.filter((c) => c.factors.debtLevel == null)
  check("FS universe is present", fs.length > 0, `n=${fs.length}`)
  check("every FS company has blank Factor 4", fsBlank.length === fs.length, `${fsBlank.length} / ${fs.length}`)
  const scoredFs = fs.filter((c) => computeScore(c.factors, DEFAULT_WEIGHTS) != null)
  check("FS companies can still score on the other three factors", scoredFs.length > 0, `n=${scoredFs.length}`)
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.log(`${failures} FAILED`)
  process.exit(1)
}
