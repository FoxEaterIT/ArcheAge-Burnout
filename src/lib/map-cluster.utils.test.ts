import { describe, expect, it } from "vitest"
import type { MapLayerData } from "./map-layers.types"
import { CLUSTER_PX, GRID_COLS, clusterView, fromScreen, hitTest, indexLayer, pointsInView, shortCount, toScreen, visibleCells } from "./map-cluster.utils"
import { MAP_BOUNDS, fromFraction, toFraction } from "./map.utils"

const [minX, minY, maxX, maxY] = MAP_BOUNDS
/** Punto di gioco alla frazione (a, b) della mappa. */
const at = (a: number, b: number): [number, number, number] => [minX + a * (maxX - minX), minY + b * (maxY - minY), 0]
const layer = (id: string, points: [number, number, number][]): MapLayerData => ({ id, entries: [["Nodo", null, ""]], points })

const overview = { width: 960, scrollLeft: 0, scrollTop: 0, clientWidth: 960, clientHeight: 1280 }

describe("indice spaziale", () => {
  it("mette ogni punto nella sua cella e somma le posizioni", () => {
    const index = indexLayer(layer("a", [at(0.1, 0.1), at(0.101, 0.101), at(0.9, 0.9)]))
    const cell = Math.floor(0.1 * 128) * GRID_COLS + Math.floor(0.1 * GRID_COLS)
    expect(index.start[cell + 1] - index.start[cell]).toBe(2)
    expect(index.start.at(-1)).toBe(3)
    expect(index.sumX[cell] / 2).toBeCloseTo(0.1005, 3)
  })

  it("trova le celle visibili con un margine", () => {
    const cells = visibleCells({ width: 9600, scrollLeft: 4800, scrollTop: 0, clientWidth: 960, clientHeight: 1280 })
    expect(cells.col0).toBe(47)
    expect(cells.col1).toBe(58)
    expect(visibleCells({ width: 9600, scrollLeft: 4800, scrollTop: 0, clientWidth: 960, clientHeight: 1280 }, 3)).toMatchObject({ col0: 45, col1: 60 })
    expect(cells.row0).toBe(0)
  })

  it("centra il palco quando è più stretto del riquadro", () => {
    expect(toScreen({ width: 400, scrollLeft: 0, scrollTop: 0, clientWidth: 800, clientHeight: 600 }, 0, 0)).toEqual([200, 0])
  })
})

describe("raggruppamento", () => {
  const dense = indexLayer(layer("alberi", Array.from({ length: 500 }, (_, i) => at(0.5 + (i % 10) * 0.0005, 0.5 + Math.floor(i / 10) * 0.0005))))
  const lone = indexLayer(layer("boss", [at(0.2, 0.8)]))

  it("da lontano unisce i punti vicini in un gruppo con il conteggio", () => {
    const items = clusterView([dense, lone], overview)
    const cluster = items.find((i) => i.kind === "cluster")
    expect(cluster).toMatchObject({ kind: "cluster", count: 500, layer: "alberi" })
    expect(items.find((i) => i.layer === "boss")).toMatchObject({ kind: "point", index: 0 })
  })

  it("con spread disegna ogni punto visibile", () => {
    const items = clusterView([dense], { width: 18432, scrollLeft: 18432 * 0.5 - 100, scrollTop: 18432 * (4 / 3) * 0.5 - 100, clientWidth: 960, clientHeight: 800 }, { spread: true })
    expect(items.every((i) => i.kind === "point")).toBe(true)
    expect(items.length).toBeGreaterThan(100)
  })

  const near = indexLayer(layer("png", Array.from({ length: 20 }, (_, i) => at(0.5 + (i % 5) * 0.0005, 0.5 + Math.floor(i / 5) * 0.0005))))

  it("da lontano fonde i livelli e colora il gruppo col più presente", () => {
    const clusters = clusterView([dense, near], overview).filter((i) => i.kind === "cluster")
    expect(clusters).toEqual([expect.objectContaining({ count: 520, layer: "alberi" })])
  })

  it("da vicino non mescola livelli diversi nello stesso gruppo", () => {
    const close = { width: 4800, scrollLeft: 4800 * 0.5 - 480, scrollTop: 4800 * (4 / 3) * 0.5 - 400, clientWidth: 960, clientHeight: 800 }
    const clusters = clusterView([dense, near], close).filter((i) => i.kind === "cluster")
    expect(new Set(clusters.map((c) => c.layer))).toEqual(new Set(["alberi", "png"]))
    expect(clusters.filter((c) => c.layer === "png").reduce((n, c) => n + (c.kind === "cluster" ? c.count : 0), 0)).toBe(20)
  })

  it("tiene fuori dai gruppi il punto scelto", () => {
    const close = { width: 4800, scrollLeft: 4800 * 0.5 - 480, scrollTop: 4800 * (4 / 3) * 0.5 - 400, clientWidth: 960, clientHeight: 800 }
    const items = clusterView([dense], close, { pinned: { layer: "alberi", index: 7 } })
    expect(items).toContainEqual(expect.objectContaining({ kind: "point", layer: "alberi", index: 7 }))
    expect(items.reduce((n, i) => n + (i.kind === "cluster" ? i.count : 1), 0)).toBe(500)
  })

  it("tiene fuori dai gruppi il punto scelto anche da lontano", () => {
    const items = clusterView([dense], overview, { pinned: { layer: "alberi", index: 7 } })
    expect(items).toContainEqual(expect.objectContaining({ kind: "point", layer: "alberi", index: 7 }))
    expect(items.reduce((n, i) => n + (i.kind === "cluster" ? i.count : 1), 0)).toBe(500)
  })

  it("fonde i gruppi accanto quando i centri quasi si toccano", () => {
    // Punti a cavallo del bordo di una cella di schermo: senza fusione nascerebbero due gruppi sovrapposti.
    const close = { width: 4800, scrollLeft: 0, scrollTop: 0, clientWidth: 960, clientHeight: 800 }
    const edge = (CLUSTER_PX * 4) / 4800
    const pair = indexLayer(layer("a", [at(edge - 0.0005, 0.05), at(edge - 0.0004, 0.05), at(edge + 0.0004, 0.05), at(edge + 0.0005, 0.05)]))
    expect(clusterView([pair], close)).toEqual([expect.objectContaining({ kind: "cluster", count: 4 })])
  })

  it("salta i punti nascosti, come i raccolti", () => {
    const items = clusterView([lone], { ...overview, width: 9600, scrollLeft: 9600 * 0.2 - 480, scrollTop: 9600 * (4 / 3) * 0.8 - 640 }, { hidden: new Map([["boss", new Set([0])]]) })
    expect(items).toHaveLength(0)
  })

  it("non disegna niente fuori dal riquadro", () => {
    expect(clusterView([lone], { ...overview, width: 9600, scrollLeft: 0, scrollTop: 0 })).toHaveLength(0)
  })

  it("il clic prende il segnaposto più vicino entro il raggio", () => {
    const items = clusterView([dense, lone], overview)
    const boss = items.find((i) => i.layer === "boss")!
    expect(hitTest(items, boss.sx + 3, boss.sy - 2, false)).toBe(boss)
    expect(hitTest(items, boss.sx + CLUSTER_PX, boss.sy, false)).toBeNull()
  })
})

describe("punti nella vista", () => {
  const view = { width: 9600, scrollLeft: 9600 * 0.5 - 480, scrollTop: 9600 * (4 / 3) * 0.5 - 400, clientWidth: 960, clientHeight: 800 }
  const index = indexLayer(layer("boss", [at(0.5, 0.5), at(0.501, 0.5), at(0.9, 0.9)]))

  it("conta solo i punti dentro il riquadro e rispetta il limite", () => {
    expect(pointsInView([index], view, 10).total).toBe(2)
    expect(pointsInView([index], view, 1)).toMatchObject({ total: 2, found: [{ layer: "boss", index: 0 }] })
  })

  it("dal pixel torna alle coordinate di gioco", () => {
    const [sx, sy] = toScreen(view, ...toFraction([120, -340]))
    expect(fromFraction(fromScreen(view, sx, sy))).toEqual([120, -340])
  })
})

it("abbrevia i conteggi dei gruppi", () => {
  expect(shortCount(980)).toBe("980")
  expect(shortCount(1240)).toBe("1,2k")
  expect(shortCount(37316)).toBe("37k")
})
