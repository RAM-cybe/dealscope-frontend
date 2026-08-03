// ---------------------------------------------------------------------------
// One-click example screens.
//
// Each is defined as the natural-language query a user could have typed, and
// is applied by running it through the SAME parser. That's deliberate: it
// means an example screen can never drift from what the parser actually
// supports, and every example doubles as a live demonstration of the query
// syntax -- click it, and the search bar shows you the sentence that produced
// the result. If a rule ever regresses, the example screens visibly break
// with it rather than silently taking a private code path.
//
// Counts are computed live from the real dataset at render time, never
// hardcoded, so a card can't advertise a number the results page won't show.
// ---------------------------------------------------------------------------

export interface ExampleScreen {
  id: string
  label: string
  description: string
  /** Parsed by parseQuery() exactly as if typed into the search bar. */
  query: string
}

export const EXAMPLE_SCREENS: ExampleScreen[] = [
  {
    id: "quality-midcaps",
    label: "High Quality Mid-Caps",
    description: "Mid-cap names clearing their sector on both capital efficiency and margin.",
    query: "mid cap high roce high margin",
  },
  {
    id: "growth-clean-balance-sheet",
    label: "Growth + Clean Balance Sheet",
    description: "Fast revenue growth without the leverage or pledged promoter holding.",
    query: "high growth low debt no promoter pledge",
  },
  {
    id: "cheap-high-roce-industrials",
    label: "Cheap High ROCE Industrials",
    description: "Industrials earning strong returns on capital while still trading cheap.",
    query: "industrials cheap high roce",
  },
  {
    id: "low-debt-consumer",
    label: "Low Debt Consumer under ₹5,000 Cr",
    description: "Smaller consumer names carrying little debt.",
    query: "consumer products market cap under 5000 cr low debt",
  },
  {
    id: "high-margin-pharma",
    label: "High Margin Pharma",
    description: "Drug manufacturers with margins in the top quartile of their own sector.",
    query: "pharma high margin",
  },
  {
    id: "capital-efficiency",
    label: "Strong Capital Efficiency",
    description: "Top-quartile ROCE and ROE together, across the whole universe.",
    query: "high roce high roe",
  },
  {
    id: "profitable-smallcaps",
    label: "Profitable Small-Caps",
    description: "Small companies already earning above-median returns on capital.",
    query: "small cap quality low debt",
  },
  {
    id: "tech-growth",
    label: "Tech Growth, Low Leverage",
    // "debt free" (debt <= 0 exactly) left only 2 names -- technically correct
    // but useless as a starting screen. "low debt" resolves to Technology's
    // own p25, which is the more honest reading of the intent anyway.
    description: "Technology compounding revenue without loading up on debt.",
    query: "technology high growth low debt",
  },
]
