// Regole del catalogo dell'originale: tipi, gruppi, ordinamento. Pure, usabili ovunque.
import type { CatalogEntry, CatalogQuery } from "./game.types"

export const DB_GROUPS: [string, string[]][] = [
  ["Equipaggiamento", ["Armi", "Armature", "Accessori", "Costumi", "Alianti", "Borse", "Strumenti"]],
  ["Oggetti", ["Materiali", "Consumabili", "Lunastones", "Arredamento", "Oggetti missione", "Altri oggetti"]],
  ["Produzione", ["Ricette", "Professioni", "Carichi commerciali", "Compagnie commerciali"]],
  ["Mondo", ["Boss", "Mob", "NPC", "Zone", "Nodi di raccolta", "Missioni", "Note", "Diario di caccia", "Abitazioni"]],
  ["Personaggio", ["Abilità", "Effetti di stato", "Statistiche", "Obiettivi", "Tipi di arma", "Guida di gioco"]],
]

const ITEM_TYPES: Record<string, string> = {
  weapon: "Armi", armor: "Armature", accessory: "Accessori", costume: "Costumi", bag: "Borse", tool: "Strumenti", glider: "Alianti",
  "crafting material": "Materiali", "reinforcement material": "Materiali", consumables: "Consumabili", furniture: "Arredamento",
  buildings: "Arredamento", "quest items": "Oggetti missione", recipes: "Ricette", notes: "Note",
}

/** Tipo mostrato nel catalogo: la categoria, o per gli "Oggetti" il tipo ricavato dalle etichette. */
export function dbType(entry: CatalogEntry) {
  if (entry[1] !== "Oggetti") return entry[1]
  const parts = entry[2].toLowerCase().split(" · ")
  return ITEM_TYPES[parts[1]] || ITEM_TYPES[parts[0]] || "Altri oggetti"
}

export const PAGE_SIZE = 72

/** Filtra e ordina come l'originale: tutte le parole cercate in nome, categoria ed etichette. */
export function searchCatalog(entries: [string, CatalogEntry][], query: CatalogQuery, rarityOf: (id: string) => string | undefined, levelOf: (id: string) => number) {
  const words = query.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  let found = entries.filter(([, e]) => (!query.type || dbType(e) === query.type) && (!query.category || query.category === e[1]) && words.every((w) => (e[0] + " " + e[1] + " " + e[2]).toLowerCase().includes(w)))
  if (query.rarity) found = found.filter(([id]) => rarityOf(id) === query.rarity)
  if (query.sort === "za") found = [...found].reverse()
  if (query.sort === "level") found = [...found].sort((a, b) => levelOf(b[0]) - levelOf(a[0]))
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  const page = Math.min(Math.max(0, query.page), pages - 1)
  return { total: found.length, pages, page, items: found.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) }
}
