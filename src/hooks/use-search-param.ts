"use client"
import { useState } from "react"
import { useCatalogNavigation } from "./use-catalog-navigation"
import { useDebouncedCallback } from "./use-debounced-callback"

/**
 * Campo di ricerca legato a un parametro dell'URL: risponde subito alla digitazione e aggiorna l'URL dopo una pausa.
 * Se l'URL cambia per altre vie (un link, Indietro), il campo si riallinea e l'aggiornamento in attesa si scarta.
 */
export function useSearchParam(key: string, clears: string[] = []) {
  const { params, update, pending } = useCatalogNavigation()
  const fromUrl = params.get(key) ?? ""
  const [value, setValue] = useState(fromUrl)
  const [seen, setSeen] = useState(fromUrl)
  const debounced = useDebouncedCallback((v: string) => update({ [key]: v.trim(), ...Object.fromEntries(clears.map((c) => [c, ""])) }), 250)
  if (fromUrl !== seen) {
    setSeen(fromUrl)
    if (fromUrl !== value.trim()) {
      setValue(fromUrl)
      debounced.cancel()
    }
  }
  return {
    value,
    pending,
    params,
    update,
    onChange: (v: string) => {
      setValue(v)
      debounced.run(v)
    },
    reset: (changes: Record<string, string>) => {
      debounced.cancel()
      setValue("")
      update(changes)
    },
  }
}
