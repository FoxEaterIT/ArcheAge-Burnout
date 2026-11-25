"use client"
import { useSearchParam } from "./use-search-param"

const FILTER_KEYS = ["q", "tipo", "categoria", "rarita", "tutte"]

/** Ricerca del catalogo: "Azzera" toglie ricerca e filtri e torna alla home del catalogo. */
export function useCatalogSearch() {
  const search = useSearchParam("q")
  return {
    value: search.value,
    pending: search.pending,
    onChange: search.onChange,
    clear: () => search.reset({ q: "", tipo: "", categoria: "", rarita: "", ordine: "", tutte: "" }),
    hasFilters: FILTER_KEYS.some((k) => search.params.get(k)),
  }
}
