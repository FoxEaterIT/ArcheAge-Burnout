"use client"
import { useEffect } from "react"

/**
 * Riscrive la query dell'indirizzo senza navigare (`history.replaceState`), dopo una pausa:
 * la vista della mappa cambia di continuo mentre si trascina, l'indirizzo solo a vista ferma.
 */
export function useReplaceQuery(query: string | null, delay = 400) {
  useEffect(() => {
    if (query === null) return
    const id = window.setTimeout(() => {
      if (window.location.search.slice(1) !== query) window.history.replaceState(window.history.state, "", query ? `?${query}` : window.location.pathname)
    }, delay)
    return () => window.clearTimeout(id)
  }, [query, delay])
}
