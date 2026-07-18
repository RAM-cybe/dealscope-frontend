"use client"

import { useEffect, useRef } from "react"

interface AnimatedNoiseProps {
  opacity?: number
  className?: string
}

export function AnimatedNoise({ opacity = 0.05, className }: AnimatedNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0
    let lastDraw = 0
    // ~12fps grain: still reads as living static, but ~2.5x less main-thread
    // pixel work than the old every-other-frame (~30fps) loop -- the loop was a
    // primary scroll-jank source on the landing and tear-sheet views.
    const FRAME_INTERVAL = 1000 / 12

    // Downscale the buffer harder (÷3) so each frame writes far fewer pixels;
    // the canvas is stretched back up so the grain looks identical.
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.offsetWidth / 3))
      canvas.height = Math.max(1, Math.floor(canvas.offsetHeight / 3))
    }

    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value // R
        data[i + 1] = value // G
        data[i + 2] = value // B
        data[i + 3] = 255 // A
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const animate = (now: number) => {
      if (now - lastDraw >= FRAME_INTERVAL) {
        lastDraw = now
        // Pause pixel work while the tab is hidden -- no point burning CPU.
        if (typeof document === "undefined" || document.visibilityState === "visible") {
          generateNoise()
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)

    if (reduceMotion) {
      // Draw a single static grain frame and stop -- no rAF loop.
      generateNoise()
    } else {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  )
}
