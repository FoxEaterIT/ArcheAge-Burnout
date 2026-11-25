import { describe, expect, it } from "vitest"
import { fmt, goldValue, ingredients, itemSlug, multiplyIngredient, rewardName } from "./text.utils"
import { segmentText } from "./trade.utils"

describe("testi di gioco", () => {
  it("slug come nell'originale", () => {
    expect(itemSlug("Gyldenlord's Curse")).toBe("gyldenlords-curse")
    expect(itemSlug("Watcher's")).toBe("watchers")
  })
  it("ricompense e oro", () => {
    expect(rewardName("3× Tainted Flesh")).toBe("Tainted Flesh")
    expect(rewardName("41,067 Gold")).toBe("Gold")
    expect(goldValue("41,067 Gold")).toBe(41067)
    expect(goldValue("3× Tainted Flesh")).toBeNull()
  })
  it("ingredienti e totali per 7 pacchi", () => {
    expect(ingredients("80 Gold 3× Grain Liquor 1× Blank Trade Certificate")).toEqual(["80 Gold", "3× Grain Liquor", "1× Blank Trade Certificate"])
    expect(multiplyIngredient("1,000 Gold", 7)).toBe("7.000 Gold")
    expect(multiplyIngredient("3× Grain Liquor", 7)).toBe("21× Grain Liquor")
  })
  it("numeri con separatore anche sotto 10.000", () => {
    expect(fmt(2090)).toBe("2.090")
  })
  it("riconosce i nomi di gioco e li collega alla scheda", () => {
    const parts = segmentText("3× Fine Lumber")
    expect(parts[0]).toBe("3× ")
    expect(parts[1]).toMatchObject({ name: "Fine Lumber", href: "/scheda/fine-lumber" })
  })
})
