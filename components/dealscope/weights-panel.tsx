"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { type Weights, DEFAULT_WEIGHTS, FACTOR_LABELS } from "@/lib/dealscope-data"

interface WeightsPanelProps {
  open: boolean
  weights: Weights
  onWeightsChange: (weights: Weights) => void
  onClose: () => void
}

export function WeightsPanel({ open, weights, onWeightsChange, onClose }: WeightsPanelProps) {
  // Lock body scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  const total = weights.revenueGrowth + weights.ebitdaMargin + weights.roce + weights.debtLevel

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            data-lenis-prevent
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-lg bg-background border-l border-border flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Weighting controls"
          >
            {/* Sticky Header */}
            <div className="p-6 sm:p-8 border-b border-border/80 bg-background flex items-start justify-between shrink-0">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                  Model Weights
                </span>
                <h2 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl tracking-tight text-foreground">
                  FACTOR WEIGHTS
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close weights panel"
                className="border border-border/80 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer"
              >
                ESC ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              className="flex-1 overflow-y-auto p-6 sm:p-8 overscroll-contain space-y-8"
              data-lenis-prevent
            >
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Adjust the relative weight of each factor. Composite scores across the screened set recalculate in real time.
              </p>

              {/* Sliders */}
              <div className="flex flex-col gap-7">
                {FACTOR_LABELS.map((factor) => (
                  <WeightSlider
                    key={factor.key}
                    label={factor.label}
                    value={weights[factor.key]}
                    onChange={(v) => onWeightsChange({ ...weights, [factor.key]: v })}
                  />
                ))}
              </div>

              <div className="border-t border-border/50 pt-6">
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Weights are normalized: relative proportions determine the composite score. Missing
                  metrics are dropped rather than treated as zero, and remaining factors are dynamically re-weighted.
                </p>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-6 border-t border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 shadow-lg">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total Allocation
                </span>
                <span className="font-mono text-sm font-bold text-accent">
                  {total}% Allocated
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onWeightsChange({ ...DEFAULT_WEIGHTS })}
                  className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-accent bg-accent text-accent-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent/90 transition-all cursor-pointer shadow-sm"
                >
                  Apply Weights ➔
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">{label}</label>
        <span className="font-mono text-xs text-accent">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} weight`}
        className="ds-slider w-full"
      />
    </div>
  )
}
