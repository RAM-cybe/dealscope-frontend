"use client"

import { useEffect, useState } from "react"

/** Returns `value`, but only after it has stopped changing for `delayMs`.
 *  Used to keep an expensive computation (e.g. re-searching 2,046 companies)
 *  off the critical path of every keystroke, while the input it's bound to
 *  stays on its own, un-debounced state and updates instantly. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
