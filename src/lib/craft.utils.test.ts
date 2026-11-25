import { describe, expect, it } from "vitest"
import recipeJson from "@/data/generated/recipe-book.json"
import type { Recipe, RecipeTier } from "./game.types"
import { craftChain, firstCalculableTier, planTier, validPieces } from "./craft.utils"

const recipes = recipeJson as unknown as Record<string, Recipe>

describe("ricette", () => {
  it("calcola lavorazioni, eccedenza e oro come l'originale", () => {
    const tier = recipes["standard-leather"][3][1] // Level 2: 90× Raw Pelt per 6×, 450 Gold
    const plan = planTier(tier, 10)
    expect(plan).toMatchObject({ calculable: true, batches: 2, produced: 12, surplus: 2, gold: 900 })
    expect(plan.materials[0]).toEqual({ id: "raw-pelt", label: "Raw Pelt", count: 180 })
  })
  it("rifiuta quantità fuori intervallo", () => {
    expect(validPieces(0)).toBe(false)
    expect(validPieces(1_000_001)).toBe(false)
    expect(validPieces(3)).toBe(true)
  })
  it("costruisce la catena dagli intermedi ai materiali grezzi", () => {
    const tier: RecipeTier = ["", [["standard-leather", "2 × Standard Leather"]], "1", "100 Gold"]
    const sub = { "standard-leather": firstCalculableTier("standard-leather", recipes)! }
    const chain = craftChain("test-item", tier, 3, sub)
    expect(chain.cycle).toBe(false)
    expect(chain.steps.map((s) => s.id)).toEqual(["standard-leather", "test-item"])
    expect(chain.raw).toEqual([{ id: "raw-pelt", count: 36 }]) // 6 pezzi di Standard Leather → 6 lavorazioni × 6 Raw Pelt
    expect(chain.gold).toBe(300 + 6 * 125)
  })
  it("segnala i cicli", () => {
    const a: RecipeTier = ["", [["b", "1 × B"]], "1", ""]
    const b: RecipeTier = ["", [["a", "1 × A"]], "1", ""]
    expect(craftChain("a", a, 1, { a, b }).cycle).toBe(true)
  })
})
