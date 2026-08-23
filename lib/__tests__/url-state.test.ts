/**
 * Landing → results → tear sheet URLs must round-trip cleanly.
 *
 * Run: npx tsx lib/__tests__/url-state.test.ts
 */

import { makeScreen } from "../screener"
import { canonicalizeUrlState, decodeUrlState, encodeUrlState } from "../url-state"

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

function decode(qs: string) {
  return decodeUrlState(new URLSearchParams(qs))
}

console.log("=== Landing is a bare URL ===")
{
  const qs = encodeUrlState({ view: "landing", ticker: null, screen: makeScreen() })
  check("empty screen encodes to empty query", qs === "")
  const round = decode(qs)
  check("empty query is landing", round.view === "landing" && round.ticker === null)
}

console.log("\n=== Landing must not keep a leftover ticker ===")
{
  const qs = encodeUrlState({ view: "landing", ticker: "INFY", screen: makeScreen() })
  check("landing drops ticker", !qs.includes("ticker"))
  check("landing drops view", !qs.includes("view="))
}

console.log("\n=== Results ===")
{
  const screen = makeScreen({ text: "pharma", sectors: ["Healthcare & Lifesciences"] })
  const qs = encodeUrlState({ view: "results", ticker: null, screen })
  check("results sets view=results", qs.includes("view=results"))
  check("results keeps the query", qs.includes("q=pharma"))
  check("results does not invent a ticker", !qs.includes("ticker"))
  const round = decode(qs)
  check("results round-trips view", round.view === "results")
  check("results round-trips text", round.screen.text === "pharma")
}

console.log("\n=== Results must not keep a leftover ticker ===")
{
  const qs = encodeUrlState({ view: "results", ticker: "INFY", screen: makeScreen() })
  check("results URL has no ticker", !qs.includes("ticker"))
  check("results URL is view=results", qs === "view=results")
}

console.log("\n=== Tear sheet is view=detail, not view=results ===")
{
  const qs = encodeUrlState({ view: "detail", ticker: "INFY", screen: makeScreen() })
  check("sheet uses view=detail", qs.includes("view=detail"))
  check("sheet does not say view=results", !qs.includes("view=results"))
  check("sheet carries ticker", qs.includes("ticker=INFY"))
  const round = decode(qs)
  check("sheet round-trips to detail", round.view === "detail" && round.ticker === "INFY")
}

console.log("\n=== Legacy view=results&ticker= still opens the sheet ===")
{
  const round = decode("view=results&ticker=TCS")
  check("old shared links still open the tear sheet", round.view === "detail" && round.ticker === "TCS")
  const canonical = canonicalizeUrlState(new URLSearchParams("view=results&ticker=TCS"))
  check("canonical form is view=detail&ticker=TCS", canonical === "view=detail&ticker=TCS")
}

console.log("\n=== Broken / leftover params ===")
{
  check("view=detail without ticker degrades to results", decode("view=detail").view === "results")
  check("blank ticker is treated as missing", decode("view=results&ticker=").ticker === null)
  check("whitespace ticker is treated as missing", decode("ticker=   ").ticker === null)
  const junk = canonicalizeUrlState(new URLSearchParams("view=results&foo=bar&ticker="))
  check("unknown keys are stripped", junk === "view=results", `got ${junk}`)
  const withScreen = encodeUrlState({
    view: "detail",
    ticker: "INFY",
    screen: makeScreen({ text: "pharma" }),
  })
  check("in-app sheet keeps the screen so Back can restore it", withScreen.includes("q=pharma") && withScreen.includes("view=detail"))
}

console.log("\n=== Encode is stable (no replace/read loop) ===")
{
  const screen = makeScreen({ text: "steel", sectors: ["Metals, Mining & Materials"] })
  const a = encodeUrlState({ view: "results", ticker: null, screen })
  const b = encodeUrlState(decode(a))
  check("encode(decode(encode(x))) === encode(x)", a === b, `a=${a} b=${b}`)
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.log(`${failures} FAILED`)
  process.exit(1)
}
