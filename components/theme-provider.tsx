"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
})

function applyThemeToDom(t: Theme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (t === "dark") {
    root.classList.add("dark")
    root.classList.remove("light")
  } else {
    root.classList.add("light")
    root.classList.remove("dark")
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dealscope-theme") as Theme | null
      if (saved === "light" || saved === "dark") {
        setThemeState(saved)
        applyThemeToDom(saved)
      } else {
        // Default to dark
        applyThemeToDom("dark")
      }
    } catch {
      applyThemeToDom("dark")
    }
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    applyThemeToDom(t)
    try {
      localStorage.setItem("dealscope-theme", t)
    } catch {}
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
