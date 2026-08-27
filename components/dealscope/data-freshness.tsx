import datasetMeta from "@/data/dataset-meta.json"
import { cn } from "@/lib/utils"

/** Format an ISO calendar date as "21 Aug 2026" without a timezone shift. */
export function formatAsOfDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[Number(match[2]) - 1]
  if (!month) return iso
  return `${Number(match[3])} ${month} ${match[1]}`
}

export const PRICES_AS_OF = formatAsOfDate(datasetMeta.prices_as_of)
export const FUNDAMENTALS_AS_OF = formatAsOfDate(datasetMeta.fundamentals_as_of)
export const FUNDAMENTALS_AS_OF_MAX = formatAsOfDate(datasetMeta.fundamentals_as_of_max)

export function DataFreshness({
  className,
  align = "start",
}: {
  className?: string
  align?: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground",
        align === "end" && "sm:justify-end",
        className,
      )}
      role="status"
      aria-label={`NSE telemetry. Prices last updated ${PRICES_AS_OF}. Fundamentals last updated ${FUNDAMENTALS_AS_OF}.`}
    >
      {/* Live Market Session Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border/80 bg-card/60 text-foreground shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.7)]" />
        <span className="font-semibold text-[10px] tracking-widest text-foreground">NSE LIVE</span>
      </div>

      {/* Prices Telemetry Chip */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border/60 bg-card/30">
        <span className="text-muted-foreground/80 text-[10px]">PRICES</span>
        <span className="text-foreground font-semibold tabular-nums">{PRICES_AS_OF}</span>
      </div>

      {/* Fundamentals Telemetry Chip */}
      <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 border border-border/60 bg-card/30">
        <span className="text-muted-foreground/80 text-[10px]">FUNDAMENTALS</span>
        <span className="text-foreground font-semibold tabular-nums">{FUNDAMENTALS_AS_OF}</span>
      </div>
    </div>
  )
}
