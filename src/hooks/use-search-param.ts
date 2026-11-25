"use client"
import { useState } from "react"
import { useCatalogNavigation } from "./use-catalog-navigation"
import { useDebouncedCallback } from "./use-debounced-callback"

/** Campo di ricerca legato a un parametro dell'URL: digitazione immediata, URL aggiornato dopo una pausa. */
export function useSearchParam(key: string, clears: string[] = []) {
  const { params, update, pending } = useCatalogNavigation()
  const [value, setValue] = useState(params.get(key) ?? "")
  const push = useDebouncedCallback((v: string) => update({ [key]: v.trim(), ...Object.fromEntries(clears.map((c) => [c, ""])) }), 250)
  return {
    value,
    pending,
    onChange: (v: string) => {
      setValue(v)
      push(v)
    },
  }
}
