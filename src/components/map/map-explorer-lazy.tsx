"use client"
// La mappa interattiva si carica solo nel browser: canvas e dati dei livelli non servono al server.
import dynamic from "next/dynamic"

export const MapExplorerLazy = dynamic(() => import("./map-explorer").then((m) => m.MapExplorer), {
  ssr: false,
  loading: () => <div className="h-[clamp(420px,calc(100dvh-15rem),920px)] animate-pulse rounded-lg border border-line bg-surface lg:ml-[324px]" />,
})
