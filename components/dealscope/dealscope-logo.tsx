"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface DealScopeLogoProps {
  className?: string
  /** Size in pixels (default: 30) */
  size?: number
}

/**
 * DealScope Brandmark: The "Slotted D".
 *
 * Header Lockup Rules:
 * - Mark + Nothing Else (no "DEALSCOPE" text, no "NSE WORKBENCH" subtitle).
 * - Single-path geometry on a 32-unit grid with even-odd fill and transparent counter.
 * - Single fill (`currentColor`) so it tracks light & dark themes automatically.
 * - No border chips, no background pills, no gradients, no glow, no drop shadows.
 * - Accessible link to "/" with `aria-label="DealScope home"`.
 */
export function DealScopeLogo({ className, size = 30 }: DealScopeLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center justify-center shrink-0 select-none text-accent hover:opacity-85 transition-opacity duration-150 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-accent",
        className,
      )}
      aria-label="DealScope home"
    >
      <SlottedDMark
        className="w-7 h-7 sm:w-[30px] sm:h-[30px]"
        style={size !== 30 ? { width: size, height: size } : undefined}
      />
    </Link>
  )
}

export interface SlottedDMarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * Standalone Slotted D SVG mark (32x32 viewBox).
 * - Path 1: Outer D contour + inner counter hole via evenodd rule.
 * - Rect: Level line slot spanning x10 to x24 at y14 (height 4).
 */
export function SlottedDMark({ className, ...props }: SlottedDMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
      className={cn("w-full h-full", className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M5 3 H16.5 C24 3 29 8.8 29 16 C29 23.2 24 29 16.5 29 H5 Z M10 8 H16.5 C20.9 8 24 11.6 24 16 C24 20.4 20.9 24 16.5 24 H10 Z"
      />
      <rect x="10" y="14" width="14" height="4" />
    </svg>
  )
}

export default DealScopeLogo
