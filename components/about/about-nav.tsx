"use client"

import { useEffect, useState } from "react"
import { Linkedin, Mail, ArrowUpRight } from "lucide-react"

const CHAPTERS = [
  { id: "01-mission", index: "01", label: "Mission & Scope", short: "01 Mission" },
  { id: "02-universe", index: "02", label: "Universe & Data", short: "02 Data" },
  { id: "03-scoring", index: "03", label: "Scoring Engine", short: "03 Scoring" },
  { id: "04-valuation", index: "04", label: "Valuation Comps", short: "04 Valuation" },
  { id: "05-governance", index: "05", label: "Cap Table & Float", short: "05 Float" },
  { id: "06-architecture", index: "06", label: "Architecture & CSV", short: "06 CSV" },
  { id: "07-integrity", index: "07", label: "10 Guardrails & Legal", short: "07 Legal" },
] as const

export function AboutNav() {
  const [activeChapter, setActiveChapter] = useState<string>("01-mission")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180

      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const element = document.getElementById(CHAPTERS[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(CHAPTERS[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      aria-label="Methodology Chapters"
      className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur border-y border-border/40 py-2.5 px-4 sm:px-6 my-8 -mx-4 sm:-mx-6 max-w-[calc(100%+2rem)] sm:max-w-[calc(100%+3rem)]"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Horizontally scrollable chapter pill bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.id
            return (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className={`whitespace-nowrap px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-150 border shrink-0 ${
                  isActive
                    ? "border-accent bg-accent/15 text-accent font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-card/40"
                }`}
              >
                <span className="hidden sm:inline">{ch.index} / {ch.label}</span>
                <span className="inline sm:hidden">{ch.short}</span>
              </a>
            )
          })}
        </div>

        {/* Compact Quick Contact Anchors on the right */}
        <div className="hidden md:flex items-center gap-2 shrink-0 pl-3 border-l border-border/40 font-mono text-xs">
          <a
            href="https://www.linkedin.com/in/ramsuthakaran-vp-778b4731b/"
            target="_blank"
            rel="noopener noreferrer"
            title="Connect with Ram on LinkedIn"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors px-2 py-1 border border-border/40 hover:border-accent text-[11px] uppercase tracking-wider"
          >
            <Linkedin className="w-3 h-3 text-accent" />
            <span>LinkedIn</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href="mailto:ramsuthakaran.vp@gmail.com"
            title="Email Ram directly"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors px-2 py-1 border border-border/40 hover:border-accent text-[11px] uppercase tracking-wider"
          >
            <Mail className="w-3 h-3 text-accent" />
            <span>Email</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
