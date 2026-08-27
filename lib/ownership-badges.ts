// Factual promoter / pledge readout for results rows and the tear-sheet
// header. Uses the numbers already on Company.raw: never invents a 0 for a
// missing value, and never hides a real 0. Compact chip copy only; no
// buy/sell/safe language.

/** Matches the existing "Elevated" pledge bucket in BUCKET_FIELDS (> 10%). */
export const ELEVATED_PLEDGE_PCT = 10

export function isPresentNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

/**
 * Compact percent for the chip. Exact 0 stays "0%". A non-zero that would
 * round to 0.0 at one decimal keeps extra digits so it cannot be mistaken
 * for an unpledged / zero-holding name.
 */
export function formatBadgePct(value: number): string {
  if (value === 0) return "0%"
  const one = value.toFixed(1)
  if (one === "0.0" || one === "-0.0") {
    const two = value.toFixed(2)
    if (two === "0.00" || two === "-0.00") return `${value}%`
    return `${two}%`
  }
  return one.endsWith(".0") ? `${Number.parseInt(one, 10)}%` : `${one}%`
}

export function ownershipBadgeLabel(
  holding: number | null | undefined,
  pledge: number | null | undefined,
): string | null {
  const hasHolding = isPresentNumber(holding)
  const hasPledge = isPresentNumber(pledge)
  if (!hasHolding && !hasPledge) return null
  const parts: string[] = []
  if (hasHolding) parts.push(`PROM ${formatBadgePct(holding)}`)
  if (hasPledge) parts.push(`PLG ${formatBadgePct(pledge)}`)
  return parts.join(" · ")
}

export function isElevatedPledge(pledge: number | null | undefined): boolean {
  return isPresentNumber(pledge) && pledge > ELEVATED_PLEDGE_PCT
}

export function ownershipBadgeTitle(
  holding: number | null | undefined,
  pledge: number | null | undefined,
): string | undefined {
  const hasHolding = isPresentNumber(holding)
  const hasPledge = isPresentNumber(pledge)
  if (!hasHolding && !hasPledge) return undefined
  const bits: string[] = []
  if (hasHolding) bits.push(`Promoter holding ${formatBadgePct(holding)}`)
  if (hasPledge) bits.push(`Promoter pledge ${formatBadgePct(pledge)}`)
  return `${bits.join(". ")}.`
}
