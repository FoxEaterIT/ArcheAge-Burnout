import { describe, expect, it } from "vitest"
import { isActiveSection, legacyHashTarget } from "./nav.utils"

describe("navigazione", () => {
  it("le schede appartengono al catalogo", () => {
    expect(isActiveSection("/scheda/iron-ore", "/catalogo")).toBe(true)
    expect(isActiveSection("/rotte", "/catalogo")).toBe(false)
  })
  it("traduce i link dell'Atlante offline", () => {
    expect(legacyHashTarget("#/scheda/achievements%2Fwildfang")).toBe("/scheda/achievements%2Fwildfang")
    expect(legacyHashTarget("#/scheda/iron-ore")).toBe("/scheda/iron-ore")
    expect(legacyHashTarget("#/categoria/Armi")).toBe("/catalogo?tipo=Armi")
    expect(legacyHashTarget("#/eventi")).toBe("/eventi")
    expect(legacyHashTarget("#utilizzi")).toBeNull()
  })
})
