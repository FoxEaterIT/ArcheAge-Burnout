// Stato della mappa interattiva: indirizzo condivisibile, punto scelto, percorso.
import type { Point } from "./game.types"
import type { LayerIndex } from "./map-cluster.types"
import type { MapLayerData, MapLayerGroupId } from "./map-layers.types"

/** Punto di un livello, riconosciuto da livello e coordinate: resta valido anche se i dati si rigenerano. */
export type MapPointRef = { layer: string; x: number; y: number }

/**
 * Stato nell'indirizzo. `layers` null: nessuna scelta, valgono i livelli accesi all'inizio.
 * `zoom`: larghezza del palco diviso 1.152 (la mappa intera a livello 2).
 */
export type MapUrlState = { layers: string[] | null; center: Point | null; zoom: number | null; point: MapPointRef | null; route: Point[] }

/** Tappa di un percorso: coordinate e, se agganciata a un segnaposto, il suo nome. */
export type RouteStop = { x: number; y: number; name: string | null }

/** Livello scaricato e indicizzato, pronto per il disegno. */
export type LayerBundle = { data: MapLayerData; index: LayerIndex }

/** Punto scelto, pronto per la sua scheda breve. */
export type SelectedPoint = { ref: MapPointRef; index: number; name: string; href: string | null; detail: string; layerLabel: string; group: MapLayerGroupId | null; done: boolean }

/** Ricerca di un oggetto sovrapposta ai livelli: nome, scheda e fonti con i loro punti. */
export type MapSearchOverlay = { name: string; href: string; intro: string | null; sources: { label: string; points: Point[]; total: number }[]; defaultSource: number }

/** Segnaposto visibile per l'elenco accessibile sotto la mappa. */
export type VisibleMarker = { key: string; layer: string; index: number; name: string; detail: string }
