"use client"

import React, { useState, useId } from "react"
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

  const size = 320
  const center = size / 2
  const padding = 46
  const maxRadius = center - padding
  const minRadius = maxRadius * 0.08

  // 4 Standard DealScope Factor Axes
  const axes = [
    { key: "revenueGrowth" as const, label: "Revenue Growth", shortLabel: "GROWTH", angle: -Math.PI / 2 },
    { key: "ebitdaMargin" as const, label: "EBITDA Margin", shortLabel: "MARGIN", angle: 0 },
    { key: "roce" as const, label: "ROCE", shortLabel: "ROCE", angle: Math.PI / 2 },
    { key: "debtLevel" as const, label: "Debt Health", shortLabel: "LEVERAGE", angle: Math.PI },
  ]

  const isFig = sector === "Financial Services"

  // Radial scale converter
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

  // Target company polygon points
  const targetPolygonPoints = axes
    .map((axis) => {
      const val = factors[axis.key]
      const r = getRadius(val)
      const pt = getPoint(r, axis.angle)
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
    })
    .join(" ")

  if (unclassified) {
    return (
      <div className={`border border-border/40 bg-card/15 p-6 flex flex-col items-center justify-center text-center ${className}`}>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Radar Visual Unavailable
        </span>
        <p className="font-mono text-[11px] text-muted-foreground/60 mt-1 max-w-xs">
          Unclassified entity with no primary sector benchmark cohort.
        </p>
      </div>
    )
  }

  return (
    <div className={`border border-border/40 bg-card/20 p-4 sm:p-5 flex flex-col items-center select-none relative ${className}`}>
      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between border-b border-border/30 pb-2.5 mb-2 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="uppercase tracking-wider text-foreground font-semibold">
            Factor Radar // {sector}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-accent border border-accent/30 bg-accent/5 px-2 py-0.5 font-medium">
          Sector Relative (0–100)
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Amber Glow Filter */}
            <filter id={`radar-glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Amber Radial Fill */}
            <radialGradient id={`radar-fill-${filterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.30" />
              <stop offset="70%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Grid Polygons */}
          <polygon points={p100Points} fill="none" stroke="oklch(0.25 0 0)" strokeWidth="1" />
          <polygon points={p25Points} fill="none" stroke="oklch(0.20 0 0)" strokeWidth="1" strokeDasharray="2,2" />

          {/* P75 Top Quartile Reference Ring */}
          <polygon
            points={p75Points}
            fill="oklch(1 0 0 / 0.015)"
            stroke="oklch(0.38 0 0)"
            strokeWidth="1"
            strokeDasharray="2,3"
          />

          {/* P50 Sector Median Baseline Ring (Primary Reference) */}
          <polygon
            points={p50Points}
            fill="none"
            stroke="oklch(0.55 0 0)"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Axis Radial Spokes */}
          {axes.map((axis, i) => {
            const endPt = getPoint(maxRadius, axis.angle)
            const weightVal = weights ? weights[axis.key] : 25
            const isHovered = hoveredIndex === i

            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke={isHovered ? "oklch(0.7 0.2 45)" : "oklch(0.28 0 0)"}
                strokeWidth={isHovered ? 1.5 : 1}
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
            strokeWidth="2.25"
            filter={`url(#radar-glow-${filterId})`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />

          {/* Interactive Vertex Nodes */}
          {axes.map((axis, i) => {
            const val = factors[axis.key]
            const isMissing = val == null
            const isExempt = isFig && axis.key === "debtLevel"
            const r = getRadius(val)
            const pt = getPoint(r, axis.angle)
            const isHovered = hoveredIndex === i

            return (
              <g key={axis.key} className="cursor-pointer">
                {/* Visible Vertex Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isMissing || isExempt ? "oklch(0.4 0 0)" : "oklch(0.7 0.2 45)"}
                  stroke="oklch(0.12 0 0)"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Expanded Invisible Hit Target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={22}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}

          {/* Outer Monospace Labels */}
          {axes.map((axis, i) => {
            const labelRadius = maxRadius + 18
            const labelPt = getPoint(labelRadius, axis.angle)
            const scoreVal = factors[axis.key]
            const isHovered = hoveredIndex === i
            const isExempt = isFig && axis.key === "debtLevel"

            let textAnchor: "middle" | "start" | "end" = "middle"
            let dy = "0.35em"
            if (axis.angle === 0) {
              textAnchor = "start"
            } else if (axis.angle === Math.PI) {
              textAnchor = "end"
            } else if (axis.angle === -Math.PI / 2) {
              dy = "-0.5em"
            } else if (axis.angle === Math.PI / 2) {
              dy = "1.1em"
            }

            return (
              <text
                key={axis.key}
                x={labelPt.x}
                y={labelPt.y}
                textAnchor={textAnchor}
                dy={dy}
                className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 ${
                  isHovered ? "fill-accent font-bold" : "fill-muted-foreground"
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {axis.shortLabel}
                <tspan className="fill-foreground font-semibold">
                  {" "}
                  {isExempt ? "FIG" : scoreVal != null ? `${scoreVal}` : "—"}
                </tspan>
              </text>
            )
          })}
        </svg>

        {/* Interactive Hover HUD Tooltip Card */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute left-1/2 bottom-2 -translate-x-1/2 z-30 pointer-events-none bg-background/95 border border-accent/40 px-3 py-2 shadow-2xl backdrop-blur-md min-w-[200px]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1 mb-1 font-mono text-[10px]">
                <span className="uppercase tracking-wider text-accent font-semibold">
                  {axes[hoveredIndex].label}
                </span>
                <span className="text-muted-foreground">
                  Weight: {weights ? `${weights[axes[hoveredIndex].key]}%` : "25%"}
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-muted-foreground text-[11px]">Sector Rank:</span>
                <span className="text-foreground font-bold">
                  {isFig && axes[hoveredIndex].key === "debtLevel"
                    ? "Exempt (FIG Bank)"
                    : factors[axes[hoveredIndex].key] != null
                    ? `${factors[axes[hoveredIndex].key]}th Percentile`
                    : "No Data"}
                </span>
              </div>
              {rawMetrics[axes[hoveredIndex].key] && (
                <div className="flex items-baseline justify-between font-mono text-xs mt-0.5">
                  <span className="text-muted-foreground text-[11px]">Reported:</span>
                  <span className="text-accent font-mono">
                    {rawMetrics[axes[hoveredIndex].key]}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Footer */}
      <div className="mt-2.5 pt-2 border-t border-border/20 w-full flex items-center justify-center gap-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-accent inline-block shadow-[0_0_4px_#f59e0b]" />
          <span>Target Profile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 border-b border-dashed border-muted-foreground inline-block" />
          <span>Sector Median ($P_{50}$)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 border-b border-dotted border-border/80 inline-block" />
          <span>Top Quartile ($P_{75}$)</span>
        </div>
      </div>
    </div>
  )
}
