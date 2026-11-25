"use client"
// La mappa si carica solo quando serve: tiene leggero il bundle delle pagine.
import dynamic from "next/dynamic"

export const WorldMapLazy = dynamic(() => import("./world-map").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-[clamp(300px,55vh,600px)] animate-pulse rounded-lg border border-line bg-surface" />,
})
