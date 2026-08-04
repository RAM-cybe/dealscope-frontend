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
      <div className="flex flex-wrap gap-2">
        {screens.map(({ screen, count }) => (
          <button
            key={screen.id}
            onClick={() => onApply(screen)}
            title={screen.description}
            className="group inline-flex items-baseline gap-2 border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <span>{screen.label}</span>
            <span className="text-[9px] text-muted-foreground/70 group-hover:text-accent/70">{count}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 border border-border/40">
      {screens.map(({ screen, count }, i) => (
        <motion.div
          key={screen.id}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: Math.min(i, 4) * 0.03, duration: 0.18, ease: "easeOut" }}
        >
          <button
            onClick={() => onApply(screen)}
            className="group bg-background h-full w-full text-left p-6 flex flex-col gap-4 hover:bg-accent/5 transition-colors duration-300"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-[family-name:var(--font-bebas)] text-3xl tracking-tight leading-none text-accent">
                {count}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {count === 1 ? "match" : "matches"}
              </span>
            </div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground leading-relaxed">
              {screen.label}
            </h3>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed flex-1">
              {screen.description}
            </p>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors duration-200">
              Run screen
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </span>
          </button>
        </motion.div>
      ))}
    </div>
  )
}
