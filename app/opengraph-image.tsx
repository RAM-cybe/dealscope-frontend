import { ImageResponse } from "next/og"

// Generated at build time into a real 1200x630 PNG, so a shared link renders a
// branded card instead of a bare URL. Written in code rather than committed as
// a static image so the company count and the palette stay in one place with
// the rest of the site.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "DealScope: Sector-relative comps and screening for 2,381 NSE companies."

// Hex equivalents of the site's oklch tokens. Satori (the renderer behind
// ImageResponse) does not support oklch(), so these are pinned here
// deliberately rather than imported from the CSS.
// Converted from the exact oklch() tokens in app/globals.css, not eyeballed --
// a card that is nearly the brand colour looks worse than one that is not
// trying. background oklch(0.08 0 0), foreground 0.97, muted-foreground 0.76,
// accent oklch(0.7 0.2 45), border 0.25.
const BG = "#020202"
const FG = "#f5f5f5"
const MUTED = "#b1b1b1"
const ACCENT = "#fe6a00"
const BORDER = "#222222"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: ACCENT,
              display: "flex",
            }}
          >
            Acquisition Screening
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: -2,
              color: FG,
              marginTop: 18,
              display: "flex",
            }}
          >
            DEALSCOPE
          </div>
          <div
            style={{
              fontSize: 36,
              color: MUTED,
              marginTop: 20,
              maxWidth: 940,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            Screen 2,381 NSE-listed companies on sector-relative growth, margin,
            ROCE and leverage.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 28,
          }}
        >
          {["Natural-language screening", "Indicative valuation", "Free, no account"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 24,
                color: MUTED,
                border: `1px solid ${BORDER}`,
                padding: "10px 20px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
