"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Respect users who ask for reduced motion -- skip the smooth-scroll
    // hijack entirely so native scrolling stays crisp.
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)

    // Drive Lenis from GSAP's single rAF ticker. Keep a stable reference so the
    // cleanup removes THIS callback -- passing `lenis.raf` (as before) removed
    // nothing and leaked a ticker callback on every remount, compounding jank.
    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy() // also tears down its scroll listeners
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
