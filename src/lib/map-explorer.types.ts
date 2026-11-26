// Stato della mappa interattiva: indirizzo condivisibile, punto scelto, percorso.
import type { Point } from "./game.types"
import type { LayerIndex } from "./map-cluster.types"
import type { MapLayerData, MapLayerGroup, MapLayerGroupId, MapLayerInfo } from "./map-layers.types"

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

/** Voce di un segnaposto, per la sua scheda breve. */
export type PointEntry = { name: string; href: string | null; detail: string }

/** Punto scelto, pronto per la sua scheda breve: tutte le voci che stanno in quella posizione. `focus`: scelto da tastiera. */
export type SelectedPoint = { ref: MapPointRef; index: number; entries: PointEntry[]; layerLabel: string; group: MapLayerGroupId | null; done: boolean; focus: boolean }

export type MapPanelLayer = { info: MapLayerInfo; on: boolean; loading: boolean; failed: boolean; count: string; done: number }
export type MapPanelGroup = { group: MapLayerGroup; ids: string[]; expanded: boolean; swatch: string; checked: boolean | "indeterminate"; total: string; layers: MapPanelLayer[] }

/** Pannello dei livelli: valori pronti e azioni stabili (non cambiano mentre si trascina la mappa). */
export type MapPanelModel = {
  groups: MapPanelGroup[]
  filter: string
  setFilter: (value: string) => void
  open: boolean
  toggleOpen: () => void
  toggleId: string
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
  setExpanded: (id: string, open: boolean) => void
  activeCount: number
  toggle: (id: string) => void
  setGroup: (ids: string[], on: boolean) => void
  all: () => void
  none: () => void
  clearDone: (layerId: string) => void
  hideDone: boolean
  setHideDone: (value: boolean) => void
}

/** Percorso per il suo pannello. */
export type MapRouteModel = {
  stops: RouteStop[]
  editing: boolean
  lengthLabel: string
  toggleEditing: () => void
  remove: (index: number) => void
  optimize: () => void
  reverse: () => void
  clear: () => void
  fromView: () => void
}

/** Ricerca di un oggetto sovrapposta ai livelli: nome, scheda e fonti con i loro punti. */
export type MapSearchOverlay = { name: string; href: string; intro: string | null; sources: { label: string; points: Point[]; total: number }[]; defaultSource: number }

/** Segnaposto visibile per l'elenco accessibile sotto la mappa. */
export type VisibleMarker = { key: string; layer: string; index: number; name: string; detail: string }
