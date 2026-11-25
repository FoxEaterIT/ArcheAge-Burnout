"use client"
import { useState } from "react"
import type { PositionsSection } from "@/lib/record.types"

/** Fonte e punto scelti tra le posizioni di un oggetto; "all" mostra tutti i punti della fonte. */
export function useItemPositions(section: PositionsSection) {
  const [source, setSourceState] = useState(section.defaultSource)
  const [spot, setSpot] = useState("all")
  const points = section.sources[source].points
  const selected = spot === "all" || points.length < 2 ? null : points[Number(spot)]
  return {
    source,
    setSource: (value: number) => {
      setSourceState(value)
      setSpot("all")
    },
    spot: points.length < 2 ? "0" : spot,
    setSpot,
    points,
    label: section.sources[source].label,
    point: points.length === 1 ? points[0] : selected,
    overview: selected || points.length === 1 ? [] : points,
    spotOptions: [
      { value: "all", label: `Mostra tutti i ${points.length}${section.flowers && section.sources[source].label.startsWith("Raccolta") ? " fiori" : " punti"}` },
      ...points.map(([x, y], i) => ({ value: String(i), label: `Punto ${i + 1} di ${points.length} · ${x}, ${y}` })),
    ],
  }
}
