"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import {
  type BucketFilters,
  type BucketFieldDef,
  type BucketFieldKey,
  type IndustryOption,
  BUCKET_FIELDS,
  DEFAULT_BUCKET_FILTERS,
  countActiveBucketFilters,
} from "@/lib/dealscope-data"
import { cn } from "@/lib/utils"

interface FiltersPanelProps {
  open: boolean
  filters: BucketFilters
  onFiltersChange: (filters: BucketFilters) => void
  onClose: () => void
  industries: IndustryOption[]
}

const FIELD = Object.fromEntries(BUCKET_FIELDS.map((f) => [f.key, f])) as Record<
  BucketFieldKey,
  BucketFieldDef
>

const GROUPS: { index: string; label: string; fields: BucketFieldKey[] }[] = [
  { index: "01", label: "Size & Valuation", fields: ["marketCap", "peRatio"] },
  { index: "02", label: "Quality & Growth", fields: ["revenueGrowth", "ebitdaMargin", "roce", "roe"] },
  { index: "03", label: "Risk", fields: ["debtLevel", "promoterPledge"] },
]

export function FiltersPanel({ open, filters, onFiltersChange, onClose, industries }: FiltersPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  const activeCount = countActiveBucketFilters(filters)

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
            aria-label="Screening filters"
          >
            <div className="p-8 md:p-10 flex flex-col min-h-full">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                    Screening Constraints
                  </span>
                  <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl tracking-tight">
                    FILTERS
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
                Constrain the screened set by real financials — size, valuation, quality, growth and risk.
                Pills accept several bands at once; segmented controls pick one. Fields left untouched
                don&apos;t constrain. Filters decide which companies appear; weights decide how they rank.
              </p>

              {/* Grouped bucket controls */}
              <div className="mt-10 flex flex-col gap-12 flex-1">
                {GROUPS.map((group) => (
                  <div key={group.index}>
                    <SectionLabel index={group.index} label={group.label} />
                    <div className="mt-6 flex flex-col gap-8">
                      {group.fields.map((key) => (
                        <FieldControl
                          key={key}
                          def={FIELD[key]}
                          selection={filters[key]}
                          onChange={(next) => onFiltersChange({ ...filters, [key]: next } as BucketFilters)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Industry -- exact-match multi-select over ~123 raw values,
                    too many for fixed pills, so this is search-to-narrow
                    rather than the numeric fields' small fixed bucket set. */}
                <div>
                  <SectionLabel index="04" label="Industry" />
                  <div className="mt-6">
                    <IndustryFilterControl
                      industries={industries}
                      selected={filters.industry}
                      onChange={(next) => onFiltersChange({ ...filters, industry: next })}
                    />
                  </div>
                </div>

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
                  A field only narrows the set once you pick at least one band; up to eight can be active.
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
                  onClick={() => onFiltersChange({ ...DEFAULT_BUCKET_FILTERS })}
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

// Reuses the tear sheet's SectionLabel pattern for consistency.
function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
      {index} / {label}
    </span>
  )
}

function FieldControl({
  def,
  selection,
  onChange,
}: {
  def: BucketFieldDef
  selection: string[] | string | null
  onChange: (next: string[] | string | null) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">{def.label}</label>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
          {def.select === "multi" ? "Select any" : "Select one"}
        </span>
      </div>
      {def.select === "multi" ? (
        <PillGroup def={def} selected={Array.isArray(selection) ? selection : []} onChange={onChange} />
      ) : (
        <SegmentedControl
          def={def}
          selected={typeof selection === "string" ? selection : null}
          onChange={onChange}
        />
      )}
    </div>
  )
}

// Multi-select, outline-active. Used for Market Cap and Promoter Pledge.
function PillGroup({
  def,
  selected,
  onChange,
}: {
  def: BucketFieldDef
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {def.buckets.map((b) => {
        const active = selected.includes(b.key)
        return (
          <button
            key={b.key}
            onClick={() => toggle(b.key)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
              active
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent",
            )}
          >
            <span>{b.name}</span>
            <span
              className={cn(
                "text-[9px] normal-case tracking-normal",
                active ? "text-accent/70" : "text-muted-foreground/60",
              )}
            >
              {b.range}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Typeahead + multi-select over the ~123 raw industry labels. Too many for
// fixed pills (unlike the numeric fields' 3-4 buckets), so this is a search
// box narrowing a scrollable option list, with selected industries surfaced
// above it as removable pills once search moves them out of view.
function IndustryFilterControl({
  industries,
  selected,
  onChange,
}: {
  industries: IndustryOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const filtered = q ? industries.filter((ind) => ind.name.toLowerCase().includes(q)) : industries

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name])
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((name) => (
            <button
              key={name}
              onClick={() => toggle(name)}
              className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-accent hover:bg-accent/20 transition-colors duration-200"
            >
              <span>{name}</span>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove {name} filter</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative border border-border focus-within:border-accent transition-colors duration-200">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${industries.length} industries…`}
          aria-label="Search industries"
          className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>

      <div className="mt-2 max-h-48 overflow-y-auto border border-border/50 divide-y divide-border/30">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 font-mono text-[10px] text-muted-foreground/60 text-center">
            No industries match &quot;{query}&quot;
          </p>
        ) : (
          filtered.map((ind) => {
            const active = selected.includes(ind.name)
            return (
              <button
                key={ind.name}
                onClick={() => toggle(ind.name)}
                aria-pressed={active}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 font-mono text-[11px] text-left transition-colors duration-200",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <span className="truncate">{ind.name}</span>
                <span className={cn("text-[9px] shrink-0", active ? "text-accent/70" : "text-muted-foreground/60")}>
                  {ind.count}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// Single-select, fill-active connected control. Segments share borders and
// stack name over range so the real units fit without horizontal overflow on
// narrow screens. Clicking the active segment clears the field back to null.
function SegmentedControl({
  def,
  selected,
  onChange,
}: {
  def: BucketFieldDef
  selected: string | null
  onChange: (next: string | null) => void
}) {
  return (
    <div className="flex border border-border">
      {def.buckets.map((b, i) => {
        const active = selected === b.key
        return (
          <button
            key={b.key}
            onClick={() => onChange(active ? null : b.key)}
            aria-pressed={active}
            className={cn(
              "flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-center transition-colors duration-200",
              i < def.buckets.length - 1 ? "border-r border-border" : "",
              active ? "bg-accent" : "hover:bg-foreground/5",
            )}
          >
            <span
              className={cn(
                "font-mono text-[9px] uppercase tracking-wider leading-tight",
                active ? "text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {b.name}
            </span>
            <span
              className={cn(
                "font-mono text-[8px] tracking-normal leading-tight",
                active ? "text-accent-foreground/80" : "text-muted-foreground/60",
              )}
            >
              {b.range}
            </span>
          </button>
        )
      })}
    </div>
  )
}
