"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Branded first-load overlay. It is server-rendered into the initial HTML with
 * `done = false`, so it paints immediately (no blank flash) on top of the app.
 * Its hide effect only runs after React hydrates -- which is after the ~1.5MB
 * companies.json bundle has been downloaded and parsed at module-eval time --
 * so the overlay naturally covers the window until the data is ready and the
 * app is interactive, then fades out and unmounts.
 */
export function LoadingScreen() {
  const [done, setDone] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Hold a short brand moment so the mark registers instead of flickering,
    // but keep it brief -- this is a cover, not a gate.
    const t = setTimeout(() => setDone(true), reduce ? 0 : 850)
    return () => clearTimeout(t)
  }, [])

  if (removed) return null

  return (
    <div
      role="status"
      aria-label="Loading DealScope"
      aria-hidden={done}
      onTransitionEnd={() => {
        if (done) setRemoved(true)
      }}
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out",
        done ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="ds-loading-scan absolute inset-x-0 top-0 h-px bg-accent/60" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-7 px-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">Initializing</span>
        <h1 className="ds-loading-pulse font-[family-name:var(--font-bebas)] text-[clamp(3rem,12vw,8rem)] leading-none tracking-tight text-foreground">
          DEALSCOPE
        </h1>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="ds-loading-dot" aria-hidden="true" />
          Compiling screened universe
        </div>
      </div>
    </div>
  )
}
