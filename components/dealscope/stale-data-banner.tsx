"use client"

import { useEffect, useState } from "react"
import datasetMeta from "@/data/dataset-meta.json"
import { FUNDAMENTALS_AS_OF, PRICES_AS_OF, formatAsOfDate } from "@/components/dealscope/data-freshness"

const STALE_AFTER_DAYS = Number(datasetMeta.stale_after_days ?? 100)

function utcDaysBetween(iso: string | null | undefined, now: Date): number | null {
  if (!iso) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  const asOf = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.floor((today - asOf) / 86_400_000)
}

export function StaleDataBanner() {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    setDays(utcDaysBetween(datasetMeta.fundamentals_as_of, new Date()))
  }, [])

  if (days == null || days <= STALE_AFTER_DAYS) return null

  return (
    <div
      role="status"
      className="border-b border-accent/40 bg-accent/10 px-6 md:px-12 py-3"
    >
      <p className="font-mono text-[11px] leading-relaxed text-foreground/90 max-w-4xl">
        Fundamentals were last updated {FUNDAMENTALS_AS_OF} ({days} days ago) and
        may not reflect the latest reported results. Prices / market cap last
        updated {PRICES_AS_OF}.
        {datasetMeta.fundamentals_as_of_max &&
        formatAsOfDate(datasetMeta.fundamentals_as_of_max) !== FUNDAMENTALS_AS_OF
          ? ` Some names use ${formatAsOfDate(datasetMeta.fundamentals_as_of_max)}.`
          : null}
      </p>
    </div>
  )
}
