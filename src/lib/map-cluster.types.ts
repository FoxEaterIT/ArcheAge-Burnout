// Disegno dei segnaposti: indice spaziale di un livello, vista sullo schermo, elementi da disegnare.

/** Livello indicizzato: posizioni in frazioni della mappa, punti ordinati per cella, somme per cella. */
export type LayerIndex = {
  id: string
  fx: Float32Array
  fy: Float32Array
  /** Inizio dei punti di ogni cella in `order` (una voce in più per la fine). */
  start: Uint32Array
  order: Uint32Array
  sumX: Float64Array
  sumY: Float64Array
}

/** Vista: larghezza del palco e scorrimento del riquadro, in pixel CSS. */
export type ScreenView = { width: number; scrollLeft: number; scrollTop: number; clientWidth: number; clientHeight: number }

/** `spread`: nessun raggruppamento (zoom massimo). `hidden`: punti da non disegnare, per livello. `pinned`: punto mai raggruppato. */
export type ClusterOptions = { spread?: boolean; hidden?: Map<string, Set<number>>; pinned?: { layer: string; index: number } | null }

export type DrawItem =
  | { kind: "point"; sx: number; sy: number; layer: string; index: number }
  | { kind: "cluster"; sx: number; sy: number; count: number; layer: string }

/** Livello acceso, pronto per il canvas: indice, colore del gruppo e icona di gioco. */
export type CanvasLayer = { id: string; index: LayerIndex; color: string; art: string | null }

/** Colori letti dai token di `globals.css`, perché il canvas non conosce le variabili CSS. */
export type CanvasPalette = { bg: string; surface: string; ink: string; gold: string; font: string }

/**
 * Cosa disegnare: livelli accesi, punti raccolti (attenuati, o nascosti con `hideDone`), punto scelto,
 * tappe del percorso, punti della ricerca di un oggetto; `spread` allo zoom massimo.
 */
export type MapScene = {
  layers: CanvasLayer[]
  done: Map<string, Set<number>>
  hideDone: boolean
  selected: { layer: string; index: number } | null
  route: { x: number; y: number }[]
  search: LayerIndex | null
  spread: boolean
}
