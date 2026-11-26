// Mappa interattiva: indirizzo condivisibile, punti raccolti e percorsi.
import type { Point } from "./game.types"
import type { MapLayerData, MapLayerGroupId } from "./map-layers.types"
import type { MapPanelView, MapPointRef, MapUrlState, RouteStop } from "./map-explorer.types"
import { MAP_BOUNDS, toFraction } from "./map.utils"

/** Larghezza della mappa intera a livello 2: lo zoom nell'indirizzo è un multiplo di questa. */
export const ZOOM_UNIT = 1152
export const MAX_ROUTE_STOPS = 200
export const PROGRESS_KEY = "burnout-map-raccolti-v1"
export const ROUTE_KEY = "burnout-map-percorso-v1"
export const HIDE_DONE_KEY = "burnout-map-nascondi-raccolti-v1"
export const PANEL_VIEW_KEY = "burnout-map-vista-livelli-v1"

/** Vista del pannello salvata: l'elenco solo se scelto, altrimenti le tessere. */
export function parsePanelView(value: unknown): MapPanelView {
  return value === "elenco" ? "elenco" : "tessere"
}

const LAYER_ID = /^[a-z0-9-]+$/
const inside = ([x, y]: Point) => x >= MAP_BOUNDS[0] && x <= MAP_BOUNDS[2] && y >= MAP_BOUNDS[1] && y <= MAP_BOUNDS[3]

function parsePoint(value: string | undefined): Point | null {
  const match = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(value ?? "")
  if (!match) return null
  const point: Point = [Math.round(Number(match[1])), Math.round(Number(match[2]))]
  return inside(point) ? point : null
}

/** Legge lo stato dall'indirizzo; ciò che non è valido si ignora, senza errori. */
export function parseMapUrl(params: URLSearchParams): MapUrlState {
  const rawLayers = params.get("livelli")
  const layers = rawLayers === null ? null : rawLayers.split(",").filter((id) => LAYER_ID.test(id))
  const x = params.get("x")
  const y = params.get("y")
  const center = x !== null && y !== null ? parsePoint(`${x},${y}`) : null
  const zoomValue = Number(params.get("zoom"))
  const zoom = params.has("zoom") && Number.isFinite(zoomValue) && zoomValue > 0 && zoomValue <= 64 ? zoomValue : null
  const [pointLayer, pointAt] = (params.get("punto") ?? "").split(":")
  const at = parsePoint(pointAt)
  const point = pointLayer && LAYER_ID.test(pointLayer) && at ? { layer: pointLayer, x: at[0], y: at[1] } : null
  const route = (params.get("percorso") ?? "")
    .split(";")
    .map((p) => parsePoint(p))
    .filter((p): p is Point => p !== null)
    .slice(0, MAX_ROUTE_STOPS)
  return { layers, center, zoom, point, route }
}

/** Scrive lo stato nell'indirizzo, lasciando com'erano gli altri parametri (ricerca dell'oggetto). */
export function serializeMapUrl(state: MapUrlState, base: URLSearchParams) {
  const params = new URLSearchParams(base)
  for (const key of ["livelli", "x", "y", "zoom", "punto", "percorso"]) params.delete(key)
  if (state.layers) params.set("livelli", state.layers.join(","))
  if (state.center) {
    params.set("x", String(Math.round(state.center[0])))
    params.set("y", String(Math.round(state.center[1])))
  }
  if (state.zoom) params.set("zoom", String(Math.round(state.zoom * 10) / 10))
  if (state.point) params.set("punto", `${state.point.layer}:${state.point.x},${state.point.y}`)
  if (state.route.length) params.set("percorso", state.route.map(([px, py]) => `${Math.round(px)},${Math.round(py)}`).join(";"))
  // Virgole, due punti e punti e virgola restano leggibili: il link si legge e si corregge a mano.
  return params.toString().replace(/%2C/g, ",").replace(/%3A/g, ":").replace(/%3B/g, ";")
}

/** Zoom di un punto aperto da un link senza centro: icone visibili, dintorni leggibili. */
export const POINT_ZOOM = 6

/** Vista di partenza da un link: il centro e lo zoom scritti, oppure il punto ingrandito, oppure la panoramica (null). */
export function startView(state: MapUrlState): { width: number; center: [number, number] } | null {
  if (state.center) return { width: (state.zoom ?? 4) * ZOOM_UNIT, center: toFraction(state.center) }
  if (state.point) return { width: (state.zoom ?? POINT_ZOOM) * ZOOM_UNIT, center: toFraction([state.point.x, state.point.y]) }
  return null
}

/** Id di un punto per i raccolti: livello e coordinate. */
export const pointId = (layer: string, x: number, y: number) => `${layer}:${x},${y}`
export const refId = (ref: MapPointRef) => pointId(ref.layer, ref.x, ref.y)

const DONE_ID = /^[a-z0-9-]+:-?\d+,-?\d+$/
/** Raccolti salvati (già letti dal JSON): solo id ben formati, il resto si scarta. */
export function parseDone(value: unknown): Set<string> {
  return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && DONE_ID.test(id)) : [])
}

/** Percorso salvato: tappe con coordinate numeriche dentro la mappa, al massimo `MAX_ROUTE_STOPS`. */
export function parseRoute(value: unknown): RouteStop[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((s): s is RouteStop => typeof s === "object" && s !== null && Number.isFinite(s.x) && Number.isFinite(s.y) && inside([s.x, s.y]))
    .slice(0, MAX_ROUTE_STOPS)
    .map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), name: typeof s.name === "string" ? s.name.slice(0, 120) : null }))
}

/** Indici dei punti raccolti di un livello, per non disegnarli. */
export function doneIndices(layer: MapLayerData, done: Set<string>): Set<number> {
  const prefix = layer.id + ":"
  const result = new Set<number>()
  if (![...done].some((id) => id.startsWith(prefix))) return result
  layer.points.forEach(([x, y], i) => {
    if (done.has(prefix + x + "," + y)) result.add(i)
  })
  return result
}

/** Quanti punti di un livello sono raccolti. */
export function doneCount(layerId: string, done: Set<string>) {
  const prefix = layerId + ":"
  let n = 0
  for (const id of done) if (id.startsWith(prefix)) n++
  return n
}

/** Stesse tappe nello stesso ordine (i nomi non contano): il link e il percorso salvato coincidono. */
export const sameRoute = (a: { x: number; y: number }[], b: { x: number; y: number }[]) => a.length === b.length && a.every((s, i) => s.x === b[i].x && s.y === b[i].y)

/** Punto da cui parte un percorso dai segnaposti visibili: il più vicino a `center` (pixel dello schermo). */
export function nearestFirst<T extends { sx: number; sy: number }>(points: T[], center: [number, number]): T[] {
  if (points.length < 2) return points
  let best = 0
  for (let i = 1; i < points.length; i++) if (Math.hypot(points[i].sx - center[0], points[i].sy - center[1]) < Math.hypot(points[best].sx - center[0], points[best].sy - center[1])) best = i
  return [points[best], ...points.slice(0, best), ...points.slice(best + 1)]
}

/** Lunghezza del percorso in unità di gioco. */
export function routeLength(stops: Point[]) {
  let total = 0
  for (let i = 1; i < stops.length; i++) total += Math.hypot(stops[i][0] - stops[i - 1][0], stops[i][1] - stops[i - 1][1])
  return total
}

/**
 * Ordine più corto, partendo dalla prima tappa: vicino più vicino, poi 2-opt finché migliora.
 * Il percorso resta aperto (non torna alla partenza).
 */
export function optimizeRoute<T extends { x: number; y: number }>(stops: T[]): T[] {
  if (stops.length < 3) return stops
  const left = stops.slice(1)
  const order = [stops[0]]
  while (left.length) {
    const last = order.at(-1)!
    let best = 0
    for (let i = 1; i < left.length; i++) if (Math.hypot(left[i].x - last.x, left[i].y - last.y) < Math.hypot(left[best].x - last.x, left[best].y - last.y)) best = i
    order.push(left.splice(best, 1)[0])
  }
  const d = (a: T, b: T) => Math.hypot(a.x - b.x, a.y - b.y)
  let improved = true
  for (let pass = 0; improved && pass < 50; pass++) {
    improved = false
    for (let i = 1; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const before = d(order[i - 1], order[i]) + (j + 1 < order.length ? d(order[j], order[j + 1]) : 0)
        const after = d(order[i - 1], order[j]) + (j + 1 < order.length ? d(order[i], order[j + 1]) : 0)
        if (after < before - 1e-9) {
          order.splice(i, j - i + 1, ...order.slice(i, j + 1).reverse())
          improved = true
        }
      }
    }
  }
  return order
}

/** Colore di ogni gruppo sulla mappa: token di `globals.css`, letti dal canvas e usati nei campioni del pannello. */
export const GROUP_COLOR_VARS: Record<MapLayerGroupId, string> = {
  alberi: "--map-alberi",
  minerali: "--map-minerali",
  piante: "--map-piante",
  creature: "--map-creature",
  png: "--map-png",
  produzione: "--map-produzione",
  commercio: "--map-commercio",
  oggetti: "--map-oggetti",
}

/** Colore del gruppo in `--group`, per bordo e fondo delle tessere accese. Classi scritte per intero perché Tailwind le trovi. */
export const GROUP_ACCENT: Record<MapLayerGroupId, string> = {
  alberi: "[--group:var(--map-alberi)]",
  minerali: "[--group:var(--map-minerali)]",
  piante: "[--group:var(--map-piante)]",
  creature: "[--group:var(--map-creature)]",
  png: "[--group:var(--map-png)]",
  produzione: "[--group:var(--map-produzione)]",
  commercio: "[--group:var(--map-commercio)]",
  oggetti: "[--group:var(--map-oggetti)]",
}

/** Classi Tailwind dei campioni, scritte per intero perché Tailwind le trovi. */
export const GROUP_SWATCH: Record<MapLayerGroupId, string> = {
  alberi: "bg-map-alberi",
  minerali: "bg-map-minerali",
  piante: "bg-map-piante",
  creature: "bg-map-creature",
  png: "bg-map-png",
  produzione: "bg-map-produzione",
  commercio: "bg-map-commercio",
  oggetti: "bg-map-oggetti",
}
