import { describe, expect, it } from "vitest"
import catalogJson from "@/data/generated/world-catalog.json"
import gearValues from "@/data/generated/gear-values.json"
import temperTables from "@/data/generated/temper-tables.json"
import traitBook from "@/data/generated/trait-book.json"
import type { Build, BuilderData } from "./builder.types"
import { EMPTY_BUILD, gearOptions, normalizeBuild, pieceStats, pointsLeft, readings, toggleTrait, traitLayout, traitLocked } from "./builder.utils"
import type { CatalogEntry } from "./game.types"

const equipment = Object.entries(catalogJson as unknown as Record<string, CatalogEntry>).filter(([, e]) => e[2].startsWith("Equipment · ")).map(([id, e]) => ({ id, name: e[0], tags: e[2].split(" · "), art: e[5] }))
const data: BuilderData = { equipment, gearValues: gearValues as BuilderData["gearValues"], temperTables: temperTables as unknown as BuilderData["temperTables"], traitBook: traitBook as unknown as BuilderData["traitBook"], skillArt: {}, classArt: {}, fallbackSkillArt: null }
const name = (id: string) => id

describe("character builder", () => {
  it("ripulisce le build non valide", () => {
    expect(normalizeBuild({ archetype: "Paladin", level: 99, points: [50, 0, 0, 0, 0, 0] })).toMatchObject({ archetype: null, level: 1, points: [0, 0, 0, 0, 0, 0] })
    const ok = normalizeBuild({ archetype: "Ranger", level: 11, points: [10, 10, 10, 0, 0, 0] })
    expect(ok.archetype).toBe("Ranger")
    expect(pointsLeft(ok)).toBe(0)
  })
  it("la tempra senza valori esatti stima dal bonus percentuale", () => {
    const base = pieceStats("ancient-soldiers-armor", 0, data)!
    const tempered = pieceStats("ancient-soldiers-armor", 1, data)!
    expect(tempered["Physical DEF"]).toBe(Math.round(base["Physical DEF"] * 1.22))
  })
  it("somma pezzi e punti nelle statistiche", () => {
    const b = { ...EMPTY_BUILD, archetype: "Warrior" as const, level: 2, points: [3, 0, 0, 0, 0, 0], gear: { chest: "ancient-soldiers-armor" } }
    const r = readings(b, data, name)
    expect(r.counted).toBe(1)
    expect(r.totals["Physical ATK"]).toBeCloseTo(2.7)
    expect(r.totals["Physical DEF"]).toBe(55)
  })
  it("propone solo i pezzi dello slot, con il confronto", () => {
    const b = { ...EMPTY_BUILD, archetype: "Warrior" as const }
    const options = gearOptions(b, "chest", "", true, data)
    expect(options.length).toBeGreaterThan(0)
    expect(options.every((o) => o.piece.tags[1] === "Armor" && o.piece.tags[2] === "Chest")).toBe(true)
    const weapons = gearOptions(b, "primary", "", true, data)
    expect(weapons.every((o) => ["Longsword", "Greatsword"].includes(o.piece.tags[2]))).toBe(true)
  })
  it("tratti: i bonus del ramo richiedono quello iniziale e si tolgono insieme", () => {
    let b: Build = { ...EMPTY_BUILD, archetype: "Warrior" }
    expect(traitLocked(b, "Longsword", "Longsword1", "Bonus")).toBe(true)
    b = toggleTrait(toggleTrait(b, "Longsword", "Longsword0"), "Longsword", "Longsword1")
    expect(Object.keys(b.traits)).toEqual(["Longsword0", "Longsword1"])
    expect(toggleTrait(b, "Longsword", "Longsword0").traits).toEqual({})
    const layout = traitLayout(b, "Longsword", data)
    expect(layout.nodes.find((n) => n.id === "Longsword0")).toMatchObject({ x: 320, learned: true })
    expect(layout.lines.length).toBeGreaterThan(0)
  })
})
