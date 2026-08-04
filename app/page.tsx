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
      {/* Mounted here, not in the root layout. The overlay exists to cover the
          ~1.5MB companies.json parse that this route performs at module-eval
          time -- /about has no data to load, so showing it there meant every
          visit to a static text page flashed "Compiling screened universe"
          for a beat and then settled. */}
      <LoadingScreen />
      <DealScopeApp />
    </Suspense>
  )
}
