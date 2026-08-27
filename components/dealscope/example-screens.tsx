"use client"

import { motion } from "framer-motion"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { type ExampleScreen } from "@/lib/example-screens"

interface ExampleScreensProps {
  screens: { screen: ExampleScreen; count: number }[]
  onApply: (screen: ExampleScreen) => void
  /** Compact grid for the results page, roomy cards for the landing page. */
  variant?: "cards" | "pills"
}

/**
 * One-click screens. Each card's count is computed live from the real dataset
 * through the same parser + screener the search bar uses, so the number shown
 * is exactly what the results page will return -- never a hardcoded claim.
 */
export function ExampleScreens({ screens, onApply, variant = "cards" }: ExampleScreensProps) {
  if (variant === "pills") {
    return (
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {screens.map(({ screen, count }) => (
          <button
            key={screen.id}
            onClick={() => onApply(screen)}
            title={screen.description}
            className="group inline-flex items-baseline gap-1.5 sm:gap-2 border border-border/60 bg-card/30 px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-150 shrink-0 cursor-pointer"
          >
            <span>{screen.label}</span>
            <span className="text-[9px] sm:text-[11px] text-accent/70 font-semibold tabular-nums">{count}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {screens.map(({ screen, count }, i) => (
        <motion.div
          key={screen.id}
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: Math.min(i, 4) * 0.03, duration: 0.18, ease: "easeOut" }}
        >
          <button
            onClick={() => onApply(screen)}
            className="group bg-card/40 border border-border/60 h-full w-full text-left p-5 flex flex-col justify-between gap-4 hover:border-accent/60 hover:bg-accent/5 transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2.5">
                <span className="font-[family-name:var(--font-bebas)] text-3xl tracking-tight leading-none text-accent">
                  {count}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {count === 1 ? "match" : "matches"} · 0{i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-foreground font-semibold leading-relaxed group-hover:text-accent transition-colors">
                {screen.label}
              </h3>
              <p className="mt-2 font-sans text-xs text-muted-foreground leading-relaxed">
                {screen.description}
              </p>
            </div>
            <div className="pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                Run screen
              </span>
              <BitmapChevron className="transition-transform duration-[300ms] ease-in-out group-hover:rotate-45 text-muted-foreground group-hover:text-accent" />
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  )
}
