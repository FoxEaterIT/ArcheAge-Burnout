// Forma dei dati estratti dall'originale (src/data/generated).

export type Point = [number, number]
/** Voce di catalogo: nome, categoria, etichette, testo, punto sulla mappa, arte, bottino [id, quantità, probabilità]. */
export type CatalogEntry = [string, string, string, string, Point | null, string | null, [string, string | number, string][]]
/** Oggetto di gioco: nome, tipo, rarità, livello, descrizione, punto sulla mappa. */
export type GameItem = [string, string, string, string, string, Point | null]
/** Livello di ricetta: nome del livello, ingredienti [id, "N × Nome"], quantità prodotta, costo. */
export type RecipeTier = [string, [string, string][], string, string]
/** Ricetta: risultato, professione, banchi, livelli, note. */
export type Recipe = [string, string, string[], RecipeTier[], string]
export type ItemUse = { text: string; links: Record<string, [string, string][]> }
export type ItemLocations = { points: Point[][]; refs: Record<string, [string, number][]> }
/** Smontaggio: pezzo, quantità, probabilità %, id del pezzo. */
export type Salvage = [string, string | number, string | number, string]
export type TradeRoute = { origin: string; cargo: string; destination: string; payout: string; recipe: string }
export type Bench = { name: string; recipes: { cargo: string; cost: string; deliveries: { destination: string; reward: string }[] }[] }
export type TemperTable = { weapon: boolean; pct: Record<string, number>; exact: Record<string, [number, number]> }
/** Tratto: classe, ramo (arma), nome, gruppo, punti. */
export type Trait = [string, string, string, string, number]

export type CatalogSort = "az" | "za" | "level"
export type CatalogQuery = { q: string; type: string; category: string; rarity: string; sort: CatalogSort; page: number; all: boolean }

/** Pezzo di testo: libero, oppure un nome di gioco con icona e scheda. */
export type Segment = string | { name: string; icon: string; href: string | null }

export type RewardKind = "" | "item" | "gold"
export type TradeFilters = { target: string; query: string; origin: string; destination: string; kind: RewardKind }
export type CargoGroup = { origin: string; cargo: string; recipe: string; routes: TradeRoute[] }
/** Fermata della linea: destinazione, ricompensa, oro se è oro, `best` se è il ricavo più alto in oro. */
export type RouteStop = { destination: string; payout: string; gold: number | null; best: boolean }

/** Riga del catalogo pronta per la tabella. */
export type CatalogRow = { id: string; name: string; category: string; type: string; rarity: string; level: string; art: string | null }
export type CatalogTypeLink = { type: string; count: number; art: string | null }
export type CatalogResults = { total: number; pages: number; page: number; rows: CatalogRow[] }
