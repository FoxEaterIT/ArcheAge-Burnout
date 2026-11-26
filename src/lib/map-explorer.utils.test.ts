import { describe, expect, it } from "vitest"
import { GROUP_ACCENT, GROUP_SWATCH, ZOOM_UNIT, doneCount, parsePanelView, nearestFirst, sameRoute, startView, doneIndices, optimizeRoute, parseDone, parseMapUrl, parseRoute, pointId, routeLength, serializeMapUrl } from "./map-explorer.utils"

describe("indirizzo della mappa", () => {
  it("andata e ritorno di livelli, centro, zoom, punto e percorso", () => {
    const state = { layers: ["boss", "raccolta-dark-vein"], center: [120, -340] as [number, number], zoom: 4.25, point: { layer: "boss", x: 10, y: 20 }, route: [[1, 2], [3, 4]] as [number, number][] }
    const query = serializeMapUrl(state, new URLSearchParams("q=Iron Ore&oggetto=iron-ore"))
    expect(query).toContain("livelli=boss,raccolta-dark-vein")
    expect(query).toContain("punto=boss:10,20")
    expect(query).toContain("percorso=1,2;3,4")
    expect(query).toContain("oggetto=iron-ore")
    expect(parseMapUrl(new URLSearchParams(query))).toEqual({ ...state, zoom: 4.3 })
  })

  it("senza livelli nell'indirizzo lascia decidere ai livelli di partenza; vuoto vuol dire nessuno", () => {
    expect(parseMapUrl(new URLSearchParams("")).layers).toBeNull()
    expect(parseMapUrl(new URLSearchParams("livelli=")).layers).toEqual([])
  })

  it("ignora valori non validi o fuori dalla mappa", () => {
    const state = parseMapUrl(new URLSearchParams("livelli=boss,<script>&x=999999&y=1&zoom=-3&punto=boss:abc&percorso=1,2;x;99999,1"))
    expect(state).toEqual({ layers: ["boss"], center: null, zoom: null, point: null, route: [[1, 2]] })
  })
})

describe("vista di partenza", () => {
  const none = { layers: null, center: null, zoom: null, point: null, route: [] }
  it("usa centro e zoom del link, poi il punto, altrimenti la panoramica", () => {
    expect(startView({ ...none, center: [0, 510], zoom: 2 })).toEqual({ width: 2 * ZOOM_UNIT, center: [0.5, 0.5] })
    expect(startView({ ...none, point: { layer: "boss", x: 0, y: 510 } })).toEqual({ width: 6 * ZOOM_UNIT, center: [0.5, 0.5] })
    expect(startView(none)).toBeNull()
  })
})

describe("raccolti", () => {
  const layer = { id: "boss", entries: [], points: [[1, 2, 0], [3, 4, 0], [5, 6, 0]] as [number, number, number][] }

  it("legge solo id ben formati", () => {
    expect([...parseDone(["boss:1,2", 3, "x", "boss:-5,6"])]).toEqual(["boss:1,2", "boss:-5,6"])
    expect(parseDone({ a: 1 }).size).toBe(0)
  })

  it("legge un percorso salvato scartando tappe rotte o fuori mappa", () => {
    expect(parseRoute([{ x: 1.4, y: 2, name: "Dark Vein" }, { x: "a", y: 1 }, { x: 999999, y: 0 }, { x: 5, y: 6 }])).toEqual([
      { x: 1, y: 2, name: "Dark Vein" },
      { x: 5, y: 6, name: null },
    ])
  })

  it("trova gli indici e conta i raccolti del livello", () => {
    const done = new Set([pointId("boss", 3, 4), pointId("png", 1, 2)])
    expect([...doneIndices(layer, done)]).toEqual([1])
    expect(doneCount("boss", done)).toBe(1)
  })
})

describe("percorsi", () => {
  it("riconosce lo stesso percorso anche senza i nomi", () => {
    expect(sameRoute([{ x: 1, y: 2 }], [{ x: 1, y: 2, name: "Archeum" } as { x: number; y: number }])).toBe(true)
    expect(sameRoute([{ x: 1, y: 2 }], [{ x: 2, y: 1 }])).toBe(false)
  })

  it("parte dal segnaposto più vicino al centro della vista", () => {
    const points = [{ sx: 0, sy: 0 }, { sx: 95, sy: 105 }, { sx: 300, sy: 10 }]
    expect(nearestFirst(points, [100, 100])[0]).toBe(points[1])
    expect(nearestFirst(points, [100, 100])).toHaveLength(3)
  })

  it("misura la lunghezza", () => {
    expect(routeLength([[0, 0], [3, 4], [3, 10]])).toBe(11)
  })

  it("ottimizza l'ordine partendo dalla prima tappa", () => {
    const stops = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 5, y: 1 }]
    const best = optimizeRoute(stops)
    expect(best[0]).toBe(stops[0])
    expect(best.map((s) => s.x)).toEqual([0, 5, 10, 20, 30])
    expect(best).toHaveLength(5)
  })

  it("non accorcia un percorso già migliore e non perde tappe", () => {
    const stops = Array.from({ length: 60 }, (_, i) => ({ x: (i * 37) % 101, y: (i * 53) % 89 }))
    const best = optimizeRoute(stops)
    expect(new Set(best)).toEqual(new Set(stops))
    expect(routeLength(best.map((s) => [s.x, s.y]))).toBeLessThan(routeLength(stops.map((s) => [s.x, s.y])))
  })
})

describe("vista del pannello dei livelli", () => {
  it("parte dalle tessere e ricorda l'elenco solo se salvato così", () => {
    expect(parsePanelView("elenco")).toBe("elenco")
    expect(parsePanelView("tessere")).toBe("tessere")
    expect(parsePanelView(null)).toBe("tessere")
    expect(parsePanelView({ vista: "elenco" })).toBe("tessere")
  })

  it("ogni gruppo ha il suo colore per le tessere, lo stesso del campione", () => {
    for (const [group, swatch] of Object.entries(GROUP_SWATCH)) {
      expect(GROUP_ACCENT[group as keyof typeof GROUP_ACCENT]).toBe(`[--group:var(--map-${swatch.replace("bg-map-", "")})]`)
    }
  })
})
