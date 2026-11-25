"use client"
import { useState } from "react"
import { useCatalogNavigation } from "./use-catalog-navigation"
import { useDebouncedCallback } from "./use-debounced-callback"

/** Campo di ricerca del catalogo: risponde subito alla digitazione e aggiorna l'URL dopo una breve pausa. */
export function useCatalogSearch() {
  const { params, update, pending } = useCatalogNavigation()
  const [value, setValue] = useState(params.get("q") ?? "")
  const push = useDebouncedCallback((q: string) => update({ q: q.trim() }), 250)
  return {
    value,
    pending,
    onChange: (q: string) => {
      setValue(q)
      push(q)
    },
    clear: () => {
      setValue("")
      update({ q: "", tipo: "", categoria: "", rarita: "", ordine: "" })
    },
    hasFilters: ["q", "tipo", "categoria", "rarita"].some((k) => params.get(k)),
  }
}
