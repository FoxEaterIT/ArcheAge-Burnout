import type { useCharacterBuild } from "@/hooks/use-character-build"

// Character Builder: build salvata, pezzi, statistiche e albero dei tratti.

export type ClassName = "Warrior" | "Ranger" | "Berserker" | "Mage"
export type SlotType = "Weapon" | "Armor" | "Accessory" | "Bag" | "Glider" | "Tool"
export type SlotKey = "primary" | "secondary" | "head" | "chest" | "hands" | "feet" | "neck" | "ear" | "wrist" | "ring" | "bag" | "glider" | "tool"
/** Slot: chiave, etichetta, tipo di pezzo, posizione richiesta (per armature e accessori). */
export type BuildSlot = { key: SlotKey; label: string; type: SlotType; position?: string }

export type Build = {
  name: string
  archetype: ClassName | null
  level: number
  points: number[]
  gear: Partial<Record<SlotKey, string>>
  temper: Partial<Record<SlotKey, number>>
  traits: Record<string, true>
}

export type Stats = Record<string, number>
/** Pezzo equipaggiabile: id, nome, etichette ("Equipment · Weapon · Axe · Rare · 30"), arte. */
export type GearPiece = { id: string; name: string; tags: string[]; art: string | null }
export type TemperTableData = { weapon: boolean; pct: Record<string, number>; exact: Record<string, [number, number]> }
export type BuilderData = {
  equipment: GearPiece[]
  gearValues: Record<string, Stats>
  temperTables: Record<string, TemperTableData>
  traitBook: Record<string, [string, string, string, string, number]>
  skillArt: Record<string, string>
  classArt: Partial<Record<ClassName, string>>
  fallbackSkillArt: string | null
}

export type Readings = {
  totals: Stats
  counted: number
  missing: string[]
  hud: { label: string; value: number }[]
  groups: { label: string; keys: string[] }[]
  coverage: string
}

export type GearOption = { piece: GearPiece; detail: string; equipped: boolean; changes: { stat: string; delta: number }[] | "same" | "unavailable" | null }

export type TraitNode = { id: string; name: string; group: string; points: number; x: number; y: number; learned: boolean; art: string | null }
export type TraitLayout = { headings: { label: string; y: number }[]; nodes: TraitNode[]; lines: { x1: number; y1: number; x2: number; y2: number }[]; height: number }

export type BuilderView = "gear" | "stats" | "traits"
/** Stato e azioni del Character Builder, come li restituisce `useCharacterBuild`. */
export type CharacterBuild = ReturnType<typeof useCharacterBuild>
