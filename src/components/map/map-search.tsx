"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParam } from "@/hooks/use-search-param"

export function MapSearch() {
  const { value, onChange, pending } = useSearchParam("q", ["oggetto"])
  return (
    <div className="grid w-full gap-1.5 lg:max-w-md">
      <Label htmlFor="map-q">Cerca un oggetto sulla mappa</Label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-3 left-3 size-4 text-dim" />
        <Input id="map-q" type="search" autoComplete="off" placeholder="Es. Iron Ore" value={value} onChange={(e) => onChange(e.target.value)} aria-busy={pending} className="h-10 pl-9 text-base" />
      </div>
    </div>
  )
}
