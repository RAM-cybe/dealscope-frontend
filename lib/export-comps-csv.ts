/** Locked 30-column comps CSV for the current screened result set.

No advisory language. Missing values are empty cells, never 0.
₹ Cr fields are already stored on Company.raw in crores.
*/

import datasetMeta from "@/data/dataset-meta.json"
import { computeScore, type Company, type Weights } from "@/lib/dealscope-data"

export const COMPS_CSV_HEADERS = [
  "Ticker",
  "Company Name",
  "Sector",
  "Industry",
  "Composite Score",
  "Market Cap (INR Cr)",
  "Revenue TTM (INR Cr)",
  "Revenue Growth YoY (%)",
  "EBITDA (INR Cr)",
  "EBITDA Margin (%)",
  "Net Income (INR Cr)",
  "ROCE (%)",
  "ROE (%)",
  "Total Debt (INR Cr)",
  "Debt to Equity (x)",
  "Current Ratio (x)",
  "Free Cash Flow (INR Cr)",
  "P/E Ratio (x)",
  "Price to Book (x)",
  "Beta",
  "Promoter Holding (%)",
  "Promoter Pledge (%)",
  "Growth Percentile",
  "Margin Percentile",
  "ROCE Percentile",
  "Leverage Health Percentile",
  "Peer EV/EBITDA Implied Low (INR Cr)",
  "Peer EV/EBITDA Implied High (INR Cr)",
  "Price As Of Date",
  "Fundamentals As Of Date",
] as const

const BOM = "\uFEFF"

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function numCell(value: number | null | undefined, decimals: number): string {
  if (value == null || typeof value !== "number" || Number.isNaN(value)) return ""
  return value.toFixed(decimals)
}

function textCell(value: string | null | undefined): string {
  if (value == null || value === "") return ""
  return csvEscape(value)
}

function dateCell(value: string | null | undefined): string {
  if (!value) return ""
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match ? match[1] : csvEscape(value)
}

function rowCells(company: Company, weights: Weights): string[] {
  const score = computeScore(company.factors, weights)
  const raw = company.raw
  return [
    textCell(company.ticker.toUpperCase()),
    textCell(company.name),
    textCell(company.sector),
    textCell(company.industry),
    numCell(score, 1),
    numCell(raw.marketCap, 2),
    numCell(raw.revenue, 2),
    numCell(raw.revenueGrowth, 1),
    numCell(raw.ebitda, 2),
    numCell(raw.ebitdaMargin, 1),
    numCell(raw.netIncome, 2),
    numCell(raw.roce, 1),
    numCell(raw.roe, 1),
    numCell(raw.totalDebt, 2),
    numCell(raw.debtToEquity, 2),
    numCell(raw.currentRatio, 2),
    numCell(raw.freeCashFlow, 2),
    numCell(raw.peRatio, 2),
    numCell(raw.priceToBook, 2),
    numCell(raw.beta, 2),
    numCell(raw.promoterHolding, 1),
    numCell(raw.promoterPledge, 1),
    numCell(company.factors.revenueGrowth, 1),
    numCell(company.factors.ebitdaMargin, 1),
    numCell(company.factors.roce, 1),
    numCell(company.factors.debtLevel, 1),
    numCell(raw.evEbitdaLow, 2),
    numCell(raw.evEbitdaHigh, 2),
    dateCell(company.financials.marketCapAsOf),
    dateCell(company.asOfDate),
  ]
}

export function buildCompsCsv(companies: Company[], weights: Weights): string {
  const lines = [COMPS_CSV_HEADERS.join(",")]
  for (const company of companies) {
    lines.push(rowCells(company, weights).join(","))
  }
  return BOM + lines.join("\r\n") + "\r\n"
}

export function slugForFilename(value: string): string {
  return value
    .replace(/&/g, " and ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48)
}

function yyyymmdd(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return isoDate.replace(/-/g, "")
  return `${match[1]}${match[2]}${match[3]}`
}

export interface CompsCsvFilenameInput {
  resultCount: number
  universeCount: number
  query: string
  sectors: string[]
  pricesAsOf?: string
}

export function compsCsvFilename(input: CompsCsvFilenameInput): string {
  const date = yyyymmdd(input.pricesAsOf ?? datasetMeta.prices_as_of ?? "")
  const querySlug = slugForFilename(input.query.trim())
  const unconstrained =
    input.resultCount === input.universeCount &&
    querySlug.length === 0 &&
    input.sectors.length === 0

  if (unconstrained) {
    return `DealScope_All_Listed_Comps_${date}.csv`
  }
  if (querySlug) {
    return `DealScope_Comps_${querySlug}_${date}.csv`
  }
  if (input.sectors.length === 1) {
    const sectorSlug = slugForFilename(input.sectors[0]) || "Sector"
    return `DealScope_Comps_${sectorSlug}_${date}.csv`
  }
  return `DealScope_Comps_Screened_${date}.csv`
}

export function downloadCompsCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
