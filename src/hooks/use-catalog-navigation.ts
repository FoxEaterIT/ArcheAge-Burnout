"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

/** Aggiorna i parametri del catalogo nell'URL; ogni cambio di filtro torna alla prima pagina. */
export function useCatalogNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.delete("pagina")
    const query = next.toString()
    startTransition(() => router.replace(pathname + (query ? "?" + query : ""), { scroll: false }))
  }
  return { params, update, pending }
}
