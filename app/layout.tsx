import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
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
const SITE_TITLE = "DealScope — Every NSE-listed company, ranked the way a deal team would."
const SITE_DESCRIPTION =
  "Screen 2,381 NSE-listed Indian companies for acquisition fit. Sector-relative scoring on growth, margin, ROCE and leverage, with indicative valuation ranges from precedent M&A. Free, no account required."

export const metadata: Metadata = {
  // metadataBase makes every relative image/URL below absolute, which is what
  // link-preview crawlers need -- a relative og:image is simply dropped.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "DealScope",
  authors: [{ name: "Ram Suthakaran" }],
  keywords: [
    "M&A screening", "NSE", "Indian equities", "acquisition targets",
    "stock screener", "sector-relative scoring", "valuation",
  ],
  // Open Graph / Twitter were absent entirely, so sharing the link anywhere --
  // LinkedIn especially -- produced a bare URL with no title, description or
  // card. For a tool whose whole distribution model is being shared, that was
  // the single biggest gap on the site.
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
    <html lang="en" className="dark bg-background">
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        {/* Real header bar, not a floating chip.
            This was `position: fixed` with a semi-transparent blurred
            background and no reserved space anywhere in the layout, so it
            floated over whatever scrolled beneath it -- confirmed overlapping
            "Adjust Weights" on the results page, industry pill rows, homepage
            prose, and the About page's own content.
            `sticky` (not `fixed`) is the fix: a sticky element stays in normal
            document flow, so it occupies its own 56px of height and pushes all
            page content down by exactly that much. Nothing can render
            underneath it -- that's a structural property of the layout now,
            not per-page padding that the next new page could forget to add.
            Background is fully opaque (`bg-background`, no backdrop-blur) so
            content scrolling under it is hidden rather than showing through.
            z-40 keeps it above page content but below the filters/weights
            drawers (z-[60]/z-[70]) and the loading screen (z-[200]), so a
            modal still covers it, as it should. */}
        <header className="sticky top-0 z-40 h-14 w-full bg-background border-b border-border/60">
          <div className="flex h-full items-center justify-end pl-6 pr-6 md:pr-12">
            <Link
              href="/about"
              className="inline-flex items-center border border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent hover:border-accent transition-colors duration-200"
            >
              About
            </Link>
          </div>
        </header>
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
      </body>
    </html>
  )
}
