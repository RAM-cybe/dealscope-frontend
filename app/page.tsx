import { Suspense } from "react"
import { DealScopeApp } from "@/components/dealscope/dealscope-app"

// DealScopeApp reads the current view from the URL via useSearchParams (so the
// browser's back/forward buttons and trackpad swipe move between landing /
// results / tear sheet). Next requires a Suspense boundary around any component
// calling useSearchParams on a statically prerendered route -- without it the
// build fails rather than degrading, so this boundary is load-bearing.
export default function Page() {
  return (
    <Suspense>
      <DealScopeApp />
    </Suspense>
  )
}
