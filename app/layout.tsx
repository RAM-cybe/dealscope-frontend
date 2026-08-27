import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import { DataFreshness, PRICES_AS_OF, FUNDAMENTALS_AS_OF } from "@/components/dealscope/data-freshness"
import { DealScopeLogo } from "@/components/dealscope/dealscope-logo"
import { StaleDataBanner } from "@/components/dealscope/stale-data-banner"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
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

const SITE_URL = "https://dealscope-screener.vercel.app"
const SITE_TITLE = "DealScope: Sector-relative comps and screening for NSE companies"
const SITE_DESCRIPTION =
  "Screen NSE-listed Indian companies by sector-relative operating percentiles, peer trading multiples, and promoter pledge telemetry. Free, no account required."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "DealScope",
  authors: [{ name: "Ram Suthakaran" }],
  keywords: [
    "M&A screening", "NSE", "Indian equities", "acquisition targets",
    "stock screener", "sector-relative scoring", "valuation",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "DealScope",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
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
    <html lang="en" className="dark bg-background" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider>
          <div className="noise-overlay" aria-hidden="true" />
          <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/60 transition-colors">
            <div className="flex min-h-14 items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-10 py-2.5 max-w-7xl mx-auto">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <DealScopeLogo />
                <div className="hidden md:block h-4 w-px bg-border/80" />
                <DataFreshness className="hidden md:flex" />
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <ThemeToggle />
                <Link
                  href="/about"
                  className="inline-flex shrink-0 items-center border border-border/60 bg-card/30 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/5 transition-colors duration-200 font-medium"
                >
                  About
                </Link>
              </div>
            </div>

            {/* Mobile Sub-Header Telemetry Strip (visible on < md so dates are NEVER hidden) */}
            <div className="md:hidden border-t border-border/40 bg-card/20 px-4 py-1.5 flex items-center justify-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2 text-muted-foreground/90">
                <span>Prices as of: <strong className="text-foreground font-semibold">{PRICES_AS_OF}</strong></span>
                <span className="text-border">·</span>
                <span>Fundamentals: <strong className="text-foreground font-semibold">{FUNDAMENTALS_AS_OF}</strong></span>
              </div>
            </div>
          </header>
          <StaleDataBanner />
          <SmoothScroll>{children}</SmoothScroll>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
