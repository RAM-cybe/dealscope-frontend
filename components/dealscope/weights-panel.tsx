"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { type Weights, DEFAULT_WEIGHTS, FACTOR_LABELS } from "@/lib/dealscope-data"

interface WeightsPanelProps {
  open: boolean
  weights: Weights
  onWeightsChange: (weights: Weights) => void
  onClose: () => void
}

export function WeightsPanel({ open, weights, onWeightsChange, onClose }: WeightsPanelProps) {
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            // Same scroll-trap fix as the filters panel: keep Lenis from
            // capturing wheel events over this overlay and scrolling the page
            // behind it, and stop native scroll chaining at the panel boundary.
            data-lenis-prevent
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-background border-l border-border overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label="Weighting controls"
          >
            <div className="p-8 md:p-10 flex flex-col min-h-full">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                    Control Variables
                  </span>
                  <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl tracking-tight">
                    FACTOR WEIGHTS
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close weights panel"
                  className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                >
                  ESC
                </button>
              </div>

              <p className="mt-6 font-mono text-xs text-muted-foreground leading-relaxed">
                Adjust the weight of each factor. Composite scores across the screened set recalculate in real time.
              </p>

              {/* Sliders */}
              <div className="mt-10 flex flex-col gap-8 flex-1">
                {FACTOR_LABELS.map((factor) => (
                  <WeightSlider
                    key={factor.key}
                    label={factor.label}
                    value={weights[factor.key]}
                    onChange={(v) => onWeightsChange({ ...weights, [factor.key]: v })}
                  />
                ))}

                {/* Total readout */}
                <div className="border-t border-border/50 pt-6 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Total Allocation
                  </span>
                  <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-tight text-accent">
                    {total}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed -mt-4">
                  Weights are normalized — relative proportions determine the composite.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 text-center"
                >
                  <ScrambleTextOnHover text="Apply Weights" as="span" duration={0.5} />
                </button>
                <button
                  onClick={() => onWeightsChange({ ...DEFAULT_WEIGHTS })}
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Reset
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
