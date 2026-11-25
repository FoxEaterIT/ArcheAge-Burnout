import { describe, expect, it } from "vitest"
import index from "@/data/generated/map-index.json"
import { mapMarkers, tileLevel, toFraction, visibleTiles } from "./map.utils"

describe("mappa", () => {
  it("converte le coordinate di gioco in frazioni della mappa", () => {
    expect(toFraction([0, 510])).toEqual([0.5, 0.5])
  })
  it("sceglie il livello di dettaglio dalla larghezza", () => {
    expect(tileLevel(300, 1)).toBe(2)
    expect(tileLevel(18432, 1)).toBe(6)
  })
  it("a livello 2 usa le tile della panoramica", () => {
    const { level, tiles } = visibleTiles({ width: 400, dpr: 1, scrollLeft: 0, scrollTop: 0, clientWidth: 400, clientHeight: 533 }, index as Record<string, number[]>)
    expect(level).toBe(2)
    expect(tiles[0].src).toBe("/game/map/overview/0-0.webp")
    expect(tiles).toHaveLength(30)
  })
  it("numera i punti se sono pochi, puntini se più di 50", () => {
    expect(mapMarkers(null, [[0, 0], [1, 1]], "Iron Ore").map((m) => m.kind)).toEqual(["pin", "pin"])
    expect(mapMarkers(null, Array.from({ length: 51 }, () => [0, 0]), "x")[0].kind).toBe("dot")
  })
})
