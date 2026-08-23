"use client"

import type React from "react"
import { motion } from "framer-motion"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScoreRing } from "@/components/dealscope/score-ring"
import {
  type Company,
  type DealRow,
  type Weights,
  computeScore,
  sectorAverage,
  comparablesForSector,
  comparableCountForSector,
  FACTOR_LABELS,
} from "@/lib/dealscope-data"
import { useCompanyDetails } from "@/lib/company-details"
import { formatAsOfDate } from "@/components/dealscope/data-freshness"
import { cn } from "@/lib/utils"

interface TearSheetViewProps {
  company: Company
  weights: Weights
  onBack: () => void
  companies: Company[]
  deals: DealRow[]
}

export function TearSheetView({ company, weights, onBack, companies, deals }: TearSheetViewProps) {
  const score = computeScore(company.factors, weights)
  const avg = sectorAverage(companies, company.sector, weights)
  const comparables = comparablesForSector(company.sectorKey, deals)
  const comparableCount = comparableCountForSector(company.sectorKey, deals)
  const { ready: detailsReady, narrative, news: companyNews } = useCompanyDetails(company.ticker)
  const hasAbout = Boolean(narrative.about)
  const hasWhyThisScore = Boolean(narrative.whyThisScore)
  const unclassified = company.sector === "Unclassified"

  // Key Financials -- raw numbers are the headline. A non-zero promoter pledge
  // is a real governance-risk signal, so flag it in accent rather than leaving
  // it as another neutral stat.
  const fin = company.financials
  const pledgeFlagged = fin.promoterPledge !== "N/A" && Number.parseFloat(fin.promoterPledge) > 0
  const financialCards: { label: string; value: string; flagged?: boolean; note?: string }[] = [
    { label: "Market Cap", value: fin.marketCap, note: fin.marketCapAsOf ? `As of ${formatAsOfDate(fin.marketCapAsOf)}` : undefined },
    { label: "Revenue (TTM)", value: company.metrics.revenue, note: company.asOfDate ? `As of ${formatAsOfDate(company.asOfDate)}` : undefined },
    { label: "EBITDA Margin", value: company.metrics.ebitdaMargin },
    { label: "ROCE", value: company.metrics.roce },
    { label: "Total Debt", value: company.metrics.totalDebt },
    { label: "P/E Ratio", value: fin.peRatio },
    { label: "ROE", value: fin.roe },
    { label: "Debt / Equity", value: fin.debtToEquity },
    { label: "Promoter Pledge", value: fin.promoterPledge, flagged: pledgeFlagged },
    { label: "Current Ratio", value: fin.currentRatio },
    { label: "Free Cash Flow", value: fin.freeCashFlow },
    { label: "Beta", value: fin.beta },
  ]

  return (
    <section className="relative min-h-screen pl-6 md:pl-28 pr-6 md:pr-12 py-16 md:py-24">
      <AnimatedNoise opacity={0.02} />

      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          TEAR SHEET
        </span>
      </div>

      <div className="relative z-10 max-w-6xl">
        {/* Back */}
        <button
          onClick={onBack}
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          ← Back to Results
        </button>

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              Study / {company.sector}
            </span>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-balance"
            >
              {company.name.toUpperCase()}
            </motion.h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                NSE: {company.ticker}
              </span>
              {/* Granular industry, alongside the broad sector already shown in
                  the kicker above -- omitted entirely (not a broken/empty
                  label) for the ~74/2,046 companies missing it upstream. */}
              {company.industry && (
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                  {company.industry}
                </span>
              )}
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                TTM {company.metrics.revenue}
              </span>
            </div>
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-6 shrink-0"
          >
            <ScoreRing score={score} size={140} strokeWidth={3} sectorAverage={avg} />
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground leading-loose">
              <span className="block text-foreground">Composite Score</span>
              <span className="block">
                Sector Avg <span className="text-accent">{avg == null ? "—" : avg}</span>
              </span>
              <span className="block text-muted-foreground">
                {unclassified ? "Unclassified — not scored" : "Scale 0–100"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Key financials -- the raw numbers are the headline of the sheet */}
        <div className="mt-16">
          <SectionLabel index="01" label="Key Financials" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {financialCards.map((card) => (
              <FinancialCard
                key={card.label}
                label={card.label}
                value={card.value}
                flagged={card.flagged}
                note={card.note}
              />
            ))}
          </div>
          {pledgeFlagged && (
            <p className="mt-4 font-mono text-xs leading-relaxed text-accent/80 max-w-2xl">
              Non-zero promoter pledge — shares pledged by promoters are a governance-risk signal worth
              reviewing before any approach.
            </p>
          )}
        </div>

        {/* Factor decomposition -- supporting detail beneath the raw numbers */}
        <div className="mt-14">
          <SectionLabel index="02" label="Factor Decomposition" />
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/80 max-w-2xl">
            {unclassified
              ? "This company has no sector classification, so it is not ranked against a peer group. Factor scores are shown as unavailable rather than invented."
              : `Each score below is ranked 0–100 against only the other companies in ${company.sector} — not the whole market — so a 91 means this company outperforms ~91% of its direct sector peers. Missing factors show as — and are dropped from the composite, not treated as zero.`}
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {FACTOR_LABELS.map((factor, i) => (
              <FactorBar
                key={factor.key}
                label={factor.label}
                value={company.factors[factor.key]}
                weight={weights[factor.key]}
                metric={company.metrics[factor.metricKey]}
                explainer={factor.explainer}
                delay={0.04 * i}
              />
            ))}
          </div>
        </div>

        {/* About the company -- factual, standalone, ahead of the score
            explanation so a reader gets "what this is" before "why it
            scored this way". Full-width: it's 2-4 sentences, doesn't need
            to share a row with the valuation panel the way the (longer)
            score explanation does. */}
        <div className="mt-20 max-w-3xl">
          <SectionLabel index="03" label="About The Company" />
          {hasAbout ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06, duration: 0.35 }}
              className="mt-8 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty"
            >
              {narrative.about}
            </motion.p>
          ) : !detailsReady ? (
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Loading description…
            </p>
          ) : (
            <div className="mt-8 border border-dashed border-border/60 p-8">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                  Awaiting Generation
                </span>
              </div>
              <p className="mt-4 font-sans text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
                No company description has been drafted for {company.name} yet. The financials and
                factor breakdown above are computed directly from screened fundamentals and stand on
                their own in the meantime.
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                Not yet generated • not investment advice
              </p>
            </div>
          )}
        </div>

        {/* Why This Score + Valuation */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <SectionLabel index="04" label="Why This Score" />
            {hasWhyThisScore ? (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                  className="mt-8 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty"
                >
                  {narrative.whyThisScore}
                </motion.p>
                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                  Generated from screened fundamentals. Not investment advice.
                </p>
              </>
            ) : !detailsReady ? (
              <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Loading explanation…
              </p>
            ) : (
              <div className="mt-8 border border-dashed border-border/60 p-8">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    Awaiting Generation
                  </span>
                </div>
                <p className="mt-4 font-sans text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
                  No AI rationale has been drafted for {company.name} yet. Its composite score and
                  valuation range above are computed directly from the screened fundamentals and stand
                  on their own.
                </p>
                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                  Not yet generated • not investment advice
                </p>
              </div>
            )}
          </div>

          {/* Valuation */}
          <div className="lg:col-span-5">
            <SectionLabel index="05" label="Indicative Valuation Range" />
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/80">
              Two independent estimates based on listed-peer trading multiples in {company.sector} —
              the 25th–75th percentile EV/EBITDA and P/E of other listed companies in this sector,
              applied to this company&apos;s own earnings. These are not precedent M&amp;A deal
              multiples. EV/EBITDA values the whole business including debt; P/E values just the
              equity. Shown as a range, not a single number.
            </p>
            <div className="mt-8 border border-border/50">
              <div className="border-b border-border/50 p-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  EV / EBITDA
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl tracking-tight text-accent break-words">
                  {company.valuation.evEbitda}
                </p>
              </div>
              <div className="p-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  P/E Implied
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl tracking-tight break-words">
                  {company.valuation.peImplied}
                </p>
              </div>
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground/80">
              {company.valuation.note ||
                "Ranges derived from listed-peer trading multiples in this sector. Not M&A deal multiples."}
            </p>
          </div>
        </div>

        {/* Comparable deals */}
        <div className="mt-20">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <SectionLabel index="06" label="Comparable Deals" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Historical M&amp;A — {comparableCount} in sector of 727 · values in US$ as reported
            </span>
          </div>
          <div className="mt-8">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/50 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="col-span-5">Target</span>
              <span className="col-span-4">Acquirer</span>
              <span className="col-span-1">Year</span>
              <span className="col-span-2 text-right">Value (US$)</span>
            </div>
            <p className="mt-3 mb-4 font-mono text-xs leading-relaxed text-muted-foreground/80 max-w-2xl">
              Precedent transactions for context only. They are not the source of the valuation range
              above, which uses listed-peer trading multiples.
            </p>
            {comparables.length === 0 ? (
              <div className="py-8 font-mono text-xs text-muted-foreground/80">
                No comparable deals found in this sector.
              </div>
            ) : (
              comparables.map((deal, i) => (
                <motion.div
                  key={`${deal.target}-${deal.year}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + Math.min(i, 8) * 0.03, duration: 0.3 }}
                  className="grid grid-cols-12 gap-x-3 gap-y-1 md:gap-4 border-b border-border/30 py-4 font-mono text-xs hover:bg-accent/5 transition-colors duration-300"
                >
                  <span className="col-span-12 md:col-span-5 text-foreground">{deal.target}</span>
                  <span className="col-span-12 md:col-span-4 text-muted-foreground">{deal.acquirer}</span>
                  <span className="col-span-5 md:col-span-1 text-muted-foreground/80">{deal.year}</span>
                  <span className="col-span-7 md:col-span-2 md:text-right text-accent">{deal.value}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Filings, notices & news */}
        <div className="mt-20">
          <SectionLabel index="07" label="Filings, Notices & News" />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12">
            {/* NSE regulatory filings */}
            <NewsColumn title="NSE Filings" count={companyNews.filings.length} emptyLabel="No recent filings found">
              {companyNews.filings.map((f, i) => (
                <NewsRow key={`${f.category}-${f.date}-${i}`} index={i} href={f.link} date={f.date} title={f.category} />
              ))}
            </NewsColumn>

            {/* BSE notices */}
            <NewsColumn title="BSE Notices" count={companyNews.bseNotices.length} emptyLabel="No recent notices found">
              {companyNews.bseNotices.map((n, i) => (
                <NewsRow key={`${n.title}-${n.date}-${i}`} index={i} href={n.link} date={n.date} title={n.title} />
              ))}
            </NewsColumn>

            {/* Press / news */}
            <NewsColumn title="News" count={companyNews.news.length} emptyLabel="No recent coverage found">
              {companyNews.news.map((n, i) => (
                <NewsRow key={`${n.headline}-${n.date}-${i}`} index={i} href={n.link} date={n.date} title={n.headline} source={n.source} />
              ))}
            </NewsColumn>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 flex items-center justify-end">
          <button
            onClick={onBack}
            className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            Close Study
          </button>
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
      {index} / {label}
    </span>
  )
}

function FinancialCard({
  label,
  value,
  flagged,
  note,
}: {
  label: string
  value: string
  flagged?: boolean
  note?: string
}) {
  return (
    <div className="border border-border/50 p-5 flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-[family-name:var(--font-bebas)] text-3xl md:text-4xl leading-none tracking-tight break-words",
          flagged ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </span>
      {note && (
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/80">{note}</span>
      )}
    </div>
  )
}

function NewsColumn({
  title,
  count,
  emptyLabel,
  children,
}: {
  title: string
  count: number
  emptyLabel: string
  children: React.ReactNode
}) {
  return (
    <div>
      {/* Sub-header, mirrors the Comparable Deals header row */}
      <div className="flex items-baseline justify-between border-b border-border/50 pb-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">{title}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          {count > 0 ? String(count).padStart(2, "0") : "—"}
        </span>
      </div>
      {count === 0 ? (
        <p className="py-6 font-mono text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col">{children}</div>
      )}
    </div>
  )
}

function NewsRow({
  index,
  href,
  date,
  title,
  source,
}: {
  index: number
  href: string
  date: string
  title: string
  source?: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 + Math.min(index, 6) * 0.03, duration: 0.3 }}
      className="group block border-b border-border/30 py-4 hover:bg-accent/5 transition-colors duration-300"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">{date}</span>
        <span
          aria-hidden="true"
          className="font-mono text-xs text-muted-foreground group-hover:text-accent transition-colors duration-200"
        >
          ↗
        </span>
      </div>
      <p className="mt-2 font-mono text-xs leading-relaxed text-foreground group-hover:text-accent transition-colors duration-200 text-pretty">
        {title}
      </p>
      {source && (
        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          {source}
        </span>
      )}
    </motion.a>
  )
}

function FactorBar({
  label,
  value,
  weight,
  metric,
  explainer,
  delay,
}: {
  label: string
  value: number | null
  weight: number
  metric: string
  explainer: string
  delay: number
}) {
  const missing = value == null
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {metric} • <span className="text-accent/80">w {weight}%</span>
        </span>
      </div>
      <div className="mt-3 h-[3px] bg-border/50 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: missing ? "0%" : `${value}%` }}
          transition={{ delay: 0.08 + delay, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>
      <span className="mt-2 block font-mono text-xs text-muted-foreground/80">
        {missing ? "— / unavailable" : `${value} / 100 sector-relative`}
      </span>
      <span className="mt-1 block font-mono text-xs leading-relaxed text-muted-foreground/40">{explainer}</span>
    </div>
  )
}
