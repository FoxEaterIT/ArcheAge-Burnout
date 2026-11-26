"use client"
import { useEffect, useState } from "react"
import type { RouteStop } from "@/lib/map-explorer.types"
import { MAX_ROUTE_STOPS, ROUTE_KEY, optimizeRoute, parseRoute, routeLength } from "@/lib/map-explorer.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/**
 * Percorso sulla mappa: tappe aggiunte col clic o dai punti visibili, ordine ottimizzabile.
 * Un percorso nell'indirizzo (link condiviso) vince su quello salvato nel browser.
 */
export function useMapRoute(fromUrl: RouteStop[]) {
  const [stops, setStops] = useState<RouteStop[]>(fromUrl)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal localStorage
    if (!fromUrl.length) setStops(parseRoute(readStored(ROUTE_KEY)))
    // Solo al montaggio: dopo, il percorso cambia solo per mano dell'utente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = (next: RouteStop[]) => {
    const limited = next.slice(0, MAX_ROUTE_STOPS)
    setStops(limited)
    writeStored(ROUTE_KEY, limited)
  }

  return {
    stops,
    editing,
    length: routeLength(stops.map((s) => [s.x, s.y])),
    full: stops.length >= MAX_ROUTE_STOPS,
    toggleEditing: () => setEditing((e) => !e),
    add: (stop: RouteStop) => save([...stops, stop]),
    replace: (next: RouteStop[]) => save(next),
    remove: (index: number) => save(stops.filter((_, i) => i !== index)),
    optimize: () => save(optimizeRoute(stops)),
    reverse: () => save(stops.toReversed()),
    clear: () => save([]),
  }
}
