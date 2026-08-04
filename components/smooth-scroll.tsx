"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Module-level handle to the live Lenis instance.
//
// Lenis hijacks the scroll position and animates it over ~1.2s. A plain
// `window.scrollTo({ top: 0 })` therefore does NOT reset the scroll -- Lenis
// still believes it is mid-animation at the old offset and, on its next rAF
// tick, drags the page back toward where it thinks it should be. The result is
// the page visibly sliding/fighting itself on every view change, which is the
// bulk of the "transition jank" on this site.
//
// Callers that need a hard reset use scrollToTop() below, which tells Lenis
// itself to jump, so its internal target and the real scroll position stay in
// agreement. Falls back to the native call when Lenis is inactive (reduced
// motion, or before mount).
let activeLenis: Lenis | null = null

export function scrollToTop() {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate: true })
    return
  }
  if (typeof window !== "undefined") window.scrollTo({ top: 0 })
}

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
    activeLenis = lenis

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
      if (activeLenis === lenis) activeLenis = null
    }
  }, [])

  return <>{children}</>
}
