"use client"
// La mappa interattiva si carica solo nel browser: canvas e dati dei livelli non servono al server.
import dynamic from "next/dynamic"

/** Segnaposto della mappa mentre si carica: stessa altezza del riquadro, accanto alla colonna dei livelli. */
export function MapExplorerSkeleton() {
  return <div className="h-[clamp(420px,calc(100dvh-13rem),920px)] animate-pulse rounded-lg border border-line bg-surface lg:ml-[324px]" />
}

export const MapExplorerLazy = dynamic(() => import("./map-explorer").then((m) => m.MapExplorer), { ssr: false, loading: MapExplorerSkeleton })
