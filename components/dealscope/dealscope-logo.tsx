"use client"

import Link from "next/link"

interface DealScopeLogoProps {
  className?: string
}

/**
 * Institutional DealScope brandmark & precision reticle icon.
 * Permanent top-left anchor on every page that redirects to "/" (Home).
 */
export function DealScopeLogo({ className = "" }: DealScopeLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 sm:gap-3 select-none transition-transform hover:opacity-95 ${className}`}
      aria-label="DealScope Home"
    >
      {/* Precision Scope Reticle Icon */}
      <div className="relative w-8 h-8 rounded-md bg-accent/10 border border-accent/40 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/20 transition-all duration-200 shadow-xs shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-4.5 h-4.5 text-accent stroke-[1.75]"
        >
          {/* Outer circle */}
          <circle cx="12" cy="12" r="8.5" className="stroke-accent/40" />
          {/* Inner target circle */}
          <circle cx="12" cy="12" r="4" className="stroke-accent" />
          {/* Center pinpoint */}
          <circle cx="12" cy="12" r="1.25" className="fill-accent stroke-none" />
          {/* Crosshair blades */}
          <line x1="12" y1="2" x2="12" y2="5" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
          <line x1="2" y1="12" x2="5" y2="12" strokeLinecap="round" />
          <line x1="19" y1="12" x2="22" y2="12" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typographic Brand Identity */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-[family-name:var(--font-bebas)] text-2xl sm:text-2xl tracking-wider text-foreground group-hover:text-accent transition-colors">
            DEALSCOPE
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-foreground/80 transition-colors mt-0.5">
          NSE WORKBENCH
        </span>
      </div>
    </Link>
  )
}
