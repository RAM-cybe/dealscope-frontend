"use client"

import React, { useState, useId, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type FactorScores, type Weights } from "@/lib/dealscope-data"

interface FactorRadarChartProps {
  factors: FactorScores
  weights?: Weights
  sector: string
  unclassified?: boolean
  rawMetrics?: Record<string, string | number>
  className?: string
}

export function FactorRadarChart({
  factors,
  weights,
  sector,
  unclassified = false,
  rawMetrics = {},
  className = "",
}: FactorRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const filterId = useId()

  const isFig = sector === "Financial Services"

  // Ultra-safe coordinate system dimensions (540x380) with generous border clearance
  const viewBoxWidth = 540
  const viewBoxHeight = 380
  const cx = 270
  const cy = 190
  const maxRadius = 105
  const minRadius = maxRadius * 0.08

  // 4 Standard DealScope Factor Axes
  const axes = useMemo(
    () => [
      {
        key: "revenueGrowth" as const,
        label: "Revenue Growth",
        shortLabel: "GROWTH",
        angle: -Math.PI / 2,
        metricKey: "revenueGrowth",
        explainer: "Sales growth momentum relative to sector peers",
      },
      {
        key: "ebitdaMargin" as const,
        label: "EBITDA Margin",
        shortLabel: "MARGIN",
        angle: 0,
        metricKey: "ebitdaMargin",
        explainer: "Core operating cash profitability margin",
      },
      {
        key: "roce" as const,
        label: "ROCE",
        shortLabel: "ROCE",
        angle: Math.PI / 2,
        metricKey: "roce",
        explainer: "Efficiency of turning invested capital into operating profit",
      },
      {
        key: "debtLevel" as const,
        label: "Debt Health",
        shortLabel: "LEVERAGE",
        angle: Math.PI,
        metricKey: "debtLevel",
        explainer: isFig
          ? "Exempt for Banks & NBFCs (debt is raw material for lending)"
          : "Lower leverage / debt burden scores higher",
      },
    ],
    [isFig]
  )

  // Radial scale converter (0 to 100)
  const getRadius = (score: number | null) => {
    if (score == null) return minRadius
    const clamped = Math.max(0, Math.min(100, score))
    return minRadius + (maxRadius - minRadius) * (clamped / 100)
  }

  const getPoint = (radius: number, angle: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  })

  // Precomputed baseline polygon points
  const p100Points = axes.map((a) => getPoint(maxRadius, a.angle)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const p75Points = axes.map((a) => getPoint(getRadius(75), a.angle)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const p50Points = axes.map((a) => getPoint(getRadius(50), a.angle)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const p25Points = axes.map((a) => getPoint(getRadius(25), a.angle)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

  // Target company polygon points (Handles FIG 3-point triangle or standard 4-point quadrilateral)
  const targetPolygonPoints = useMemo(() => {
    const validAxes = isFig && factors.debtLevel == null ? axes.filter((a) => a.key !== "debtLevel") : axes
    return validAxes
      .map((axis) => {
        const val = factors[axis.key]
        const r = getRadius(val)
        const pt = getPoint(r, axis.angle)
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
      })
      .join(" ")
  }, [axes, factors, isFig, maxRadius, minRadius, cx, cy])

  // Company Archetype diagnosis in simple plain language
  const archetype = useMemo(() => {
    const g = factors.revenueGrowth ?? 50
    const m = factors.ebitdaMargin ?? 50
    const r = factors.roce ?? 50
    const d = factors.debtLevel ?? 50

    if (g >= 75 && m >= 70 && r >= 70) return { label: "Top-Quartile Compounder", desc: "Outperforming peers on Growth, Margin & Capital Efficiency", color: "text-accent border-accent/40 bg-accent/5" }
    if (r >= 80 && (isFig || d >= 75)) return { label: "High-Return Capital Efficient", desc: "Superior ROCE paired with a pristine balance sheet", color: "text-emerald-500 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/5" }
    if (g >= 75 && m < 45) return { label: "High-Growth Expansion Play", desc: "Aggressive revenue expansion ahead of profitability inflection", color: "text-cyan-500 dark:text-cyan-400 border-cyan-500/40 bg-cyan-500/5" }
    if (m >= 75 && g < 40) return { label: "Cash-Rich Margin Leader", desc: "High operating margin cash generator in mature sector", color: "text-amber-500 dark:text-amber-300 border-amber-400/40 bg-amber-400/5" }
    if (r < 35 && m < 35) return { label: "Operational Turnaround", desc: "Underperforming sector median; candidate for restructuring", color: "text-rose-500 dark:text-rose-400 border-rose-500/40 bg-rose-500/5" }
    return { label: "Sector-Balanced Performer", desc: "Operating consistently within median sector ranges", color: "text-muted-foreground border-border/60 bg-card/40" }
  }, [factors, isFig])

  if (unclassified) {
    return (
      <div className={`border border-border/60 bg-card/30 p-8 flex flex-col items-center justify-center text-center ${className}`}>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Radar Fingerprint Unavailable
        </span>
        <p className="font-mono text-xs text-muted-foreground/70 mt-2 max-w-xs leading-relaxed">
          This entity has no assigned sector cohort, so peer-relative polygon percentiles cannot be formed.
        </p>
      </div>
    )
  }

  return (
    <div className={`border border-border/60 bg-card/30 p-4 sm:p-6 flex flex-col items-center select-none relative overflow-hidden transition-colors ${className}`}>
      {/* Corner Terminal Accent Brackets */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-accent/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-accent/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-accent/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-accent/40 pointer-events-none" />

      {/* Top Header Strip */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
          <span className="uppercase tracking-widest text-foreground font-semibold text-[11px] sm:text-xs">
            Factor Radar // {sector}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border font-mono font-medium ${archetype.color}`}>
            {archetype.label}
          </span>
        </div>
      </div>

      {/* Main SVG Radar Canvas (Fluid aspect ratio with guaranteed clearance) */}
      <div className="relative w-full max-w-[540px] flex items-center justify-center my-1 aspect-[540/380]">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-w-[540px] overflow-visible select-none"
        >
          <defs>
            {/* Glow Filter */}
            <filter id={`radar-glow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Amber Radial Fill Gradient */}
            <radialGradient id={`radar-fill-${filterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
              <stop offset="65%" stopColor="var(--accent)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Grid Polygons */}
          {/* 100% Boundary */}
          <polygon points={p100Points} fill="none" stroke="var(--border)" strokeWidth="1.2" />
          {/* 25% Quartile */}
          <polygon points={p25Points} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />

          {/* 75% Top Quartile Reference Ring */}
          <polygon
            points={p75Points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* 50% Sector Median Baseline Ring (Primary Benchmark) */}
          <polygon
            points={p50Points}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.75"
          />

          {/* Concentric Percentage Annotations on North Spoke */}
          <text x={cx + 6} y={cy - getRadius(25) + 3} className="font-mono text-[8px] fill-muted-foreground/60 font-medium">25</text>
          <text x={cx + 6} y={cy - getRadius(50) + 3} className="font-mono text-[8px] fill-muted-foreground font-semibold">50</text>
          <text x={cx + 6} y={cy - getRadius(75) + 3} className="font-mono text-[8px] fill-muted-foreground/70 font-medium">75</text>
          <text x={cx + 6} y={cy - maxRadius + 3} className="font-mono text-[8px] fill-muted-foreground/60 font-medium">100</text>

          {/* Axis Radial Spokes */}
          {axes.map((axis, i) => {
            const endPt = getPoint(maxRadius, axis.angle)
            const weightVal = weights ? weights[axis.key] : 25
            const isHovered = hoveredIndex === i
            const isExempt = isFig && axis.key === "debtLevel"

            return (
              <line
                key={axis.key}
                x1={cx}
                y1={cy}
                x2={endPt.x}
                y2={endPt.y}
                stroke={isHovered ? "var(--accent)" : "var(--border)"}
                strokeWidth={isHovered ? 1.75 : 1}
                strokeDasharray={isExempt ? "3 3" : undefined}
                strokeOpacity={isHovered ? 1 : 0.5 + (weightVal / 100) * 0.5}
                className="transition-colors duration-200"
              />
            )
          })}

          {/* Target Company Active Polygon */}
          <motion.polygon
            points={targetPolygonPoints}
            fill={`url(#radar-fill-${filterId})`}
            stroke="var(--accent)"
            strokeWidth="2.5"
            filter={`url(#radar-glow-${filterId})`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />

          {/* Center Point Crosshair */}
          <circle cx={cx} cy={cy} r="2.5" fill="var(--muted-foreground)" />

          {/* Interactive Vertex Nodes */}
          {axes.map((axis, i) => {
            const val = factors[axis.key]
            const isMissing = val == null
            const isExempt = isFig && axis.key === "debtLevel"
            const r = isExempt ? minRadius : getRadius(val)
            const pt = getPoint(r, axis.angle)
            const isHovered = hoveredIndex === i

            return (
              <g key={axis.key} className="cursor-pointer">
                {/* Outer Reticle Ring on Hover or Top Performer */}
                {(isHovered || (val != null && val >= 90)) && !isExempt && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 9 : 7}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    className="transition-all duration-150"
                  />
                )}

                {/* Visible Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isMissing || isExempt ? "var(--muted-foreground)" : "var(--accent)"}
                  stroke="var(--background)"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Expanded Invisible Hit Target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={26}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}

          {/* Structured Two-Line Monospace Labels & Scores with Zero Overflow */}
          {axes.map((axis, i) => {
            const scoreVal = factors[axis.key]
            const isHovered = hoveredIndex === i
            const isExempt = isFig && axis.key === "debtLevel"
            const rawVal = rawMetrics[axis.key]

            // Exact coordinate placement for 2-line layout
            let line1X = cx
            let line1Y = cy
            let line2X = cx
            let line2Y = cy
            let textAnchor: "middle" | "start" | "end" = "middle"

            if (axis.angle === -Math.PI / 2) {
              // North (GROWTH)
              textAnchor = "middle"
              line1X = cx
              line1Y = 48
              line2X = cx
              line2Y = 64
            } else if (axis.angle === 0) {
              // East (MARGIN)
              textAnchor = "start"
              line1X = cx + maxRadius + 19
              line1Y = cy - 8
              line2X = cx + maxRadius + 19
              line2Y = cy + 8
            } else if (axis.angle === Math.PI / 2) {
              // South (ROCE)
              textAnchor = "middle"
              line1X = cx
              line1Y = cy + maxRadius + 27
              line2X = cx
              line2Y = cy + maxRadius + 43
            } else if (axis.angle === Math.PI) {
              // West (LEVERAGE)
              textAnchor = "end"
              line1X = cx - maxRadius - 19
              line1Y = cy - 8
              line2X = cx - maxRadius - 19
              line2Y = cy + 8
            }

            return (
              <g
                key={axis.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Line 1: Factor Header */}
                <text
                  x={line1X}
                  y={line1Y}
                  textAnchor={textAnchor}
                  className={`font-mono text-[10.5px] uppercase tracking-wider transition-colors duration-150 ${
                    isHovered ? "fill-accent font-bold" : "fill-muted-foreground font-medium"
                  }`}
                >
                  {axis.shortLabel}
                </text>

                {/* Line 2: Score + Metric Pill */}
                <text
                  x={line2X}
                  y={line2Y}
                  textAnchor={textAnchor}
                  className="font-mono text-[10px] uppercase tracking-wider"
                >
                  <tspan className={isHovered ? "fill-accent font-bold" : "fill-foreground font-semibold"}>
                    {isExempt ? "EXEMPT" : scoreVal != null ? `${scoreVal}` : "—"}
                  </tspan>
                  {rawVal && !isExempt && (
                    <tspan className="fill-muted-foreground/80 text-[9.5px]">
                      {" "}({rawVal})
                    </tspan>
                  )}
                  {isExempt && (
                    <tspan className="fill-muted-foreground/70 text-[9.5px]">
                      {" "}(FIG)
                    </tspan>
                  )}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Center P50 / Median Reference Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50 border border-border/40 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-xs">
            P50 REF
          </span>
        </div>

        {/* Floating Telemetry HUD Tooltip Card */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute left-1/2 bottom-2 -translate-x-1/2 z-30 pointer-events-none bg-popover/95 border border-accent/50 p-3 shadow-2xl backdrop-blur-md w-[240px] max-w-[calc(100%-20px)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 mb-1.5 font-mono text-[11px]">
                <span className="uppercase tracking-wider text-accent font-bold">
                  {axes[hoveredIndex].label}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Weight: {weights ? `${weights[axes[hoveredIndex].key]}%` : "25%"}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-muted-foreground text-[11px]">Sector Percentile:</span>
                <span className="text-foreground font-bold">
                  {isFig && axes[hoveredIndex].key === "debtLevel"
                    ? "Exempt (FIG Bank)"
                    : factors[axes[hoveredIndex].key] != null
                    ? `${factors[axes[hoveredIndex].key]} / 100`
                    : "No Data"}
                </span>
              </div>
              {rawMetrics[axes[hoveredIndex].key] && (
                <div className="flex items-baseline justify-between font-mono text-xs mt-1">
                  <span className="text-muted-foreground text-[11px]">Reported Metric:</span>
                  <span className="text-accent font-semibold">
                    {rawMetrics[axes[hoveredIndex].key]}
                  </span>
                </div>
              )}
              <p className="font-mono text-[10px] text-muted-foreground/80 mt-1.5 pt-1.5 border-t border-border/30 leading-relaxed">
                {axes[hoveredIndex].explainer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Footer */}
      <div className="mt-2 pt-2.5 border-t border-border/30 w-full flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-accent inline-block shadow-[0_0_6px_var(--accent)]" />
          <span className="text-foreground font-medium">Target Company</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-muted-foreground inline-block" />
          <span>Sector Median (P50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dotted border-border inline-block" />
          <span>Top Quartile (P75)</span>
        </div>
      </div>
    </div>
  )
}
