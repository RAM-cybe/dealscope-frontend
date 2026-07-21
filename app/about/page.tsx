import type { Metadata } from "next"
import Link from "next/link"
import { Linkedin } from "lucide-react"
import { AnimatedNoise } from "@/components/animated-noise"

export const metadata: Metadata = {
  title: "About — DEALSCOPE",
  description: "Why DealScope exists and how it works, from the person who built it.",
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
          About
        </h1>

        <div className="mt-10 flex flex-col gap-6 font-sans text-lg md:text-xl leading-relaxed text-foreground/90 text-pretty">
          <p>I&apos;m RAM, and I built DealScope.</p>
          <p className="text-foreground/80">
            Most acquisition-screening tools I came across were either paywalled or too simplified to
            be useful on real data. I wanted to see if I could build one that actually screens the live
            market — not a mockup, not a demo dataset.
          </p>
          <p className="text-foreground/80">
            Every score here comes from real NSE data, refreshed on a schedule rather than typed in by
            hand. Scoring is percentile-based within sector, so a company is only ever measured against
            its real peers. Valuation ranges are built off actual precedent M&amp;A, not a formula
            pulled from a textbook.
          </p>
          <p className="text-foreground/80">
            This is a learning project, not a research desk. Nothing on this site is investment advice.
          </p>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Built With
          </span>
          <p className="mt-2 font-mono text-xs text-foreground">
            Next.js, Python, NSE/BSE data, Gemini/Groq/Cerebras for company summaries.
          </p>
        </div>

        <div className="mt-10">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <Linkedin className="w-4 h-4" aria-hidden="true" />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
