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
  const financialCards: { label: string; value: string; flagged?: boolean }[] = [
    { label: "Market Cap", value: fin.marketCap },
    { label: "Revenue (TTM)", value: company.metrics.revenue },
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
    <section className="relative min-h-screen px-6 md:px-12 py-12 md:py-20 max-w-7xl mx-auto">
      <AnimatedNoise opacity={0.02} />

      <div className="relative z-10">
        {/* Back */}
        <button
          onClick={onBack}
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200 py-1"
        >
          ← Back to Screener
        </button>

        {/* Master Header Ribbon */}
        <div className="mt-6 md:mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-border/40">
          {/* Identity Column */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent block">
              Tear Sheet / {company.sector}
            </span>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2.5 font-[family-name:var(--font-bebas)] text-[clamp(2rem,3.8vw,3.5rem)] leading-[0.92] tracking-tight text-balance break-words text-foreground"
            >
              {company.name.toUpperCase()}
            </motion.h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <span className="border border-border px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                NSE: {company.ticker}
              </span>
              <OwnershipBadge
                holding={company.raw.promoterHolding}
                pledge={company.raw.promoterPledge}
                variant="header"
              />
              {company.industry && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {company.industry}
                </span>
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                TTM {company.metrics.revenue}
              </span>
              {sectorRank && (
                <span className="border border-accent/40 bg-accent/5 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-accent font-medium">
                  Ranks {sectorRank.rank} of {sectorRank.total} in {company.sector}
                </span>
              )}
            </div>
          </div>

          {/* Composite Score Pod */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-5 shrink-0"
          >
            <ScoreRing score={score} size={110} strokeWidth={3} sectorAverage={avg} />
            <div className="font-mono text-xs uppercase tracking-wider leading-relaxed">
              <span className="block text-foreground font-medium">Composite Score</span>
              <span className="block text-muted-foreground">
                Sector Avg <span className="text-accent font-medium tabular-nums">{avg == null ? "—" : avg}</span>
              </span>
              <span className="block text-muted-foreground/70 text-xs mt-0.5">
                {unclassified ? "Unclassified — not scored" : "Sector-relative · 0–100"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* 01 / Key Financials */}
        <div className="mt-12 md:mt-16">
          <SectionHeader
            index="01"
            label="Key Financials"
            subtitle={`Market Cap & Fundamentals as of ${formatAsOfDate(fin.marketCapAsOf || company.asOfDate)}`}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {financialCards.map((card) => (
              <FinancialCard
                key={card.label}
                label={card.label}
                value={card.value}
                flagged={card.flagged}
              />
            ))}
          </div>
        </div>

        {/* 02 / Factor Decomposition */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader
            index="02"
            label="Factor Decomposition"
            subtitle={`Sector-relative percentiles (0–100) benchmarked against ${company.sector} cohort`}
          />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-3xl mb-8">
            {unclassified
              ? "This company has no sector classification, so it is not ranked against a peer group. Factor scores are shown as unavailable rather than invented."
              : `Each score below is ranked 0–100 against direct peers in ${company.sector} — a 90 means outperforming ~90% of sector companies. Missing factors (—) are excluded from weighting.`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8">
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

        {/* 03 / Sector Peers */}
        {peers.length > 0 && (
          <div className="mt-12 md:mt-16">
            <SectionHeader
              index="03"
              label="Sector Peers"
              subtitle={`Closest 5 peers in ${company.sector} by factor correlation`}
            />
            <div className="border border-border/40 bg-card/20 overflow-hidden">
              {/* Desktop header */}
              <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/40 bg-card/40 px-5 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <span className="col-span-5">Company</span>
                <span className="col-span-2">Ticker</span>
                <span className="col-span-2 text-right">Composite Score</span>
                <span className="col-span-3 text-right">EBITDA Margin</span>
              </div>
              {/* Target company row */}
              <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 border-b border-border/40 bg-accent/[0.04] border-l-2 border-l-accent px-5 py-3.5 font-mono text-xs items-center">
                <div className="col-span-2 md:col-span-5 flex items-center gap-2">
                  <span className="text-foreground font-semibold truncate">{company.name}</span>
                  <span className="text-[10px] uppercase tracking-wider border border-accent/40 text-accent px-1.5 py-0.5 bg-accent/5 font-medium">
                    Target
                  </span>
                </div>
                <span className="hidden md:inline md:col-span-2 text-muted-foreground">{company.ticker}</span>
                <span className="md:col-span-2 text-right text-accent font-bold tabular-nums">
                  {score != null ? `${score} / 100` : "—"}
                </span>
                <span className="md:col-span-3 text-right text-foreground font-medium tabular-nums">
                  {company.metrics.ebitdaMargin}
                </span>
              </div>
              {/* Peer rows */}
              {peers.map((peer) => {
                const peerScore = computeScore(peer.factors, weights)
                return (
                  <div
                    key={peer.ticker}
                    className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 border-b last:border-b-0 border-border/25 px-5 py-3 font-mono text-xs items-center hover:bg-accent/5 transition-colors"
                  >
                    <span className="col-span-2 md:col-span-5 text-foreground/90 truncate">{peer.name}</span>
                    <span className="hidden md:inline md:col-span-2 text-muted-foreground/70">{peer.ticker}</span>
                    <span className="md:col-span-2 text-right text-muted-foreground tabular-nums">
                      {peerScore != null ? `${peerScore} / 100` : "—"}
                    </span>
                    <span className="md:col-span-3 text-right text-muted-foreground/80 tabular-nums">
                      {peer.metrics.ebitdaMargin}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 04 / Executive Brief & Thesis */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader
            index="04"
            label="Executive Brief & Thesis"
            subtitle="Company profile & score driver analysis"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Company Profile */}
            <div className="border border-border/40 bg-card/20 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">
                    04.A / Business Model
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
                    {company.industry || company.sector}
                  </span>
                </div>
                {hasAbout ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.06, duration: 0.35 }}
                    className="font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty"
                  >
                    {narrative.about}
                  </motion.p>
                ) : !detailsReady ? (
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 py-4">
                    Loading profile…
                  </p>
                ) : (
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 py-4">
                    — Company overview pending synthesis. Financial metrics and factor rankings above are live.
                  </p>
                )}
              </div>
              <div className="mt-6 pt-3 border-t border-border/20 flex justify-between font-mono text-xs text-muted-foreground/60 uppercase tracking-wider">
                <span>NSE: {company.ticker}</span>
                <span>Corporate Overview</span>
              </div>
            </div>

            {/* Right: Score Thesis */}
            <div className="border border-border/40 bg-card/20 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">
                    04.B / Score Rationale
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">
                    Score: {score != null ? `${score}/100` : "—"}
                  </span>
                </div>
                {hasWhyThisScore ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.35 }}
                    className="font-sans text-sm md:text-base leading-relaxed text-foreground/90 text-pretty"
                  >
                    {narrative.whyThisScore}
                  </motion.p>
                ) : !detailsReady ? (
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 py-4">
                    Loading rationale…
                  </p>
                ) : (
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 py-4">
                    — Score rationale pending synthesis. Factor decomposition reflects direct sector-relative percentiles.
                  </p>
                )}
              </div>
              <div className="mt-6 pt-3 border-t border-border/20 flex justify-between font-mono text-xs text-muted-foreground/60 uppercase tracking-wider">
                <span>Algorithmic screening</span>
                <span>Non-advisory</span>
              </div>
            </div>
          </div>
        </div>

        {/* 05 / Indicative Valuation Range */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader
            index="05"
            label="Indicative Valuation Range"
            subtitle={`Derived from ${company.sector} listed peer multiples (P25–P75)`}
          />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-3xl mb-6">
            Two independent estimates based on listed-peer trading multiples in {company.sector} applied to this company&apos;s own earnings. EV/EBITDA values enterprise; P/E values equity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EV / EBITDA Card */}
            <div className="border border-border/40 bg-card/30 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between border-b border-border/30 pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    EV / EBITDA Implied
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-accent border border-accent/40 bg-accent/5 px-2 py-0.5 font-medium">
                    Enterprise Value
                  </span>
                </div>
                <div className="py-5">
                  <p className="font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-accent">
                    {company.valuation.evEbitda}
                  </p>
                </div>
              </div>
              <p className="pt-3 border-t border-border/20 font-mono text-xs text-muted-foreground/70">
                Applied against TTM EBITDA of {company.metrics.ebitdaMargin !== "—" ? `${company.metrics.ebitdaMargin} margin` : "reported operating earnings"}. Reflects core operating enterprise value.
              </p>
            </div>

            {/* P / E Card */}
            <div className="border border-border/40 bg-card/30 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between border-b border-border/30 pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    P / E Implied
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                    Equity Value
                  </span>
                </div>
                <div className="py-5">
                  <p className="font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-tight text-foreground">
                    {company.valuation.peImplied}
                  </p>
                </div>
              </div>
              <p className="pt-3 border-t border-border/20 font-mono text-xs text-muted-foreground/70">
                {company.valuation.note ||
                  "Derived from 25th–75th percentile sector P/E multiples applied to net profit. Excludes debt adjustments."}
              </p>
            </div>
          </div>
        </div>

        {/* 06 / Ownership Structure */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader
            index="06"
            label="Ownership Structure"
            subtitle={`Cap table & float breakdown · As of ${formatAsOfDate(company.asOfDate)}`}
          />
          <div className="border border-border/40 bg-card/25 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Promoter Holding
                  </span>
                  {promoterHolding != null && (
                    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border/60 text-muted-foreground">
                      {promoterHolding >= 50 ? "Majority" : promoterHolding >= 26 ? "Controlling" : "Minority"}
                    </span>
                  )}
                </div>
                <p className="mt-2.5 font-mono text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                  {promoterHolding != null ? `${promoterHolding.toFixed(1)}%` : fin.promoterHolding || "N/A"}
                </p>
                <span className="mt-1.5 block font-mono text-xs text-muted-foreground/70">
                  Promoter &amp; insider equity
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Promoter Pledge
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border",
                      pledgeFlagged
                        ? "border-accent/40 bg-accent/10 text-accent font-medium"
                        : "border-border/60 text-muted-foreground/70",
                    )}
                  >
                    {pledgeFlagged ? "Encumbered" : "Unencumbered"}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2.5 font-mono text-3xl md:text-4xl font-semibold tracking-tight tabular-nums",
                    pledgeFlagged ? "text-accent" : "text-foreground",
                  )}
                >
                  {fin.promoterPledge}
                </p>
                <span className="mt-1.5 block font-mono text-xs text-muted-foreground/70">
                  {pledgeFlagged ? "Shares encumbered as collateral" : "No reported encumbrance on promoter shares"}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Free Float (Est.)
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border/60 text-muted-foreground">
                    Liquid Float
                  </span>
                </div>
                <p className="mt-2.5 font-mono text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                  {freeFloat != null ? `${freeFloat.toFixed(1)}%` : "N/A"}
                </p>
                <span className="mt-1.5 block font-mono text-xs text-muted-foreground/70">
                  Institutional &amp; public float
                </span>
              </div>
            </div>

            {/* Factual distribution bar */}
            {promoterHolding != null && freeFloat != null && (
              <div className="mt-8 pt-6 border-t border-border/30">
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
                <div className="mt-3 flex justify-between font-mono text-xs text-muted-foreground/70">
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

        {/* 07 / Comparable Deals */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader
            index="07"
            label="Comparable Deals"
            subtitle={`Historical M&A — ${comparableCount} in sector of 727 precedent deals (2006–2025)`}
          />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground/70 max-w-3xl mb-6">
            Selected precedent M&amp;A transactions in {company.sector} for benchmark context only. Not the source of the listed-peer valuation range above.
          </p>

          <div className="border border-border/40 bg-card/20 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border/40 bg-card/40 px-5 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="col-span-4">Target Company</span>
              <span className="col-span-3">Acquiring Entity</span>
              <span className="col-span-1 text-center">Year</span>
              <span className="col-span-2 text-center">Deal Type</span>
              <span className="col-span-2 text-right">Value (US$)</span>
            </div>

            {/* Rows */}
            {comparables.length === 0 ? (
              <div className="p-6 font-mono text-xs text-muted-foreground/70 text-center">
                No precedent transactions recorded for {company.sector} in the dataset.
              </div>
            ) : (
              comparables.map((deal, i) => (
                <div
                  key={`${deal.target}-${deal.year}-${i}`}
                  className="border-b last:border-b-0 border-border/25 px-5 py-3.5 font-mono text-xs hover:bg-accent/5 transition-colors"
                >
                  {/* Desktop Row View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <span className="col-span-4 text-foreground font-medium truncate" title={deal.target}>
                      {deal.target}
                    </span>
                    <span className="col-span-3 text-muted-foreground truncate" title={deal.acquirer}>
                      {deal.acquirer}
                    </span>
                    <span className="col-span-1 text-center text-muted-foreground/70 tabular-nums">
                      {deal.year}
                    </span>
                    <span
                      className="col-span-2 text-center text-muted-foreground/70 uppercase text-xs truncate"
                      title={deal.dealType || "M&A"}
                    >
                      {deal.dealType || "M&A"}
                    </span>
                    <span
                      className={cn(
                        "col-span-2 text-right tabular-nums",
                        deal.value === "N/A"
                          ? "text-muted-foreground/40 font-normal"
                          : "text-accent font-medium",
                      )}
                    >
                      {deal.value}
                    </span>
                  </div>

                  {/* Mobile Structured Card View */}
                  <div className="md:hidden flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-foreground font-medium text-xs flex-1 break-words">
                        {deal.target}
                      </span>
                      <span
                        className={cn(
                          "text-xs shrink-0 tabular-nums",
                          deal.value === "N/A"
                            ? "text-muted-foreground/40 font-normal"
                            : "text-accent font-medium",
                        )}
                      >
                        {deal.value}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground/80">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 shrink-0">
                        Buyer:
                      </span>
                      <span className="truncate text-foreground/85">{deal.acquirer}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground/60">
                      <span className="tabular-nums text-muted-foreground/70">{deal.year}</span>
                      <span>•</span>
                      <span className="uppercase text-xs">{deal.dealType || "M&A"}</span>
                      {deal.stakePct && (
                        <>
                          <span>•</span>
                          <span className="tabular-nums">{deal.stakePct}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 08 / Filings, Notices & News */}
        <div className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-border/30">
          <SectionHeader index="08" label="Filings, Notices & News" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12">
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
        <div className="mt-20 md:mt-24 pt-8 border-t border-border/30 flex items-center justify-between">
          <button
            onClick={onBack}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            ← Return to Screener
          </button>
          <button
            onClick={onBack}
            className="border border-border/60 hover:border-accent px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-all duration-200"
          >
            Close Tear Sheet
          </button>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({ index, label, subtitle }: { index: string; label: string; subtitle?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-border/40 pb-3 mb-6">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent font-bold">{index}</span>
        <span className="font-mono text-xs text-border">/</span>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-foreground font-semibold">{label}</h2>
      </div>
      {subtitle && (
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
          {subtitle}
        </span>
      )}
    </div>
  )
}

function FinancialCard({
  label,
  value,
  flagged,
}: {
  label: string
  value: string
  flagged?: boolean
}) {
  return (
    <div className="border border-border/40 bg-card/25 hover:border-border/70 transition-colors p-5 flex flex-col justify-between h-[105px]">
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl leading-none tracking-tight break-words",
          flagged ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </span>
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
      <div className="flex items-baseline justify-between border-b border-border/40 pb-3 mb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 tabular-nums">
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
      className="group block border-b border-border/25 py-4 hover:bg-accent/5 transition-colors duration-200"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70">{date}</span>
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
        <span className="mt-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground/70">
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
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-4 font-mono text-xs">
        <span className="uppercase tracking-wider text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground/80 shrink-0">
          {metric} • <span className="text-accent font-medium">w {weight}%</span>
        </span>
      </div>
      <div className="mt-3 h-[3px] bg-border/40 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: missing ? "0%" : `${value}%` }}
          transition={{ delay: 0.08 + delay, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 font-mono text-xs text-muted-foreground/70">
        <span>{missing ? "— / unavailable" : `${value} / 100 sector-relative`}</span>
      </div>
      <span className="mt-1 block font-mono text-xs leading-relaxed text-muted-foreground/70">{explainer}</span>
    </div>
  )
}
