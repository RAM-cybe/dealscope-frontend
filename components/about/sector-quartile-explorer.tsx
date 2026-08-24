"use client"

import { useState } from "react"
import sectorBands from "@/data/sector-bands.json"

const METRICS = [
  { key: "ebitdaMargin", label: "EBITDA Margin", unit: "%", decimals: 1 },
  { key: "roce", label: "ROCE", unit: "%", decimals: 1 },
  { key: "revenueGrowth", label: "Revenue Growth", unit: "%", decimals: 1 },
  { key: "peRatio", label: "P/E Multiple", unit: "x", decimals: 1 },
  { key: "totalDebt", label: "Total Debt", unit: "₹ Cr", decimals: 0 },
] as const

type MetricKey = (typeof METRICS)[number]["key"]

export function SectorQuartileExplorer() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("ebitdaMargin")
  const sectorsData = sectorBands.sectors as Record<string, Record<string, { p25: number; p50: number; p75: number; sample_size: number }>>

  const sectorNames = Object.keys(sectorsData).filter((s) => s !== "__all__")
  const activeMetricMeta = METRICS.find((m) => m.key === selectedMetric) || METRICS[0]

  return (
    <div className="border border-border/40 bg-card/25 p-5 md:p-6 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/30 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold block">
            Interactive Sector Quartile Atlas
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/70">
            Empirical P25, Median (P50), and P75 distribution cutpoints across 13 sector cohorts
          </span>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-accent border border-accent/40 bg-accent/5 px-2.5 py-1 shrink-0 self-start sm:self-auto font-medium">
          2,381 Universe Baseline
        </span>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2 mt-5">
        {METRICS.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 border ${
              selectedMetric === metric.key
                ? "border-accent bg-accent/10 text-accent font-semibold"
                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Small-Multiples Table / Range Grid */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[11px] uppercase tracking-wider">
              <th className="py-2.5 pr-4 font-normal">Sector Cohort</th>
              <th className="py-2.5 px-3 text-right font-normal">Sample (N)</th>
              <th className="py-2.5 px-3 text-right font-normal text-muted-foreground/70">P25 (Bottom)</th>
              <th className="py-2.5 px-3 text-right font-semibold text-accent">P50 (Median)</th>
              <th className="py-2.5 px-3 text-right font-normal text-foreground">P75 (Top)</th>
              <th className="py-2.5 pl-4 min-w-[140px] font-normal">Interquartile Range (IQR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sectorNames.map((sectorName) => {
              const data = sectorsData[sectorName]?.[selectedMetric]
              if (!data) return null

              const p25 = data.p25
              const p50 = data.p50
              const p75 = data.p75
              const n = data.sample_size

              // Normalize for visual mini-bar (clamp 0-100%)
              const allData = sectorsData["__all__"]?.[selectedMetric]
              const minVal = Math.min(0, allData ? allData.p25 : 0)
              const maxVal = allData ? allData.p75 * 1.8 : 50
              const span = Math.max(1, maxVal - minVal)

              const leftPct = Math.max(0, Math.min(100, ((p25 - minVal) / span) * 100))
              const widthPct = Math.max(4, Math.min(100 - leftPct, ((p75 - p25) / span) * 100))
              const medPct = Math.max(0, Math.min(100, ((p50 - minVal) / span) * 100))

              return (
                <tr key={sectorName} className="hover:bg-accent/[0.02] transition-colors">
                  <td className="py-2.5 pr-4 text-foreground font-medium text-pretty">{sectorName}</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground/70 tabular-nums">{n}</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground/80 tabular-nums">
                    {p25.toFixed(activeMetricMeta.decimals)}
                    {activeMetricMeta.unit === "%" ? "%" : activeMetricMeta.unit === "x" ? "x" : ""}
                  </td>
                  <td className="py-2.5 px-3 text-right text-accent font-semibold tabular-nums">
                    {p50.toFixed(activeMetricMeta.decimals)}
                    {activeMetricMeta.unit === "%" ? "%" : activeMetricMeta.unit === "x" ? "x" : ""}
                  </td>
                  <td className="py-2.5 px-3 text-right text-foreground font-medium tabular-nums">
                    {p75.toFixed(activeMetricMeta.decimals)}
                    {activeMetricMeta.unit === "%" ? "%" : activeMetricMeta.unit === "x" ? "x" : ""}
                  </td>
                  <td className="py-2.5 pl-4">
                    <div className="h-2 w-full bg-border/40 relative rounded-none overflow-hidden">
                      {/* P25 to P75 range */}
                      <div
                        className="absolute top-0 bottom-0 bg-accent/30 border-x border-accent/70"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      />
                      {/* Median marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-accent -translate-x-1/2"
                        style={{ left: `${medPct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground/70">
        <span>
          <strong className="text-foreground font-medium">Visual Key:</strong> Shaded block = Interquartile zone (P25 to P75); Vertical amber line = Sector Median (P50).
        </span>
        <span className="text-accent/90">Winsorized at 1st &amp; 99th percentiles</span>
      </div>
    </div>
  )
}
