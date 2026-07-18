"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import {
  type RangeFilters,
  type FactorRange,
  DEFAULT_RANGE_FILTERS,
  FACTOR_LABELS,
  countActiveRangeFilters,
} from "@/lib/dealscope-data"

interface FiltersPanelProps {
  open: boolean
  filters: RangeFilters
  onFiltersChange: (filters: RangeFilters) => void
  onClose: () => void
}

export function FiltersPanel({ open, filters, onFiltersChange, onClose }: FiltersPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  const activeCount = countActiveRangeFilters(filters)

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
            // overscroll-contain stops native scroll chaining to the body when
            // this panel reaches its scroll boundary; data-lenis-prevent tells
            // the Lenis smooth-scroll to ignore wheel events that originate in
            // the panel -- without it, Lenis captures the wheel and scrolls the
            // company list behind the panel instead (the reported scroll trap).
            data-lenis-prevent
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-background border-l border-border overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label="Range filters"
          >
            <div className="p-8 md:p-10 flex flex-col min-h-full">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                    Screening Constraints
                  </span>
                  <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl tracking-tight">
                    RANGE FILTERS
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close filters panel"
                  className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                >
                  ESC
                </button>
              </div>

              <p className="mt-6 font-mono text-xs text-muted-foreground leading-relaxed">
                Constrain the screened set by factor score. Each is sector-relative, 0–100 — the same
                score shown on the rings. Filters decide which companies appear; weights decide how
                they rank.
              </p>

              {/* Range inputs */}
              <div className="mt-10 flex flex-col gap-9 flex-1">
                {FACTOR_LABELS.map((factor) => (
                  <RangeControl
                    key={factor.key}
                    label={factor.label}
                    range={filters[factor.key]}
                    onChange={(range) => onFiltersChange({ ...filters, [factor.key]: range })}
                  />
                ))}

                {/* Active readout */}
                <div className="border-t border-border/50 pt-6 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Active Filters
                  </span>
                  <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-tight text-accent">
                    {activeCount}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed -mt-4">
                  A factor is only applied once its range narrows below the full 0–100 span.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 text-center"
                >
                  <ScrambleTextOnHover text="Apply Filters" as="span" duration={0.5} />
                </button>
                <button
                  onClick={() => onFiltersChange({ ...DEFAULT_RANGE_FILTERS })}
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

function RangeControl({
  label,
  range,
  onChange,
}: {
  label: string
  range: FactorRange
  onChange: (range: FactorRange) => void
}) {
  // Plain number inputs, 0-100. Non-numeric input is rejected; an emptied field
  // resets that bound to its extreme. Min can never cross above max and vice
  // versa -- clamp on the way through, same rule as before.
  const commit = (which: "min" | "max", raw: string) => {
    if (raw.trim() === "") {
      onChange(which === "min" ? { min: 0, max: range.max } : { min: range.min, max: 100 })
      return
    }
    const parsed = Number.parseInt(raw, 10)
    if (Number.isNaN(parsed)) return // reject non-numeric
    const v = Math.max(0, Math.min(100, parsed))
    if (which === "min") onChange({ min: Math.min(v, range.max), max: range.max })
    else onChange({ min: range.min, max: Math.max(v, range.min) })
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">{label}</label>
        <span className="font-mono text-xs text-accent">
          {range.min} – {range.max}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Min"
          value={range.min}
          ariaLabel={`${label} minimum score`}
          onCommit={(raw) => commit("min", raw)}
        />
        <NumberField
          label="Max"
          value={range.max}
          ariaLabel={`${label} maximum score`}
          onCommit={(raw) => commit("max", raw)}
        />
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  ariaLabel,
  onCommit,
}: {
  label: string
  value: number
  ariaLabel: string
  onCommit: (raw: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={5}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onCommit(e.target.value)}
        className="ds-num w-full border border-border bg-transparent px-3 py-2.5 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors duration-200"
      />
    </label>
  )
}
