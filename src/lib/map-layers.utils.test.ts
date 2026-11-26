import { describe, expect, it } from "vitest"
import locations from "@/data/generated/item-locations.json"
import catalog from "@/data/generated/world-catalog.json"
import type { MapLayerSources } from "./map-layers.types"
import { actorDetail, buildMapLayers, gatheringGroup } from "./map-layers.utils"

const { groups, data } = buildMapLayers({ locations, catalog } as unknown as MapLayerSources)
const info = groups.flatMap((g) => g.layers)
const byId = new Map(info.map((l) => [l.id, l]))

describe("livelli della mappa", () => {
  it("riconosce alberi, minerali e piante dal nome del nodo", () => {
    expect(gatheringGroup("Mature Tree (Fir)")).toBe("alberi")
    expect(gatheringGroup("Dark Vein")).toBe("minerali")
    expect(gatheringGroup("Star Meteor")).toBe("minerali")
    expect(gatheringGroup("Lily")).toBe("piante")
  })

  it("riassume livello e zona di una creatura", () => {
    expect(actorDetail("Lv 30 · Normal · Whalesong Shores · 30")).toBe("Lv 30 · Whalesong Shores")
  })

  it("ha un livello per ogni nodo di raccolta, nel gruppo giusto", () => {
    expect(byId.get("raccolta-mature-tree-fir")).toMatchObject({ group: "alberi", label: "Mature Tree (Fir)", count: 37316 })
    expect(byId.get("raccolta-dark-vein")).toMatchObject({ group: "minerali", count: 432 })
    expect(byId.get("raccolta-lily")?.group).toBe("piante")
    expect(info.filter((l) => l.id.startsWith("raccolta-"))).toHaveLength(17)
  })

  it("mette PNG, mostri e boss del catalogo nei loro livelli", () => {
    expect(byId.get("png")!.count).toBeGreaterThanOrEqual(2662)
    expect(byId.get("boss")!.count).toBeGreaterThanOrEqual(112)
    expect(byId.get("mostri")!.count).toBeGreaterThanOrEqual(1254)
    for (const id of ["venditori", "missioni", "banchi", "commercio", "interazioni", "oggetti", "zone"]) expect(byId.has(id), id).toBe(true)
  })

  it("conta i punti come li serve e non ripete la stessa voce nello stesso punto", () => {
    for (const layer of info) {
      const points = data.get(layer.id)!.points
      expect(points.length, layer.id).toBe(layer.count)
      expect(new Set(points.map((p) => p.join("|"))).size, layer.id).toBe(points.length)
    }
  })

  it("dà id unici e link solo verso le schede", () => {
    expect(new Set(info.map((l) => l.id)).size).toBe(info.length)
    for (const id of byId.keys()) expect(id).toMatch(/^[a-z0-9-]+$/)
    for (const layer of data.values()) for (const [, href] of layer.entries) if (href) expect(href).toMatch(/^\/scheda\//)
  })

  it("accende all'inizio pochi livelli, senza alberi", () => {
    const on = info.filter((l) => l.on)
    expect(on.map((l) => l.id)).toContain("boss")
    expect(on.some((l) => l.group === "alberi")).toBe(false)
  })
})
