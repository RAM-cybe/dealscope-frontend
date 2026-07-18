"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ScrambleText } from "@/components/scramble-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScoreRing } from "@/components/dealscope/score-ring"
import {
  type Company,
  type DealRow,
  type Weights,
  computeScore,
  sectorAverage,
  comparablesForSector,
  getNewsForTicker,
  FACTOR_LABELS,
} from "@/lib/dealscope-data"

interface TearSheetViewProps {
  company: Company
  weights: Weights
  onBack: () => void
  companies: Company[]
  deals: DealRow[]
  dataAsOf: string
}

export function TearSheetView({ company, weights, onBack, companies, deals, dataAsOf }: TearSheetViewProps) {
  const score = computeScore(company.factors, weights)
  const avg = sectorAverage(companies, company.sector, weights)
  const comparables = comparablesForSector(company.sectorKey, deals)
  const companyNews = getNewsForTicker(company.ticker)

  return (
    <section className="relative min-h-screen pl-6 md:pl-28 pr-6 md:pr-12 py-16 md:py-24">
      <AnimatedNoise opacity={0.02} />

      {/* Left vertical label */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          TEAR SHEET
        </span>
      </div>

      <div className="relative z-10 max-w-6xl">
        {/* Back */}
        <button
          onClick={onBack}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          ← Back to Results
        </button>

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              Study / {company.sector}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-balance"
            >
              {company.name.toUpperCase()}
            </motion.h1>
            <div className="mt-3 flex items-center gap-4">
              <span className="border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                NSE: {company.ticker}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                TTM {company.metrics.revenue}
              </span>
            </div>
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-6 shrink-0"
          >
            <ScoreRing score={score} size={140} strokeWidth={3} sectorAverage={avg} />
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-loose">
              <span className="block text-foreground">Composite Score</span>
              <span className="block">
                Sector Avg <span className="text-accent">{avg}</span>
              </span>
              <span className="block text-muted-foreground/70">Scale 0–100</span>
            </div>
          </motion.div>
        </div>

        {/* Factor bars */}
        <div className="mt-20">
          <SectionLabel index="01" label="Factor Decomposition" />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {FACTOR_LABELS.map((factor, i) => (
              <FactorBar
                key={factor.key}
                label={factor.label}
                value={company.factors[factor.key]}
                weight={weights[factor.key]}
                metric={company.metrics[factor.metricKey]}
                delay={0.1 * i}
              />
            ))}
          </div>
        </div>

        {/* Rationale */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <SectionLabel index="02" label="AI-Drafted Rationale" />
            {company.hasRationale ? (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-8 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty"
                >
                  {company.rationale}
                </motion.p>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Generated from screened fundamentals • not investment advice
                </p>
              </>
            ) : (
              <div className="mt-8 border border-dashed border-border/60 p-8">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                    Awaiting Generation
                  </span>
                </div>
                <p className="mt-4 font-sans text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
                  No AI rationale has been drafted for {company.name} yet. Its composite score and
                  valuation range above are computed directly from the screened fundamentals and stand
                  on their own.
                </p>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Not yet generated • not investment advice
                </p>
              </div>
            )}
          </div>

          {/* Valuation */}
          <div className="lg:col-span-5">
            <SectionLabel index="03" label="Indicative Valuation Range" />
            <div className="mt-8 border border-border/50">
              <div className="border-b border-border/50 p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  EV / EBITDA
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-tight text-accent">
                  <ScrambleText text={company.valuation.evEbitda} delayMs={500} duration={0.8} />
                </p>
              </div>
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  P/E Implied
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-tight">
                  <ScrambleText text={company.valuation.peImplied} delayMs={700} duration={0.8} />
                </p>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted-foreground/60">
              {company.valuation.note ||
                "Ranges derived from sector-relative comparables, adjusted for growth and leverage differentials."}
            </p>
          </div>
        </div>

        {/* Comparable deals */}
        <div className="mt-20">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <SectionLabel index="04" label="Comparable Deals" />
            {/* M&A deal values are genuinely reported in USD -- label it so it
                doesn't read as a mismatch against the rupee-denominated site. */}
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Deal values in US$ (as reported)
            </span>
          </div>
          <div className="mt-8">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/50 pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
              <span className="col-span-5">Target</span>
              <span className="col-span-4">Acquirer</span>
              <span className="col-span-1">Year</span>
              <span className="col-span-2 text-right">Value (US$)</span>
            </div>
            {comparables.length === 0 ? (
              <div className="py-8 font-mono text-xs text-muted-foreground/60">
                No comparable deals found in this sector.
              </div>
            ) : (
              comparables.map((deal, i) => (
                <motion.div
                  key={`${deal.target}-${deal.year}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 border-b border-border/30 py-4 font-mono text-xs hover:bg-accent/5 transition-colors duration-300"
                >
                  <span className="col-span-2 md:col-span-5 text-foreground">{deal.target}</span>
                  <span className="md:col-span-4 text-muted-foreground">{deal.acquirer}</span>
                  <span className="md:col-span-1 text-muted-foreground/60">{deal.year}</span>
                  <span className="md:col-span-2 md:text-right text-accent">{deal.value}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Filings, notices & news */}
        <div className="mt-20">
          <SectionLabel index="05" label="Filings, Notices & News" />
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
        <div className="mt-20 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
            Data as of {dataAsOf}
          </span>
          <button
            onClick={onBack}
            className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
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
    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
      {index} / {label}
    </span>
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
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">{title}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
          {count > 0 ? String(count).padStart(2, "0") : "—"}
        </span>
      </div>
      {count === 0 ? (
        <p className="py-6 font-mono text-xs text-muted-foreground/70">{emptyLabel}</p>
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
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + Math.min(index, 6) * 0.08, duration: 0.45 }}
      className="group block border-b border-border/30 py-4 hover:bg-accent/5 transition-colors duration-300"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{date}</span>
        <span
          aria-hidden="true"
          className="font-mono text-[10px] text-muted-foreground/70 group-hover:text-accent transition-colors duration-200"
        >
          ↗
        </span>
      </div>
      <p className="mt-2 font-mono text-xs leading-relaxed text-foreground group-hover:text-accent transition-colors duration-200 text-pretty">
        {title}
      </p>
      {source && (
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
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
  delay,
}: {
  label: string
  value: number
  weight: number
  metric: string
  delay: number
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {metric} • <span className="text-accent/80">w {weight}%</span>
        </span>
      </div>
      <div className="mt-3 h-[3px] bg-border/50 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.3 + delay, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>
      <span className="mt-2 block font-mono text-[10px] text-muted-foreground/60">{value} / 100 sector-relative</span>
    </div>
  )
}
