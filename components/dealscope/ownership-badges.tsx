import { cn } from "@/lib/utils"
import {
  isElevatedPledge,
  ownershipBadgeLabel,
  ownershipBadgeTitle,
} from "@/lib/ownership-badges"

/**
 * Native DealScope chip: PROM / PLG percents already on the company record.
 * Row variant matches pass-reason chips; header variant matches the NSE chip.
 * Elevated pledge (> 10%) uses the same accent border already used for
 * "good" reason chips — factual emphasis, not a warning product.
 */
export function OwnershipBadge({
  holding,
  pledge,
  variant = "row",
  className,
}: {
  holding: number | null | undefined
  pledge: number | null | undefined
  variant?: "row" | "header"
  className?: string
}) {
  const label = ownershipBadgeLabel(holding, pledge)
  if (!label) return null
  const flagged = isElevatedPledge(pledge)
  const title = ownershipBadgeTitle(holding, pledge)

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center border font-mono text-xs uppercase",
        variant === "header" ? "px-3 py-1 tracking-widest" : "px-2 py-1 tracking-wider",
        flagged
          ? "border-accent/40 text-accent/90"
          : variant === "header"
            ? "border-border text-muted-foreground"
            : "border-border/60 text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  )
}
