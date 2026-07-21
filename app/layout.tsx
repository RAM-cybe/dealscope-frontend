import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import { LoadingScreen } from "@/components/dealscope/loading-screen"
import "./globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
})
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" })

export const metadata: Metadata = {
  title: "DEALSCOPE — Screens India's Listed Companies for Acquisition Fit",
  description:
    "Screen and value NSE-listed Indian companies for acquisition attractiveness. Weighted factors, sector-relative scoring, indicative valuation ranges.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        <LoadingScreen />
        <Link
          href="/about"
          className="fixed top-4 right-4 md:top-6 md:right-12 z-30 inline-flex items-center gap-2 border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent hover:border-accent transition-colors duration-200"
        >
          About
        </Link>
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
      </body>
    </html>
  )
}
