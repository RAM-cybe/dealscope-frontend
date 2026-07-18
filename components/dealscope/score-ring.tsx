"use client"

import { motion } from "framer-motion"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  sectorAverage?: number
  showLabel?: boolean
  className?: string
}

export function ScoreRing({
  score,
  size = 64,
  strokeWidth = 2,
  sectorAverage,
  showLabel = true,
  className = "",
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Sector average tick position
  const avgAngle = sectorAverage !== undefined ? (sectorAverage / 100) * 360 - 90 : 0
  const avgRad = (avgAngle * Math.PI) / 180
  const tickInner = radius - 5
  const tickOuter = radius + 5

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.25 0 0)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.7 0.2 45)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </svg>
      {sectorAverage !== undefined && (
        <svg width={size} height={size} className="absolute inset-0" aria-hidden="true">
          <line
            x1={center + tickInner * Math.cos(avgRad)}
            y1={center + tickInner * Math.sin(avgRad)}
            x2={center + tickOuter * Math.cos(avgRad)}
            y2={center + tickOuter * Math.sin(avgRad)}
            stroke="oklch(0.55 0 0)"
            strokeWidth={1.5}
          />
        </svg>
      )}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="font-[family-name:var(--font-bebas)] leading-none text-foreground"
            style={{ fontSize: size * 0.32 }}
          >
            {score}
          </motion.span>
        </div>
      )}
    </div>
  )
}
