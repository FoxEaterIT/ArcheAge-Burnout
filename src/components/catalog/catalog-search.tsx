"use client"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCatalogSearch } from "@/hooks/use-catalog-search"

export function CatalogSearch() {
  const { value, onChange, clear, hasFilters, pending } = useCatalogSearch()
  return (
    <div className="flex w-full items-center gap-2 lg:max-w-xl">
      <div className="relative flex-1">
        <label htmlFor="catalog-q" className="sr-only">Cerca nel catalogo</label>
        <Search aria-hidden className="pointer-events-none absolute top-3 left-3 size-4 text-dim" />
        <Input id="catalog-q" type="search" autoComplete="off" placeholder="Cerca armi, materiali, creature, missioni…" value={value} onChange={(e) => onChange(e.target.value)} aria-busy={pending} className="h-10 pl-9 text-base" />
      </div>
      {hasFilters ? <Button variant="ghost" onClick={clear} className="h-10 text-muted"><X aria-hidden />Azzera</Button> : null}
    </div>
  )
}
