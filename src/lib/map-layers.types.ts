// Livelli della mappa interattiva: gruppi, livelli e punti.
import type { Point } from "./game.types"

export type MapLayerGroupId = "alberi" | "minerali" | "piante" | "creature" | "png" | "produzione" | "commercio" | "oggetti"

/** Voce di un livello: nome, link alla scheda, dettaglio breve (livello, zona, tipo di fonte). */
export type MapLayerEntry = [name: string, href: string | null, detail: string]

/**
 * Punti di un livello: x, y in coordinate di gioco e gli indici delle voci che stanno lì.
 * Un punto per posizione: più voci nello stesso posto (oggetti di uno stesso forziere, varianti di un mostro)
 * sono un solo segnaposto, con tutte le voci nella sua scheda.
 */
export type MapLayerPoint = [x: number, y: number, ...entries: number[]]
export type MapLayerData = { id: string; entries: MapLayerEntry[]; points: MapLayerPoint[] }

/** Livello senza punti, per il pannello: arriva alla pagina come prop. `on`: acceso alla prima apertura, quando l'indirizzo non sceglie i livelli. */
export type MapLayerInfo = { id: string; group: MapLayerGroupId; label: string; count: number; art: string | null; on: boolean }
export type MapLayerGroup = { id: MapLayerGroupId; label: string; layers: MapLayerInfo[] }

/** Dati da cui nascono i livelli: le fonti per oggetto dell'Atlante e il catalogo con le posizioni. */
export type MapLayerSources = {
  locations: { points: Point[][]; refs: Record<string, [string, number][]> }
  catalog: Record<string, [name: string, category: string, tags: string, text: string, point: Point | null, art: string | null, ...rest: unknown[]]>
}
