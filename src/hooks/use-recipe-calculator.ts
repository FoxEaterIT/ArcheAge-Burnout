"use client"
import { useMemo, useState } from "react"
import { craftChain, planTier, validPieces } from "@/lib/craft.utils"
import type { RecipeModel } from "@/lib/record.types"

/** Livello scelto e pezzi desiderati di una ricetta, con il piano e la catena di produzione calcolati. */
export function useRecipeCalculator(recipe: RecipeModel) {
  const [tierIndex, setTierIndex] = useState(0)
  const [pieces, setPieces] = useState("1")
  const tier = recipe.tiers[tierIndex] ?? recipe.tiers[0]
  const requested = Number(pieces)
  const plan = useMemo(() => planTier(tier, validPieces(requested) ? requested : 1), [tier, requested])
  const valid = !plan.calculable || validPieces(requested)
  const chain = useMemo(
    () => (plan.calculable && valid ? craftChain(recipe.result, tier, requested, recipe.subTiers) : null),
    [plan.calculable, valid, recipe.result, recipe.subTiers, tier, requested],
  )
  return { tierIndex, setTierIndex, pieces, setPieces, plan, valid, chain }
}
