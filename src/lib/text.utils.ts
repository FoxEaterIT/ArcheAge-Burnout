// Funzioni di testo condivise da server e client, con le stesse regole dell'originale.

/** Slug di un nome come nell'originale (`itemSlug`): i trattini ai bordi restano. */
export function itemSlug(name: string) {
  return name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-")
}

/** Nome della ricompensa senza la quantità: "3× Tainted Flesh" → "Tainted Flesh", "41,067 Gold" → "Gold". */
export function rewardName(payout: string) {
  return payout.replace(/^[\d,.]+(?:×\s*|\s+)/, "").trim()
}

/** Oro del ricavo, `null` se il ricavo è un oggetto. */
export function goldValue(payout: string) {
  const m = /^([\d,]+) Gold$/.exec(payout)
  return m ? Number(m[1].replaceAll(",", "")) : null
}

/** Ingredienti di una preparazione: "80 Gold 3× Grain Liquor" → ["80 Gold", "3× Grain Liquor"]. */
export function ingredients(recipe: string) {
  return recipe.split(/\s+(?=\d+×)/)
}

export const deliveryOnly = (recipe: string) => recipe.startsWith("Solo consegna")

// "always": in italiano Intl non separa le migliaia sotto 10.000, e 2090 accanto a 47.385 si legge male.
const integer = new Intl.NumberFormat("it-IT", { useGrouping: "always" } as Intl.NumberFormatOptions)
const decimal = new Intl.NumberFormat("it-IT", { useGrouping: "always", maximumFractionDigits: 3 } as Intl.NumberFormatOptions)

export const fmt = (n: number) => integer.format(n)
export const fmtDecimal = (n: number) => decimal.format(n)

/** Ingrediente moltiplicato per `times` pacchi: "3× Grain Liquor" → "21× Grain Liquor". */
export function multiplyIngredient(ingredient: string, times: number) {
  return ingredient.replace(/^[\d,]+/, (q) => fmt(times * Number(q.replaceAll(",", ""))))
}
