// Livelli della mappa interattiva, costruiti dalle fonti per oggetto dell'Atlante e dalle posizioni del catalogo.
import type { MapLayerData, MapLayerEntry, MapLayerGroup, MapLayerGroupId, MapLayerInfo, MapLayerPoint, MapLayerSources } from "./map-layers.types"
import { itemSlug } from "./text.utils"
import { recordHref } from "./trade.utils"

export const MAP_LAYER_GROUPS: [MapLayerGroupId, string][] = [
  ["alberi", "Alberi"],
  ["minerali", "Minerali"],
  ["piante", "Piante"],
  ["creature", "Creature"],
  ["png", "PNG"],
  ["produzione", "Produzione"],
  ["commercio", "Commercio"],
  ["oggetti", "Oggetti"],
]

/** Livelli fissi: gruppo, nome e categoria del catalogo da cui prendere l'icona. */
const FIXED_LAYERS: Record<string, [MapLayerGroupId, string, string]> = {
  mostri: ["creature", "Mostri", "Mob"],
  boss: ["creature", "Boss", "Boss"],
  png: ["png", "PNG", "NPC"],
  venditori: ["png", "Venditori", "Compagnie commerciali"],
  missioni: ["png", "Missioni e doni", "Missioni"],
  banchi: ["produzione", "Banchi di produzione", "Ricette"],
  commercio: ["commercio", "Banchi commerciali", "Carichi commerciali"],
  interazioni: ["oggetti", "Interazioni e documenti", "Note"],
  oggetti: ["oggetti", "Posizioni degli oggetti", "Oggetti"],
  zone: ["oggetti", "Ricompense di zona", "Obiettivi"],
}

/** Gli alberi, i minerali e le piante della raccolta si riconoscono dal nome del nodo. */
export function gatheringGroup(source: string): MapLayerGroupId {
  if (/tree/i.test(source)) return "alberi"
  if (/vein|rock|archeum|meteor/i.test(source)) return "minerali"
  return "piante"
}

const DEFAULT_LAYERS = new Set(["boss", "banchi", "commercio"])
/** Livelli accesi alla prima apertura: pochi punti, utili a tutti; la raccolta si accende a scelta. */
export const isDefaultLayer = (id: string, group: MapLayerGroupId) => DEFAULT_LAYERS.has(id) || group === "minerali"

/** Dettaglio breve di una creatura o di un PNG: "Lv 30 · Diamond Shores". */
export function actorDetail(tags: string) {
  const [level, , zone] = tags.split(" · ")
  return [level, zone].filter(Boolean).join(" · ")
}

type Builder = { id: string; group: MapLayerGroupId; label: string; art: string | null; entries: MapLayerEntry[]; entryIndex: Map<string, number>; points: MapLayerPoint[]; at: Map<string, MapLayerPoint> }

/**
 * Costruisce tutti i livelli. Le fonti derivate (smontaggio, pietre incastonate) ripetono posizioni
 * già presenti in altre fonti e si saltano. Un punto per posizione: le voci nello stesso posto si sommano al punto.
 */
export function buildMapLayers({ locations, catalog }: MapLayerSources) {
  const layers = new Map<string, Builder>()
  const categoryArt = new Map<string, string>()
  const byName = new Map<string, Map<string, string>>()
  for (const [id, e] of Object.entries(catalog)) {
    if (e[5] && !categoryArt.has(e[1])) categoryArt.set(e[1], e[5])
    if (!byName.has(e[1])) byName.set(e[1], new Map())
    if (!byName.get(e[1])!.has(e[0])) byName.get(e[1])!.set(e[0], id)
  }
  const find = (name: string, ...categories: string[]) => {
    for (const c of categories) {
      const id = byName.get(c)?.get(name)
      if (id) return id
    }
    return null
  }
  const nameOf = (id: string) => catalog[id]?.[0] ?? id.replaceAll("-", " ")
  const artOf = (id: string) => catalog[id]?.[5] ?? null

  const layer = (id: string, group: MapLayerGroupId, label: string, art: string | null) => {
    let b = layers.get(id)
    if (!b) {
      b = { id, group, label, art, entries: [], entryIndex: new Map(), points: [], at: new Map() }
      layers.set(id, b)
    }
    return b
  }
  const fixed = (id: keyof typeof FIXED_LAYERS) => {
    const [group, label, category] = FIXED_LAYERS[id]
    return layer(id, group, label, categoryArt.get(category) ?? null)
  }
  const add = (b: Builder, entry: MapLayerEntry, x: number, y: number) => {
    const key = entry.join("|")
    let index = b.entryIndex.get(key)
    if (index === undefined) {
      index = b.entries.length
      b.entries.push(entry)
      b.entryIndex.set(key, index)
    }
    const position = `${x}|${y}`
    const point = b.at.get(position)
    if (!point) {
      const created: MapLayerPoint = [x, y, index]
      b.at.set(position, created)
      b.points.push(created)
    } else if (!point.slice(2).includes(index)) point.push(index)
  }
  const href = (id: string | null) => (id ? recordHref(id) : null)

  // Posizioni del catalogo: PNG, mostri e boss, ognuno con la sua scheda.
  for (const [id, e] of Object.entries(catalog)) {
    const point = e[4]
    if (!point) continue
    const target = e[1] === "Boss" ? fixed("boss") : e[1] === "Mob" ? fixed("mostri") : e[1] === "NPC" ? fixed("png") : null
    if (target) add(target, [e[0], recordHref(id), actorDetail(e[2])], point[0], point[1])
  }

  // Fonti per oggetto. Una stessa fonte (stessi punti) può servire più oggetti: i nodi di raccolta si uniscono.
  const gatherYields = new Map<string, Set<string>>()
  for (const [item, refs] of Object.entries(locations.refs)) {
    for (const [label] of refs) {
      const [kind, source] = label.split(" · ")
      if (kind === "Raccolta" && source) {
        if (!gatherYields.has(source)) gatherYields.set(source, new Set())
        gatherYields.get(source)!.add(item)
      }
    }
  }

  for (const [item, refs] of Object.entries(locations.refs)) {
    for (const [label, key] of refs) {
      const parts = label.split(" · ")
      const [kind, source = ""] = parts
      const points = locations.points[key] ?? []
      let target: Builder | null = null
      let entry: MapLayerEntry | null = null
      switch (kind) {
        case "Raccolta": {
          const group = gatheringGroup(source)
          // Una voce sola per nodo, qualunque oggetto lo citi: altrimenti gli stessi punti si ripeterebbero.
          const yields = [...(gatherYields.get(source) ?? [item])].sort()
          target = layer("raccolta-" + itemSlug(source).replace(/^-+|-+$/g, ""), group, source, artOf(yields[0]))
          entry = [source, href(find(source, "Nodi di raccolta") ?? yields[0]), "Raccolta: " + yields.map(nameOf).join(", ")]
          break
        }
        case "Bottino": {
          const id = find(source, "Boss", "Mob")
          const boss = id ? catalog[id][1] === "Boss" : false
          target = fixed(boss ? "boss" : "mostri")
          entry = [source, href(id), id ? actorDetail(catalog[id][2]) : ""]
          break
        }
        case "Venditore":
          target = fixed("venditori")
          entry = [source, href(find(source, "NPC")), "Venditore"]
          break
        case "Missione":
          target = fixed("missioni")
          entry = [source, href(find(source, "Missioni")), "Missione"]
          break
        case "Dono":
          target = fixed("missioni")
          entry = [source, href(find(source, "NPC")), "Dono"]
          break
        case "Produzione":
          target = fixed("banchi")
          entry = [source, null, "Banco di produzione"]
          break
        case "Banco di produzione esclusivo":
          target = fixed("banchi")
          entry = ["Banco di produzione esclusivo", href(item), "Produce " + nameOf(item)]
          break
        case "Caricamento":
          target = fixed("commercio")
          entry = [source, null, "Caricamento dei pacchi"]
          break
        case "Consegna":
          target = fixed("commercio")
          entry = [source, null, "Consegna dei pacchi"]
          break
        case "Interazione":
          target = fixed("interazioni")
          entry = [source, href(item), "Interazione: " + nameOf(item)]
          break
        case "Documento":
          target = fixed("interazioni")
          entry = [source, href(item), "Documento"]
          break
        case "Punto della scheda":
          target = fixed("oggetti")
          entry = [source, href(item), "Posizione dell'oggetto"]
          break
        case "Ricompensa di completamento":
          target = fixed("zone")
          entry = [parts.at(-1) ?? source, null, "Ricompensa di completamento della zona"]
          break
      }
      if (!target || !entry) continue
      for (const [x, y] of points) add(target, entry, x, y)
    }
  }

  const order = new Map(MAP_LAYER_GROUPS.map(([id], i) => [id, i]))
  const all = [...layers.values()].filter((b) => b.points.length).sort((a, b) => order.get(a.group)! - order.get(b.group)! || b.points.length - a.points.length)
  const data = new Map<string, MapLayerData>(all.map((b) => [b.id, { id: b.id, entries: b.entries, points: b.points }]))
  const groups: MapLayerGroup[] = MAP_LAYER_GROUPS.map(([id, label]) => ({
    id,
    label,
    layers: all.filter((b) => b.group === id).map((b): MapLayerInfo => ({ id: b.id, group: b.group, label: b.label, count: b.points.length, art: b.art, on: isDefaultLayer(b.id, b.group) })),
  })).filter((g) => g.layers.length)
  return { groups, data }
}
