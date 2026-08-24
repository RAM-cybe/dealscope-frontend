"use client"

import React, { useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Company, type Weights, computeScore } from "@/lib/dealscope-data"

export type MatrixMode = "margin_ev" | "roce_pe" | "growth_ev" | "score_size"

interface PeerScatterMatrixProps {
  target: Company
  companies: Company[]
  weights: Weights
  onSelectPeer?: (company: Company) => void
  className?: string
}

interface PlotPoint {
  company: Company
  x: number
  y: number
  isTarget: boolean
  isClosestPeer: boolean
}

export function PeerScatterMatrix({
  target,
  companies,
  weights,
  onSelectPeer,
  className = "",
}: PeerScatterMatrixProps) {
  const [mode, setMode] = useState<MatrixMode>("margin_ev")
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sector peer group
  const sectorCompanies = useMemo(() => {
    if (!target.sector || target.sector === "Unclassified") return [target]
    return companies.filter((c) => c.sector === target.sector)
  }, [target, companies])

  // Extract closest 5 peers for distinct marker styling
  const closestPeerTickers = useMemo(() => {
    const peers = sectorCompanies.filter((c) => c.ticker !== target.ticker)
    const factorKeys = ["revenueGrowth", "ebitdaMargin", "roce", "debtLevel"] as const
    
    return peers
      .map((p) => {
        let sumSq = 0
        let count = 0
        for (const k of factorKeys) {
          const tv = target.factors[k]
          const pv = p.factors[k]
          if (tv != null && pv != null) {
            sumSq += Math.pow(tv - pv, 2)
            count++
          }
        }
        const dist = count > 0 ? Math.sqrt(sumSq / count) + (4 - count) * 15 : 999
        return { ticker: p.ticker, dist }
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map((x) => x.ticker)
  }, [target, sectorCompanies])

  // Mode configuration & accessor
  const config = useMemo(() => {
    switch (mode) {
      case "margin_ev":
        return {
          title: "Profitability vs. Valuation Multiple",
          xLabel: "EBITDA Margin (%)",
          yLabel: "EV / EBITDA Multiple (x)",
          getX: (c: Company) => c.raw.ebitdaMargin,
          getY: (c: Company) => {
            if (c.raw.marketCap == null || c.raw.ebitda == null || c.raw.ebitda <= 0) return null
            const ev = c.raw.marketCap + (c.raw.totalDebt ?? 0)
            const mult = ev / c.raw.ebitda
            return mult > 0 && mult < 150 ? mult : null
          },
          formatX: (v: number) => `${v.toFixed(1)}%`,
          formatY: (v: number) => `${v.toFixed(1)}x`,
        }
      case "roce_pe":
        return {
          title: "Capital Efficiency vs. Equity Multiple",
          xLabel: "ROCE (%)",
          yLabel: "P/E Ratio (x)",
          getX: (c: Company) => c.raw.roce,
          getY: (c: Company) => (c.raw.peRatio && c.raw.peRatio > 0 && c.raw.peRatio < 200 ? c.raw.peRatio : null),
          formatX: (v: number) => `${v.toFixed(1)}%`,
          formatY: (v: number) => `${v.toFixed(1)}x`,
        }
      case "growth_ev":
        return {
          title: "Revenue Growth vs. Valuation Multiple",
          xLabel: "Revenue Growth YoY (%)",
          yLabel: "EV / EBITDA Multiple (x)",
          getX: (c: Company) => c.raw.revenueGrowth,
          getY: (c: Company) => {
            if (c.raw.marketCap == null || c.raw.ebitda == null || c.raw.ebitda <= 0) return null
            const ev = c.raw.marketCap + (c.raw.totalDebt ?? 0)
            const mult = ev / c.raw.ebitda
            return mult > 0 && mult < 150 ? mult : null
          },
          formatX: (v: number) => `${v.toFixed(1)}%`,
          formatY: (v: number) => `${v.toFixed(1)}x`,
        }
      case "score_size":
        return {
          title: "Composite Quality Score vs. Scale",
          xLabel: "Composite Score (0–100)",
          yLabel: "Market Capitalization (₹ Cr)",
          getX: (c: Company) => computeScore(c.factors, weights),
          getY: (c: Company) => (c.raw.marketCap && c.raw.marketCap > 0 ? c.raw.marketCap : null),
          formatX: (v: number) => `${Math.round(v)}`,
          formatY: (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`,
        }
    }
  }, [mode, weights])

  // Filter valid data points
  const validData: PlotPoint[] = useMemo(() => {
    return sectorCompanies
      .map((c) => {
        const x = config.getX(c)
        const y = config.getY(c)
        return {
          company: c,
          x: x as number,
          y: y as number,
          isTarget: c.ticker === target.ticker,
          isClosestPeer: closestPeerTickers.includes(c.ticker),
        }
      })
      .filter((d) => d.x != null && !isNaN(d.x) && isFinite(d.x) && d.y != null && !isNaN(d.y) && isFinite(d.y))
  }, [sectorCompanies, config, target.ticker, closestPeerTickers])

  // Mathematical bounds & Medians
  const stats = useMemo(() => {
    if (validData.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 50, medX: 50, medY: 25 }
    const xs = validData.map((d) => d.x).sort((a, b) => a - b)
    const ys = validData.map((d) => d.y).sort((a, b) => a - b)

    // 5th to 95th percentile clipping for plot stability
    const p5X = xs[Math.floor(xs.length * 0.05)] ?? xs[0]
    const p95X = xs[Math.floor(xs.length * 0.95)] ?? xs[xs.length - 1]
    const p5Y = ys[Math.floor(ys.length * 0.05)] ?? ys[0]
    const p95Y = ys[Math.floor(ys.length * 0.95)] ?? ys[ys.length - 1]

    const medX = xs[Math.floor(xs.length / 2)]
    const medY = ys[Math.floor(ys.length / 2)]

    const padX = Math.max(1, (p95X - p5X) * 0.12)
    const padY = Math.max(1, (p95Y - p5Y) * 0.12)

    return {
      minX: p5X - padX,
      maxX: p95X + padX,
      minY: Math.max(0, p5Y - padY),
      maxY: p95Y + padY,
      medX,
      medY,
    }
  }, [validData])

  // Bubble size radius
  const getRadius = (mcap: number | null, isTarget: boolean) => {
    if (isTarget) return 10
    if (mcap == null || mcap <= 0) return 4.5
    const norm = Math.min(1, Math.max(0, (Math.sqrt(mcap) - Math.sqrt(100)) / (Math.sqrt(50000) - Math.sqrt(100))))
    return 4.5 + norm * 8
  }

  // SVG dimensions
  const SVG_WIDTH = 760
  const SVG_HEIGHT = 420
  const MARGIN = { top: 35, right: 35, bottom: 50, left: 65 }
  const PLOT_W = SVG_WIDTH - MARGIN.left - MARGIN.right
  const PLOT_H = SVG_HEIGHT - MARGIN.top - MARGIN.bottom

  const scaleX = (x: number) => {
    const clamped = Math.max(stats.minX, Math.min(stats.maxX, x))
    return MARGIN.left + ((clamped - stats.minX) / (stats.maxX - stats.minX || 1)) * PLOT_W
  }

  const scaleY = (y: number) => {
    const clamped = Math.max(stats.minY, Math.min(stats.maxY, y))
    return MARGIN.top + PLOT_H - ((clamped - stats.minY) / (stats.maxY - stats.minY || 1)) * PLOT_H
  }

  const medianPixelX = scaleX(stats.medX)
  const medianPixelY = scaleY(stats.medY)

  return (
    <div className={`border border-border/40 bg-card/20 p-4 sm:p-6 text-foreground font-sans relative overflow-hidden ${className}`}>
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
              2D Positioning Matrix // {target.sector}
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/75 mt-1">
            {validData.length} companies positioned · Dashed lines mark Sector Medians
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-background/60 p-1 border border-border/40">
          {[
            { id: "margin_ev", label: "Margin vs EV/EBITDA" },
            { id: "roce_pe", label: "ROCE vs P/E" },
            { id: "growth_ev", label: "Growth vs EV/EBITDA" },
            { id: "score_size", label: "Score vs Size" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setMode(btn.id as MatrixMode)}
              className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                mode === btn.id
                  ? "bg-accent text-black font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative mt-4 w-full aspect-[16/10] min-h-[320px]" ref={containerRef}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full select-none overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Amber target glow */}
            <filter id="target-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Plot Background */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={PLOT_W}
            height={PLOT_H}
            fill="oklch(0.12 0 0)"
            stroke="oklch(0.24 0 0)"
          />

          {/* Quadrant Highlights */}
          {/* Bottom Right: Value Buyout Zone */}
          <rect
            x={medianPixelX}
            y={medianPixelY}
            width={MARGIN.left + PLOT_W - medianPixelX}
            height={MARGIN.top + PLOT_H - medianPixelY}
            fill="oklch(0.7 0.2 140 / 0.03)"
          />
          {/* Top Left: Overvalued Zone */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={medianPixelX - MARGIN.left}
            height={medianPixelY - MARGIN.top}
            fill="oklch(0.65 0.22 25 / 0.025)"
          />

          {/* Quadrant Watermark Labels */}
          <text
            x={MARGIN.left + PLOT_W - 10}
            y={MARGIN.top + PLOT_H - 10}
            textAnchor="end"
            className="font-mono text-[9px] uppercase tracking-wider fill-emerald-500/35 pointer-events-none font-bold"
          >
            ★ Value Arbitrage Zone (High Quality · Low Multiple)
          </text>
          <text
            x={MARGIN.left + 10}
            y={MARGIN.top + 18}
            textAnchor="start"
            className="font-mono text-[9px] uppercase tracking-wider fill-rose-400/30 pointer-events-none font-bold"
          >
            ⚠️ High Multiple / Low Margin
          </text>

          {/* Median Reference Crosshairs */}
          <line
            x1={medianPixelX}
            y1={MARGIN.top}
            x2={medianPixelX}
            y2={MARGIN.top + PLOT_H}
            stroke="oklch(0.40 0 0)"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <line
            x1={MARGIN.left}
            y1={medianPixelY}
            x2={MARGIN.left + PLOT_W}
            y2={medianPixelY}
            stroke="oklch(0.40 0 0)"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Median Labels */}
          <text
            x={medianPixelX + 5}
            y={MARGIN.top + 12}
            className="font-mono text-[9px] uppercase tracking-wider fill-muted-foreground font-medium"
          >
            Med: {config.formatX(stats.medX)}
          </text>
          <text
            x={MARGIN.left + 6}
            y={medianPixelY - 5}
            className="font-mono text-[9px] uppercase tracking-wider fill-muted-foreground font-medium"
          >
            Med: {config.formatY(stats.medY)}
          </text>

          {/* Axis Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const vx = stats.minX + pct * (stats.maxX - stats.minX)
            const vy = stats.minY + pct * (stats.maxY - stats.minY)
            const px = scaleX(vx)
            const py = scaleY(vy)

            return (
              <g key={`tick-${pct}`}>
                <line x1={px} y1={MARGIN.top + PLOT_H} x2={px} y2={MARGIN.top + PLOT_H + 4} stroke="oklch(0.30 0 0)" />
                <text
                  x={px}
                  y={MARGIN.top + PLOT_H + 16}
                  textAnchor="middle"
                  className="font-mono text-[9px] fill-muted-foreground/80"
                >
                  {config.formatX(vx)}
                </text>
                <line x1={MARGIN.left - 4} y1={py} x2={MARGIN.left} y2={py} stroke="oklch(0.30 0 0)" />
                <text
                  x={MARGIN.left - 8}
                  y={py + 3}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-muted-foreground/80"
                >
                  {config.formatY(vy)}
                </text>
              </g>
            )
          })}

          {/* Axis Titles */}
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={SVG_HEIGHT - 8}
            textAnchor="middle"
            className="font-mono text-[10px] uppercase tracking-wider fill-muted-foreground font-semibold"
          >
            {config.xLabel} →
          </text>
          <text
            x={-MARGIN.top - PLOT_H / 2}
            y={16}
            textAnchor="middle"
            transform="rotate(-90)"
            className="font-mono text-[10px] uppercase tracking-wider fill-muted-foreground font-semibold"
          >
            {config.yLabel} →
          </text>

          {/* Background Sector Peers */}
          {validData
            .filter((d) => !d.isTarget)
            .map((item) => {
              const cx = scaleX(item.x)
              const cy = scaleY(item.y)
              const r = getRadius(item.company.raw.marketCap, false)
              const isHovered = hoveredCompany?.ticker === item.company.ticker
              const isClosest = item.isClosestPeer

              return (
                <g
                  key={item.company.ticker}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCompany(item.company)}
                  onMouseLeave={() => setHoveredCompany(null)}
                  onClick={() => onSelectPeer?.(item.company)}
                >
                  {/* Expanded Hit Collider */}
                  <circle cx={cx} cy={cy} r={Math.max(18, r + 6)} fill="transparent" />

                  {/* Peer Bubble */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? r + 2.5 : r}
                    fill={
                      isHovered
                        ? "oklch(0.75 0.15 200 / 0.9)"
                        : isClosest
                        ? "oklch(0.75 0.15 200 / 0.45)"
                        : "oklch(0.45 0 0 / 0.35)"
                    }
                    stroke={
                      isHovered
                        ? "oklch(0.75 0.15 200)"
                        : isClosest
                        ? "oklch(0.75 0.15 200 / 0.7)"
                        : "oklch(0.55 0 0 / 0.4)"
                    }
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all duration-150"
                  />

                  {/* Label on closest peers or hovered */}
                  {(isClosest || isHovered) && (
                    <text
                      x={cx}
                      y={cy - r - 3}
                      textAnchor="middle"
                      className={`font-mono text-[9px] uppercase tracking-wider pointer-events-none ${
                        isHovered ? "fill-cyan-300 font-bold" : "fill-muted-foreground/90"
                      }`}
                    >
                      {item.company.ticker}
                    </text>
                  )}
                </g>
              )
            })}

          {/* Target Company (Amber Bullseye) */}
          {validData
            .filter((d) => d.isTarget)
            .map((item) => {
              const cx = scaleX(item.x)
              const cy = scaleY(item.y)
              const r = getRadius(item.company.raw.marketCap, true)

              return (
                <g key={item.company.ticker} className="cursor-pointer">
                  {/* Crosshair Guides to Axes */}
                  <line
                    x1={cx}
                    y1={MARGIN.top}
                    x2={cx}
                    y2={MARGIN.top + PLOT_H}
                    stroke="oklch(0.7 0.2 45)"
                    strokeDasharray="2 2"
                    strokeWidth="1.25"
                    opacity="0.8"
                  />
                  <line
                    x1={MARGIN.left}
                    y1={cy}
                    x2={MARGIN.left + PLOT_W}
                    y2={cy}
                    stroke="oklch(0.7 0.2 45)"
                    strokeDasharray="2 2"
                    strokeWidth="1.25"
                    opacity="0.8"
                  />

                  {/* Pulsing Outer Rings */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 8}
                    fill="none"
                    stroke="oklch(0.7 0.2 45)"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                    className="animate-spin"
                    style={{ animationDuration: "12s" }}
                  />

                  {/* Core Target Bubble */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="oklch(0.7 0.2 45)"
                    stroke="oklch(0.98 0 0)"
                    strokeWidth="2"
                    filter="url(#target-glow)"
                  />

                  {/* Target Company Badge */}
                  <rect x={cx - 38} y={cy - r - 18} width={76} height={14} fill="oklch(0.7 0.2 45)" rx="2" />
                  <text
                    x={cx}
                    y={cy - r - 7}
                    textAnchor="middle"
                    className="font-mono text-[8.5px] uppercase tracking-wider fill-black font-black"
                  >
                    ★ TARGET
                  </text>
                </g>
              )
            })}
        </svg>

        {/* Floating Telemetry Tooltip */}
        <AnimatePresence>
          {hoveredCompany && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute top-2 right-2 z-20 w-64 bg-background/95 border border-cyan-500/40 p-3 shadow-2xl backdrop-blur-md font-mono text-xs pointer-events-none"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-2">
                <span className="text-cyan-400 font-bold truncate max-w-[150px]">
                  {hoveredCompany.ticker}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Score: {computeScore(hoveredCompany.factors, weights) ?? "—"}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[9.5px]">Market Cap:</span>
                  <span className="text-foreground font-medium">{hoveredCompany.financials.marketCap}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9.5px]">EBITDA Margin:</span>
                  <span className="text-foreground font-medium">{hoveredCompany.metrics.ebitdaMargin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9.5px]">P/E Ratio:</span>
                  <span className="text-foreground font-medium">{hoveredCompany.financials.peRatio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9.5px]">ROCE:</span>
                  <span className="text-foreground font-medium">{hoveredCompany.metrics.roce}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2 border-t border-border/20 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent border border-white" />
            <span className="text-foreground font-medium">Target Company ({target.ticker})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
            <span>Closest 5 Peers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span>Sector Cohort</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground/60">
          Source: DealScope Screener Fundamentals
        </span>
      </div>
    </div>
  )
}
