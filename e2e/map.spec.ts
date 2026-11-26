import { expect, test, type Page } from "@playwright/test"
import { expectNoHorizontalScroll } from "./helpers"

// Un nodo di Archeum vero, con altri sette nodi a pochi passi: utile per percorso ed elenco.
const ARCHEUM = "raccolta-archeum:-5108,2378"
const CLOSE_VIEW = "livelli=raccolta-archeum&x=-5090&y=2350&zoom=16"

/** Su mobile il pannello dei livelli sta dietro al pulsante "Livelli". */
async function openPanel(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: /^Livelli \(/ }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/mappa?livelli=")
  await page.evaluate(() => window.localStorage.clear())
})

test("mappa: un link condiviso apre livelli e punto scelto", async ({ page, isMobile }) => {
  await page.goto(`/mappa?livelli=raccolta-archeum&punto=${ARCHEUM}`)
  const card = page.getByRole("region", { name: "Punto scelto: Archeum" })
  await expect(card).toBeVisible()
  await expect(card.getByText("Raccolta: Archeum Shard, Magic Archeum Shard")).toBeVisible()
  await expect(card.getByRole("link", { name: "Archeum" })).toHaveAttribute("href", "/scheda/gathering/archeum")
  await openPanel(page, isMobile)
  await expect(page.getByRole("checkbox", { name: "Archeum" })).toBeChecked()
  await expectNoHorizontalScroll(page)
})

test("mappa: i livelli accesi finiscono nell'indirizzo", async ({ page, isMobile }) => {
  await openPanel(page, isMobile)
  await page.getByRole("checkbox", { name: "Boss" }).click()
  await expect(page).toHaveURL(/livelli=boss(&|$)/)
  await page.getByRole("button", { name: "Nessuno" }).click()
  await expect(page).toHaveURL(/livelli=(&|$)/)
})

test("mappa: un punto segnato come raccolto resta salvato", async ({ page, isMobile }) => {
  await page.goto(`/mappa?livelli=raccolta-archeum&punto=${ARCHEUM}`)
  await page.getByRole("button", { name: "Segna raccolto" }).click()
  await expect(page.getByRole("button", { name: "Raccolto" })).toHaveAttribute("aria-pressed", "true")
  await page.reload()
  await expect(page.getByRole("button", { name: "Raccolto" })).toBeVisible()
  await openPanel(page, isMobile)
  await expect(page.getByText("1/111")).toBeVisible()
})

test("mappa: elenco dei segnaposti nella vista e percorso", async ({ page, isMobile }) => {
  await page.goto(`/mappa?${CLOSE_VIEW}`)
  const list = page.getByRole("region", { name: "Segnaposti nella vista" })
  await expect(list.getByRole("button").first()).toBeVisible()
  await list.getByRole("button").first().click()
  await expect(page.getByRole("region", { name: /^Punto scelto: Archeum/ })).toBeVisible()
  await openPanel(page, isMobile)
  await page.getByRole("button", { name: "Dai segnaposti visibili" }).click()
  const stops = page.getByRole("region", { name: "Percorso" }).getByRole("listitem").filter({ hasText: "Archeum" })
  await expect(stops.first()).toBeVisible()
  expect(await stops.count()).toBeGreaterThan(1)
  await expect(page.getByText(/^Lunghezza [\d.]+ unità$/)).toBeVisible()
  await expect(page).toHaveURL(/percorso=-?\d+,-?\d+;/)
  await page.getByRole("button", { name: "Svuota" }).click()
  await expect(page.getByText(/^Nessuna tappa\./)).toBeVisible()
})

test("mappa: copia il link della vista", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "gli appunti si provano su desktop")
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto(`/mappa?livelli=raccolta-archeum&punto=${ARCHEUM}`)
  await page.getByRole("button", { name: "Copia link" }).click()
  await expect(page.getByRole("status").filter({ hasText: "Link copiato" })).toBeVisible()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain(`punto=${ARCHEUM}`)
  expect(copied).toContain("livelli=raccolta-archeum")
})

test("mappa: i punti di un livello si scaricano come JSON statico", async ({ request }) => {
  const response = await request.get("/mappa/livelli/boss")
  expect(response.ok()).toBe(true)
  const layer = await response.json()
  expect(layer.id).toBe("boss")
  expect(layer.points.length).toBeGreaterThan(100)
  expect((await request.get("/mappa/livelli/inesistente")).status()).toBe(404)
})
