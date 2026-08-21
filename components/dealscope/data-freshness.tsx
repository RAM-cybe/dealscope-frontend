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
        "flex flex-col gap-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/75 leading-relaxed",
        align === "end" && "sm:items-end sm:text-right",
        className,
      )}
      role="status"
      aria-label={`Prices and market cap last updated ${PRICES_AS_OF}. Fundamentals last updated ${FUNDAMENTALS_AS_OF}.`}
    >
      <span>
        Prices / Market Cap last updated:{" "}
        <span className="text-foreground/85">{PRICES_AS_OF}</span>
      </span>
      <span>
        Fundamentals last updated:{" "}
        <span className="text-foreground/85">{FUNDAMENTALS_AS_OF}</span>
      </span>
    </div>
  )
}
