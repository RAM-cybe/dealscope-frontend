"use client"

import { useEffect, useState } from "react"

const CHAPTERS = [
  { id: "01-mission", index: "01", label: "Mission & Scope" },
  { id: "02-universe", index: "02", label: "Universe & Data" },
  { id: "03-scoring", index: "03", label: "Scoring Engine" },
  { id: "04-valuation", index: "04", label: "Valuation Comps" },
  { id: "05-governance", index: "05", label: "Cap Table & Float" },
  { id: "06-architecture", index: "06", label: "Architecture & CSV" },
  { id: "07-integrity", index: "07", label: "10 Guardrails & Legal" },
] as const

export function AboutNav() {
  const [activeChapter, setActiveChapter] = useState<string>("01-mission")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

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
    <nav aria-label="Methodology Chapters" className="sticky top-6 z-20 hidden lg:block">
      <div className="border border-border/40 bg-background/95 backdrop-blur p-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground block mb-3 pb-2 border-b border-border/30 font-medium">
          Dossier Chapters
        </span>
        <ul className="space-y-1.5 font-mono text-xs">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.id
            return (
              <li key={ch.id}>
                <a
                  href={`#${ch.id}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 transition-colors duration-150 ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent -ml-2.5 pl-2"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/30"
                  }`}
                >
                  <span className={isActive ? "text-accent" : "text-muted-foreground/60"}>
                    {ch.index}
                  </span>
                  <span className="truncate">{ch.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
