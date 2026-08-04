import type { Metadata } from "next"
import Link from "next/link"
import { Linkedin, Mail } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"

export const metadata: Metadata = {
  title: "About — DealScope",
  description:
    "How DealScope screens 2,381 NSE-listed companies for acquisition fit: sector-relative percentile scoring on growth, margin, ROCE and leverage, with indicative valuation ranges from 727 precedent Indian M&A transactions.",
}

function Section({
  index,
  label,
  children,
}: {
  index: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-14 first:mt-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
        {index} / {label}
      </span>
      <div className="mt-5 flex flex-col gap-5 font-sans text-base md:text-lg leading-relaxed text-foreground/85 text-pretty">
        {children}
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <section className="relative min-h-screen pl-6 md:pl-28 pr-6 md:pr-12 py-16 md:py-24">
      <AnimatedNoise opacity={0.02} />

      {/* Left vertical label -- mirrors the SCREEN / RESULTS / TEAR SHEET
          labels used on the other views */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          ABOUT
        </span>
      </div>

      <div className="relative z-10 max-w-2xl">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          ← Home
        </Link>

        <h1 className="mt-8 font-[family-name:var(--font-bebas)] text-[clamp(3rem,10vw,6rem)] leading-[0.95] tracking-tight text-foreground">
          About DealScope
        </h1>

        <p className="mt-6 max-w-xl font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty">
          A free, public screener that ranks NSE-listed companies by acquisition attractiveness and
          attaches an indicative valuation range to each one.
        </p>

        <Section index="01" label="The Problem">
          <p>
            Identifying acquisition candidates across a market the size of the NSE is mostly a
            filtering problem, and the tooling for it splits badly. Institutional platforms solve it
            well but sit behind licences priced for deal teams. Free screeners are built for public
            market investors: they rank on absolute numbers, which systematically flatters large caps
            and penalises anything cyclical or capital-intensive, and they stop at the screen — there
            is no view on what a target might actually be worth.
          </p>
          <p>
            The gap is not data availability. It is that raw metrics are not comparable across
            sectors, and a screen that ignores that produces a list nobody can act on.
          </p>
        </Section>

        <Section index="02" label="The Approach">
          <p>
            DealScope scores every company against its own sector rather than against the market. A
            company is ranked by percentile among its real peers on four factors, so a 12% EBITDA
            margin reads as strong in industrials and unremarkable in pharmaceuticals — because in
            each case it is measured against that sector&apos;s actual distribution.
          </p>
          <p>
            The same logic runs through the screening language. Asking for &ldquo;high margin
            pharma&rdquo; and &ldquo;high margin industrials&rdquo; resolves to two different
            thresholds, each drawn from that sector&apos;s own quartiles rather than a single
            market-wide cutoff that would be wrong for both.
          </p>
        </Section>

        <Section index="03" label="How Scoring Works">
          <p>
            Each company receives a percentile rank within its sector on four factors:{" "}
            <span className="text-foreground">revenue growth</span>,{" "}
            <span className="text-foreground">EBITDA margin</span>,{" "}
            <span className="text-foreground">return on capital employed</span>, and{" "}
            <span className="text-foreground">debt level</span> (inverted, so lower leverage scores
            higher). Those four combine into a single 0–100 composite. The default weighting is
            equal; the weights are adjustable, and the ranking recomputes against them.
          </p>
          <p>
            Percentiles are always computed across the full universe, never across whatever subset a
            filter has produced. Filtering decides which companies appear; it never changes the score
            a company holds. That separation is what keeps a score meaning the same thing regardless
            of how you arrived at it.
          </p>
          <p>
            Valuation ranges are derived from precedent transactions — EV/EBITDA and P/E multiples
            observed in{" "}
            <span className="text-foreground">727 Indian M&amp;A deals between 2006 and 2025</span>,
            matched to the target&apos;s sector. They are indicative context for what comparable
            businesses have changed hands at, not a fair-value estimate.
          </p>
          <p>
            Where a figure is genuinely unavailable it is shown as unavailable. Nothing is imputed,
            interpolated or filled with a sector average. A company missing a metric is excluded from
            that metric&apos;s screen rather than quietly assumed to pass it.
          </p>
        </Section>

        <Section index="04" label="Data & Refresh">
          <p>
            The universe is{" "}
            <span className="text-foreground">2,381 NSE-listed companies</span>. Share prices and
            market capitalisations refresh daily through an automated pipeline. Fundamentals —
            revenue, margins, ROCE, debt — update on a quarterly cycle, following reported results,
            and each company&apos;s tear sheet carries the date its figures are drawn from.
          </p>
          <p>
            89 companies have no sector classification available from the data source. They remain in
            the universe and are labelled as unclassified rather than dropped or assigned a guess.
          </p>
        </Section>

        <Section index="05" label="Built With">
          <p>
            Nothing on this site is hand-typed. A pipeline, not a person, keeps every number honest. A
            Python data pipeline handles ingestion, scoring and the scheduled refreshes, publishing
            pre-computed JSON. The interface is a static Next.js application — no server, no database
            and no account, which is also why it is free to run and free to use. Company summaries are
            generated by a language model from each company&apos;s own reported figures; every
            quantitative claim on the site comes from the data pipeline, not from a model.
          </p>
        </Section>

        <Section index="06" label="Disclaimer">
          <p className="text-muted-foreground">
            DealScope is an independent research and engineering project. It is not investment advice,
            not a recommendation to buy or sell any security, and not a substitute for professional
            diligence. Scores and valuation ranges are mechanical outputs of a published methodology,
            not judgements about any company&apos;s prospects.
          </p>
          <p className="text-muted-foreground">
            DealScope does not provide buy, sell, or hold recommendations, price targets, or advice
            personalized to any individual. Every score and valuation range shown is identical for
            every visitor — generated automatically from public data, with no human curation or bias
            toward any company. This is not a SEBI-registered investment advisory or research analyst
            service.
          </p>
          <p className="text-muted-foreground">
            Data is sourced from third parties and may contain errors or omissions. Verify
            independently before acting on anything here.
          </p>
        </Section>

        <div className="mt-16 border-t border-border/40 pt-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Built by Ram Suthakaran
          </span>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              <Linkedin className="w-4 h-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href="mailto:vpram2007@gmail.com"
              className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
