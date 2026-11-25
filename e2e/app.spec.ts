import { expect, test } from "@playwright/test"
import { expectNoHorizontalScroll } from "./helpers"

test("la home porta alle rotte e la navigazione segna la sezione", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/rotte$/)
  await expect(page).toHaveTitle(/Rotte commerciali · ArcheAge Burnout/)
  await expect(page.locator("a[aria-current=page]", { hasText: "Rotte" }).first()).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("rotte: filtro per obiettivo e linea con il ricavo migliore", async ({ page }) => {
  await page.goto("/rotte")
  await expect(page.getByText("360 tratte su 360")).toBeVisible()
  await page.getByLabel("Cosa vuoi ottenere?").fill("Tainted Flesh")
  await expect(page.getByText(/^\d+ tratte su 360$/)).not.toHaveText("360 tratte su 360")
  await page.getByLabel("Cosa vuoi ottenere?").fill("")
  await page.getByLabel("Cerca materiale o carico").fill("Grain Spirits")
  const card = page.getByRole("article").filter({ hasText: "Grain Spirits Crate" }).first()
  await expect(card.getByText("(ricavo migliore)")).toBeAttached()
  await expect(card.getByText("47.385 oro")).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("catalogo: categorie, ricerca e scheda", async ({ page }) => {
  await page.goto("/catalogo")
  await page.getByRole("link", { name: /^Armi/ }).first().click()
  await expect(page).toHaveURL(/tipo=Armi/)
  await expect(page.getByText(/^123 voci · Pagina 1 di 2$/)).toBeVisible()
  await page.goto("/catalogo")
  await page.getByLabel("Cerca nel catalogo").fill("iron ore")
  await expect(page).toHaveURL(/q=iron\+ore/)
  await page.getByRole("link", { name: /^Iron Ore/ }).first().click()
  await expect(page.getByRole("heading", { level: 1, name: "Iron Ore" })).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("scheda: calcolatore e catena di produzione", async ({ page }) => {
  await page.goto("/scheda/standard-leather")
  const calc = page.getByLabel("Pezzi desiderati")
  await calc.fill("10")
  await expect(page.getByText("10 lavorazioni · 10 pezzi prodotti · 1.250 oro")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Catena di produzione" })).toBeVisible()
  await calc.fill("0")
  await expect(page.getByText("Inserisci un numero intero da 1 a 1.000.000.")).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("i vecchi link dell'Atlante portano alla pagina nuova", async ({ page }) => {
  await page.goto("/rotte#/scheda/iron-ore")
  await expect(page).toHaveURL(/\/scheda\/iron-ore$/)
})

test("mappa: ricerca di un oggetto e punti", async ({ page }) => {
  await page.goto("/mappa")
  await page.getByLabel("Cerca un oggetto sulla mappa").fill("Iron Ore")
  await page.getByRole("link", { name: "Iron Ore", exact: true }).click()
  await expect(page.getByLabel("Fonte del materiale")).toBeVisible()
  await expect(page.locator("img[src*='/game/map/']").first()).toBeVisible()
  await expectNoHorizontalScroll(page)
})

test("eventi: countdown e calendario", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-25T19:10:12Z"))
  await page.goto("/eventi")
  const rift = page.getByRole("article").filter({ hasText: "Crimson Rift · Normal" })
  await expect(rift.getByText("In corso · termina tra")).toBeVisible()
  await expect(rift.getByText("00:19:48")).toBeVisible()
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: /Scarica calendario/ }).click()
  expect((await download).suggestedFilename()).toBe("Burnout - Eventi.ics")
  await expectNoHorizontalScroll(page)
})

test("builder: classe, pezzo e salvataggio", async ({ page }) => {
  await page.goto("/builder")
  await page.getByRole("button", { name: /^Ranger/ }).click()
  await page.getByRole("button", { name: /Torso/ }).click()
  await page.getByRole("button", { name: /Ancient Soldier's Armor/ }).click()
  await expect(page.getByText("Build salvata su questo dispositivo")).toBeVisible()
  await page.reload()
  await expect(page.getByRole("button", { name: /Torso.*Ancient Soldier's Armor/ })).toBeVisible()
  await page.getByRole("button", { name: "Statistiche", exact: true }).click()
  await expect(page.getByText("Physical DEF").first()).toBeVisible()
  await expectNoHorizontalScroll(page)
})
