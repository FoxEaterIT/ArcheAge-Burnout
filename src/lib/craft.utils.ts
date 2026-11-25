// Calcolatore delle ricette e catena di produzione, con le regole di `appendRecipes` e `appendCraftChain` dell'originale.
import type { ChainStep, CraftChain, RecipeTier, TierPlan } from "./game.types"

const DOSE = /^([0-9,]+)\s*×\s*(.+)$/
const GOLD_COST = /^[0-9,]+ Gold$/
const num = (s: string) => Number(s.replaceAll(",", ""))
export const MAX_PIECES = 1_000_000

/** Una ricetta è calcolabile se ogni ingrediente ha una dose "N × Nome". */
export const isCalculable = (tier: RecipeTier) => tier[1].length > 0 && tier[1].every(([, label]) => DOSE.test(label))

export const validPieces = (n: number) => Number.isSafeInteger(n) && n >= 1 && n <= MAX_PIECES

export function planTier(tier: RecipeTier, requested: number): TierPlan {
  const [, materials, amount, cost] = tier
  const calculable = isCalculable(tier)
  const wanted = calculable ? requested : 1
  const perBatch = Number.parseInt(amount, 10) || 1
  const batches = Math.ceil(wanted / perBatch)
  const produced = batches * perBatch
  return {
    calculable,
    batches,
    produced,
    surplus: produced - wanted,
    gold: cost && GOLD_COST.test(cost) ? num(cost.split(" ")[0]) * batches : null,
    materials: materials.map(([id, label]) => {
      const m = label.match(DOSE)
      return calculable && m ? { id, label: m[2], count: num(m[1]) * batches } : { id, label, count: null }
    }),
  }
}

/** Per ogni intermedio, la prima variante con dosi disponibili tra le ricette che lo producono. */
export function firstCalculableTier(child: string, recipes: Record<string, [string, unknown, unknown, RecipeTier[], unknown]>) {
  for (const recipe of Object.values(recipes)) {
    if (recipe[0] !== child) continue
    const tier = recipe[3].find(isCalculable)
    if (tier) return tier
  }
  return undefined
}

/** Catena di produzione: dagli ingredienti grezzi al prodotto finale, con lavorazioni e oro totali. */
export function craftChain(result: string, rootTier: RecipeTier, requested: number, subTiers: Record<string, RecipeTier>): CraftChain {
  const tiers = new Map<string, RecipeTier>()
  const order: string[] = []
  const active = new Set<string>()
  const needed = new Map<string, number>([[result, requested]])
  function visit(id: string, tier: RecipeTier): boolean {
    if (active.has(id)) return false
    if (tiers.has(id)) return true
    tiers.set(id, tier)
    active.add(id)
    for (const [child] of tier[1]) {
      const next = subTiers[child]
      if (next && !visit(child, next)) return false
    }
    active.delete(id)
    order.push(id)
    return true
  }
  if (!visit(result, rootTier)) return { cycle: true, steps: [], raw: [], gold: 0 }
  let gold = 0
  const steps: ChainStep[] = []
  for (const id of order.toReversed()) {
    const [level, materials, amount, cost] = tiers.get(id)!
    const batches = Math.ceil(needed.get(id)! / (Number.parseInt((amount || "").replaceAll(",", ""), 10) || 1))
    const parts = materials.map(([child, label]) => {
      const count = num(label.match(DOSE)![1]) * batches
      needed.set(child, (needed.get(child) ?? 0) + count)
      return { id: child, count }
    })
    gold += (Number.parseInt((cost || "").replaceAll(",", ""), 10) || 0) * batches
    steps.unshift({ id, level, batches, needed: needed.get(id)!, parts })
  }
  const raw = [...needed].filter(([id]) => !tiers.has(id)).map(([id, count]) => ({ id, count }))
  return { cycle: false, steps, raw, gold }
}
