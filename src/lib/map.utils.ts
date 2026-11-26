// Mappa di Auroria a tile, con le stesse regole di `renderWorld` dell'originale.
import type { MapMarker, MapTile, MapViewport, Point } from "./game.types"

export const MAP_BOUNDS = [-9180, -11730, 9180, 12750] as const
const TILE = 256
const BASE = 288
/** La mappa è alta 4/3 della larghezza (1152 × 1536 a livello 2). */
export const MAP_RATIO = 4 / 3
/** Oltre questi punti una fonte si campiona: centomila segnaposti pesano sulla pagina e non si leggono. */
export const MAX_SOURCE_POINTS = 2000
/** Oltre questi punti non si offre la scelta del singolo punto. */
export const MAX_LISTED_POINTS = 300

/** Campione regolare di al massimo `max` punti, nell'ordine originale. */
export function samplePoints(points: Point[], max = MAX_SOURCE_POINTS): Point[] {
  if (points.length <= max) return points
  const step = points.length / max
  return Array.from({ length: max }, (_, i) => points[Math.floor(i * step)])
}

export function toFraction([x, y]: Point): [number, number] {
  return [(x - MAP_BOUNDS[0]) / (MAP_BOUNDS[2] - MAP_BOUNDS[0]), (y - MAP_BOUNDS[1]) / (MAP_BOUNDS[3] - MAP_BOUNDS[1])]
}

/** Da frazioni della mappa a coordinate di gioco (intere). */
export function fromFraction([a, b]: [number, number]): Point {
  return [Math.round(MAP_BOUNDS[0] + a * (MAP_BOUNDS[2] - MAP_BOUNDS[0])), Math.round(MAP_BOUNDS[1] + b * (MAP_BOUNDS[3] - MAP_BOUNDS[1]))]
}

export const tileLevel = (width: number, dpr: number) => Math.min(6, Math.max(2, Math.ceil(Math.log2((width * dpr) / BASE))))

/** Tile visibili (con un margine di una tile) per la larghezza e lo scorrimento correnti. */
export function visibleTiles(v: MapViewport, index: Record<string, number[]>): { level: number; tiles: MapTile[] } {
  if (!v.width) return { level: 2, tiles: [] }
  const level = tileLevel(v.width, v.dpr)
  const nativeWidth = BASE * 2 ** level
  const size = (v.width * TILE) / nativeWidth
  const cols = Math.ceil(nativeWidth / TILE)
  const rows = Math.ceil((nativeWidth * MAP_RATIO) / TILE)
  const startX = Math.max(0, Math.floor(v.scrollLeft / size) - 1)
  const startY = Math.max(0, Math.floor(v.scrollTop / size) - 1)
  const endX = Math.min(cols, Math.ceil((v.scrollLeft + v.clientWidth) / size) + 1)
  const endY = Math.min(rows, Math.ceil((v.scrollTop + v.clientHeight) / size) + 1)
  const tiles: MapTile[] = []
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const src = level === 2 ? `/game/map/overview/${x}-${y}.webp` : `/game/map/hd/${index[level][y * cols + x]}.webp`
      tiles.push({ key: `${level}_${x}-${y}`, src, left: x * size, top: y * size, size: size + 0.25 })
    }
  }
  return { level, tiles }
}

/** Segnaposti: il punto della scheda, oppure i punti di una fonte (numerati se pochi, puntini se più di 50). */
export function mapMarkers(point: Point | null, overview: Point[], name: string): MapMarker[] {
  if (point) {
    const [left, top] = toFraction(point)
    return [{ key: "point", left, top, label: "", title: name, kind: "point" }]
  }
  const dense = overview.length > 50
  return overview.map((p, i) => {
    const [left, top] = toFraction(p)
    return { key: String(i), left, top, label: dense ? "" : String(i + 1), title: `${name} · ${p.join(", ")}`, kind: dense ? "dot" : "pin" }
  })
}

/** Larghezza minima (mappa intera nel riquadro) e massima (livello 6 a piena risoluzione). */
export const minimumWidth = (clientWidth: number, clientHeight: number) => Math.max(64, Math.min(clientWidth - 2, clientHeight / MAP_RATIO))
export const maximumWidth = (min: number, dpr: number) => Math.max(min, 18432 / dpr)

/** Larghezza e centro iniziali: tutti i punti nel riquadro, oppure il punto ingrandito, oppure la mappa intera. */
export function initialView(point: Point | null, overview: Point[], clientWidth: number, clientHeight: number, min: number, max: number) {
  if (!point && overview.length) {
    const fr = overview.map(toFraction)
    const xs = fr.map((p) => p[0])
    const ys = fr.map((p) => p[1])
    const x = Math.min(...xs)
    const y = Math.min(...ys)
    const dx = Math.max(...xs) - x || 0.02
    const dy = Math.max(...ys) - y || 0.02
    return { width: Math.min((clientWidth - 48) / dx, ((clientHeight - 48) / MAP_RATIO) / dy), center: [x + dx / 2, y + dy / 2] as [number, number] }
  }
  return { width: point ? Math.min(5000, max) : min, center: point ? toFraction(point) : ([0.5, 0.5] as [number, number]) }
}
