import { expect, type Page } from "@playwright/test"

/** Nessuna pagina deve scorrere in orizzontale. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}
