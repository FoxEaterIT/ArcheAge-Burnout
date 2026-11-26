"use client"
import { useCallback, useEffect, useState } from "react"
import type { RouteStop } from "@/lib/map-explorer.types"
import { MAX_ROUTE_STOPS, ROUTE_KEY, optimizeRoute, parseRoute, routeLength, sameRoute } from "@/lib/map-explorer.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/**
 * Percorso sulla mappa: tappe aggiunte col clic o dai punti visibili, ordine ottimizzabile. Azioni stabili.
 * Un percorso nell'indirizzo (link condiviso) vince su quello salvato; se è lo stesso, si tengono i nomi salvati.
 */
export function useMapRoute(fromUrl: RouteStop[]) {
  const [stops, setStops] = useState<RouteStop[]>(fromUrl)
  const [editing, setEditing] = useState(false)
  const [first] = useState(fromUrl)

  useEffect(() => {
    const stored = parseRoute(readStored(ROUTE_KEY))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal localStorage
    if (!first.length || sameRoute(first, stored)) setStops(stored)
  }, [first])

  const save = useCallback((change: (current: RouteStop[]) => RouteStop[]) => {
    setStops((current) => {
      const next = change(current).slice(0, MAX_ROUTE_STOPS)
      writeStored(ROUTE_KEY, next)
      return next
    })
  }, [])

  return {
    stops,
    editing,
    length: routeLength(stops.map((s) => [s.x, s.y])),
    full: stops.length >= MAX_ROUTE_STOPS,
    toggleEditing: useCallback(() => setEditing((e) => !e), []),
    add: useCallback((stop: RouteStop) => save((current) => [...current, stop]), [save]),
    replace: useCallback((next: RouteStop[]) => save(() => next), [save]),
    remove: useCallback((index: number) => save((current) => current.filter((_, i) => i !== index)), [save]),
    optimize: useCallback(() => save(optimizeRoute), [save]),
    reverse: useCallback(() => save((current) => current.toReversed()), [save]),
    clear: useCallback(() => save(() => []), [save]),
  }
}
