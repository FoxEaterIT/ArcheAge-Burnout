"use client"
import { useState } from "react"
import type { Point } from "@/lib/game.types"
import { MAX_LISTED_POINTS } from "@/lib/map.utils"
import { fmt } from "@/lib/text.utils"
import type { PositionsSection } from "@/lib/record.types"

const NO_POINTS: Point[] = []

/** Fonte e punto scelti tra le posizioni di un oggetto; "all" mostra tutti i punti della fonte. */
export function useItemPositions(section: PositionsSection) {
  const [source, setSourceState] = useState(section.defaultSource)
  const [spot, setSpot] = useState("all")
  const current = section.sources[source]
  const points = current.points
  const listed = points.length > 1 && points.length <= MAX_LISTED_POINTS
  const selected = spot === "all" || !listed ? null : points[Number(spot)]
  return {
    source,
    setSource: (value: number) => {
      setSourceState(value)
      setSpot("all")
    },
    spot: listed ? spot : "all",
    listed,
    sampled: current.total > points.length ? `Mostrati ${fmt(points.length)} punti su ${fmt(current.total)}.` : null,
    setSpot,
    points,
    label: current.label,
    point: points.length === 1 ? points[0] : selected,
    overview: selected || points.length === 1 ? NO_POINTS : points,
    spotOptions: [
      { value: "all", label: `Mostra tutti i ${fmt(current.total)}${section.flowers && current.label.startsWith("Raccolta") ? " fiori" : " punti"}` },
      ...points.map(([x, y], i) => ({ value: String(i), label: `Punto ${i + 1} di ${current.total} · ${x}, ${y}` })),
    ],
  }
}
