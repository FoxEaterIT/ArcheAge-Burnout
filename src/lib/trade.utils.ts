// Icone dei commerci e collegamenti alle schede, usabili anche nei componenti client (dati piccoli).
import { TRADE_ICONS, TRADE_LINKS } from "./client-data.utils"
import type { CargoGroup, RouteStop, Segment, TradeFilters, TradeRoute } from "./game.types"
import { deliveryOnly, goldValue, ingredients, multiplyIngredient, rewardName } from "./text.utils"

const names = Object.keys(TRADE_ICONS).sort((a, b) => b.length - a.length)

/** Divide un testo nei nomi di gioco riconosciuti (con icona e scheda) e nel testo libero tra uno e l'altro. */
export function segmentText(text: string): Segment[] {
  const parts: Segment[] = []
  let start = 0
  while (start < text.length) {
    let at = text.length
    let found = ""
    for (const name of names) {
      const i = text.indexOf(name, start)
      if (i >= 0 && i < at) {
        at = i
        found = name
      }
    }
    if (!found) {
      parts.push(text.slice(start))
      break
    }
    if (at > start) parts.push(text.slice(start, at))
    parts.push({ name: found, icon: TRADE_ICONS[found], href: TRADE_LINKS[found] ? recordHref(TRADE_LINKS[found]) : null })
    start = at + found.length
  }
  return parts
}

export function recordHref(id: string) {
  return "/scheda/" + id.split("/").map(encodeURIComponent).join("/")
}

export const EMPTY_TRADE_FILTERS: TradeFilters = { target: "", query: "", origin: "", destination: "", kind: "" }

const GOLD_REWARD = /\bGold$/i

/** Come `render()` dell'originale: obiettivo nella ricompensa, partenza, destinazione, tipo di ricompensa e parole cercate. */
export function filterRoutes(routes: TradeRoute[], f: TradeFilters) {
  const target = f.target.trim().toLowerCase().split(/\s+/)
  const words = f.query.trim().toLowerCase().split(/\s+/)
  return routes.filter((r) => {
    const reward = rewardName(r.payout).toLowerCase()
    if (!target.every((w) => reward.includes(w))) return false
    if (f.origin && r.origin !== f.origin) return false
    if (f.destination && r.destination !== f.destination) return false
    if (f.kind && f.kind !== (GOLD_REWARD.test(r.payout) ? "gold" : "item")) return false
    const all = [r.origin, r.cargo, r.destination, r.payout, r.recipe].join(" ").toLowerCase()
    return words.every((w) => all.includes(w))
  })
}

/** Raggruppa per banco e carico, nell'ordine dei dati. */
export function groupRoutes(routes: TradeRoute[]): CargoGroup[] {
  const groups = new Map<string, CargoGroup>()
  for (const r of routes) {
    const key = r.origin + "|" + r.cargo
    let group = groups.get(key)
    if (!group) {
      const parts = ingredients(r.recipe)
      group = { origin: r.origin, cargo: r.cargo, recipe: r.recipe, routes: [], stops: [], ingredients: parts, batch: parts.map((i) => multiplyIngredient(i, PACKS_PER_BATCH)), deliveryOnly: deliveryOnly(r.recipe) }
      groups.set(key, group)
    }
    group.routes.push(r)
  }
  for (const group of groups.values()) group.stops = routeStops(group.routes)
  return [...groups.values()]
}

/** Fermate della linea: prima l'oro dal più alto, poi gli oggetti nell'ordine dei dati; il ricavo più alto è acceso. */
export function routeStops(routes: TradeRoute[]): RouteStop[] {
  const stops = routes.map((r) => ({ destination: r.destination, payout: r.payout, gold: goldValue(r.payout), best: false }))
  const sorted = stops.toSorted((a, b) => (b.gold ?? -1) - (a.gold ?? -1))
  if (sorted[0]?.gold) sorted[0].best = true
  return sorted
}

export function rewardOptions(routes: TradeRoute[]) {
  return [...new Set(routes.map((r) => rewardName(r.payout)))].sort()
}

export function placeOptions(routes: TradeRoute[], field: "origin" | "destination") {
  return [...new Set(routes.map((r) => r[field]))].sort()
}

export function countLabel(matches: number, total: number) {
  return matches ? `${matches} tratte su ${total}` : "Nessuna tratta corrisponde ai filtri"
}

/** Valore delle select per "Tutte": Radix Select non accetta la stringa vuota. */
export const ALL = "__all"
export const toSelect = (value: string) => value || ALL
export const fromSelect = (value: string) => (value === ALL ? "" : value)
export const PACKS_PER_BATCH = 7
