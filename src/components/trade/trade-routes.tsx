"use client"
// Rotte filtrabili: barra dei filtri, conteggio e carichi come linee.
import type { TradeRoute } from "@/lib/game.types"
import { useTradeFilters } from "@/hooks/use-trade-filters"
import { CargoCard } from "./cargo-card"
import { TradeFiltersBar } from "./trade-filters"

type Props = { routes: TradeRoute[]; rewards: string[]; origins: string[]; destinations: string[]; cargoIds: Record<string, string> }

export function TradeRoutes({ routes, rewards, origins, destinations, cargoIds }: Props) {
  const { filters, set, reset, dirty, groups, count } = useTradeFilters(routes)
  return (
    <div className="space-y-5">
      <TradeFiltersBar filters={filters} set={set} reset={reset} dirty={dirty} rewards={rewards} origins={origins} destinations={destinations} />
      <p aria-live="polite" className="text-sm text-muted">{count}</p>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {groups.map((g) => <CargoCard key={g.origin + g.cargo} group={g} recordId={cargoIds[g.cargo]} />)}
      </div>
    </div>
  )
}
