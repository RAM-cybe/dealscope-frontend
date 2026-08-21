"use client"

import { useEffect, useState } from "react"
import { asString, type CompanyNews } from "@/lib/dealscope-data"

export interface CompanyNarrative {
  about: string | null
  whyThisScore: string | null
}

const EMPTY_NEWS: CompanyNews = { filings: [], bseNotices: [], news: [] }
const EMPTY_NARRATIVE: CompanyNarrative = { about: null, whyThisScore: null }

type NarrativeFile = Record<string, { about?: unknown; why_this_score?: unknown; rationale?: unknown }>

let narrativesPromise: Promise<Record<string, CompanyNarrative>> | null = null
let newsPromise: Promise<Map<string, CompanyNews>> | null = null

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function normalizeNewsEntry(raw: unknown): CompanyNews {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    filings: toArray(r.filings),
    bseNotices: toArray(r.bseNotices),
    news: toArray(r.news),
  }
}

async function loadNarratives(): Promise<Record<string, CompanyNarrative>> {
  const mod = await import("@/data/narratives.json")
  const raw = mod.default as NarrativeFile
  const out: Record<string, CompanyNarrative> = {}
  for (const [ticker, entry] of Object.entries(raw)) {
    out[ticker] = {
      about: asString(entry?.about),
      whyThisScore: asString(entry?.why_this_score) ?? asString(entry?.rationale),
    }
  }
  return out
}

async function loadNews(): Promise<Map<string, CompanyNews>> {
  const mod = await import("@/data/news.json")
  const raw = mod.default as unknown
  const map = new Map<string, CompanyNews>()
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const ticker = (entry as { ticker?: string })?.ticker
      if (ticker) map.set(ticker, normalizeNewsEntry(entry))
    }
  } else if (raw && typeof raw === "object") {
    for (const [ticker, entry] of Object.entries(raw as Record<string, unknown>)) {
      map.set(ticker, normalizeNewsEntry(entry))
    }
  }
  return map
}

export function prefetchCompanyDetails(): void {
  if (!narrativesPromise) narrativesPromise = loadNarratives()
  if (!newsPromise) newsPromise = loadNews()
}

export function useCompanyDetails(ticker: string): {
  ready: boolean
  narrative: CompanyNarrative
  news: CompanyNews
} {
  const [ready, setReady] = useState(false)
  const [narrative, setNarrative] = useState<CompanyNarrative>(EMPTY_NARRATIVE)
  const [news, setNews] = useState<CompanyNews>(EMPTY_NEWS)

  useEffect(() => {
    prefetchCompanyDetails()
    let cancelled = false
    Promise.all([narrativesPromise, newsPromise]).then(([narr, newsMap]) => {
      if (cancelled || !narr || !newsMap) return
      setNarrative(narr[ticker] ?? EMPTY_NARRATIVE)
      setNews(newsMap.get(ticker) ?? EMPTY_NEWS)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [ticker])

  return { ready, narrative, news }
}
