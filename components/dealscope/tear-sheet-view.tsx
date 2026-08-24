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
  comparableCountForSector,
  computeSectorRank,
  findClosestPeers,
  FACTOR_LABELS,
} from "@/lib/dealscope-data"
import { useCompanyDetails } from "@/lib/company-details"
import { formatAsOfDate } from "@/components/dealscope/data-freshness"
import { OwnershipBadge } from "@/components/dealscope/ownership-badges"
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
  const sectorRank = computeSectorRank(company, companies, weights)
  const peers = findClosestPeers(company, companies, 5)
  const comparables = comparablesForSector(company.sectorKey, deals)
  const comparableCount = comparableCountForSector(company.sectorKey, deals)
  const { ready: detailsReady, narrative, news: companyNews } = useCompanyDetails(company.ticker)
  const hasAbout = Boolean(narrative.about)
  const hasWhyThisScore = Boolean(narrative.whyThisScore)
  const unclassified = company.sector === "Unclassified"

  // Ownership & pledge metrics
  const fin = company.financials
  const raw = company.raw
  const promoterHolding =
    raw.promoterHolding ??
    (fin.promoterHolding && fin.promoterHolding !== "N/A" ? Number.parseFloat(fin.promoterHolding) : null)
  const pledgeVal =
    raw.promoterPledge ??
    (fin.promoterPledge && fin.promoterPledge !== "N/A" ? Number.parseFloat(fin.promoterPledge) : null)
  const pledgeFlagged = pledgeVal != null && pledgeVal > 0
  const freeFloat = promoterHolding != null ? Math.max(0, Math.min(100, 100 - promoterHolding)) : null

  // Key Financials grid
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
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          TEAR SHEET
        </span>
      </div>

      <div className="relative z-10 max-w-6xl">
        {/* Back */}
        <button
          onClick={onBack}
          className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors duration-200 py-1"
        >
          ← Back to Results
        </button>

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              Tear Sheet / {company.sector}
            </span>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-balance"
            >
              {company.name.toUpperCase()}
            </motion.h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                NSE: {company.ticker}
              </span>
              <OwnershipBadge
                holding={company.raw.promoterHolding}
                pledge={company.raw.promoterPledge}
                variant="header"
              />
              {company.industry && (
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/75">
                  {company.industry}
                </span>
              )}
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/75">
                TTM {company.metrics.revenue}
              </span>
              {sectorRank && (
                <span className="border border-accent/40 bg-accent/5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
                  Ranks {sectorRank.rank} of {sectorRank.total} in {company.sector}
                </span>
              )}
            </div>
          </div>

          {/* Score + Breakdown Mini-Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8 shrink-0"
          >
            <div className="flex items-center gap-5">
              <ScoreRing score={score} size={130} strokeWidth={3} sectorAverage={avg} />
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
                <span className="block text-foreground font-medium">Composite Score</span>
                <span className="block">
                  Sector Avg <span className="text-accent">{avg == null ? "—" : avg}</span>
                </span>
                <span className="block text-muted-foreground/70 text-[11px]">
                  {unclassified ? "Unclassified — not scored" : "Sector-relative · 0–100"}
                </span>
              </div>
            </div>

            {/* Score Breakdown mini-table */}
            {!unclassified && (
              <div className="border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80 block mb-2.5">
                  Factor Breakdown
                </span>
                <div className="flex flex-col gap-2 min-w-[210px]">
                  {FACTOR_LABELS.map((factor) => {
                    const factorVal = company.factors[factor.key]
                    const weightVal = weights[factor.key]
                    const isFigDebt = company.sector === "Financial Services" && factor.key === "debtLevel"
                    return (
                      <div key={factor.key} className="flex items-center justify-between gap-3 font-mono text-xs">
                        <span className="text-muted-foreground/85 text-[11px] truncate">{factor.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-14 h-1.5 bg-border/50 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-accent transition-all duration-300"
                              style={{ width: factorVal != null ? `${factorVal}%` : "0%" }}
                            />
                          </div>
                          <span className="w-12 text-right text-foreground font-mono text-[11px]">
                            {isFigDebt ? "N/A · FIG" : factorVal != null ? `${factorVal}` : "—"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Key financials */}
        <div className="mt-16">
          <SectionLabel index="01" label="Key Financials" />
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/70">
            Market cap as of {formatAsOfDate(fin.marketCapAsOf)}. Fundamentals as of{" "}
            {formatAsOfDate(company.asOfDate)}.
          </p>
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
            <p className="mt-4 font-mono text-xs leading-relaxed text-accent/90 max-w-2xl">
              Non-zero promoter pledge — shares pledged by promoters are a governance-risk signal worth
              reviewing before any acquisition approach.
            </p>
          )}
        </div>

        {/* Factor decomposition */}
        <div className="mt-16">
          <SectionLabel index="02" label="Factor Decomposition" />
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-2xl">
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

        {/* Sector Peers Strip */}
        {peers.length > 0 && (
          <div className="mt-16">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <SectionLabel index="02.5" label="Sector Peers" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                Closest 5 peers in {company.sector} by factor profile
              </span>
            </div>
            <div className="mt-6 border border-border/50">
              {/* Desktop header */}
              <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/50 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                <span className="col-span-5">Company</span>
                <span className="col-span-2">Ticker</span>
                <span className="col-span-2 text-right">Composite Score</span>
                <span className="col-span-3 text-right">EBITDA Margin</span>
              </div>
              {/* Current company row */}
              <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 border-b border-border/50 bg-accent/5 px-5 py-3.5 font-mono text-xs items-center">
                <div className="col-span-2 md:col-span-5 flex items-center gap-2">
                  <span className="text-accent font-medium">{company.name}</span>
                  <span className="text-[10px] uppercase tracking-widest border border-accent/40 text-accent px-1.5 py-0.5">
                    Current
                  </span>
                </div>
                <span className="hidden md:inline md:col-span-2 text-muted-foreground">{company.ticker}</span>
                <span className="md:col-span-2 text-right text-accent font-bold">
                  {score != null ? `${score} / 100` : "—"}
                </span>
                <span className="md:col-span-3 text-right text-foreground font-medium">
                  {company.metrics.ebitdaMargin}
                </span>
              </div>
              {/* Peers */}
              {peers.map((peer) => {
                const peerScore = computeScore(peer.factors, weights)
                return (
                  <div
                    key={peer.ticker}
                    className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 border-b last:border-b-0 border-border/30 px-5 py-3 font-mono text-xs items-center hover:bg-accent/5 transition-colors"
                  >
                    <span className="col-span-2 md:col-span-5 text-foreground truncate">{peer.name}</span>
                    <span className="hidden md:inline md:col-span-2 text-muted-foreground/70">{peer.ticker}</span>
                    <span className="md:col-span-2 text-right text-muted-foreground">
                      {peerScore != null ? `${peerScore} / 100` : "—"}
                    </span>
                    <span className="md:col-span-3 text-right text-muted-foreground/80">
                      {peer.metrics.ebitdaMargin}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* About the company */}
        <div className="mt-16 max-w-3xl">
          <SectionLabel index="03" label="About The Company" />
          {hasAbout ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06, duration: 0.35 }}
              className="mt-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty"
            >
              {narrative.about}
            </motion.p>
          ) : !detailsReady ? (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              Loading description…
            </p>
          ) : (
            <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground/60">
              — No company description generated yet. Financial metrics and factor rankings above are live and complete.
            </p>
          )}
        </div>

        {/* Why This Score + Valuation */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <SectionLabel index="04" label="Why This Score" />
            {hasWhyThisScore ? (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                  className="mt-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty"
                >
                  {narrative.whyThisScore}
                </motion.p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
                  Generated from screened fundamentals. Not investment advice.
                </p>
              </>
            ) : !detailsReady ? (
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                Loading explanation…
              </p>
            ) : (
              <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground/60">
                — No score rationale generated yet. Factor decomposition above reflects direct sector-relative percentiles.
              </p>
            )}
          </div>

          {/* Valuation */}
          <div className="lg:col-span-5">
            <SectionLabel index="05" label="Indicative Valuation Range" />
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/70">
              Two independent estimates based on listed-peer trading multiples in {company.sector} —
              the 25th–75th percentile EV/EBITDA and P/E of other listed companies in this sector,
              applied to this company&apos;s own earnings. EV/EBITDA values enterprise; P/E values equity.
            </p>
            <div className="mt-6 border border-border/50">
              <div className="border-b border-border/50 p-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  EV / EBITDA Implied
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-tight text-accent">
                  <ScrambleText text={company.valuation.evEbitda} delayMs={500} duration={0.8} />
                </p>
              </div>
              <div className="p-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  P / E Implied
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-tight">
                  <ScrambleText text={company.valuation.peImplied} delayMs={700} duration={0.8} />
                </p>
              </div>
            </div>
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground/70">
              {company.valuation.note ||
                "Ranges derived from listed-peer trading multiples in this sector. Not precedent M&A multiples."}
            </p>
          </div>
        </div>

        {/* Ownership Structure */}
        <div className="mt-16">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <SectionLabel index="06" label="Ownership Structure" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              Shareholding &amp; Float telemetry · As of {formatAsOfDate(company.asOfDate)}
            </span>
          </div>
          <div className="mt-6 border border-border/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Promoter Holding
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl md:text-4xl text-foreground">
                  {promoterHolding != null
                    ? `${promoterHolding.toFixed(1)}%`
                    : fin.promoterHolding && fin.promoterHolding !== "N/A"
                    ? fin.promoterHolding
                    : "N/A"}
                </p>
                <span className="mt-1 block font-mono text-[11px] text-muted-foreground/60">
                  Equity held by promoters &amp; insider group
                </span>
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Promoter Pledge
                </span>
                <p
                  className={cn(
                    "mt-2 font-[family-name:var(--font-bebas)] text-3xl md:text-4xl",
                    pledgeFlagged ? "text-accent" : "text-foreground",
                  )}
                >
                  {fin.promoterPledge}
                </p>
                <span className="mt-1 block font-mono text-[11px] text-muted-foreground/60">
                  {pledgeFlagged
                    ? "Shares encumbered as collateral"
                    : "No reported encumbrance on promoter shares"}
                </span>
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Free Float (Est.)
                </span>
                <p className="mt-2 font-[family-name:var(--font-bebas)] text-3xl md:text-4xl text-foreground">
                  {freeFloat != null ? `${freeFloat.toFixed(1)}%` : "N/A"}
                </p>
                <span className="mt-1 block font-mono text-[11px] text-muted-foreground/60">
                  Public &amp; institutional non-promoter float
                </span>
              </div>
            </div>

            {/* Factual distribution bar */}
            {promoterHolding != null && freeFloat != null && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <div className="h-2.5 w-full bg-border/40 flex overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, promoterHolding))}%` }}
                  />
                  <div
                    className="bg-foreground/25 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, freeFloat))}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground/75">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-accent inline-block" /> Promoter ({promoterHolding.toFixed(1)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-foreground/25 inline-block" /> Free Float ({freeFloat.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparable deals */}
        <div className="mt-16">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <SectionLabel index="07" label="Comparable Deals" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              Historical M&amp;A — {comparableCount} in sector of 727 precedent deals (2006–2025)
            </span>
          </div>
          <p className="mt-3 mb-4 font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-2xl">
            Precedent transactions for context only. They are not the source of the valuation range
            above, which uses listed-peer trading multiples.
          </p>

          <div className="mt-6 border border-border/50">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/50 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              <span className="col-span-5">Acquirer ← Target</span>
              <span className="col-span-2">Year</span>
              <span className="col-span-2">Deal Type</span>
              <span className="col-span-3 text-right">Value (US$)</span>
            </div>

            {comparables.length === 0 ? (
              <div className="p-6 font-mono text-xs text-muted-foreground/60">
                No precedent transactions recorded for {company.sector} in the dataset.
              </div>
            ) : (
              comparables.map((deal, i) => (
                <motion.div
                  key={`${deal.target}-${deal.year}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 + Math.min(i, 8) * 0.02, duration: 0.25 }}
                  className="border-b last:border-b-0 border-border/30 px-5 py-3.5 font-mono text-xs hover:bg-accent/5 transition-colors duration-200"
                >
                  {/* Desktop view */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-2 truncate">
                      <span className="text-foreground font-medium">{deal.acquirer}</span>
                      <span className="text-muted-foreground/50">←</span>
                      <span className="text-muted-foreground truncate">{deal.target}</span>
                    </div>
                    <span className="col-span-2 text-muted-foreground/75">{deal.year}</span>
                    <span className="col-span-2 text-muted-foreground/60 uppercase text-[11px] truncate">
                      {deal.dealType || "M&A"}
                    </span>
                    <span className="col-span-3 text-right text-accent font-medium">{deal.value}</span>
                  </div>

                  {/* Mobile stacked card view */}
                  <div className="md:hidden flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-foreground font-medium text-xs">
                        {deal.acquirer} <span className="text-muted-foreground/50">←</span> {deal.target}
                      </div>
                      <span className="text-accent font-medium text-xs shrink-0">{deal.value}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground/75">
                      <span>{deal.year}</span>
                      {deal.dealType && <span>• {deal.dealType}</span>}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Filings, notices & news */}
        <div className="mt-16">
          <SectionLabel index="08" label="Filings, Notices & News" />
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
            className="border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            Close Tear Sheet
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
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/75">{label}</span>
      <span
        className={cn(
          "font-[family-name:var(--font-bebas)] text-3xl md:text-4xl leading-none tracking-tight break-words",
          flagged ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </span>
      {note && (
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">{note}</span>
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
      <div className="flex items-baseline justify-between border-b border-border/50 pb-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">{title}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 + Math.min(index, 6) * 0.03, duration: 0.3 }}
      className="group block border-b border-border/30 py-4 hover:bg-accent/5 transition-colors duration-300"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">{date}</span>
        <span
          aria-hidden="true"
          className="font-mono text-xs text-muted-foreground/70 group-hover:text-accent transition-colors duration-200"
        >
          ↗
        </span>
      </div>
      <p className="mt-2 font-mono text-xs leading-relaxed text-foreground group-hover:text-accent transition-colors duration-200 text-pretty">
        {title}
      </p>
      {source && (
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
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
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {metric} • <span className="text-accent/90 font-medium">w {weight}%</span>
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
      <span className="mt-1 block font-mono text-xs leading-relaxed text-muted-foreground/65">{explainer}</span>
    </div>
  )
}
