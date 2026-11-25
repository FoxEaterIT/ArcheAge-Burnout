import { expect, test } from "@playwright/test"

test("la home mostra il nome e non scorre in orizzontale", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/ArcheAge Burnout/)
  await expect(page.getByRole("heading", { level: 1, name: "ArcheAge Burnout" })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
