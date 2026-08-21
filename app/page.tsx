import { Suspense } from "react"
import { DealScopeApp } from "@/components/dealscope/dealscope-app"
import { LoadingScreen } from "@/components/dealscope/loading-screen"

// DealScopeApp reads the current view from the URL via useSearchParams (so the
// browser's back/forward buttons and trackpad swipe move between landing /
// results / tear sheet). Next requires a Suspense boundary around any component
// calling useSearchParams on a statically prerendered route -- without it the
// build fails rather than degrading, so this boundary is load-bearing.
export default function Page() {
  return (
    <Suspense>
      {/* Mounted here, not in the root layout. Covers the companies.json parse
          this route does at module-eval. /about has no universe to load, so
          the overlay must not live in the root layout. */}
      <LoadingScreen />
      <DealScopeApp />
    </Suspense>
  )
}
