/**
 * Promoter / pledge badge copy: missing stays hidden, a real 0 stays 0,
 * a tiny non-zero is not rounded into 0%, elevated pledge is > 10%.
 *
 * Run: npx tsx lib/__tests__/ownership-badges.test.ts
 */

import { getCompanies } from "../dealscope-data"
import {
  formatBadgePct,
  isElevatedPledge,
  isPresentNumber,
  ownershipBadgeLabel,
  ownershipBadgeTitle,
} from "../ownership-badges"

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

console.log("=== formatBadgePct ===")
check("exact 0 is 0%", formatBadgePct(0) === "0%")
check("integer 62 is 62%", formatBadgePct(62) === "62%")
check("62.0 is 62%", formatBadgePct(62.0) === "62%")
check("55.16 is 55.2%", formatBadgePct(55.16) === "55.2%")
check("71.795 is 71.8%", formatBadgePct(71.795) === "71.8%")
check("tiny 0.01 is not 0%", formatBadgePct(0.01) === "0.01%")
check("tiny 0.03 is not 0%", formatBadgePct(0.03) === "0.03%")
check("0.04 is not coerced to 0%", formatBadgePct(0.04) !== "0%")

console.log("\n=== presence vs missing ===")
check("null is not present", isPresentNumber(null) === false)
check("undefined is not present", isPresentNumber(undefined) === false)
check("NaN is not present", isPresentNumber(Number.NaN) === false)
check("0 is present", isPresentNumber(0) === true)

console.log("\n=== combined label ===")
check(
  "both present",
  ownershipBadgeLabel(62, 0) === "PROM 62% · PLG 0%",
)
check("holding only", ownershipBadgeLabel(55.16, null) === "PROM 55.2%")
check("pledge only", ownershipBadgeLabel(null, 0) === "PLG 0%")
check("both missing is null", ownershipBadgeLabel(null, null) === null)
check("undefined pair is null", ownershipBadgeLabel(undefined, undefined) === null)
check("real 0 holding is shown", ownershipBadgeLabel(0, 0) === "PROM 0% · PLG 0%")
check(
  "missing holding is not printed as 0",
  ownershipBadgeLabel(null, 0) !== "PROM 0% · PLG 0%",
)

console.log("\n=== elevated pledge (same >10% bucket as filters) ===")
check("0 is not elevated", isElevatedPledge(0) === false)
check("10 is not elevated", isElevatedPledge(10) === false)
check("10.01 is elevated", isElevatedPledge(10.01) === true)
check("11.03 is elevated", isElevatedPledge(11.03) === true)
check("null is not elevated", isElevatedPledge(null) === false)

console.log("\n=== title / aria ===")
check(
  "title spells the facts out",
  ownershipBadgeTitle(62, 0) === "Promoter holding 62%. Promoter pledge 0%.",
)
check("title is absent when both missing", ownershipBadgeTitle(null, null) === undefined)
check("title has no buy/sell words", !/buy|attractive|target|safe|strong candidate/i.test(ownershipBadgeTitle(40, 22) ?? ""))

console.log("\n=== live records keep missing vs zero distinct ===")
{
  const byTicker = new Map(getCompanies().companies.map((c) => [c.ticker, c]))
  const andhra = byTicker.get("ANDHRSUGAR")
  const vacant = byTicker.get("3PLAND")
  const tcs = byTicker.get("TCS")
  const pledged = byTicker.get("A2ZINFRA")
  const tiny = byTicker.get("APOLLOTYRE")

  check("ANDHRSUGAR holding is a real 0", andhra?.raw.promoterHolding === 0)
  check(
    "ANDHRSUGAR badge keeps PROM 0%",
    ownershipBadgeLabel(andhra?.raw.promoterHolding, andhra?.raw.promoterPledge)?.startsWith("PROM 0%") === true,
  )
  check("3PLAND holding stays null", vacant?.raw.promoterHolding == null)
  check(
    "3PLAND badge has no PROM",
    ownershipBadgeLabel(vacant?.raw.promoterHolding, vacant?.raw.promoterPledge)?.includes("PROM") !== true,
  )
  check(
    "3PLAND badge still shows PLG",
    ownershipBadgeLabel(vacant?.raw.promoterHolding, vacant?.raw.promoterPledge)?.startsWith("PLG ") === true,
  )
  check(
    "TCS combined chip",
    ownershipBadgeLabel(tcs?.raw.promoterHolding, tcs?.raw.promoterPledge) === "PROM 71.8% · PLG 0%",
  )
  check("A2ZINFRA pledge is elevated", isElevatedPledge(pledged?.raw.promoterPledge) === true)
  check(
    "APOLLOTYRE 0.01% pledge is not 0%",
    ownershipBadgeLabel(tiny?.raw.promoterHolding, tiny?.raw.promoterPledge)?.includes("PLG 0.01%") === true,
  )
  const knack = byTicker.get("KNACK")
  check("KNACK holding is missing", knack?.raw.promoterHolding == null)
  check("KNACK pledge is missing", knack?.raw.promoterPledge == null)
  check(
    "KNACK shows no badge when both are missing",
    ownershipBadgeLabel(knack?.raw.promoterHolding, knack?.raw.promoterPledge) === null,
  )
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) process.exit(1)
