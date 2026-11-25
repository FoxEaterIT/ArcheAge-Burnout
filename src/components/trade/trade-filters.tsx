"use client"
// Filtri delle rotte: obiettivo, ricerca, partenza, destinazione, tipo di ricompensa.
import { RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RewardKind, TradeFilters } from "@/lib/game.types"
import { ALL, fromSelect, toSelect } from "@/lib/trade.utils"

type Props = {
  filters: TradeFilters
  set: <K extends keyof TradeFilters>(key: K, value: TradeFilters[K]) => void
  reset: () => void
  dirty: boolean
  rewards: string[]
  origins: string[]
  destinations: string[]
}

export function TradeFiltersBar({ filters, set, reset, dirty, rewards, origins, destinations }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr_auto] xl:items-end">
      <div className="col-span-2 grid gap-1.5 sm:col-span-1">
        <Label htmlFor="target">Cosa vuoi ottenere?</Label>
        <Input id="target" type="search" list="rewards" placeholder="Es. Standard Additive" value={filters.target} onChange={(e) => set("target", e.target.value)} className="h-9" />
        <datalist id="rewards">{rewards.map((r) => <option key={r} value={r} />)}</datalist>
      </div>
      <div className="col-span-2 grid gap-1.5 sm:col-span-1">
        <Label htmlFor="query">Cerca materiale o carico</Label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-dim" />
          <Input id="query" type="search" placeholder="Es. Grain Liquor" value={filters.query} onChange={(e) => set("query", e.target.value)} className="h-9 pl-8" />
        </div>
      </div>
      <PlaceSelect id="origin" label="Partenza" value={filters.origin} options={origins} onChange={(v) => set("origin", v)} />
      <PlaceSelect id="destination" label="Destinazione" value={filters.destination} options={destinations} onChange={(v) => set("destination", v)} />
      <div className="grid gap-1.5">
        <Label htmlFor="kind">Ricompensa</Label>
        <Select value={toSelect(filters.kind)} onValueChange={(v) => set("kind", fromSelect(v) as RewardKind)}>
          <SelectTrigger id="kind" className="w-full data-[size=default]:h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tutte</SelectItem>
            <SelectItem value="item">Materiali e oggetti</SelectItem>
            <SelectItem value="gold">Oro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" onClick={reset} disabled={!dirty} className="h-9 self-end justify-self-start text-muted">
        <RotateCcw aria-hidden />Azzera
      </Button>
    </div>
  )
}

function PlaceSelect({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={toSelect(value)} onValueChange={(v) => onChange(fromSelect(v))}>
        <SelectTrigger id={id} className="w-full data-[size=default]:h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tutte</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
