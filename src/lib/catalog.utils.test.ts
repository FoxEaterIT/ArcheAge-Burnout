import { describe, expect, it } from "vitest"
import catalogJson from "@/data/generated/world-catalog.json"
import type { CatalogEntry } from "./game.types"
import { catalogHref, dbType, isCatalogHome, parseCatalogQuery, searchCatalog } from "./catalog.utils"

const entries = Object.entries(catalogJson as unknown as Record<string, CatalogEntry>).sort((a, b) => a[1][0].localeCompare(b[1][0]))
const none = () => undefined
const zero = () => 0

describe("catalogo", () => {
  it("ricava il tipo degli oggetti dalle etichette", () => {
    expect(dbType(["X", "Oggetti", "Equipment · Weapon · Axe", "", null, null, []])).toBe("Armi")
    expect(dbType(["X", "Oggetti", "Crafting Material · Ore", "", null, null, []])).toBe("Materiali")
    expect(dbType(["X", "Boss", "", "", null, null, []])).toBe("Boss")
  })
  it("cerca tutte le parole e pagina da 72", () => {
    const all = searchCatalog(entries, parseCatalogQuery({}), none, zero)
    expect(all.total).toBe(9552)
    expect(all.items).toHaveLength(72)
    const found = searchCatalog(entries, parseCatalogQuery({ q: "iron ore" }), none, zero)
    expect(found.items.every(([, e]) => (e[0] + " " + e[1] + " " + e[2]).toLowerCase().includes("iron"))).toBe(true)
  })
  it("legge e scrive la query nell'URL", () => {
    const q = parseCatalogQuery({ q: "axe", tipo: "Armi", pagina: "3", ordine: "level" })
    expect(q).toMatchObject({ q: "axe", type: "Armi", page: 2, sort: "level" })
    expect(isCatalogHome(parseCatalogQuery({}))).toBe(true)
    expect(catalogHref({ tipo: "Armi", q: "" })).toBe("/catalogo?tipo=Armi")
  })
})
