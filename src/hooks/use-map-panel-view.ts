"use client"
import { useCallback, useState } from "react"
import type { MapPanelView } from "@/lib/map-explorer.types"
import { PANEL_VIEW_KEY, parsePanelView } from "@/lib/map-explorer.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/**
 * Vista del pannello dei livelli (tessere o elenco), ricordata in questo browser. La mappa interattiva si disegna solo
 * nel client (`MapExplorerLazy`, senza SSR), quindi il valore salvato si legge subito, senza un primo disegno sbagliato.
 */
export function useMapPanelView() {
  const [view, setState] = useState<MapPanelView>(() => parsePanelView(readStored(PANEL_VIEW_KEY)))
  const setView = useCallback((next: MapPanelView) => {
    setState(next)
    writeStored(PANEL_VIEW_KEY, next)
  }, [])
  return [view, setView] as const
}
