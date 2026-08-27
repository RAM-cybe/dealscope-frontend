"use client"

import React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 border border-border/60 bg-card/40 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/5 transition-colors duration-200 cursor-pointer ${className}`}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  )
}
