"use client"

import type React from "react"
import { type FilterChip, type ScreenFilters, screenChips, countActiveConstraints } from "@/lib/screener"
import { cn } from "@/lib/utils"

interface ScreenBarProps {
  query: string
  onQueryChange: (q: string) => void
  onSubmit?: () => void
  filters: ScreenFilters
  onRemoveChip: (chip: FilterChip) => void
  onClearAll: () => void
  matchCount: number
  totalCount: number
  /** True when the parser understood at least one constraint in the current
   *  query -- drives the "screening" vs "searching" affordance. */
  recognised: boolean
  placeholder?: string
  autoFocus?: boolean
  size?: "lg" | "sm"
  /**
   * Optional control rendered in the same row as the input (e.g. homepage
   * RUN). Placed here — not as a sibling of the whole bar — so it shares the
   * input's height and baseline instead of sitting against the taller
   * count/chips stack underneath.
   */
  trailing?: React.ReactNode
}

/**
 * The screening input: one box that accepts both a company name and a
 * natural-language screen, with the parsed result shown back as removable
 * chips and a live match count underneath.
 *
 * The chips are the honest part of this design. A natural-language box that
 * silently reinterprets what you typed is untrustworthy -- so everything the
 * parser understood is rendered as a discrete, removable token. If a chip
 * appears that you didn't mean, you can see it and drop it; if a constraint
 * you expected is missing, its absence is equally visible.
 */
export function ScreenBar({
  query,
  onQueryChange,
  onSubmit,
  filters,
  onRemoveChip,
  onClearAll,
  matchCount,
  totalCount,
  recognised,
  placeholder = "Company, ticker, or a screen like “pharma high margin low debt”",
  autoFocus = false,
  size = "lg",
  trailing,
}: ScreenBarProps) {
  const chips = screenChips(filters)
  const activeCount = countActiveConstraints(filters)
  const isFiltered = matchCount !== totalCount

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      onSubmit?.()
    }
  }

  return (
    <div>
      {/* Input row: input + optional trailing action share one baseline.
          items-stretch makes both boxes the same height; the action must not
          set a conflicting fixed height. Count/chips live BELOW this row. */}
      <div className="flex flex-col sm:flex-row items-stretch gap-0">
        <div
          className={cn(
            "relative flex-1 min-w-0 border transition-colors duration-200",
            recognised ? "border-accent/60" : "border-border focus-within:border-accent",
            trailing && "sm:border-r-0",
          )}
        >
          <span
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.3em] pointer-events-none",
              recognised ? "text-accent" : "text-muted-foreground/60",
            )}
            aria-hidden="true"
          >
            {recognised ? "FX" : "Q_"}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search companies or describe a screen"
            autoFocus={autoFocus}
            className={cn(
              "w-full h-full bg-transparent pl-12 pr-4 font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none",
              size === "lg" ? "py-4 text-sm" : "py-3 text-sm",
            )}
          />
        </div>
        {trailing ? (
          <div className="shrink-0 flex self-stretch items-stretch">{trailing}</div>
        ) : null}
      </div>

      {/* Live count + parse feedback */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs">
          <span className={cn(isFiltered ? "text-accent" : "text-foreground")}>
            {matchCount.toLocaleString("en-IN")}
          </span>
          <span className="text-muted-foreground">
            {" "}
            {matchCount === 1 ? "company" : "companies"}
            {isFiltered && ` of ${totalCount.toLocaleString("en-IN")}`}
          </span>
        </span>

        {recognised && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent/80">
            Screen applied
          </span>
        )}

        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => onRemoveChip(chip)}
              className="group inline-flex max-w-full items-center gap-2 border border-accent/50 bg-accent/10 px-3 py-1.5 font-mono text-[10px] text-accent hover:bg-accent/20 hover:border-accent transition-colors duration-200"
              aria-label={`Remove filter: ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden="true" className="text-accent/70 group-hover:text-accent">
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      {matchCount === 0 && activeCount > 0 && (
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          Nothing matches every condition. Drop a chip above to widen the screen.
        </p>
      )}
    </div>
  )
}
