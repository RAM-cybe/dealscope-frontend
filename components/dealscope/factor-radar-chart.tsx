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

  // Standard dimensions
  const size = 360
  const center = size / 2
  const padding = 56
  const maxRadius = center - padding
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
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
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
  }, [axes, factors, isFig, maxRadius, minRadius])

  // Company Archetype diagnosis in simple plain language
  const archetype = useMemo(() => {
    const g = factors.revenueGrowth ?? 50
    const m = factors.ebitdaMargin ?? 50
    const r = factors.roce ?? 50
    const d = factors.debtLevel ?? 50

    if (g >= 75 && m >= 70 && r >= 70) return { label: "Top-Quartile Compounder", desc: "Outperforming peers on Growth, Margin & Capital Efficiency", color: "text-accent border-accent/40 bg-accent/5" }
    if (r >= 80 && (isFig || d >= 75)) return { label: "High-Return Capital Efficient", desc: "Superior ROCE paired with a pristine balance sheet", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" }
    if (g >= 75 && m < 45) return { label: "High-Growth Expansion Play", desc: "Aggressive revenue expansion ahead of profitability inflection", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/5" }
    if (m >= 75 && g < 40) return { label: "Cash-Rich Margin Leader", desc: "High operating margin cash generator in mature sector", color: "text-amber-300 border-amber-400/40 bg-amber-400/5" }
    if (r < 35 && m < 35) return { label: "Operational Turnaround", desc: "Underperforming sector median; candidate for restructuring", color: "text-rose-400 border-rose-500/40 bg-rose-500/5" }
    return { label: "Sector-Balanced Performer", desc: "Operating consistently within median sector ranges", color: "text-muted-foreground border-border/50 bg-card/40" }
  }, [factors, isFig])

  if (unclassified) {
    return (
      <div className={`border border-border/40 bg-card/15 p-8 flex flex-col items-center justify-center text-center ${className}`}>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Radar Fingerprint Unavailable
        </span>
        <p className="font-mono text-xs text-muted-foreground/60 mt-2 max-w-xs leading-relaxed">
          This entity has no assigned sector cohort, so peer-relative polygon percentiles cannot be formed.
        </p>
      </div>
    )
  }

  return (
    <div className={`border border-border/40 bg-card/25 p-5 sm:p-6 flex flex-col items-center select-none relative overflow-hidden ${className}`}>
      {/* Corner Terminal Accent Brackets */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-accent/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-accent/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-accent/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-accent/40 pointer-events-none" />

      {/* Top Header Strip */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#f59e0b]" />
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

      {/* Main SVG Radar Canvas */}
      <div className="relative flex items-center justify-center my-2" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Dark Terminal Amber Glow Filter */}
            <filter id={`radar-glow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Amber Radial Fill Gradient */}
            <radialGradient id={`radar-fill-${filterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.38" />
              <stop offset="65%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Grid Polygons */}
          {/* 100% Boundary */}
          <polygon points={p100Points} fill="none" stroke="oklch(0.24 0 0)" strokeWidth="1" />
          {/* 25% Quartile */}
          <polygon points={p25Points} fill="none" stroke="oklch(0.20 0 0)" strokeWidth="1" strokeDasharray="2 2" />

          {/* 75% Top Quartile Reference Ring */}
          <polygon
            points={p75Points}
            fill="oklch(1 0 0 / 0.015)"
            stroke="oklch(0.38 0 0)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* 50% Sector Median Baseline Ring (Primary Benchmark) */}
          <polygon
            points={p50Points}
            fill="none"
            stroke="oklch(0.55 0 0)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Concentric Percentage Annotations on North Spoke */}
          <text x={center + 5} y={center - getRadius(25) + 3} className="font-mono text-[8px] fill-muted-foreground/40">25</text>
          <text x={center + 5} y={center - getRadius(50) + 3} className="font-mono text-[8px] fill-muted-foreground/70 font-semibold">50</text>
          <text x={center + 5} y={center - getRadius(75) + 3} className="font-mono text-[8px] fill-muted-foreground/50">75</text>
          <text x={center + 5} y={center - maxRadius + 3} className="font-mono text-[8px] fill-muted-foreground/40">100</text>

          {/* Axis Radial Spokes */}
          {axes.map((axis, i) => {
            const endPt = getPoint(maxRadius, axis.angle)
            const weightVal = weights ? weights[axis.key] : 25
            const isHovered = hoveredIndex === i
            const isExempt = isFig && axis.key === "debtLevel"

            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke={isHovered ? "oklch(0.7 0.2 45)" : isExempt ? "oklch(0.22 0 0)" : "oklch(0.28 0 0)"}
                strokeWidth={isHovered ? 1.75 : 1}
                strokeDasharray={isExempt ? "3 3" : undefined}
                strokeOpacity={0.4 + (weightVal / 100) * 0.6}
                className="transition-colors duration-200"
              />
            )
          })}

          {/* Target Company Active Polygon */}
          <motion.polygon
            points={targetPolygonPoints}
            fill={`url(#radar-fill-${filterId})`}
            stroke="oklch(0.7 0.2 45)"
            strokeWidth="2.5"
            filter={`url(#radar-glow-${filterId})`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />

          {/* Center Point Crosshair */}
          <circle cx={center} cy={center} r="2" fill="oklch(0.45 0 0)" />

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
                    stroke="oklch(0.7 0.2 45)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="transition-all duration-150"
                  />
                )}

                {/* Visible Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isMissing || isExempt ? "oklch(0.35 0 0)" : "oklch(0.7 0.2 45)"}
                  stroke="oklch(0.10 0 0)"
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

          {/* Outer Monospace Labels & Scores */}
          {axes.map((axis, i) => {
            const labelRadius = maxRadius + 20
            const labelPt = getPoint(labelRadius, axis.angle)
            const scoreVal = factors[axis.key]
            const isHovered = hoveredIndex === i
            const isExempt = isFig && axis.key === "debtLevel"
            const rawVal = rawMetrics[axis.key]

            let textAnchor: "middle" | "start" | "end" = "middle"
            let dy = "0.35em"
            if (axis.angle === 0) {
              textAnchor = "start"
            } else if (axis.angle === Math.PI) {
              textAnchor = "end"
            } else if (axis.angle === -Math.PI / 2) {
              dy = "-0.6em"
            } else if (axis.angle === Math.PI / 2) {
              dy = "1.2em"
            }

            return (
              <g
                key={axis.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor={textAnchor}
                  dy={dy}
                  className={`font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-colors duration-150 ${
                    isHovered ? "fill-accent font-bold" : "fill-muted-foreground"
                  }`}
                >
                  {axis.shortLabel}
                  <tspan className="fill-foreground font-semibold ml-1">
                    {" "}
                    {isExempt ? "FIG" : scoreVal != null ? `${scoreVal}` : "—"}
                  </tspan>
                  {rawVal && !isExempt && (
                    <tspan className="fill-muted-foreground/60 text-[9.5px]">
                      {" "}
                      ({rawVal})
                    </tspan>
                  )}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Center P50 / Median Reference Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/35 border border-border/30 px-1 py-0.5 rounded bg-background/60 backdrop-blur-xs">
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
              className="absolute left-1/2 bottom-1 -translate-x-1/2 z-30 pointer-events-none bg-background/95 border border-accent/50 p-3 shadow-2xl backdrop-blur-md min-w-[220px]"
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
              <p className="font-mono text-[10px] text-muted-foreground/75 mt-1.5 pt-1.5 border-t border-border/20 leading-relaxed">
                {axes[hoveredIndex].explainer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Footer (Clean Monospace Reference) */}
      <div className="mt-2 pt-2.5 border-t border-border/25 w-full flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-accent inline-block shadow-[0_0_6px_#f59e0b]" />
          <span className="text-foreground font-medium">Target Company</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dashed border-muted-foreground inline-block" />
          <span>Sector Median (P50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-b border-dotted border-border/80 inline-block" />
          <span>Top Quartile (P75)</span>
        </div>
      </div>
    </div>
  )
}
