// Indice spaziale e raggruppamento dei segnaposti per il disegno su canvas.
import type { MapLayerData } from "./map-layers.types"
import type { ClusterOptions, DrawItem, LayerIndex, ScreenView } from "./map-cluster.types"
import { MAP_RATIO, toFraction } from "./map.utils"

/** Griglia fissa dell'indice: 96 × 128 celle, come il rapporto 3:4 della mappa. */
export const GRID_COLS = 96
export const GRID_ROWS = 128
/** Lato della cella di raggruppamento sullo schermo, in pixel CSS. */
export const CLUSTER_PX = 48

/** Ordina i punti di un livello per cella (formato CSR) e somma posizioni e conteggi di ogni cella. */
export function indexLayer(layer: MapLayerData): LayerIndex {
  const n = layer.points.length
  const fx = new Float32Array(n)
  const fy = new Float32Array(n)
  const cellOf = new Uint32Array(n)
  const counts = new Uint32Array(GRID_COLS * GRID_ROWS)
  layer.points.forEach(([x, y], i) => {
    const [a, b] = toFraction([x, y])
    fx[i] = a
    fy[i] = b
    const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(a * GRID_COLS)))
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(b * GRID_ROWS)))
    cellOf[i] = row * GRID_COLS + col
    counts[cellOf[i]]++
  })
  const start = new Uint32Array(GRID_COLS * GRID_ROWS + 1)
  for (let c = 0; c < counts.length; c++) start[c + 1] = start[c] + counts[c]
  const fill = start.slice(0, -1)
  const order = new Uint32Array(n)
  const sumX = new Float64Array(counts.length)
  const sumY = new Float64Array(counts.length)
  for (let i = 0; i < n; i++) {
    const c = cellOf[i]
    order[fill[c]++] = i
    sumX[c] += fx[i]
    sumY[c] += fy[i]
  }
  return { id: layer.id, fx, fy, start, order, sumX, sumY }
}

/** Posizione sullo schermo di una frazione della mappa: il palco è centrato quando è più stretto del riquadro. */
export function toScreen(view: ScreenView, fx: number, fy: number): [number, number] {
  const offset = Math.max(0, (view.clientWidth - view.width) / 2)
  return [fx * view.width + offset - view.scrollLeft, fy * view.width * MAP_RATIO - view.scrollTop]
}

/** Da un punto del riquadro (pixel) alla frazione della mappa sotto di esso. */
export function fromScreen(view: ScreenView, sx: number, sy: number): [number, number] {
  const offset = Math.max(0, (view.clientWidth - view.width) / 2)
  return [(sx + view.scrollLeft - offset) / view.width, (sy + view.scrollTop) / (view.width * MAP_RATIO)]
}

/** Celle dell'indice visibili nel riquadro, con un margine di una cella. */
export function visibleCells(view: ScreenView) {
  const offset = Math.max(0, (view.clientWidth - view.width) / 2)
  const height = view.width * MAP_RATIO
  const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v))
  return {
    col0: clamp(Math.floor(((view.scrollLeft - offset) / view.width) * GRID_COLS) - 1, GRID_COLS - 1),
    col1: clamp(Math.ceil(((view.scrollLeft - offset + view.clientWidth) / view.width) * GRID_COLS), GRID_COLS - 1),
    row0: clamp(Math.floor((view.scrollTop / height) * GRID_ROWS) - 1, GRID_ROWS - 1),
    row1: clamp(Math.ceil(((view.scrollTop + view.clientHeight) / height) * GRID_ROWS), GRID_ROWS - 1),
  }
}

type Bucket = { x: number; y: number; count: number; layers: Map<string, number>; single: { layer: string; index: number } | null }

/**
 * Segnaposti da disegnare nella vista. Da lontano somma le celle dell'indice (costo per cella, non per punto);
 * da vicino raggruppa i singoli punti in celle di `CLUSTER_PX`; con `spread` li disegna tutti separati.
 * Da vicino ogni livello si raggruppa per conto suo (un gruppo, una categoria); da lontano i livelli si fondono
 * e il gruppo prende il livello più presente, altrimenti i cerchi delle categorie si coprirebbero a vicenda.
 */
export function clusterView(layers: LayerIndex[], view: ScreenView, options: ClusterOptions = {}): DrawItem[] {
  if (!view.width || !view.clientWidth) return []
  const { spread = false, hidden, pinned } = options
  const cellPx = view.width / GRID_COLS
  const aggregate = !spread && cellPx < CLUSTER_PX * 0.75
  const { col0, col1, row0, row1 } = visibleCells(view)
  const buckets = new Map<number, Bucket>()
  const items: DrawItem[] = []
  const put = (slot: number, sx: number, sy: number, count: number, layer: string, index: number) => {
    if (sx < -CLUSTER_PX || sy < -CLUSTER_PX || sx > view.clientWidth + CLUSTER_PX || sy > view.clientHeight + CLUSTER_PX) return
    if (spread) {
      items.push({ kind: "point", sx, sy, layer, index })
      return
    }
    // Celle di schermo per livello: righe e colonne restano sotto 1.024 anche allo zoom massimo.
    const key = ((aggregate ? 0 : slot) * 1024 + Math.floor(sy / CLUSTER_PX) + 2) * 1024 + Math.floor(sx / CLUSTER_PX) + 2
    let b = buckets.get(key)
    if (!b) {
      b = { x: 0, y: 0, count: 0, layers: new Map(), single: count === 1 && index >= 0 ? { layer, index } : null }
      buckets.set(key, b)
    } else b.single = null
    b.x += sx * count
    b.y += sy * count
    b.count += count
    b.layers.set(layer, (b.layers.get(layer) ?? 0) + count)
  }
  layers.forEach((layer, slot) => {
    const skip = hidden?.get(layer.id)
    for (let row = row0; row <= row1; row++) {
      for (let col = col0; col <= col1; col++) {
        const c = row * GRID_COLS + col
        const from = layer.start[c]
        const to = layer.start[c + 1]
        if (from === to) continue
        if (aggregate && !skip?.size) {
          const count = to - from
          const [sx, sy] = toScreen(view, layer.sumX[c] / count, layer.sumY[c] / count)
          put(slot, sx, sy, count, layer.id, count === 1 ? layer.order[from] : -1)
          continue
        }
        for (let k = from; k < to; k++) {
          const i = layer.order[k]
          if (skip?.has(i)) continue
          const [sx, sy] = toScreen(view, layer.fx[i], layer.fy[i])
          // Il punto scelto resta sempre un punto, fuori dai gruppi.
          if (pinned && pinned.layer === layer.id && pinned.index === i) items.push({ kind: "point", sx, sy, layer: layer.id, index: i })
          else put(slot, sx, sy, 1, layer.id, i)
        }
      }
    }
  })
  // Due celle vicine possono avere i baricentri quasi sovrapposti: si fondono con le celle accanto (stesso livello).
  const NEIGHBOURS = [1, 1023, 1024, 1025]
  for (const [key, b] of [...buckets].sort((a, z) => a[0] - z[0])) {
    if (!buckets.has(key)) continue
    for (const step of NEIGHBOURS) {
      const other = buckets.get(key + step)
      if (!other || Math.hypot(b.x / b.count - other.x / other.count, b.y / b.count - other.y / other.count) > CLUSTER_PX * 0.6) continue
      b.x += other.x
      b.y += other.y
      b.count += other.count
      for (const [id, n] of other.layers) b.layers.set(id, (b.layers.get(id) ?? 0) + n)
      b.single = null
      buckets.delete(key + step)
    }
  }
  for (const b of buckets.values()) {
    const sx = b.x / b.count
    const sy = b.y / b.count
    if (b.single) items.push({ kind: "point", sx, sy, layer: b.single.layer, index: b.single.index })
    else {
      let top = ""
      let most = -1
      for (const [id, n] of b.layers) if (n > most) [top, most] = [id, n]
      items.push({ kind: "cluster", sx, sy, count: b.count, layer: top })
    }
  }
  return items
}

/**
 * Punti dei livelli che cadono nel riquadro, senza raggruppare: per l'elenco accessibile e per il percorso.
 * Restituisce al massimo `limit` punti e il totale contato, così chi chiama sa se deve chiedere di ingrandire.
 */
export function pointsInView(layers: LayerIndex[], view: ScreenView, limit: number, hidden?: Map<string, Set<number>>) {
  const found: { layer: string; index: number; sx: number; sy: number }[] = []
  let total = 0
  if (!view.width || !view.clientWidth) return { found, total }
  const { col0, col1, row0, row1 } = visibleCells(view)
  for (const layer of layers) {
    const skip = hidden?.get(layer.id)
    for (let row = row0; row <= row1; row++) {
      for (let col = col0; col <= col1; col++) {
        const c = row * GRID_COLS + col
        for (let k = layer.start[c]; k < layer.start[c + 1]; k++) {
          const i = layer.order[k]
          if (skip?.has(i)) continue
          const [sx, sy] = toScreen(view, layer.fx[i], layer.fy[i])
          if (sx < 0 || sy < 0 || sx > view.clientWidth || sy > view.clientHeight) continue
          total++
          if (found.length < limit) found.push({ layer: layer.id, index: i, sx, sy })
        }
      }
    }
  }
  return { found, total }
}

/** Raggio di disegno (e di clic) di un segnaposto. */
export const itemRadius = (item: DrawItem, large: boolean) => (item.kind === "cluster" ? 13 + Math.min(10, Math.log10(item.count) * 4) : large ? 13 : 6)

/** Il segnaposto più vicino al punto del clic, entro il suo raggio più un margine per le dita. */
export function hitTest(items: DrawItem[], x: number, y: number, large: boolean): DrawItem | null {
  let best: DrawItem | null = null
  let bestDistance = Infinity
  for (const item of items) {
    const d = Math.hypot(item.sx - x, item.sy - y)
    if (d <= itemRadius(item, large) + 6 && d < bestDistance) [best, bestDistance] = [item, d]
  }
  return best
}

/** Conteggio breve per i gruppi: 980, 1,2k, 37k. */
export function shortCount(n: number) {
  if (n < 1000) return String(n)
  if (n < 10_000) return (Math.round(n / 100) / 10).toLocaleString("it-IT") + "k"
  return Math.round(n / 1000) + "k"
}
