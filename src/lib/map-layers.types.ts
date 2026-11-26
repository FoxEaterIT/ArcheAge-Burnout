// Livelli della mappa interattiva: gruppi, livelli e punti.
import type { Point } from "./game.types"

export type MapLayerGroupId = "alberi" | "minerali" | "piante" | "creature" | "png" | "produzione" | "commercio" | "oggetti"

/** Voce di un livello: nome, link alla scheda, dettaglio breve (livello, zona, tipo di fonte). */
export type MapLayerEntry = [name: string, href: string | null, detail: string]

/** Punti di un livello: x, y in coordinate di gioco e indice della voce. */
export type MapLayerData = { id: string; entries: MapLayerEntry[]; points: [number, number, number][] }

/** Livello senza punti, per il pannello: arriva alla pagina come prop. `on`: acceso alla prima apertura, quando l'indirizzo non sceglie i livelli. */
export type MapLayerInfo = { id: string; group: MapLayerGroupId; label: string; count: number; art: string | null; on: boolean }
export type MapLayerGroup = { id: MapLayerGroupId; label: string; layers: MapLayerInfo[] }

/** Dati da cui nascono i livelli: le fonti per oggetto dell'Atlante e il catalogo con le posizioni. */
export type MapLayerSources = {
  locations: { points: Point[][]; refs: Record<string, [string, number][]> }
  catalog: Record<string, [name: string, category: string, tags: string, text: string, point: Point | null, art: string | null, ...rest: unknown[]]>
}
