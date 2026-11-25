// Regole del Character Builder dell'originale: classi, punti attributo, statistiche dei pezzi, tempra, tratti.
import type { Build, BuildSlot, BuilderData, ClassName, GearOption, GearPiece, Readings, SlotKey, SlotType, Stats, TraitLayout } from "./builder.types"
import { fmtDecimal } from "./text.utils"

export const BUILD_KEY = "burnout-build-v1"
export const DRAFT_KEY = (archetype: ClassName) => `burnout-build-v1-draft-${archetype}`

export const CLASSES: Record<ClassName, [string, string]> = {
  Warrior: ["Longsword", "Greatsword"],
  Ranger: ["Hatchet", "Longbow"],
  Berserker: ["Axe", "Warhammer"],
  Mage: ["Elemental Staff", "Wavesword"],
}
export const CLASS_NAMES = Object.keys(CLASSES) as ClassName[]
export const isClass = (v: unknown): v is ClassName => typeof v === "string" && v in CLASSES

export const ATTRIBUTES = ["Forza", "Agilità", "Intelligenza", "Costituzione", "Resistenza", "Talento"]
export const STARTING_STATS: Record<ClassName, number[]> = {
  Warrior: [29, 16, 10, 17, 7, 11],
  Ranger: [15, 27, 12, 8, 11, 17],
  Berserker: [18, 6, 4, 26, 25, 11],
  Mage: [10, 17, 30, 6, 7, 20],
}
export const MAX_LEVEL = 40
export const pointsForLevel = (level: number) => 3 * (level - 1)

export const BUILD_SLOTS: BuildSlot[] = [
  { key: "primary", label: "Arma principale", type: "Weapon" },
  { key: "secondary", label: "Arma secondaria", type: "Weapon" },
  { key: "head", label: "Testa", type: "Armor", position: "Head" },
  { key: "chest", label: "Torso", type: "Armor", position: "Chest" },
  { key: "hands", label: "Mani", type: "Armor", position: "Hands" },
  { key: "feet", label: "Piedi", type: "Armor", position: "Feet" },
  { key: "neck", label: "Collana", type: "Accessory", position: "Necklace" },
  { key: "ear", label: "Orecchini", type: "Accessory", position: "Earring" },
  { key: "wrist", label: "Bracciale", type: "Accessory", position: "Bracelet" },
  { key: "ring", label: "Anello", type: "Accessory", position: "Ring" },
  { key: "bag", label: "Borsa", type: "Bag" },
  { key: "glider", label: "Aliante", type: "Glider" },
  { key: "tool", label: "Strumento", type: "Tool" },
]
export const SLOT_GROUPS: [string, SlotType[]][] = [["Armi", ["Weapon"]], ["Armatura", ["Armor"]], ["Accessori", ["Accessory"]], ["Utilità", ["Bag", "Glider", "Tool"]]]
/** Glifi di gioco per gli slot vuoti. */
export const SLOT_GLYPHS: Record<SlotType, string> = {
  Weapon: "/game/catalog/106.webp",
  Armor: "/game/catalog/105.webp",
  Accessory: "/game/catalog/128.webp",
  Bag: "/game/catalog/368.webp",
  Glider: "/game/catalog/124.webp",
  Tool: "/game/catalog/123.webp",
}
export const slotByKey = (key: SlotKey) => BUILD_SLOTS.find((s) => s.key === key)!

// Incrementi per punto osservati nella demo (AAC Tools, Ranger con Longbow), applicati a tutte le classi.
const PER_POINT: Stats[] = [
  { "Physical ATK": 0.9, "Physical PEN": 0.1 },
  { "Physical ATK": 0.2, "Magic ATK": 0.2, "Physical Amplification": 1.4, "Magic Amplification": 1.4, "Physical Crit Chance ↑": 29, "Magic Crit Chance ↑": 29, "Physical Crit Damage ↑": 19, "Magic Crit Damage ↑": 19, "Physical PEN": 0.6 },
  { "Magic ATK": 0.8, "Magic PEN": 0.1 },
  { "Max HP": 7.2, "Physical Amplification RES": 0.7, "Magic Amplification RES": 0.7 },
  { "Physical DEF": 2.1, "Magic DEF": 2.1, "Max SP": 6.6 },
  { "Magic PEN": 0.6, "Wind ATK": 0.2, "Fog ATK": 0.1, "Fire ATK": 0.1, "Tidal ATK": 0.1, "Lightning ATK": 0.1, "Steel ATK": 0.1, "Max Equip Load": 0.5 },
]
const ELEMENTS = ["Wind", "Fog", "Fire", "Tidal", "Lightning", "Steel"]
const RECORD_GROUPS: [string, string[]][] = [
  ["Attacco", ["Physical ATK", "Physical Amplification", "Physical Crit Chance ↑", "Physical Crit Damage ↑", "Physical PEN", "Magic ATK", "Magic Amplification", "Magic Crit Chance ↑", "Magic Crit Damage ↑", "Magic PEN", "Damage to Normal Monsters ↑", "Damage to Elite Monsters ↑"]],
  ["Difesa", ["Physical DEF", "Magic DEF", "Physical Amplification RES", "Magic Amplification RES", "Stagger RES"]],
  ["Elementi", ["ATK", "DEF"].flatMap((type) => ELEMENTS.map((n) => n + " " + type))],
  ["Altro", ["Weight", "Potion Potency", "Move Speed"]],
]
export const statLabel = (key: string) => (key === "Weight" ? "Peso equipaggiato" : key)
export const formatStat = (n: number) => fmtDecimal(n)

export const EMPTY_BUILD: Build = { name: "", archetype: null, level: 1, points: [0, 0, 0, 0, 0, 0], gear: {}, temper: {}, traits: {} }

/** Ripulisce una build letta dal browser: valori fuori regola tornano ai default, come nell'originale. */
export function normalizeBuild(raw: unknown): Build {
  const b = raw && typeof raw === "object" ? (raw as Partial<Build>) : {}
  const level = Number.isInteger(b.level) && b.level! >= 1 && b.level! <= MAX_LEVEL ? b.level! : 1
  const points = Array.isArray(b.points) && b.points.length === 6 && b.points.every((n) => Number.isInteger(n) && n >= 0) && b.points.reduce((a, n) => a + n, 0) <= pointsForLevel(level) ? b.points : [0, 0, 0, 0, 0, 0]
  const record = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? v : {})
  return {
    name: typeof b.name === "string" ? b.name.slice(0, 80) : "",
    archetype: isClass(b.archetype) ? b.archetype : null,
    level,
    points,
    gear: record(b.gear) as Build["gear"],
    temper: record(b.temper) as Build["temper"],
    traits: record(b.traits) as Build["traits"],
  }
}

export const spentPoints = (b: Build) => b.points.reduce((a, n) => a + n, 0)
export const pointsLeft = (b: Build) => pointsForLevel(b.level) - spentPoints(b)

/** Bonus di un pezzo alla tempra `rank`: valori esatti se noti, altrimenti stima dal bonus percentuale. */
export function pieceStats(id: string | undefined, rank: number | undefined, data: Pick<BuilderData, "gearValues" | "temperTables">): Stats | null {
  if (!id) return null
  const table = data.temperTables[id]
  const base = data.gearValues[id]
  const exact = table?.exact[rank ?? 0]
  if (!base && !exact) return null
  const values: Stats = { ...base }
  if (table) {
    const keys = table.weapon ? ["Physical ATK", "Magic ATK"] : ["Physical DEF", "Magic DEF"]
    keys.forEach((key, i) => {
      if (exact) values[key] = exact[i]
      else if (rank && base?.[key] != null && table.pct[rank] != null) values[key] = Math.round(base[key] * (1 + table.pct[rank] / 100))
    })
  }
  return values
}

export function temperRanks(table: BuilderData["temperTables"][string]) {
  return [...new Set([0, ...Object.keys(table.pct).map(Number), ...Object.keys(table.exact).map(Number)])].sort((a, b) => a - b)
}

/** Descrizione dei bonus di tempra del pezzo equipaggiato. */
export function temperSummary(id: string, rank: number, data: Pick<BuilderData, "gearValues" | "temperTables">) {
  const table = data.temperTables[id]
  const v = pieceStats(id, rank, data)
  const keys = table.weapon ? ["Physical ATK", "Magic ATK"] : ["Physical DEF", "Magic DEF"]
  return v
    ? keys.filter((k) => k in v).map((k) => k + " " + v[k]).join(" · ") + (rank && !table.exact[rank] ? " · stima da bonus percentuale" : "")
    : "Bonus di tempra " + (table.pct[rank] || 0) + "% · valori base mancanti"
}

export function readings(b: Build, data: BuilderData, names: (id: string) => string): Readings {
  const totals: Stats = {}
  const missing: string[] = []
  let counted = 0
  const add = (stat: string, value: number) => (totals[stat] = (totals[stat] || 0) + value)
  for (const { key } of BUILD_SLOTS) {
    const id = b.gear[key]
    if (key === "secondary" || !id) continue
    const values = pieceStats(id, b.temper[key], data)
    if (!values) {
      missing.push(names(id))
      continue
    }
    counted++
    for (const [stat, value] of Object.entries(values)) add(stat, value)
  }
  PER_POINT.forEach((effects, i) => {
    for (const [stat, delta] of Object.entries(effects)) add(stat, b.points[i] * delta)
  })
  const primary = data.equipment.find((p) => p.id === b.gear.primary)
  const weaponTag = primary?.tags[2]
  const weaponStats = pieceStats(b.gear.primary, b.temper.primary, data)
  for (const [suffix, key] of [["1", "Physical ATK"], ["2", "Magic ATK"]] as const) {
    if (weaponTag && b.traits[weaponTag + suffix] && weaponStats?.[key]) add(key, weaponStats[key] * 0.1)
  }
  const used = new Set(RECORD_GROUPS.flatMap((g) => g[1]))
  const groups = RECORD_GROUPS.map(([label, keys], i) => ({ label, keys: i === 3 ? [...keys, ...Object.keys(totals).filter((k) => !used.has(k))] : keys }))
  return {
    totals,
    counted,
    missing,
    hud: [
      { label: "HP bonus", value: totals["Max HP"] || 0 },
      { label: "SP bonus", value: totals["Max SP"] || 0 },
      { label: "ATK fis. + mag.", value: (totals["Physical ATK"] || 0) + (totals["Magic ATK"] || 0) },
      { label: "DEF fis. + mag.", value: (totals["Physical DEF"] || 0) + (totals["Magic DEF"] || 0) },
    ],
    groups,
    coverage: `Bonus da equipaggiamento e punti assegnati. Incrementi stimati dai dati demo del Ranger con Longbow (AAC Tools), applicati a tutte le classi. · ${counted} pezzi conteggiati · arma principale attiva.` + (missing.length ? ` Dati mancanti: ${missing.join(", ")}.` : ""),
  }
}

/** Pezzi proposti per uno slot, con il confronto rispetto a quello equipaggiato. */
export function gearOptions(b: Build, slotKey: SlotKey, search: string, classOnly: boolean, data: BuilderData): GearOption[] {
  const slot = slotByKey(slotKey)
  const q = search.trim().toLowerCase()
  const current = b.gear[slotKey]
  const previous = pieceStats(current, b.temper[slotKey], data)
  const classWeapons: readonly string[] = b.archetype ? CLASSES[b.archetype] : []
  return data.equipment.flatMap((piece): GearOption[] => {
    const t = piece.tags
    if (t[1] !== slot.type || (slot.position && t[2] !== slot.position) || !piece.name.toLowerCase().includes(q)) return []
    if (slot.type === "Weapon" && classOnly && b.archetype && !classWeapons.includes(t[2])) return []
    const detail = [t[2], t.at(-2), "Lv. " + t.at(-1)].filter((s, i, a) => a.indexOf(s) === i).join(" · ")
    if (piece.id === current) return [{ piece, detail, equipped: true, changes: null }]
    const next = pieceStats(piece.id, 0, data)
    if (!next || (current && !previous)) return [{ piece, detail, equipped: false, changes: "unavailable" as const }]
    const changes = Object.keys({ ...previous, ...next }).filter((k) => k !== "Weight").map((stat) => ({ stat, delta: (next[stat] || 0) - (previous?.[stat] || 0) })).filter((c) => c.delta)
    return [{ piece, detail, equipped: false, changes: changes.length ? changes : ("same" as const) }]
  })
}

const TREE_GROUPS: [string, string][] = [["Bonus", "Bonus arma"], ["Active", "Attivi"], ["Passive", "Passivi"], ["Active II", "Attivi II"], ["Passive II", "Passivi II"], ["Stats", "Statistiche"]]
export const treeGroupLabel = (key: string) => TREE_GROUPS.find((g) => g[0] === key)?.[1] ?? key

export function branchEntries(b: Build, branch: string, book: BuilderData["traitBook"]) {
  return Object.entries(book).filter(([, n]) => n[0] === b.archetype && n[1] === branch)
}
export const buildTraitPoints = (b: Build, book: BuilderData["traitBook"]) => Object.keys(b.traits).reduce((sum, id) => sum + (book[id]?.[4] || 0), 0)
export const branchTraitPoints = (b: Build, entries: [string, BuilderData["traitBook"][string]][]) => entries.reduce((sum, [id, n]) => sum + (b.traits[id] ? n[4] : 0), 0)

/** I tratti bonus del ramo (oltre al primo) richiedono il bonus iniziale. */
export const traitLocked = (b: Build, branch: string, id: string, group: string) => group === "Bonus" && id !== branch + "0" && !b.traits[branch + "0"]

/** Apprende o rimuove un tratto; togliere il bonus iniziale toglie anche gli altri bonus del ramo. */
export function toggleTrait(b: Build, branch: string, id: string): Build {
  const traits = { ...b.traits }
  if (traits[id]) {
    delete traits[id]
    if (id === branch + "0") for (let i = 1; i <= 4; i++) delete traits[branch + i]
  } else traits[id] = true
  return { ...b, traits }
}

/** Disposizione dell'albero come nell'originale: righe per gruppo, bonus a ventaglio dal primo nodo. */
export function traitLayout(b: Build, branch: string, data: BuilderData): TraitLayout {
  const entries = branchEntries(b, branch, data.traitBook)
  const headings: TraitLayout["headings"] = []
  const nodes: TraitLayout["nodes"] = []
  const lines: TraitLayout["lines"] = []
  let y = 20
  for (const [key, label] of TREE_GROUPS) {
    const items = entries.filter(([, n]) => n[3] === key)
    if (!items.length) continue
    headings.push({ label, y })
    y += 44
    const positions = items.map((_, i) => (key === "Bonus" ? (i === 0 ? [320, y] : [95 + 150 * (i - 1), y + 100]) : [90 + (i % 4) * 150, y + Math.floor(i / 4) * 85]))
    if (key === "Bonus") for (const [x, cy] of positions.slice(1)) lines.push({ x1: positions[0][0], y1: positions[0][1], x2: x, y2: cy })
    items.forEach(([id, n], i) => nodes.push({ id, name: n[2], group: key, points: n[4], x: positions[i][0], y: positions[i][1], learned: Boolean(b.traits[id]), art: data.skillArt[branch + "|" + n[2]] ?? data.fallbackSkillArt }))
    y = positions.at(-1)![1] + 75
  }
  return { headings, nodes, lines, height: y }
}

export const pieceName = (pieces: GearPiece[]) => {
  const byId = new Map(pieces.map((p) => [p.id, p.name]))
  return (id: string) => byId.get(id) ?? id
}
