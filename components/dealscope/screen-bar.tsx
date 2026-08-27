"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Search, X, Sparkles, Command } from "lucide-react"
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
  recognised: boolean
  placeholder?: string
  autoFocus?: boolean
  size?: "lg" | "sm"
  trailing?: React.ReactNode
}

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
  placeholder = "Search 2,381 NSE companies (e.g. \"TCS\", \"Tata Motors\") or screen by sector, ROCE, margin...",
  autoFocus = false,
  size = "lg",
  trailing,
}: ScreenBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const chips = screenChips(filters)
  const activeCount = countActiveConstraints(filters)
  const isFiltered = matchCount !== totalCount

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      onSubmit?.()
    }
  }

  // One outer border shell; both cells use the same fixed height so their top
  // and bottom edges are identical. Never put a separate outer border on the
  // button (that made it 2px taller than the input content box on production).
  //
  // Do NOT use flex-1 on the input cell when the shell is a column (mobile +
  // trailing): flex-1 → flex-shrink:1 with basis 0% lets the column axis crush
  // the cell below h-14. Horizontal growth only on the sm+ row layout.
  const rowH = size === "lg" ? "h-14" : "h-12"

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-stretch border bg-card/60 backdrop-blur-sm transition-all duration-200 shadow-sm",
          trailing ? "flex-col sm:flex-row" : "flex-row",
          recognised
            ? "border-accent/80 ring-1 ring-accent/40 shadow-accent/5"
            : "border-border/80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/40",
        )}
      >
        <div
          className={cn(
            "relative min-w-0 flex items-center",
            rowH,
            trailing ? "w-full sm:flex-1 sm:min-w-0" : "flex-1",
          )}
        >
          {/* Leading Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none select-none">
            {recognised ? (
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/15 px-1.5 py-0.5 border border-accent/40">
                SCREEN
              </span>
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search companies or describe a screen"
            autoFocus={autoFocus}
            className="box-border w-full h-full bg-transparent pl-12 pr-20 font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />

          {/* Trailing inside-input shortcuts and clear action */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search input"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 border border-border/80 bg-background/50 pointer-events-none select-none">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            )}
          </div>
        </div>

        {trailing ? (
          <div
            className={cn(
              "flex shrink-0 items-stretch",
              rowH,
              "w-full sm:w-auto",
              "border-t sm:border-t-0 sm:border-l",
              recognised ? "border-accent/80" : "border-border/80",
            )}
          >
            {trailing}
          </div>
        ) : null}
      </div>

      {/* Live count + parse feedback — always under the full control row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs">
          <span className={cn(isFiltered ? "text-accent font-semibold" : "text-foreground font-medium")}>
            {matchCount.toLocaleString("en-IN")}
          </span>
          <span className="text-muted-foreground">
            {" "}
            {matchCount === 1 ? "company" : "companies"}
            {isFiltered && ` of ${totalCount.toLocaleString("en-IN")}`}
          </span>
        </span>

        {recognised && (
          <span className="font-mono text-[11px] uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 border border-accent/30 font-semibold">
            Screen Applied
          </span>
        )}

        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200 cursor-pointer"
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
              className="group inline-flex max-w-full items-center gap-2 border border-accent/60 bg-accent/10 px-3 py-1 font-mono text-xs text-accent hover:bg-accent/20 hover:border-accent transition-colors duration-200 cursor-pointer"
              aria-label={`Remove filter: ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden="true" className="text-accent font-bold">
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
