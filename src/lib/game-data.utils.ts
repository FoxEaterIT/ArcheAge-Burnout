// Dati di gioco, solo lato server: i file sono grandi e non devono finire nel bundle del browser.
import "server-only"
import acquisitionJson from "@/data/generated/acquisition.json"
import benchesJson from "@/data/generated/benches.json"
import dismantlingJson from "@/data/generated/dismantling.json"
import gameItemsJson from "@/data/generated/game-items.json"
import itemLocationsJson from "@/data/generated/item-locations.json"
import itemUsesJson from "@/data/generated/item-uses.json"
import lunastoneJson from "@/data/generated/lunastone-ranges.json"
import materialPointsJson from "@/data/generated/material-points.json"
import recipeBookJson from "@/data/generated/recipe-book.json"
import routesJson from "@/data/generated/trade-routes.json"
import worldCatalogJson from "@/data/generated/world-catalog.json"
import { DB_GROUPS, dbType, searchCatalog } from "./catalog.utils"
import { itemSlug } from "./text.utils"
import type { Bench, CatalogEntry, CatalogQuery, CatalogResults, CatalogRow, CatalogTypeLink, GameItem, ItemLocations, ItemUse, Point, Recipe, Salvage, TradeRoute } from "./game.types"

export const tradeRoutes: TradeRoute[] = (routesJson as string[][]).map(([origin, cargo, destination, payout, recipe]) => ({ origin, cargo, destination, payout, recipe }))
export const benches = benchesJson as Bench[]
export const worldCatalog = worldCatalogJson as unknown as Record<string, CatalogEntry>
export const acquisition = acquisitionJson as Record<string, string[]>
export const materialPoints = materialPointsJson as unknown as Record<string, Point>
export const dismantling = dismantlingJson as unknown as Record<string, Salvage[]>
export const itemLocations = itemLocationsJson as unknown as ItemLocations
export const recipeBook = recipeBookJson as unknown as Record<string, Recipe>
export const itemUses = itemUsesJson as unknown as Record<string, ItemUse>
export const lunastoneRanges = lunastoneJson as unknown as Record<string, [string, string][]>

/** Come l'originale: i carichi commerciali senza scheda di gioco ricevono una voce `cargo-<slug>`. */
export const gameItems: Record<string, GameItem> = { ...(gameItemsJson as unknown as Record<string, GameItem>) }
{
  const names = new Set(Object.values(gameItems).map((e) => e[0]))
  for (const { cargo } of tradeRoutes) if (!names.has(cargo)) gameItems["cargo-" + itemSlug(cargo)] = [cargo, "Carico commerciale", "", "", "", null]
}

export const catalogEntries: [string, CatalogEntry][] = Object.entries(worldCatalog).sort((a, b) => a[1][0].localeCompare(b[1][0]))

/** Chi rilascia un oggetto: id → [attore, quantità, probabilità]. */
export const lootSources = new Map<string, [string, string | number, string][]>()
for (const [id, entry] of catalogEntries) {
  for (const [item, amount, chance] of entry[6]) {
    if (!lootSources.has(item)) lootSources.set(item, [])
    lootSources.get(item)!.push([id, amount, chance])
  }
}

export const rarities = [...new Set(Object.values(gameItems).map((r) => r[2]).filter(Boolean))].sort()
export const categories = [...new Set(catalogEntries.map(([, e]) => e[1]))].sort()
export const rarityOf = (id: string) => gameItems[id]?.[2]
export const levelOf = (id: string) => Number(gameItems[id]?.[3]) || 0

/** Nome da mostrare per un id: catalogo, oggetti di gioco, oppure lo slug leggibile. */
export function nameOf(id: string) {
  return worldCatalog[id]?.[0] ?? gameItems[id]?.[0] ?? id.replaceAll("-", " ")
}

/** Un id ha una scheda se compare in almeno una delle fonti che la scheda mostra. */
export function hasRecord(id: string) {
  return id in worldCatalog || id in gameItems || id in acquisition || id in dismantling || id in materialPoints
}

/** Carico → id della sua scheda nel catalogo. */
export const cargoRecordIds: Record<string, string> = Object.fromEntries(
  catalogEntries.filter(([, e]) => e[1] === "Carichi commerciali").map(([id, e]) => [e[0], id]),
)

/** Arte rappresentativa di ogni categoria: la prima voce con arte, al posto dei glifi Unicode dell'originale. */
export const categoryArt: Record<string, string> = {}
for (const [, e] of catalogEntries) if (e[5] && !categoryArt[e[1]]) categoryArt[e[1]] = e[5]

export const artFor = (entry: CatalogEntry | undefined) => (entry ? entry[5] ?? categoryArt[entry[1]] ?? null : null)
export const artOf = (id: string) => artFor(worldCatalog[id])

const typed = catalogEntries.map(([id, e]) => ({ id, e, type: dbType(e) }))

export function catalogRow(id: string, e: CatalogEntry, type = dbType(e)): CatalogRow {
  return { id, name: e[0], category: e[1], type, rarity: rarityOf(id) ?? "", level: gameItems[id]?.[3] ?? "", art: artFor(e) }
}

/** Gruppi della home: per ogni tipo il numero di voci e l'arte della prima voce che ne ha una. */
export const catalogGroups: [string, CatalogTypeLink[]][] = DB_GROUPS.map(([title, types]) => [
  title,
  types.flatMap((type) => {
    const found = typed.filter((t) => t.type === type)
    if (!found.length) return []
    return [{ type, count: found.length, art: (found.find((t) => t.e[5]) ?? found[0]).e[5] ?? categoryArt[found[0].e[1]] ?? null }]
  }),
])

/** Equipaggiamento leggendario in vetrina, come nell'originale (i primi 9 con arte). */
export const featuredGear: CatalogRow[] = typed
  .filter((t) => t.e[1] === "Oggetti" && /Equipment.*Legendary/.test(t.e[2]) && t.e[5])
  .slice(0, 9)
  .map((t) => catalogRow(t.id, t.e, t.type))

export function runCatalogSearch(query: CatalogQuery): CatalogResults {
  const r = searchCatalog(catalogEntries, query, rarityOf, levelOf)
  return { total: r.total, pages: r.pages, page: r.page, rows: r.items.map(([id, e]) => catalogRow(id, e)) }
}
