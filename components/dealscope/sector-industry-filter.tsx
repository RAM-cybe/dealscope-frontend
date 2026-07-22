"use client"

import { useState } from "react"
import { type Sector, type IndustryGroup } from "@/lib/dealscope-data"
import { cn } from "@/lib/utils"

const COLLAPSED_COUNT = 6

interface SectorIndustryFilterProps {
  sectors: Sector[]
  selectedSectors: string[]
  onToggleSector: (sector: string) => void
  industryGroups: IndustryGroup[]
  selectedIndustries: string[]
  onToggleIndustry: (name: string) => void
  onClearIndustries: () => void
}

/** Sector pill row + the full industry breakdown underneath, always visible --
 *  no click on a sector pill required to see that industries exist under it.
 *  Shared between the landing page and the results page so both read the
 *  same taxonomy the same way (previously the results page gated the
 *  industry rows behind selecting exactly one sector, and the landing page
 *  didn't show industries at all). */
export function SectorIndustryFilter({
  sectors,
  selectedSectors,
  onToggleSector,
  industryGroups,
  selectedIndustries,
  onToggleIndustry,
  onClearIndustries,
}: SectorIndustryFilterProps) {
  const unclassified = sectors.find((s) => s.name === "Unclassified")
  const showUnclassifiedNote =
    unclassified && (selectedSectors.length === 0 || selectedSectors.includes("Unclassified"))

  return (
    <div>
      {/* Sector pills */}
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => {
          const active = selectedSectors.includes(sector.name)
          return (
            <button
              key={sector.name}
              onClick={() => onToggleSector(sector.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {sector.name}
              <span className={cn("text-[9px]", active ? "text-accent/70" : "text-muted-foreground/70")}>
                {sector.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Industry breakdown -- always visible, grouped by sector. */}
      <div className="mt-5 flex flex-col gap-5 border-l border-border/40 pl-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/70">
            Industry
          </span>
          {selectedIndustries.length > 0 && (
            <button
              onClick={onClearIndustries}
              className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Clear ({selectedIndustries.length})
            </button>
          )}
        </div>

        {industryGroups.map((group) => (
          <IndustryGroupBlock
            key={group.sector}
            group={group}
            selected={selectedIndustries}
            onToggle={onToggleIndustry}
          />
        ))}

        {showUnclassifiedNote && (
          <p className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">
            Unclassified ({unclassified!.count}) — no industry data available for these companies
            (confirmed data-source gap, not a filter you can narrow further).
          </p>
        )}
      </div>
    </div>
  )
}

function IndustryGroupBlock({
  group,
  selected,
  onToggle,
}: {
  group: IndustryGroup
  selected: string[]
  onToggle: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? group.industries : group.industries.slice(0, COLLAPSED_COUNT)
  const hiddenCount = group.industries.length - visible.length

  return (
    <div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
        {group.sector}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {visible.map((ind) => {
          const active = selected.includes(ind.name)
          return (
            <button
              key={ind.name}
              onClick={() => onToggle(ind.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-baseline gap-1.5 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-all duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/50 text-muted-foreground/80 hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {ind.name}
              <span className={cn("text-[8px]", active ? "text-accent/70" : "text-muted-foreground/60")}>
                {ind.count}
              </span>
            </button>
          )
        })}
        {hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center border border-border/50 border-dashed px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70 hover:border-foreground/40 hover:text-foreground transition-all duration-200"
          >
            +{hiddenCount} more
          </button>
        )}
        {expanded && group.industries.length > COLLAPSED_COUNT && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50 hover:text-accent transition-colors duration-200"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  )
}
