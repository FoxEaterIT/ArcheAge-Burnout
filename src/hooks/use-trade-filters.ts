"use client"
import { useDeferredValue, useMemo, useState } from "react"
import type { TradeFilters, TradeRoute } from "@/lib/game.types"
import { EMPTY_TRADE_FILTERS, countLabel, filterRoutes, groupRoutes } from "@/lib/trade.utils"

/** Filtri delle rotte e carichi risultanti; i campi di testo sono differiti per tenere fluida la digitazione. */
export function useTradeFilters(routes: TradeRoute[]) {
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_TRADE_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const deferred = useDeferredValue(filters)
  const matches = useMemo(() => filterRoutes(routes, deferred), [routes, deferred])
  const groups = useMemo(() => groupRoutes(matches), [matches])
  const set = <K extends keyof TradeFilters>(key: K, value: TradeFilters[K]) => setFilters((f) => ({ ...f, [key]: value }))
  return {
    filters,
    set,
    reset: () => setFilters(EMPTY_TRADE_FILTERS),
    groups,
    count: countLabel(matches.length, routes.length),
    dirty: Object.values(filters).some(Boolean),
    filtersOpen,
    toggleFilters: () => setFiltersOpen((open) => !open),
  }
}
