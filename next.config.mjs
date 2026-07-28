// Content-Security-Policy, deliberately permissive rather than maximally strict.
//
// 'unsafe-inline' is required in script-src because Next.js inlines its own
// hydration/bootstrap scripts and this app has no nonce plumbing (it's a
// statically prerendered site with no middleware, so there's no request-time
// hook to mint a per-response nonce). 'unsafe-inline' is likewise required in
// style-src: framer-motion writes inline style attributes on every animated
// element, and Next injects critical CSS inline.
//
// Fonts are self-hosted -- next/font/google downloads IBM Plex Sans/Mono and
// Bebas Neue at build time, so no external font origin is needed.
// The Vercel Analytics origins cover the case where its script/beacon is not
// same-origin-proxied.
//
// Tightening this (nonces, dropping 'unsafe-inline') would need real browser
// verification, which this project deliberately does not do in-session -- so
// the bar here is "meaningfully better than no CSP at all, and cannot break
// the site", not "perfect".
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

const SECURITY_HEADERS = [
  // Redundant with CSP's frame-ancestors above, kept for older browsers that
  // don't honour frame-ancestors. The two agree: no framing at all.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No feature of this site uses any of these; deny by default.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: CSP },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }]
  },
}

export default nextConfig
