"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCatalogNavigation } from "@/hooks/use-catalog-navigation"
import { ALL, fromSelect, toSelect } from "@/lib/trade.utils"

export function CatalogFilters({ categories, rarities }: { categories: string[]; rarities: string[] }) {
  const { params, update } = useCatalogNavigation()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="col-span-2 grid gap-1.5 sm:col-span-1">
        <Label htmlFor="categoria">Categoria</Label>
        <Select value={toSelect(params.get("categoria") ?? "")} onValueChange={(v) => update({ categoria: fromSelect(v), tipo: "" })}>
          <SelectTrigger id="categoria" className="w-full data-[size=default]:h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tutte le categorie</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="rarita">Rarità</Label>
        <Select value={toSelect(params.get("rarita") ?? "")} onValueChange={(v) => update({ rarita: fromSelect(v) })}>
          <SelectTrigger id="rarita" className="w-full data-[size=default]:h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tutte</SelectItem>
            {rarities.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ordine">Ordina per</Label>
        <Select value={params.get("ordine") || "az"} onValueChange={(v) => update({ ordine: v === "az" ? "" : v })}>
          <SelectTrigger id="ordine" className="w-full data-[size=default]:h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="az">Nome A–Z</SelectItem>
            <SelectItem value="za">Nome Z–A</SelectItem>
            <SelectItem value="level">Livello decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
