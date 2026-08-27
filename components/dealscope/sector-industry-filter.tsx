"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { type Sector, type IndustryGroup, filterIndustryGroups } from "@/lib/dealscope-data"
import { cn } from "@/lib/utils"

interface SectorIndustryFilterProps {
  sectors: Sector[]
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  /** Every sector's industries. The panel narrows this to the selected
   *  sectors for its default view and keeps the rest reachable behind a
   *  toggle -- so this is deliberately the full list, not a pre-scoped one. */
  industryGroups: IndustryGroup[]
  selectedIndustries: string[]
  onToggleIndustry: (name: string) => void
  onClearIndustries: () => void
  /** Shown inside the panel only, so it stops being permanent page furniture. */
  unclassifiedCount?: number
}

/** Sector pills, plus an on-demand industry browser.
 *
 *  Supersedes the previous always-visible layout: every industry for every
 *  sector used to render inline under the pills on both the landing and
 *  results pages. Seen live that read as sprawl -- a wall of ~124 tiny chips
 *  the user has to scroll past to reach anything else -- so industries are
 *  now tucked behind one toggle, closed by default, and the type inside is
 *  sized to actually be read (11px labels / 10px counts, up from 9px / 8px).
 */
export function SectorIndustryFilter({
  sectors,
  selectedSectors,
  onToggleSector,
  industryGroups,
  selectedIndustries,
  onToggleIndustry,
  onClearIndustries,
  unclassifiedCount,
}: SectorIndustryFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [showOtherSectors, setShowOtherSectors] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on Escape and on click-outside. Both are registered only while the
  // panel is open, so there's no always-on document listener.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [open])

  // Default the panel to whatever sectors are pinned, but never hard-lock it:
  // the remaining sectors stay one click away inside the open panel.
  const [inSelected, otherSectors] = useMemo(() => {
    if (selectedSectors.length === 0) return [industryGroups, [] as IndustryGroup[]]
    return [
      industryGroups.filter((g) => selectedSectors.includes(g.sector)),
      industryGroups.filter((g) => !selectedSectors.includes(g.sector)),
    ]
  }, [industryGroups, selectedSectors])

  const primary = useMemo(() => filterIndustryGroups(inSelected, query), [inSelected, query])
  const secondary = useMemo(() => filterIndustryGroups(otherSectors, query), [otherSectors, query])

  const selectedCount = selectedIndustries.length
  const totalIndustries = industryGroups.reduce((n, g) => n + g.industries.length, 0)

  return (
    <div ref={containerRef}>
      {/* Sector pills -- unchanged */}
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => {
          const active = selectedSectors.includes(sector.name)
          return (
            <button
              key={sector.name}
              onClick={() => onToggleSector(sector.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {sector.name}
              <span className={cn("text-[11px]", active ? "text-accent/70" : "text-muted-foreground")}>
                {sector.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Toggle + active-industry summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-200",
            open || selectedCount > 0
              ? "border-accent text-accent"
              : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          <span>Browse Industries</span>
          {selectedCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-accent text-accent-foreground text-[11px] leading-none">
              {selectedCount}
            </span>
          )}
          <span aria-hidden="true" className={cn("transition-transform duration-200", open && "rotate-90")}>
            ›
          </span>
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onClearIndustries}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            Clear industries
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 border border-border/60 bg-background">
          {/* Search */}
          <div className="border-b border-border/60">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${totalIndustries} industries…`}
              aria-label="Search industries"
              autoFocus
              className="w-full bg-transparent px-4 py-3 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="p-5 sm:p-6">
            {primary.length === 0 && secondary.length === 0 ? (
              <p className="py-6 text-center font-mono text-xs text-muted-foreground">
                No industries match &quot;{query}&quot;
              </p>
            ) : (
              <div className="flex flex-col gap-7">
                {primary.map((group) => (
                  <IndustryGroupBlock
                    key={group.sector}
                    group={group}
                    selected={selectedIndustries}
                    onToggle={onToggleIndustry}
                  />
                ))}

                {otherSectors.length > 0 && !showOtherSectors && (
                  <button
                    onClick={() => setShowOtherSectors(true)}
                    className="self-start border border-dashed border-border/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all duration-200"
                  >
                    Browse other sectors ({otherSectors.length})
                  </button>
                )}

                {showOtherSectors &&
                  secondary.map((group) => (
                    <IndustryGroupBlock
                      key={group.sector}
                      group={group}
                      selected={selectedIndustries}
                      onToggle={onToggleIndustry}
                      dimmedHeader
                    />
                  ))}

                {unclassifiedCount != null && unclassifiedCount > 0 && (
                  <p className="border-t border-border/40 pt-4 font-mono text-xs leading-relaxed text-muted-foreground">
                    Unclassified ({unclassifiedCount}): sector data is unavailable for these
                    entities in public filings. Searchable by ticker, but excluded from peer
                    percentile scoring to prevent misleading rankings.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function IndustryGroupBlock({
  group,
  selected,
  onToggle,
  dimmedHeader = false,
}: {
  group: IndustryGroup
  selected: string[]
  onToggle: (name: string) => void
  dimmedHeader?: boolean
}) {
  return (
    <div>
      <span
        className={cn(
          "font-mono text-xs uppercase tracking-[0.2em]",
          dimmedHeader ? "text-muted-foreground" : "text-accent",
        )}
      >
        {group.sector}
      </span>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.industries.map((ind) => {
          const active = selected.includes(ind.name)
          return (
            <button
              key={ind.name}
              onClick={() => onToggle(ind.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[11px] transition-all duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {ind.name}
              <span className={cn("text-xs", active ? "text-accent/80" : "text-muted-foreground/80")}>
                {ind.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
