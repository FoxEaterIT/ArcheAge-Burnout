// Costruisce la scheda come `renderRecord` dell'originale: stesse sezioni, stesso ordine, stessi testi.
import "server-only"
import { firstCalculableTier } from "./craft.utils"
import { samplePoints } from "./map.utils"
import {
  acquisition, artOf, dismantling, gameItems, hasRecord, itemLocations, itemUses, lootSources, lunastoneRanges, materialPoints, nameOf, recipeBook, tradeRoutes, worldCatalog,
} from "./game-data.utils"
import type { RecipeTier } from "./game.types"
import type { MapSearchOverlay } from "./map-explorer.types"
import type { EntryLink, PositionsSection, RecipeModel, RecordModel, UsesSection } from "./record.types"
import { deliveryOnly, ingredients, multiplyIngredient, rewardName } from "./text.utils"
import { PACKS_PER_BATCH, recordHref, routeStops } from "./trade.utils"

const FUTURE = /coming soon|not available yet/i

export function link(id: string, fallbackName?: string): EntryLink {
  const known = hasRecord(id)
  return { id, name: known ? nameOf(id) : fallbackName ?? nameOf(id), art: artOf(id), href: worldCatalog[id] || known ? recordHref(id) : null }
}

export function locationStatus(id: string) {
  return FUTURE.test(gameItems[id]?.[4] ?? "")
    ? "Il catalogo segnala questo oggetto come contenuto futuro. Nessun punto di acquisizione verificato."
    : "Nessuna posizione di acquisizione verificata nelle fonti consultate."
}

function usesSection(id: string): UsesSection | null {
  const usage = itemUses[id]
  const entry = worldCatalog[id]
  if (!usage) return null
  const lines: string[] = []
  const tags = entry?.[2].split(" · ") ?? []
  if (tags[0] === "Equipment" && tags.length > 3 && !/coming soon|cannot be equipped/i.test(usage.text)) lines.push("Equipaggiamento · " + tags.slice(1, -2).join(" · "))
  if (tags[0] === "Furniture") lines.push("Arredo per la casa.")
  if (entry?.[1] === "Lunastones") lines.push("Pietra per gli alloggiamenti compatibili dell’equipaggiamento.")
  if (tags[0] === "Notes") lines.push("Documento consultabile per la storia di Auroria.")
  if (usage.text) lines.push(usage.text)
  const groups = Object.entries(usage.links).map(([title, targets]) => ({
    title,
    open: targets.length <= 5,
    items: targets.map(([target, note]) => ({ ...link(target), note })),
  }))
  return { lines, groups, empty: !groups.length && !id.startsWith("cargo-") }
}

/** Ricette che producono la voce, con la catena degli intermedi già risolta per il calcolatore. */
function recipeModels(id: string): RecipeModel[] {
  const matching = id.startsWith("recipes/") ? [[id.slice(8), recipeBook[id.slice(8)]] as const] : Object.entries(recipeBook).filter(([, r]) => r[0] === id)
  return matching.flatMap(([key, recipe]) => {
    if (!recipe) return []
    const [result, profession, stations, tiers] = recipe
    const subTiers: Record<string, RecipeTier> = {}
    const ids = new Set<string>([result])
    const labels = new Map<string, string>()
    const visit = (tier: RecipeTier) => {
      for (const [child, label] of tier[1]) {
        ids.add(child)
        const dose = /^[0-9,]+\s*×\s*(.+)$/.exec(label)
        if (dose && !labels.has(child)) labels.set(child, dose[1])
        if (child in subTiers) continue
        const next = firstCalculableTier(child, recipeBook)
        if (next) {
          subTiers[child] = next
          visit(next)
        }
      }
    }
    tiers.forEach(visit)
    const entries: Record<string, EntryLink> = {}
    // Come l'originale: per gli id senza scheda il nome viene dalla dose della ricetta.
    for (const each of ids) entries[each] = link(each, labels.get(each))
    return [{
      key,
      result,
      title: "Come produrre " + (worldCatalog[result]?.[0] ?? worldCatalog["recipes/" + key]?.[0] ?? nameOf(result)),
      note: key === "standard-leather" ? "Patch 25 novembre: 6 Raw Pelt per la ricetta base. Le dosi dei livelli 2 e 4 sono ancora precedenti alla patch e da verificare." : null,
      meta: [stations.join(" / "), profession].filter(Boolean).join(" · "),
      tiers,
      subTiers,
      entries,
    }]
  })
}

function positionsSection(id: string): PositionsSection | null {
  const sources = itemLocations.refs[id]
  if (!sources?.length) return null
  const gathering = sources.findIndex(([label]) => label.startsWith("Raccolta"))
  const dewdrop = id === "evening-dewdrop"
  return {
    intro: dewdrop ? "Raccogli gli Evening Dew Bellflower a Diamond Shores, Gylden Ruins o Astron Plains. Anche i forzieri di Mailgrove, ad Astron Plains, possono contenerlo. I numeri sulla mappa indicano i sei fiori. Seleziona un punto per ingrandirlo." : null,
    sources: sources.map(([label, key]) => ({ label, points: samplePoints(itemLocations.points[key]), total: itemLocations.points[key].length })),
    defaultSource: Math.max(0, gathering),
    flowers: dewdrop,
  }
}

export function buildRecord(id: string): RecordModel | null {
  if (!hasRecord(id)) return null
  const entry = worldCatalog[id]
  const item = gameItems[id]
  const name = nameOf(id)

  const outgoing = tradeRoutes.filter((r) => r.cargo === name)
  const positions = positionsSection(id)
  const point = item?.[5] ?? materialPoints[id] ?? null
  const catalogPoint = !item && entry?.[4] && !itemLocations.refs[id] ? entry[4] : null
  // Come l'originale: senza fonti, gli id senza "/" mostrano lo stato; gli altri ripiegano sul punto della scheda.
  const noSourcesStatus = !positions && !id.includes("/") ? locationStatus(id) : null
  const mapPoint = positions || noSourcesStatus ? catalogPoint : point ?? catalogPoint
  const status = !positions && !noSourcesStatus && !mapPoint && !entry?.[4] ? locationStatus(id) : null

  const salvageShown = id in dismantling || id in acquisition || /material/i.test(item?.[1] ?? "")
  const recipes = recipeModels(id)
  const uses = usesSection(id)
  const rewardRoutes = tradeRoutes.filter((r) => rewardName(r.payout) === name).map((r) => `${r.origin} → ${r.destination} · ${r.cargo} · ${r.payout}`)

  const model: RecordModel = {
    id,
    name,
    category: entry?.[1] ?? null,
    art: artOf(id),
    itemLine: item ? [item[1], item[2], item[3] && "Livello " + item[3]].filter(Boolean).join(" · ") : null,
    uses,
    lunastone: entry?.[1] === "Lunastones" ? (lunastoneRanges[id]?.map(([stat, range]) => ({ stat, range })) ?? "unknown") : null,
    catalogTexts: entry && !item ? [entry[2], entry[3]].filter(Boolean) : [],
    droppedBy: id.includes("/") ? [] : (lootSources.get(id) ?? []).map(([actor, amount, chance]) => ({ ...link(actor), note: `${amount} × · ${chance}` })),
    loot: (entry?.[6] ?? []).map(([target, amount, chance]) => ({ ...link(target, target.replaceAll("-", " ")), note: `${amount} × · ${chance}` })),
    cargo: outgoing.length
      ? {
          origin: outgoing[0].origin,
          recipe: outgoing[0].recipe,
          deliveryOnly: deliveryOnly(outgoing[0].recipe),
          batch: ingredients(outgoing[0].recipe).map((i) => multiplyIngredient(i, PACKS_PER_BATCH)),
          stops: routeStops(outgoing),
        }
      : null,
    salvageYields: Object.entries(dismantling).flatMap(([material, rows]) => rows.filter((r) => r[3] === id).map((r) => ({ ...link(material, gameItems[material]?.[0]), note: `${r[1]} × · ${r[2]}%` }))),
    description: item?.[4] || null,
    salvage: salvageShown
      ? dismantling[id]?.length
        ? { material: link(id), items: dismantling[id].map(([gear, quantity, chance, source]) => ({ gear: link(source, gear), quantity: String(quantity), chance: String(chance) })) }
        : "none"
      : null,
    recipes,
    positions,
    positionsStatus: noSourcesStatus,
    mapPoint,
    status,
    notes: acquisition[id] ?? [],
    rewardRoutes,
    shortcuts: [],
  }
  model.shortcuts = [
    recipes.length && { id: "produzione", label: "Produzione" },
    (model.salvage || model.salvageYields.length) && { id: "smontaggio", label: "Smontaggio" },
    (positions || noSourcesStatus || mapPoint) && { id: "mappa", label: "Mappa" },
    uses && { id: "utilizzi", label: "Utilizzi" },
    rewardRoutes.length && { id: "tratte", label: "Tratte" },
  ].filter((s): s is { id: string; label: string } => Boolean(s))
  return model
}

/** Ricerca di un oggetto sulla mappa interattiva: le sue fonti, oppure il punto della scheda; null se non ha posizioni. */
export function mapSearchOverlay(record: RecordModel): MapSearchOverlay | null {
  const href = recordHref(record.id)
  if (record.positions) return { name: record.name, href, intro: record.positions.intro, sources: record.positions.sources, defaultSource: record.positions.defaultSource }
  if (record.mapPoint) return { name: record.name, href, intro: null, sources: [{ label: "Punto della scheda", points: [record.mapPoint], total: 1 }], defaultSource: 0 }
  return null
}
