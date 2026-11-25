import { describe, expect, it } from "vitest"
import routesJson from "@/data/generated/trade-routes.json"
import type { TradeRoute } from "./game.types"
import { EMPTY_TRADE_FILTERS, countLabel, filterRoutes, groupRoutes, routeStops } from "./trade.utils"

const routes: TradeRoute[] = (routesJson as string[][]).map(([origin, cargo, destination, payout, recipe]) => ({ origin, cargo, destination, payout, recipe }))

describe("rotte commerciali", () => {
  it("senza filtri mostra tutte le 360 tratte in 72 carichi", () => {
    const all = filterRoutes(routes, EMPTY_TRADE_FILTERS)
    expect(all).toHaveLength(360)
    expect(groupRoutes(all)).toHaveLength(72)
  })
  it("l'obiettivo cerca nella ricompensa, come l'originale", () => {
    const found = filterRoutes(routes, { ...EMPTY_TRADE_FILTERS, target: "tainted flesh" })
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((r) => r.payout.includes("Tainted Flesh"))).toBe(true)
  })
  it("filtra per partenza, destinazione e oro", () => {
    const found = filterRoutes(routes, { ...EMPTY_TRADE_FILTERS, origin: "Jubilant Village", destination: "Stargazer", kind: "gold" })
    expect(found.every((r) => r.origin === "Jubilant Village" && r.destination === "Stargazer" && r.payout.endsWith("Gold"))).toBe(true)
  })
  it("accende il ricavo più alto in oro e mette gli oggetti dopo", () => {
    const fang = routes.filter((r) => r.origin === "Jubilant Village" && r.cargo === "Hardened Fang Crate")
    const stops = routeStops(fang)
    expect(stops[0]).toMatchObject({ payout: "2,090 Gold", best: true })
    expect(stops.slice(1).every((s) => s.gold === null && !s.best)).toBe(true)
  })
  it("conteggio", () => {
    expect(countLabel(5, 360)).toBe("5 tratte su 360")
    expect(countLabel(0, 360)).toBe("Nessuna tratta corrisponde ai filtri")
  })
})
